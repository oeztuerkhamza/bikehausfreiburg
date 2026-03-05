namespace BikeHaus.Application.Interfaces;

public interface IKleinanzeigenScraperService
{
    /// <summary>
    /// Scrapes listings from Kleinanzeigen profile page.
    /// </summary>
    /// <param name="profileUrl">The Kleinanzeigen profile/listing URL</param>
    /// <param name="existingExternalIds">External IDs already in DB — detail pages will be skipped for these</param>
    /// <param name="cancellationToken">Cancellation token for timeout support</param>
    Task<List<ScrapedListingData>> ScrapeListingsAsync(
        string profileUrl,
        HashSet<string>? existingExternalIds = null,
        CancellationToken cancellationToken = default);
}

public class ScrapedListingData
{
    public string ExternalId { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal? Price { get; set; }
    public string? PriceText { get; set; }
    public string? Category { get; set; }
    public string? Location { get; set; }
    public string ExternalUrl { get; set; } = string.Empty;
    public List<string> ImageUrls { get; set; } = new();
    /// <summary>
    /// True if only card-level data was scraped (detail page was skipped for existing listings).
    /// </summary>
    public bool IsCardDataOnly { get; set; }
}
