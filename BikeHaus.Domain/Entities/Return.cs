using BikeHaus.Domain.Enums;

namespace BikeHaus.Domain.Entities;

public class Return : BaseEntity
{
    public int SaleId { get; set; }                              // Original Sale
    public int BicycleId { get; set; }                           // Returned Bicycle
    public int CustomerId { get; set; }                          // Customer returning

    public DateTime Rueckgabedatum { get; set; } = DateTime.UtcNow;  // Return Date
    public ReturnReason Grund { get; set; }                      // Return Reason
    public string? GrundDetails { get; set; }                    // Detailed reason description
    public decimal Erstattungsbetrag { get; set; }               // Refund Amount
    public PaymentMethod Zahlungsart { get; set; }               // Refund payment method
    public string? Notizen { get; set; }                         // Notes
    public string BelegNummer { get; set; } = string.Empty;      // Return Receipt Number

    // Signature FK
    public int? CustomerSignatureId { get; set; }
    public int? ShopSignatureId { get; set; }

    // Navigation Properties
    public Sale Sale { get; set; } = null!;
    public Bicycle Bicycle { get; set; } = null!;
    public Customer Customer { get; set; } = null!;
    public Signature? CustomerSignature { get; set; }
    public Signature? ShopSignature { get; set; }
    public ICollection<Document> Documents { get; set; } = new List<Document>();
}
