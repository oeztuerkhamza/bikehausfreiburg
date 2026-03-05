namespace BikeHaus.Domain.Entities;

public class KleinanzeigenImage : BaseEntity
{
    public int KleinanzeigenListingId { get; set; }
    public string ImageUrl { get; set; } = string.Empty;    // Original Kleinanzeigen URL
    public string? LocalPath { get; set; }                   // Cached local file path
    public int SortOrder { get; set; }

    // Navigation property
    public KleinanzeigenListing Listing { get; set; } = null!;
}
