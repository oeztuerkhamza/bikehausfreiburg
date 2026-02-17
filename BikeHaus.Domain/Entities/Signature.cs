using BikeHaus.Domain.Enums;

namespace BikeHaus.Domain.Entities;

public class Signature : BaseEntity
{
    public string SignatureData { get; set; } = string.Empty;   // Base64 encoded signature image
    public string SignerName { get; set; } = string.Empty;
    public SignatureType SignatureType { get; set; }
    public DateTime SignedAt { get; set; } = DateTime.UtcNow;

    // Optional relations
    public int? PurchaseId { get; set; }

    // Navigation Properties
    public Purchase? Purchase { get; set; }
}
