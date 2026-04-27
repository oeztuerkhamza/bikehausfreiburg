using BikeHaus.Domain.Enums;

namespace BikeHaus.Domain.Entities;

public class Bicycle : BaseEntity
{
    public string Marke { get; set; } = string.Empty;          // Brand
    public string Modell { get; set; } = string.Empty;         // Model

    private string? _rahmennummer;
    public string? Rahmennummer                                 // Frame Number (Serienummer)
    {
        get => _rahmennummer;
        set => _rahmennummer = value?.ToUpperInvariant();
    }

    public string? Rahmengroesse { get; set; }                   // Frame Size (Rahmengröße)
    public string? Farbe { get; set; }                          // Color (Rahmenfarbe)
    public string Reifengroesse { get; set; } = string.Empty;  // Tire Size (Zoll)
    public string? Fahrradtyp { get; set; }                     // Bike Type (E-Bike, Trekking, etc.)
    public string? Art { get; set; }                             // Gender: Herren, Damen, Kinder
    public string? Beschreibung { get; set; }                   // Description (Ausstattung/Features)
    public BikeStatus Status { get; set; } = BikeStatus.Available;
    public BikeCondition Zustand { get; set; } = BikeCondition.Gebraucht; // Neu or Gebraucht

    // Rental settings
    public bool IsRentable { get; set; } = false;
    public decimal? RentalPriceDay1 { get; set; }
    public decimal? RentalPriceDay3 { get; set; }
    public decimal? RentalPriceDay7 { get; set; }
    public decimal? RentalPriceDay14 { get; set; }
    public decimal? RentalPriceDay30 { get; set; }
    public decimal? RentalPricePerDayFrom10 { get; set; }

    // Publishing flags
    public bool IsPublishedOnWebsite { get; set; } = false;
    public bool IsPublishedOnKleinanzeigen { get; set; } = false;
    public decimal? VerkaufspreisVorschlag { get; set; }  // Suggested selling price for listings
    public string? KleinanzeigenAnzeigeNr { get; set; }   // Kleinanzeigen ad number (Verkaufs-Anzeige-Nr)

    // Navigation Properties
    public Purchase? Purchase { get; set; }
    public ICollection<Sale> Sales { get; set; } = new List<Sale>();
    public Reservation? Reservation { get; set; }
    public ICollection<Rental> Rentals { get; set; } = new List<Rental>();
    public ICollection<Document> Documents { get; set; } = new List<Document>();
    public ICollection<BicycleImage> Images { get; set; } = new List<BicycleImage>();
}
