using BikeHaus.Application.DTOs;

namespace BikeHaus.Application.Interfaces;

/// <summary>
/// Holt Titel, Foto und Preis einer Anzeige direkt von kleinanzeigen.de —
/// für Anzeigen, die (noch) nicht im gescrapten Bestand liegen, etwa weil sie
/// über ein anderes Kleinanzeigen-Konto laufen oder erst nach dem letzten
/// Sync eingestellt wurden.
/// </summary>
public interface IKleinanzeigenAdLookup
{
    /// <summary>Anzeigendaten zur Anzeigennummer; <c>null</c>, wenn die Anzeige nicht erreichbar ist.</summary>
    Task<KleinanzeigenAdInfoDto?> GetAsync(string adId, CancellationToken ct);
}
