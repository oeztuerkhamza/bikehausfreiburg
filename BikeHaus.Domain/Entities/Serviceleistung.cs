namespace BikeHaus.Domain.Entities;

/// <summary>
/// Beleg über eine durchgeführte Serviceleistung (Service/Wartung) am
/// Kundenrad. Dient ausschließlich der Dokumentation — es entsteht
/// KEINE Rechnung.
/// </summary>
public class Serviceleistung : BaseEntity
{
    public string BelegNummer { get; set; } = string.Empty;      // z.B. SL-2026-0001
    public DateTime Datum { get; set; } = DateTime.UtcNow;       // Service date

    // Kunde (Freitext — das Rad gehört dem Kunden, kein Inventar)
    public string KundeName { get; set; } = string.Empty;
    public string? KundeTelefon { get; set; }
    public string? KundeEmail { get; set; }
    public string? KundeAdresse { get; set; }

    // Fahrrad des Kunden
    public string? FahrradMarke { get; set; }
    public string? FahrradModell { get; set; }
    public string? Rahmennummer { get; set; }
    public string? Farbe { get; set; }

    // Leistung
    public string DurchgefuehrteArbeiten { get; set; } = string.Empty;
    public string? VerwendeteTeile { get; set; }                 // Used parts/materials
    public decimal? Preis { get; set; }                          // Optional documented price
    public string? Zahlungsart { get; set; }
    public string? Notizen { get; set; }
}
