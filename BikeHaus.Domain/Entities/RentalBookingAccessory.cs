namespace BikeHaus.Domain.Entities;

public class RentalBookingAccessory : BaseEntity
{
    public int RentalBookingId { get; set; }
    public int? RentalAccessoryId { get; set; }

    public string Bezeichnung { get; set; } = string.Empty;
    public decimal Tagespreis { get; set; }
    public int Menge { get; set; } = 1;

    public RentalBooking RentalBooking { get; set; } = null!;
    public RentalAccessory? RentalAccessory { get; set; }
}
