using BikeHaus.Domain.Enums;

namespace BikeHaus.Domain.Entities;

public class Purchase : BaseEntity
{
    public int BicycleId { get; set; }
    public int SellerId { get; set; }                           // Customer who sold the bike
    public decimal Preis { get; set; }                          // Price
    public PaymentMethod Zahlungsart { get; set; }              // Payment Method
    public DateTime Kaufdatum { get; set; } = DateTime.UtcNow;  // Purchase Date
    public string? Notizen { get; set; }                        // Notes
    public string BelegNummer { get; set; } = string.Empty;     // Receipt Number
    public decimal? VerkaufspreisVorschlag { get; set; }         // Planned Selling Price

    // Navigation Properties
    public Bicycle Bicycle { get; set; } = null!;
    public Customer Seller { get; set; } = null!;
    public Signature? Signature { get; set; }
    public ICollection<Document> Documents { get; set; } = new List<Document>();
    public Sale? Sale { get; set; }
}
