using BikeHaus.Domain.Enums;

namespace BikeHaus.Domain.Entities;

public class Bicycle : BaseEntity
{
    public string Marke { get; set; } = string.Empty;          // Brand
    public string Modell { get; set; } = string.Empty;         // Model
    public string? Rahmennummer { get; set; }                   // Frame Number (Serienummer)
    public string? Rahmengroesse { get; set; }                   // Frame Size (Rahmengröße)
    public string? Farbe { get; set; }                          // Color (Rahmenfarbe)
    public string Reifengroesse { get; set; } = string.Empty;  // Tire Size (Zoll)
    public string? StokNo { get; set; }                         // Stock Number (Stok Numarası)
    public string? Fahrradtyp { get; set; }                     // Bike Type (E-Bike, Trekking, etc.)
    public string? Art { get; set; }                             // Gender: Herren, Damen, Kinder
    public string? Beschreibung { get; set; }                   // Description (Ausstattung/Features)
    public BikeStatus Status { get; set; } = BikeStatus.Available;
    public BikeCondition Zustand { get; set; } = BikeCondition.Gebraucht; // Neu or Gebraucht

    // Publishing flags
    public bool IsPublishedOnWebsite { get; set; } = false;
    public bool IsPublishedOnKleinanzeigen { get; set; } = false;
    public decimal? VerkaufspreisVorschlag { get; set; }  // Suggested selling price for listings
    public string? KleinanzeigenAnzeigeNr { get; set; }   // Kleinanzeigen ad number (Verkaufs-Anzeige-Nr)

    // Navigation Properties
    public Purchase? Purchase { get; set; }
    public ICollection<Sale> Sales { get; set; } = new List<Sale>();
    public Reservation? Reservation { get; set; }
    public ICollection<Document> Documents { get; set; } = new List<Document>();
    public ICollection<BicycleImage> Images { get; set; } = new List<BicycleImage>();
}
