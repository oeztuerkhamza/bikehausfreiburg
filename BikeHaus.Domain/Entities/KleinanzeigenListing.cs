namespace BikeHaus.Domain.Entities;

public class KleinanzeigenListing : BaseEntity
{
    public string ExternalId { get; set; } = string.Empty;       // Kleinanzeigen ad ID (unique)
    public string Title { get; set; } = string.Empty;             // Ad title
    public string? Description { get; set; }                      // Full description
    public decimal? Price { get; set; }                           // Price in EUR
    public string? PriceText { get; set; }                        // Raw price text (e.g. "VB", "Zu verschenken")
    public string? Category { get; set; }                         // Kleinanzeigen category name
    public string? Location { get; set; }                         // Location text
    public string ExternalUrl { get; set; } = string.Empty;       // Direct link to the listing
    public bool IsActive { get; set; } = true;                    // Still on Kleinanzeigen?
    public DateTime? LastScrapedAt { get; set; }                  // Last scrape timestamp

    // Navigation property
    public List<KleinanzeigenImage> Images { get; set; } = new();
}
