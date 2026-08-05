namespace BikeHaus.Domain.Entities;

public class RentalBookingAccessory : BaseEntity
{
    public int RentalBookingId { get; set; }
    public int? RentalAccessoryId { get; set; }

    public string Bezeichnung { get; set; } = string.Empty;
    public decimal Tagespreis { get; set; }
    public int Menge { get; set; } = 1;

    /// <summary>
    /// true = der Preis gilt einmal pro Vermietung statt je Miettag
    /// (z. B. Reparaturset oder Schlauch, den der Mieter behält).
    /// false = Tagespreis, wird mit den Miettagen multipliziert.
    /// </summary>
    public bool Einmalig { get; set; }

    public RentalBooking RentalBooking { get; set; } = null!;
    public RentalAccessory? RentalAccessory { get; set; }
}
