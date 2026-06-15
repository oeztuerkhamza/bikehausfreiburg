namespace BikeHaus.Domain.Entities;

public class EBike : BaseEntity
{
    public string Titel { get; set; } = string.Empty;
    public string? Beschreibung { get; set; }
    public decimal Preis { get; set; }
    public string? PreisText { get; set; }
    public string? Kategorie { get; set; }
    public string? Marke { get; set; }
    public string? Modell { get; set; }
    public string? Farbe { get; set; }
    public string? Rahmengroesse { get; set; }
    public string? Reifengroesse { get; set; }
    public string? Gangschaltung { get; set; }
    public string Zustand { get; set; } = "Neu";
    public decimal? Angebot { get; set; }
    public bool IsActive { get; set; } = true;

    // E-bike specific fields
    public string? MotorMarke { get; set; }      // motor brand: Bosch, Shimano, Yamaha...
    public string? MotorPosition { get; set; }   // Mittelmotor / Heckmotor / Frontmotor
    public int? AkkuKapazitaetWh { get; set; }   // battery capacity, Wh
    public int? ReichweiteKm { get; set; }       // estimated range, km (often null)
    public int? MotorLeistungNm { get; set; }    // torque, Nm

    // Navigation property
    public List<EBikeImage> Images { get; set; } = new();
}
