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
}
