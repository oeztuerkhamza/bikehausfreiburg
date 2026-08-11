using BikeHaus.Application.DTOs;

namespace BikeHaus.Application.Interfaces;

/// <summary>
/// Gemeinsame Sicht auf Miet- und Verkaufsbelege eines Zeitraums.
/// </summary>
public interface IBelegeService
{
    /// <summary>Beide Belegarten in einer nach Datum sortierten Liste.</summary>
    Task<IEnumerable<BelegListDto>> GetBelegeAsync(DateTime startDate, DateTime endDate);

    /// <summary>
    /// Mietverträge und Verkaufsbelege des Zeitraums in EINER PDF-Datei,
    /// in derselben Reihenfolge wie in der Liste.
    /// </summary>
    Task<byte[]> GenerateCombinedPdfAsync(DateTime startDate, DateTime endDate);

    /// <summary>Ankaufbelege des Zeitraums, gleiche Sortierung wie die Übersicht.</summary>
    Task<IEnumerable<BelegListDto>> GetAnkaufBelegeAsync(DateTime startDate, DateTime endDate);

    /// <summary>Ankaufbelege des Zeitraums in EINER PDF-Datei.</summary>
    Task<byte[]> GenerateAnkaufPdfAsync(DateTime startDate, DateTime endDate);

    /// <summary>Setzt oder entfernt das Flatpay-Häkchen eines Belegs.</summary>
    Task SetFlatpayAsync(BelegArt art, int belegId, bool flatpay);

    /// <summary>
    /// Gleicht den Transaktionsbericht des Flatpay-Terminals (.xlsx) mit den
    /// Belegen ab und hakt die getroffenen an. Bereits gesetzte Häkchen bleiben
    /// stehen — der Abgleich entfernt nie eines.
    /// </summary>
    Task<FlatpayImportResultDto> ImportFlatpayReportAsync(Stream xlsx);
}
