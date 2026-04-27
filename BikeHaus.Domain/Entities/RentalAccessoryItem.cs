namespace BikeHaus.Domain.Entities;

public class RentalAccessoryItem : BaseEntity
{
    public int RentalId { get; set; }
    public int? RentalAccessoryId { get; set; }

    public string Bezeichnung { get; set; } = string.Empty;
    public decimal Tagespreis { get; set; }
    public decimal? Verlustgebuehr { get; set; }
    public int Menge { get; set; } = 1;

    public Rental Rental { get; set; } = null!;
    public RentalAccessory? RentalAccessory { get; set; }
}
