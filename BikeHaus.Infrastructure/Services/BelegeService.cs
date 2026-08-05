using System.Text.RegularExpressions;
using BikeHaus.Application.DTOs;
using BikeHaus.Application.Interfaces;
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
    IPdfService pdfService,
    ILogger<BelegeService> logger) : IBelegeService
{
    public async Task<IEnumerable<BelegListDto>> GetBelegeAsync(DateTime startDate, DateTime endDate)
    {
        var belege = new List<BelegListDto>();

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
                rental.Gesamtmiete));
        }

        foreach (var sale in await saleRepository.GetByDateRangeWithDetailsAsync(startDate, endDate))
        {
            belege.Add(new BelegListDto(
                BelegArt.Verkauf,
                sale.Id,
                sale.BelegNummer,
                sale.Verkaufsdatum,
                sale.Buyer?.FullName ?? string.Empty,
                $"{sale.Bicycle?.Marke} {sale.Bicycle?.Modell}".Trim(),
                sale.Gesamtbetrag));
        }

        return Sort(belege);
    }

    public async Task<IEnumerable<BelegListDto>> GetAnkaufBelegeAsync(DateTime startDate, DateTime endDate)
    {
        var belege = new List<BelegListDto>();

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
                purchase.Preis));
        }

        return Sort(belege);
    }

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
