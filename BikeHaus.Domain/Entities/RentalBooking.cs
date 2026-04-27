using BikeHaus.Domain.Enums;

namespace BikeHaus.Domain.Entities;

public class RentalBooking : BaseEntity
{
    public int BicycleId { get; set; }
    public string BuchungsNummer { get; set; } = string.Empty;

    public DateTime StartDatum { get; set; }
    public DateTime EndDatum { get; set; }

    public string Vorname { get; set; } = string.Empty;
    public string Nachname { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? Telefon { get; set; }
    public string? Sprache { get; set; }

    public string? Notizen { get; set; }
    public string? AdminNotizen { get; set; }

    public decimal? Gesamtpreis { get; set; }
    public RentalBookingStatus Status { get; set; } = RentalBookingStatus.Pending;

    public DateTime? ApprovedAt { get; set; }
    public DateTime? CancelledAt { get; set; }

    public Bicycle Bicycle { get; set; } = null!;
    public ICollection<RentalBookingAccessory> Accessories { get; set; } = new List<RentalBookingAccessory>();
}
