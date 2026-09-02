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

    // Stock number (Lagernummer): per-bike sequential number used to match
    // Ankauf- and Verkaufsbelege when the Rahmennummer is missing/mismatched.
    public int? Lagernummer { get; set; }

    public string? Rahmengroesse { get; set; }                   // Frame Size (Rahmengröße)
    public string? Farbe { get; set; }                          // Color (Rahmenfarbe)
    public string Reifengroesse { get; set; } = string.Empty;  // Tire Size (Zoll)
    public string? Fahrradtyp { get; set; }                     // Bike Type (E-Bike, Trekking, etc.)
    public string? Art { get; set; }                             // Gender: Herren, Damen, Kinder
    public string? Gangschaltung { get; set; }                   // Gears, e.g. "21 Gänge" / "Shimano Nexus 7"
    public string? Beschreibung { get; set; }                   // Description (Ausstattung/Features)
    public BikeStatus Status { get; set; } = BikeStatus.Available;
    public BikeCondition Zustand { get; set; } = BikeCondition.Gebraucht; // Neu or Gebraucht

    // Rental settings
    public bool IsRentable { get; set; } = false;

    // Interne Nummer des Mietrads ("E7", "12"). Steht am Rahmen und dient der
    // Zuordnung im Laden — sie wird bewusst NICHT an Kunden ausgeliefert und
    // fehlt deshalb im PublicRentalBicycleDto.
    public string? Fahrradnummer { get; set; }

    // Empfohlene Körpergröße des Fahrers in cm (nur bei Mietfahrrädern
    // gepflegt). Als zwei Zahlen statt als Satz, damit sie überall gleich
    // dargestellt und später auch gefiltert werden kann.
    public int? KoerpergroesseVonCm { get; set; }
    public int? KoerpergroesseBisCm { get; set; }
    public decimal? RentalPriceDay1 { get; set; }
    public decimal? RentalPriceDay2 { get; set; }
    public decimal? RentalPriceDay3 { get; set; }
    public decimal? RentalPriceDay4 { get; set; }
    public decimal? RentalPriceDay5 { get; set; }
    public decimal? RentalPriceDay6 { get; set; }
    public decimal? RentalPriceDay7 { get; set; }
    public decimal? RentalPriceAdditionalDayAfter7 { get; set; }
    public decimal? Kaution { get; set; }

    // Publishing flags
    public bool IsPublishedOnWebsite { get; set; } = false;
    public bool IsPublishedOnKleinanzeigen { get; set; } = false;

    /// <summary>
    /// Gehoert dieses Rad in den SHOWROOM-Katalog?
    ///
    /// Die Bicycle-Tabelle traegt alles: angekaufte Raeder, verkaufte, Mietraeder
    /// und die Raeder, die eigens fuer den Showroom angelegt wurden. Bisher war
    /// IsPublishedOnWebsite das einzige Unterscheidungsmerkmal — und das liess
    /// sich auch aus der Bestandsliste umlegen. Damit landete Ware aus dem
    /// Tagesgeschaeft im oeffentlichen Showroom, und die Showroom-Pflegeseite
    /// zeigte umgekehrt den kompletten Bestand.
    ///
    /// Dieses Flag zieht die Grenze: nur ein Rad, das ausdruecklich in den
    /// Showroom-Katalog aufgenommen wurde, kann dort erscheinen. Zusammen mit
    /// IsPublishedOnWebsite entscheidet es ueber die oeffentliche Sichtbarkeit —
    /// das eine sagt "gehoert in den Katalog", das andere "ist gerade sichtbar".
    /// </summary>
    public bool IsShowroomBike { get; set; } = false;
    public decimal? VerkaufspreisVorschlag { get; set; }  // Suggested selling price for listings
    public string? KleinanzeigenAnzeigeNr { get; set; }   // Kleinanzeigen ad number (Verkaufs-Anzeige-Nr)

    // Navigation Properties
    public Purchase? Purchase { get; set; }
    public ICollection<Sale> Sales { get; set; } = new List<Sale>();
    public Reservation? Reservation { get; set; }
    public ICollection<RentalBike> RentalBikes { get; set; } = new List<RentalBike>();
    public ICollection<Document> Documents { get; set; } = new List<Document>();
    public ICollection<BicycleImage> Images { get; set; } = new List<BicycleImage>();
}
