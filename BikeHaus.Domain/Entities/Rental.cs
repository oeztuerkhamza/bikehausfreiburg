using BikeHaus.Domain.Enums;

namespace BikeHaus.Domain.Entities;

public class Rental : BaseEntity
{
    // Mietvertrag-Nummer
    public string MietvertragNummer { get; set; } = string.Empty;

    // Mieter (Renter)
    public int CustomerId { get; set; }
    public string? AusweisnNr { get; set; }  // ID number

    // Fahrrad
    public int BicycleId { get; set; }

    // Mietdauer
    public DateTime StartDatum { get; set; }
    public DateTime EndDatum { get; set; }

    // Mietpreis
    public decimal Gesamtmiete { get; set; }  // Total rent (incl. MwSt.)
    public decimal Rabatt { get; set; }  // Discount

    // Kaution
    public decimal Kaution { get; set; }
    public bool KautionZurueckgegeben { get; set; } = false;
    public string? KautionRueckgabeUnterschrift { get; set; }

    // Zahlungsart
    public PaymentMethod Zahlungsart { get; set; } = PaymentMethod.Bar;

    // Zustand bei Übergabe
    public BikeConditionAtHandover ZustandBeiUebergabe { get; set; } = BikeConditionAtHandover.Gut;

    // Status
    public RentalStatus Status { get; set; } = RentalStatus.Active;

    // Notizen
    public string? Notizen { get; set; }

    // Navigation Properties
    public Customer Customer { get; set; } = null!;
    public Bicycle Bicycle { get; set; } = null!;
    public ICollection<RentalAccessoryItem> Accessories { get; set; } = new List<RentalAccessoryItem>();
}
