using BikeHaus.Domain.Enums;

namespace BikeHaus.Domain.Entities;

public class Document : BaseEntity
{
    public string FileName { get; set; } = string.Empty;
    public string FilePath { get; set; } = string.Empty;
    public string ContentType { get; set; } = string.Empty;
    public long FileSize { get; set; }
    public DocumentType DocumentType { get; set; }

    // Optional relations
    public int? BicycleId { get; set; }
    public int? PurchaseId { get; set; }
    public int? SaleId { get; set; }

    // Navigation Properties
    public Bicycle? Bicycle { get; set; }
    public Purchase? Purchase { get; set; }
    public Sale? Sale { get; set; }
}
