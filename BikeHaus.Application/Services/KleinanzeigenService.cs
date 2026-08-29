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
            OeffnungszeitenJson = settings.OeffnungszeitenJson,
            FullAddress = settings.FullAddress,
            TotalActiveListings = activeListings.Count(),
            KleinanzeigenUrl = settings.KleinanzeigenUrl,
            Steuernummer = settings.Steuernummer,
            UstIdNr = settings.UstIdNr,
            GoogleReviewUrl = settings.GoogleReviewUrl
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

            // Bekannte Anzeigen ueberspringen die Detailseite — dort haengen aber
            // die Bilder. Anzeigen OHNE Bild werden deshalb bewusst wie neue
            // behandelt, damit sie noch einmal vollstaendig geholt werden.
            //
            // Hintergrund: Die Detailseite wird nur beim ersten Fund besucht.
            // Liefert sie damals kein Bild (Galerie noch nicht im DOM), blieb die
            // Anzeige fuer immer bildlos — bei 133 von 175 Anzeigen war genau das
            // passiert, obwohl die Anzeigen auf Kleinanzeigen Fotos haben.
            //
            // Pro Lauf nur ein begrenztes Kontingent, sonst besucht ein einziger
            // Sync ueber hundert Detailseiten am Stueck und faellt der
            // Bot-Erkennung auf. Bei alle 4 Stunden ist der Rueckstand in rund
            // einem Tag abgearbeitet.
            // Bewusst klein: Jede Nachhol-Anzeige bedeutet einen Chromium-
            // Seitenaufruf, und genau diese Last hat den Host am 25.08. ins
            // Swap-Thrashing getrieben. Lieber laenger nachholen als die
            // Maschine erneut lahmlegen.
            const int maxImageRepairsPerRun = 8;

            // Eine Anzeige mit auffaellig VIELEN Bildern ist genauso kaputt wie
            // eine ohne. Bis zur Korrektur der Bildsuche griff der Scraper ueber
            // die ganze Anzeigenseite und sammelte die Vorschaubilder der anderen
            // Anzeigen des Haendlers mit ein — ein gebrauchtes Rad landete so bei
            // 137 Fotos, darunter Werbebanner und Gruppenfotos. Solche Anzeigen
            // haetten sich nie von selbst erholt: nachgeholt wurde bisher nur,
            // was GAR KEIN Bild hatte, und Detailseiten besucht der Lauf sonst
            // nur fuer neue Anzeigen. Deshalb kommen sie hier mit in die
            // Reparaturschlange und werden mit der korrigierten Bildsuche neu
            // eingelesen.
            const int implausibleImageCount = 30;

            var existingListings = await _listingRepository.GetAllActiveAsync();
            var broken = existingListings
                .Where(l => l.Images == null
                            || l.Images.Count == 0
                            || l.Images.Count >= implausibleImageCount)
                .ToList();

            var needImages = broken
                // Die leeren zuerst: dort fehlt dem Kunden das Bild ganz, waehrend
                // eine ueberfuellte Galerie wenigstens das richtige Rad zeigt.
                .OrderBy(l => l.Images == null || l.Images.Count == 0 ? 0 : 1)
                .ThenBy(l => l.LastScrapedAt ?? l.CreatedAt)
                .Take(maxImageRepairsPerRun)
                .Select(l => l.ExternalId)
                .ToHashSet();

            var existingExternalIds = new HashSet<string>(
                existingListings
                    .Select(l => l.ExternalId)
                    .Where(id => !needImages.Contains(id)));

            var missingTotal = broken.Count(l => l.Images == null || l.Images.Count == 0);
            var bloatedTotal = broken.Count - missingTotal;
            _logger.LogInformation(
                "Found {Count} existing listings in DB; {Missing} ohne Bild, {Bloated} mit unplausibel vielen Bildern, davon {Repair} in diesem Lauf zur Nachholung",
                existingListings.Count(), missingTotal, bloatedTotal, needImages.Count);

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

                        // Bilder nur ersetzen, wenn der Lauf ueberhaupt welche
                        // gefunden hat. Ohne diese Bedingung loescht ein einziger
                        // Fehlversuch — Galerie nicht geladen, Timeout — die
                        // vorhandenen Fotos und die Anzeige steht wieder ohne da.
                        if (scraped.ImageUrls.Count > 0)
                        {
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
                        else if (existing.Images.Count > 0)
                        {
                            _logger.LogWarning(
                                "Detailseite von {Id} lieferte keine Bilder — vorhandene {Count} bleiben erhalten",
                                existing.ExternalId, existing.Images.Count);
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
