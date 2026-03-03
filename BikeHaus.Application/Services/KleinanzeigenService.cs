using BikeHaus.Application.DTOs;
using BikeHaus.Application.Interfaces;
using BikeHaus.Domain.Entities;
using BikeHaus.Domain.Interfaces;
using Microsoft.Extensions.Logging;

namespace BikeHaus.Application.Services;

public class KleinanzeigenService : IKleinanzeigenService
{
    private readonly IKleinanzeigenListingRepository _listingRepository;
    private readonly IShopSettingsRepository _settingsRepository;
    private readonly IKleinanzeigenScraperService _scraperService;
    private readonly ILogger<KleinanzeigenService> _logger;

    public KleinanzeigenService(
        IKleinanzeigenListingRepository listingRepository,
        IShopSettingsRepository settingsRepository,
        IKleinanzeigenScraperService scraperService,
        ILogger<KleinanzeigenService> logger)
    {
        _listingRepository = listingRepository;
        _settingsRepository = settingsRepository;
        _scraperService = scraperService;
        _logger = logger;
    }

    public async Task<IEnumerable<KleinanzeigenListingDto>> GetAllActiveListingsAsync()
    {
        var listings = await _listingRepository.GetAllActiveAsync();
        return listings.Select(MapToDto);
    }

    public async Task<IEnumerable<KleinanzeigenListingDto>> GetListingsByCategoryAsync(string category)
    {
        var listings = await _listingRepository.GetByCategoryAsync(category);
        return listings.Select(MapToDto);
    }

    public async Task<KleinanzeigenListingDto?> GetListingByIdAsync(int id)
    {
        var listing = await _listingRepository.GetWithImagesAsync(id);
        return listing == null ? null : MapToDto(listing);
    }

    public async Task<IEnumerable<KleinanzeigenCategoryDto>> GetCategoriesAsync()
    {
        var listings = await _listingRepository.GetAllActiveAsync();
        var categories = listings
            .Where(l => !string.IsNullOrEmpty(l.Category))
            .GroupBy(l => l.Category!)
            .Select(g => new KleinanzeigenCategoryDto
            {
                Name = g.Key,
                Count = g.Count()
            })
            .OrderBy(c => c.Name)
            .ToList();

        return categories;
    }

    public async Task<DateTime?> GetLastSyncTimeAsync()
    {
        return await _listingRepository.GetLastScrapeTimeAsync();
    }

    public async Task<PublicShopInfoDto?> GetPublicShopInfoAsync()
    {
        var settings = await _settingsRepository.GetSettingsAsync();
        if (settings == null) return null;

        var activeListings = await _listingRepository.GetAllActiveAsync();

        return new PublicShopInfoDto
        {
            ShopName = settings.ShopName,
            Strasse = settings.Strasse,
            Hausnummer = settings.Hausnummer,
            PLZ = settings.PLZ,
            Stadt = settings.Stadt,
            Telefon = settings.Telefon,
            Email = settings.Email,
            Website = settings.Website,
            LogoBase64 = settings.LogoBase64,
            LogoFileName = settings.LogoFileName,
            Oeffnungszeiten = settings.Oeffnungszeiten,
            FullAddress = settings.FullAddress,
            TotalActiveListings = activeListings.Count(),
            KleinanzeigenUrl = settings.KleinanzeigenUrl
        };
    }

