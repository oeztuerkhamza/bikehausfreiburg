using BikeHaus.Domain.Enums;

namespace BikeHaus.Domain.Entities;

public class Bicycle : BaseEntity
{
    public string Marke { get; set; } = string.Empty;          // Brand
    public string Modell { get; set; } = string.Empty;         // Model
    public string Rahmennummer { get; set; } = string.Empty;   // Frame Number (Serienummer)
    public string Farbe { get; set; } = string.Empty;          // Color (Rahmenfarbe)
    public string Reifengroesse { get; set; } = string.Empty;  // Tire Size (Zoll)
    public string? Fahrradtyp { get; set; }                     // Bike Type (E-Bike, Trekking, etc.)
    public string? Beschreibung { get; set; }                   // Description (Ausstattung/Features)
    public BikeStatus Status { get; set; } = BikeStatus.Available;
    public BikeCondition Zustand { get; set; } = BikeCondition.Gebraucht; // Neu or Gebraucht

    // Navigation Properties
    public Purchase? Purchase { get; set; }
    public Sale? Sale { get; set; }
    public ICollection<Document> Documents { get; set; } = new List<Document>();
}
