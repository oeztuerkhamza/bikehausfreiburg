namespace BikeHaus.Domain.Entities;

/// <summary>
/// Represents an accessory sold with a bicycle (e.g., helmet, lock, lights)
/// </summary>
public class SaleAccessory : BaseEntity
{
    public int SaleId { get; set; }
    public string Bezeichnung { get; set; } = string.Empty;  // Name/Description
    public decimal Preis { get; set; }                        // Price
    public int Menge { get; set; } = 1;                       // Quantity

    // Computed
    public decimal Gesamtpreis => Preis * Menge;

    // Navigation
    public Sale Sale { get; set; } = null!;
}