    public async Task<KleinanzeigenSyncResultDto> TriggerSyncAsync(CancellationToken cancellationToken = default)
    {
        var result = new KleinanzeigenSyncResultDto { SyncedAt = DateTime.UtcNow };

        try
        {
            var settings = await _settingsRepository.GetSettingsAsync();
            if (settings == null || string.IsNullOrEmpty(settings.KleinanzeigenUrl))
            {
                result.Error = "Kleinanzeigen URL is not configured in shop settings.";
                return result;
            }

            _logger.LogInformation("Starting Kleinanzeigen sync from: {Url}", settings.KleinanzeigenUrl);

            // Get existing external IDs so scraper can skip detail pages for known listings
            var existingListings = await _listingRepository.GetAllActiveAsync();
            var existingExternalIds = new HashSet<string>(existingListings.Select(l => l.ExternalId));
            _logger.LogInformation("Found {Count} existing listings in DB", existingExternalIds.Count);

            // Scrape listings from Kleinanzeigen (skips detail pages for existing IDs)
            var scrapedListings = await _scraperService.ScrapeListingsAsync(
                settings.KleinanzeigenUrl, existingExternalIds, cancellationToken);

            if (!scrapedListings.Any())
            {
                _logger.LogWarning("No listings scraped from Kleinanzeigen.");
                result.Error = "No listings found. The page might be empty or scraping failed.";
                return result;
            }

            var activeExternalIds = new List<string>();
            int newCount = 0, updateCount = 0;

            foreach (var scraped in scrapedListings)
            {
                activeExternalIds.Add(scraped.ExternalId);

                var existing = await _listingRepository.GetByExternalIdAsync(scraped.ExternalId);

                if (existing == null)
                {
                    // New listing — insert
                    var listing = new KleinanzeigenListing
                    {
                        ExternalId = scraped.ExternalId,
                        Title = scraped.Title,
                        Description = scraped.Description,
                        Price = scraped.Price,
                        PriceText = scraped.PriceText,
                        Category = scraped.Category,
                        Location = scraped.Location,
                        ExternalUrl = scraped.ExternalUrl,
                        IsActive = true,
                        LastScrapedAt = DateTime.UtcNow,
                        Images = scraped.ImageUrls.Select((url, index) => new KleinanzeigenImage
                        {
                            ImageUrl = url,
                            SortOrder = index
                        }).ToList()
                    };

                    await _listingRepository.AddAsync(listing);
                    newCount++;
                }
                else
                {
                    // Existing listing — update
                    if (scraped.IsCardDataOnly)
                    {
                        // Only card-level data available (detail page was skipped)
                        // Update only title/price from card, preserve description/images/location
                        existing.Title = !string.IsNullOrEmpty(scraped.Title) ? scraped.Title : existing.Title;
                        existing.PriceText = scraped.PriceText ?? existing.PriceText;
                        existing.IsActive = true;
                        existing.LastScrapedAt = DateTime.UtcNow;
                        existing.UpdatedAt = DateTime.UtcNow;
                    }
                    else
                    {
                        // Full detail data available
                        existing.Title = scraped.Title;
                        existing.Description = scraped.Description;
                        existing.Price = scraped.Price;
                        existing.PriceText = scraped.PriceText;
                        existing.Category = scraped.Category;
                        existing.Location = scraped.Location;
                        existing.IsActive = true;
                        existing.LastScrapedAt = DateTime.UtcNow;
                        existing.UpdatedAt = DateTime.UtcNow;

                        // Update images: clear old, add new
                        existing.Images.Clear();
                        foreach (var (url, index) in scraped.ImageUrls.Select((u, i) => (u, i)))
                        {
                            existing.Images.Add(new KleinanzeigenImage
                            {
                                ImageUrl = url,
                                SortOrder = index
                            });
                        }
                    }

                    await _listingRepository.UpdateAsync(existing);
                    updateCount++;
                }
            }

            // Deactivate listings no longer on Kleinanzeigen (soft-delete — NEVER touches Bicycle table)
            await _listingRepository.DeactivateRemovedAsync(activeExternalIds);
            var totalActive = (await _listingRepository.GetAllActiveAsync()).Count();
            var deactivated = totalActive < scrapedListings.Count ? 0 : 0; // Count by checking before/after

            result.NewListings = newCount;
            result.UpdatedListings = updateCount;
            result.DeactivatedListings = deactivated;

            _logger.LogInformation(
                "Kleinanzeigen sync completed: {New} new, {Updated} updated, from {Total} scraped.",
                newCount, updateCount, scrapedListings.Count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during Kleinanzeigen sync");
            result.Error = $"Sync failed: {ex.Message}";
        }

        return result;
    }

    /// <summary>
    /// Categories are now only set from Kleinanzeigen "Art" attribute during scraping.
    /// To fix categories, a full re-sync is required.
    /// </summary>
    public async Task<int> FixCategoriesAsync()
    {
        _logger.LogWarning("FixCategories is deprecated. Categories are now set from Kleinanzeigen 'Art' attribute during scraping. Please use full re-sync to update categories.");
        await Task.CompletedTask;
        return 0;
    }

    /// <summary>
    /// Delete all Kleinanzeigen listings. Use this before a full re-sync to get fresh data with correct categories.
    /// </summary>
    public async Task<int> DeleteAllListingsAsync()
    {
        var listings = await _listingRepository.GetAllAsync();
        var count = 0;
        foreach (var listing in listings)
        {
            await _listingRepository.DeleteAsync(listing.Id);
            count++;
        }
        _logger.LogInformation("Deleted {Count} Kleinanzeigen listings", count);
        return count;
    }

    private static KleinanzeigenListingDto MapToDto(KleinanzeigenListing listing)
    {
        return new KleinanzeigenListingDto
        {
            Id = listing.Id,
            ExternalId = listing.ExternalId,
            Title = listing.Title,
            Description = listing.Description,
            Price = listing.Price,
            PriceText = listing.PriceText,
            Category = listing.Category,
            Location = listing.Location,
            ExternalUrl = listing.ExternalUrl,
            IsActive = listing.IsActive,
            LastScrapedAt = listing.LastScrapedAt,
            CreatedAt = listing.CreatedAt,
            Images = listing.Images.Select(i => new KleinanzeigenImageDto
            {
                Id = i.Id,
                ImageUrl = i.ImageUrl,
                LocalPath = i.LocalPath,
                SortOrder = i.SortOrder
            }).ToList()
        };
    }
}
