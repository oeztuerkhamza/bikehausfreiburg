using System.Text.RegularExpressions;
using BikeHaus.Application.DTOs;
using BikeHaus.Application.Interfaces;
using BikeHaus.Domain.Entities;
using BikeHaus.Domain.Interfaces;
using Microsoft.Extensions.Logging;
using PdfSharp.Pdf;
using PdfSharp.Pdf.IO;

namespace BikeHaus.Infrastructure.Services;

/// <summary>
/// Miet- und Verkaufsbelege in einer gemeinsamen Übersicht — und als eine
/// einzige, fortlaufende PDF-Datei.
/// </summary>
public class BelegeService(
    ISaleRepository saleRepository,
    IRentalRepository rentalRepository,
    IPurchaseRepository purchaseRepository,
    IRepository<BelegKontrolle> kontrolleRepository,
    IPdfService pdfService,
    ILogger<BelegeService> logger) : IBelegeService
{
    public async Task<IEnumerable<BelegListDto>> GetBelegeAsync(DateTime startDate, DateTime endDate)
    {
        var belege = new List<BelegListDto>();
        var kontrollen = await LoadKontrollenAsync();

        foreach (var rental in await rentalRepository.GetByStartDateRangeWithDetailsAsync(startDate, endDate))
        {
            var ersteRad = rental.Bikes.OrderBy(b => b.Id).FirstOrDefault()?.Bicycle;
            var radInfo = ersteRad != null ? $"{ersteRad.Marke} {ersteRad.Modell}".Trim() : string.Empty;
            if (rental.Bikes.Count > 1) radInfo += $" (+{rental.Bikes.Count - 1})";

            belege.Add(new BelegListDto(
                BelegArt.Miete,
                rental.Id,
                rental.MietvertragNummer,
                rental.StartDatum,
                rental.Customer?.FullName ?? string.Empty,
                radInfo,
                rental.Gesamtmiete,
                // Ein Mietvertrag kennt nur eine Zahlungsart für die Miete
                // (die Kaution hat ihre eigene und gehört nicht in diese Summe).
                [new BelegZahlungDto(rental.Zahlungsart.ToString(), rental.Gesamtmiete)],
                null,
                null,
                Flatpay(kontrollen, BelegArt.Miete, rental.Id),
                // Ein Mietvertrag kann mehrere Räder umfassen — ein einzelner
                // Zustand wäre irreführend.
                null));
        }

        foreach (var sale in await saleRepository.GetByDateRangeWithDetailsAsync(startDate, endDate))
        {
            // Derselbe Kaufbeleg wie im Verkaufsbeleg-PDF; Ankaufpreis am
            // Verkauf schlägt den Kaufbeleg (manuelle Korrektur gewinnt).
            var ankauf = await PurchaseResolver.ForSaleAsync(purchaseRepository, sale);

            belege.Add(new BelegListDto(
                BelegArt.Verkauf,
                sale.Id,
                sale.BelegNummer,
                sale.Verkaufsdatum,
                sale.Buyer?.FullName ?? string.Empty,
                $"{sale.Bicycle?.Marke} {sale.Bicycle?.Modell}".Trim(),
                sale.Gesamtbetrag,
                ZahlungenVon(sale),
                ankauf?.BelegNummer,
                sale.AnkaufPreis ?? ankauf?.Preis,
                Flatpay(kontrollen, BelegArt.Verkauf, sale.Id),
                ZustandVon(sale.Bicycle)));
        }

        return Sort(belege);
    }

    public async Task<IEnumerable<BelegListDto>> GetAnkaufBelegeAsync(DateTime startDate, DateTime endDate)
    {
        var belege = new List<BelegListDto>();
        var kontrollen = await LoadKontrollenAsync();

        foreach (var purchase in await purchaseRepository.GetByDateRangeWithDetailsAsync(startDate, endDate))
        {
            belege.Add(new BelegListDto(
                BelegArt.Ankauf,
                purchase.Id,
                // Ankaufbelege dürfen ohne Nummer angelegt sein; dann bleibt die
                // Spalte leer statt eine erfundene Nummer zu zeigen.
                purchase.BelegNummer ?? string.Empty,
                purchase.Kaufdatum,
                purchase.Seller?.FullName ?? string.Empty,
                $"{purchase.Bicycle?.Marke} {purchase.Bicycle?.Modell}".Trim(),
                purchase.Preis,
                [new BelegZahlungDto(purchase.Zahlungsart.ToString(), purchase.Preis)],
                purchase.BelegNummer,
                purchase.Preis,
                Flatpay(kontrollen, BelegArt.Ankauf, purchase.Id),
                ZustandVon(purchase.Bicycle)));
        }

        return Sort(belege);
    }

    public async Task SetFlatpayAsync(BelegArt art, int belegId, bool flatpay)
    {
        var key = art.ToString();
        var vorhanden = (await kontrolleRepository.FindAsync(k => k.Art == key && k.BelegId == belegId))
            .FirstOrDefault();

        if (vorhanden == null)
        {
            // Ohne Häkchen braucht es keinen Eintrag — der Normalfall bleibt leer.
            if (!flatpay) return;
            await kontrolleRepository.AddAsync(new BelegKontrolle
            {
                Art = key,
                BelegId = belegId,
                Flatpay = true,
            });
            return;
        }

        if (vorhanden.Flatpay == flatpay) return;
        vorhanden.Flatpay = flatpay;
        vorhanden.UpdatedAt = DateTime.UtcNow;
        await kontrolleRepository.UpdateAsync(vorhanden);
    }

    /// <summary>
    /// Gleicht den Flatpay-Transaktionsbericht mit den Belegen ab.
    ///
    /// Regel: eine abgeschlossene Kartenzahlung passt zu einem Beleg desselben
    /// Tages mit demselben Betrag. Jeder Beleg wird höchstens einmal vergeben —
    /// gibt es an einem Tag mehrere gleich hohe Belege, bekommt die zweite
    /// Zahlung den nächsten. Ein bereits gesetztes Häkchen bleibt stehen, damit
    /// derselbe Bericht zweimal eingelesen dasselbe Ergebnis liefert.
    /// </summary>
    public async Task<FlatpayImportResultDto> ImportFlatpayReportAsync(Stream xlsx)
    {
        var zeilen = FlatpayReportReader.Read(xlsx);

        // Abgelehnte oder abgebrochene Zahlungen sind nie über den Ladentisch
        // gegangen; Gutschriften/Stornos sind Rückzahlungen und gehören nicht
        // an einen Verkaufsbeleg.
        var zahlungen = zeilen
            .Where(z => z.Status.Trim().StartsWith("Abgeschlossen", StringComparison.OrdinalIgnoreCase))
            .Where(z => z.Typ.Trim().Length == 0
                        || z.Typ.Trim().Equals("Verkauf", StringComparison.OrdinalIgnoreCase))
            .OrderBy(z => z.Datum)
            .ToList();

        if (zahlungen.Count == 0)
            return new FlatpayImportResultDto(zeilen.Count, 0, 0, 0, []);

        var von = zahlungen.Min(z => z.Datum).Date;
        var bis = zahlungen.Max(z => z.Datum).Date.AddDays(1).AddTicks(-1);
        var belege = (await GetBelegeAsync(von, bis)).ToList();

        var vergeben = new HashSet<(BelegArt Art, int Id)>();
        var offen = new List<FlatpayOffeneZahlungDto>();
        var neu = 0;
        var schon = 0;

        foreach (var zahlung in zahlungen)
        {
            var treffer = belege
                .Where(b => b.Datum.Date == zahlung.Datum.Date && !vergeben.Contains((b.Art, b.Id)))
                .Select(b => new { Beleg = b, Rang = TrefferRang(b, zahlung.Betrag) })
                .Where(x => x.Rang < int.MaxValue)
                .OrderBy(x => x.Rang)
                // Feste Reihenfolge, damit ein zweiter Durchlauf desselben
                // Berichts dieselben Belege trifft.
                .ThenBy(x => x.Beleg.BelegNummer, StringComparer.OrdinalIgnoreCase)
                .ThenBy(x => x.Beleg.Id)
                .Select(x => x.Beleg)
                .FirstOrDefault();

            if (treffer == null)
            {
                offen.Add(new FlatpayOffeneZahlungDto(zahlung.Datum, zahlung.Betrag));
                continue;
            }

            vergeben.Add((treffer.Art, treffer.Id));

            if (treffer.Flatpay)
            {
                schon++;
                continue;
            }

            await SetFlatpayAsync(treffer.Art, treffer.Id, true);
            neu++;
        }

        return new FlatpayImportResultDto(zeilen.Count, zahlungen.Count, neu, schon, offen);
    }

    /// <summary>
    /// Wie gut ein Beleg zu einem Zahlungsbetrag passt (kleiner = besser):
    /// 0 = als Karte verbuchter Teilbetrag, 1 = Gesamtbetrag des Belegs,
    /// 2 = irgendein Zahlungsanteil. MaxValue = passt nicht.
    /// </summary>
    private static int TrefferRang(BelegListDto beleg, decimal betrag)
    {
        bool Passt(decimal wert) => decimal.Round(wert, 2) == decimal.Round(betrag, 2);

        if (beleg.Zahlungen.Any(z => Passt(z.Betrag)
                && z.Zahlungsart.Equals("Karte", StringComparison.OrdinalIgnoreCase)))
            return 0;
        if (Passt(beleg.Betrag)) return 1;
        if (beleg.Zahlungen.Any(z => Passt(z.Betrag))) return 2;
        return int.MaxValue;
    }

    /// <summary>
    /// "Neu" oder "Gebraucht". Reine Zubehörverkäufe tragen ein Platzhalter-Fahrrad
    /// (Marke "Zubehör" / Rahmennummer "ACC-…") — dort wäre ein Fahrradzustand
    /// irreführend, deshalb bleibt die Spalte leer.
    /// </summary>
    private static string? ZustandVon(Bicycle? bicycle)
    {
        if (bicycle == null) return null;
        var istZubehoer =
            string.Equals(bicycle.Marke, "Zubehör", StringComparison.OrdinalIgnoreCase) &&
            (bicycle.Rahmennummer?.StartsWith("ACC-", StringComparison.OrdinalIgnoreCase) ?? false);
        return istZubehoer ? null : bicycle.Zustand.ToString();
    }

    /// <summary>Zahlungsanteile eines Verkaufs; ohne Aufteilung die eine Zahlungsart über den Gesamtbetrag.</summary>
    private static IReadOnlyList<BelegZahlungDto> ZahlungenVon(Sale sale) =>
        sale.Zahlungen.Count > 0
            ? sale.Zahlungen
                .OrderBy(z => z.Id)
                .Select(z => new BelegZahlungDto(z.Zahlungsart.ToString(), z.Betrag))
                .ToList()
            : [new BelegZahlungDto(sale.Zahlungsart.ToString(), sale.Gesamtbetrag)];

    /// <summary>Alle gesetzten Häkchen einmal laden — die Tabelle bleibt klein.</summary>
    private async Task<HashSet<(string Art, int BelegId)>> LoadKontrollenAsync() =>
        (await kontrolleRepository.FindAsync(k => k.Flatpay))
            .Select(k => (k.Art, k.BelegId))
            .ToHashSet();

    private static bool Flatpay(HashSet<(string Art, int BelegId)> kontrollen, BelegArt art, int belegId) =>
        kontrollen.Contains((art.ToString(), belegId));

    public Task<byte[]> GenerateAnkaufPdfAsync(DateTime startDate, DateTime endDate) =>
        BuildPdfAsync(() => GetAnkaufBelegeAsync(startDate, endDate));

    public Task<byte[]> GenerateCombinedPdfAsync(DateTime startDate, DateTime endDate) =>
        BuildPdfAsync(() => GetBelegeAsync(startDate, endDate));

    /// <summary>
    /// Erzeugt zu jedem Beleg der Liste das PDF und hängt sie in Listenreihenfolge
    /// aneinander. Ein defekter Einzelbeleg darf die Datei nicht verhindern.
    /// </summary>
    private async Task<byte[]> BuildPdfAsync(Func<Task<IEnumerable<BelegListDto>>> load)
    {
        var parts = new List<byte[]>();
        foreach (var beleg in await load())
        {
            try
            {
                parts.Add(beleg.Art switch
                {
                    BelegArt.Miete => await pdfService.GenerateMietvertragAsync(beleg.Id),
                    BelegArt.Ankauf => await pdfService.GenerateKaufbelegAsync(beleg.Id),
                    // Verkaufsbeleg MIT Ankaufpreis: die Sammeldatei ist ein internes
                    // Buchhaltungsdokument, kein Kundenbeleg. Bei Gebrauchträdern steht
                    // damit Ankaufpreis und -datum daneben — wie im ZIP-Export auch.
                    _ => await pdfService.GenerateVerkaufsbelegAsync(beleg.Id, includeAnkaufPreis: true),
                });
            }
            catch (Exception ex)
            {
                logger.LogError(ex,
                    "Beleg konnte nicht erzeugt werden und fehlt in der Sammeldatei: {Art} {Nummer} (Id {Id})",
                    beleg.Art, beleg.BelegNummer, beleg.Id);
            }
        }

        return Merge(parts);
    }

    // Verkäufe und Mietverträge ziehen aus DEMSELBEN Nummernkreis, deshalb
    // ordnet die Belegnummer beide Arten korrekt ineinander.
    // Absteigend: der zuletzt vergebene Beleg steht oben.
    // Sortiert wird über die Zahl am Ende, nicht über den Text: sonst käme
    // "…-9" vor "…-10". Datum entscheidet nur noch bei gleicher Nummer.
    private static List<BelegListDto> Sort(IEnumerable<BelegListDto> belege) =>
        belege
            .OrderByDescending(b => BelegNummerWert(b.BelegNummer))
            .ThenByDescending(b => b.BelegNummer, StringComparer.OrdinalIgnoreCase)
            .ThenByDescending(b => b.Datum)
            .ThenByDescending(b => b.Id)
            .ToList();

    private static readonly Regex EndZahl = new(@"(\d+)$", RegexOptions.Compiled);

    /// <summary>Zahl am Ende der Belegnummer; ohne Ziffern 0 (steht dann hinten).</summary>
    private static int BelegNummerWert(string? belegNummer)
    {
        if (string.IsNullOrWhiteSpace(belegNummer)) return 0;
        var match = EndZahl.Match(belegNummer);
        return match.Success && int.TryParse(match.Groups[1].Value, out var wert) ? wert : 0;
    }

    /// <summary>Hängt die einzelnen PDFs seitenweise zu einem Dokument zusammen.</summary>
    private static byte[] Merge(IReadOnlyCollection<byte[]> pdfs)
    {
        using var output = new PdfDocument();
        foreach (var bytes in pdfs)
        {
            if (bytes is not { Length: > 0 }) continue;
            using var input = new MemoryStream(bytes);
            using var source = PdfReader.Open(input, PdfDocumentOpenMode.Import);
            for (var page = 0; page < source.PageCount; page++)
                output.AddPage(source.Pages[page]);
        }

        if (output.PageCount == 0) return [];

        using var result = new MemoryStream();
        output.Save(result, false);
        return result.ToArray();
    }
}
