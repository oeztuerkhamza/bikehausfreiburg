namespace BikeHaus.Domain.Entities;

/// <summary>
/// Funnel-Telemetrie für den öffentlichen Mietbuchungs-Flow: pro Schritt
/// (Datumswahl, Fahrradwahl, …) ein Ereignis je Besucher-Session. Rein
/// anonyme Daten — kein Personenbezug, nur SessionKey (zufälliger
/// Client-Schlüssel), Schritt, Sprache und optionale Zusatzinfo.
/// </summary>
public class RentalFunnelEvent : BaseEntity
{
    public string Step { get; set; } = string.Empty;
    public string SessionKey { get; set; } = string.Empty;
    public string? Sprache { get; set; }
    public string? Info { get; set; }
}
