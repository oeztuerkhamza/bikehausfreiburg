using BikeHaus.Domain.Enums;

namespace BikeHaus.Domain.Entities;

public class Sale : BaseEntity
{
    public int BicycleId { get; set; }
    public int BuyerId { get; set; }                            // Customer who bought the bike
    public int? PurchaseId { get; set; }                        // Link to original purchase
    public decimal Preis { get; set; }                          // Selling Price
    public PaymentMethod Zahlungsart { get; set; }              // Payment Method
    public DateTime Verkaufsdatum { get; set; } = DateTime.UtcNow; // Sale Date
    public bool Garantie { get; set; }                          // Warranty included
    public string? GarantieBedingungen { get; set; }            // Warranty Terms
    public string? Notizen { get; set; }                        // Notes
    public string BelegNummer { get; set; } = string.Empty;     // Receipt Number

    // Signature FK
    public int? BuyerSignatureId { get; set; }
    public int? SellerSignatureId { get; set; }

    // Navigation Properties
    public Bicycle Bicycle { get; set; } = null!;
    public Customer Buyer { get; set; } = null!;
    public Purchase? Purchase { get; set; }
    public Signature? BuyerSignature { get; set; }
    public Signature? SellerSignature { get; set; }
    public ICollection<Document> Documents { get; set; } = new List<Document>();
    public ICollection<SaleAccessory> Accessories { get; set; } = new List<SaleAccessory>();

    // Computed: Total including accessories
    public decimal Gesamtbetrag => Preis + Accessories.Sum(a => a.Gesamtpreis);
}
