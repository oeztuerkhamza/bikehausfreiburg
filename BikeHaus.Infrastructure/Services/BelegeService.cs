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

    public async Task<byte[]> GenerateCombinedPdfAsync(DateTime startDate, DateTime endDate)
    {
        var belege = (await GetBelegeAsync(startDate, endDate)).ToList();

        // Reihenfolge der Liste = Reihenfolge im Dokument.
        var parts = new List<byte[]>();
        foreach (var beleg in belege)
        {
            try
            {
                parts.Add(beleg.Art == BelegArt.Miete
                    ? await pdfService.GenerateMietvertragAsync(beleg.Id)
                    : await pdfService.GenerateVerkaufsbelegAsync(beleg.Id));
            }
            catch (Exception ex)
            {
                // Ein defekter Einzelbeleg darf die gesamte Datei nicht verhindern.
                logger.LogError(ex,
                    "Beleg konnte nicht erzeugt werden und fehlt in der Sammeldatei: {Art} {Nummer} (Id {Id})",
                    beleg.Art, beleg.BelegNummer, beleg.Id);
            }
        }

        return Merge(parts);
    }

    // Datum bestimmt die Reihenfolge; bei gleichem Datum entscheidet die
    // Belegnummer, damit die Ausgabe zwischen zwei Läufen stabil bleibt.
    private static List<BelegListDto> Sort(IEnumerable<BelegListDto> belege) =>
        belege
            .OrderBy(b => b.Datum)
            .ThenBy(b => b.BelegNummer, StringComparer.OrdinalIgnoreCase)
            .ThenBy(b => b.Id)
            .ToList();

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
