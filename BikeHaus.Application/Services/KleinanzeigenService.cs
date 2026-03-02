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
    /// Fix categories for existing listings based on title analysis
    /// </summary>
    public async Task<int> FixCategoriesAsync()
    {
        var listings = await _listingRepository.GetAllActiveAsync();
        int updatedCount = 0;

        foreach (var listing in listings)
        {
            var oldCategory = listing.Category;
            var newCategory = DetectCategoryFromTitle(listing.Title);

            // Update if: new category detected AND (old category is invalid OR different)
            var isInvalidCategory = string.IsNullOrEmpty(oldCategory) ||
                                    oldCategory.Contains("Kleinanzeigen") ||
                                    oldCategory.Contains("Freiburg") ||
                                    oldCategory.Contains("Baden") ||
                                    oldCategory.Contains("Breisgau");

            if (!string.IsNullOrEmpty(newCategory) && (isInvalidCategory || newCategory != oldCategory))
            {
                listing.Category = newCategory;
                listing.UpdatedAt = DateTime.UtcNow;
                await _listingRepository.UpdateAsync(listing);
                updatedCount++;
                _logger.LogInformation("Fixed category: {Title} -> {Category} (was: {OldCategory})",
                    listing.Title, newCategory, oldCategory ?? "null");
            }
        }

        _logger.LogInformation("Fixed categories for {Count} listings", updatedCount);
        return updatedCount;
    }

    private static string? DetectCategoryFromTitle(string title)
    {
        var lowerTitle = title.ToLower();

        // Accessories/Zubehör detection first (most specific)
        if (lowerTitle.Contains("tasche") || lowerTitle.Contains("korb") ||
            lowerTitle.Contains("helm") || lowerTitle.Contains("ständer") ||
            lowerTitle.Contains("gepäckträger") || lowerTitle.Contains("gepäck") ||
            lowerTitle.Contains("schloss") || lowerTitle.Contains("licht") ||
            lowerTitle.Contains("pumpe") || lowerTitle.Contains("zubehör") ||
            lowerTitle.Contains("ersatzteil") || lowerTitle.Contains("sattel") ||
            lowerTitle.Contains("lenker") || lowerTitle.Contains("reifen") ||
            lowerTitle.Contains("schlauch") || lowerTitle.Contains("kette") ||
            lowerTitle.Contains("bremse") || lowerTitle.Contains("pedal"))
            return "Zubehör";

        if (lowerTitle.Contains("e-bike") || lowerTitle.Contains("ebike") ||
            lowerTitle.Contains("pedelec") || lowerTitle.Contains("elektro"))
            return "E-Bikes";

        if (lowerTitle.Contains("kinder") || lowerTitle.Contains("kind ") ||
            lowerTitle.Contains("junge") || lowerTitle.Contains("mädchen") ||
            lowerTitle.Contains("jugend") || lowerTitle.Contains("12 zoll") ||
            lowerTitle.Contains("14 zoll") || lowerTitle.Contains("16 zoll") ||
            lowerTitle.Contains("18 zoll") || lowerTitle.Contains("20 zoll") ||
            lowerTitle.Contains("24 zoll"))
            return "Kinder-Fahrräder";

        if (lowerTitle.Contains("damen") || lowerTitle.Contains("frau") ||
            lowerTitle.Contains("frauen") || lowerTitle.Contains("tiefeinsteiger"))
            return "Damen-Fahrräder";

        if (lowerTitle.Contains("herren") || lowerTitle.Contains("männer") ||
            lowerTitle.Contains("mann ") || lowerTitle.Contains("28 zoll") ||
            lowerTitle.Contains("29 zoll") || lowerTitle.Contains("27,5") ||
            lowerTitle.Contains("27.5") || lowerTitle.Contains("27. 5"))
            return "Herren-Fahrräder";

        if (lowerTitle.Contains("trekking"))
            return "Trekkingräder";

        if (lowerTitle.Contains("mountain") || lowerTitle.Contains("mtb") ||
            lowerTitle.Contains("fully") || lowerTitle.Contains("hardtail"))
            return "Mountainbikes";

        if (lowerTitle.Contains("city") || lowerTitle.Contains("stadt"))
            return "Cityräder";

        if (lowerTitle.Contains("rennrad") || lowerTitle.Contains("renn ") ||
            lowerTitle.Contains("renner"))
            return "Rennräder";

        if (lowerTitle.Contains("bmx"))
            return "BMX";

        if (lowerTitle.Contains("holland") || lowerTitle.Contains("hollandrad"))
            return "Hollandräder";

        if (lowerTitle.Contains("cruiser"))
            return "Cruiser";

        if (lowerTitle.Contains("klapp") || lowerTitle.Contains("falt"))
            return "Klappräder";

        // Default based on wheel size (common in titles)
        if (lowerTitle.Contains("26 zoll"))
            return "Herren-Fahrräder"; // 26" is typically adult unisex/herren

        // If title contains "Fahrrad" but no size info, mark as general
        if (lowerTitle.Contains("fahrrad") && !lowerTitle.Contains("zoll"))
            return "Sonstige Fahrräder";

        return null;
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
