namespace BikeHaus.Application.Interfaces;

public interface IKleinanzeigenScraperService
{
    Task<List<ScrapedListingData>> ScrapeListingsAsync(string profileUrl);
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
}
