namespace BikeHaus.Domain.Entities;

public class RentalBookingBike : BaseEntity
{
    public int RentalBookingId { get; set; }
    public int BicycleId { get; set; }
    public string? Rahmennummer { get; set; }
    public string? Farbe { get; set; }
    public decimal? Kaution { get; set; }
    public DateTime StartDatum { get; set; }
    public DateTime EndDatum { get; set; }
    public decimal? Gesamtpreis { get; set; }

    public RentalBooking RentalBooking { get; set; } = null!;
    public Bicycle Bicycle { get; set; } = null!;
}
