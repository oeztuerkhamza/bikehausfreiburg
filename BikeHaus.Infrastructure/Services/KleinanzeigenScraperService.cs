using BikeHaus.Application.Interfaces;
using Microsoft.Extensions.Logging;
using Microsoft.Playwright;

namespace BikeHaus.Infrastructure.Services;

public class KleinanzeigenScraperService : IKleinanzeigenScraperService
{
    private readonly ILogger<KleinanzeigenScraperService> _logger;

    public KleinanzeigenScraperService(ILogger<KleinanzeigenScraperService> logger)
    {
        _logger = logger;
    }

    public async Task<List<ScrapedListingData>> ScrapeListingsAsync(
        string profileUrl,
        HashSet<string>? existingExternalIds = null,
        CancellationToken cancellationToken = default)
    {
        var results = new List<ScrapedListingData>();

        _logger.LogInformation("Starting Kleinanzeigen scrape from: {Url}", profileUrl);

        IPlaywright? playwright = null;
        IBrowser? browser = null;

        try
        {
            playwright = await Playwright.CreateAsync();
            browser = await playwright.Chromium.LaunchAsync(new BrowserTypeLaunchOptions
            {
                Headless = true,
                Args = new[] { "--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage" }
            });

            var context = await browser.NewContextAsync(new BrowserNewContextOptions
            {
                UserAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                ViewportSize = new ViewportSize { Width = 1920, Height = 1080 },
                Locale = "de-DE"
            });

            var page = await context.NewPageAsync();

            // Navigate to profile listing page
            await page.GotoAsync(profileUrl, new PageGotoOptions
            {
                WaitUntil = WaitUntilState.DOMContentLoaded,
                Timeout = 30000
            });

            // Handle cookie consent
            await AcceptCookieConsentAsync(page);
            await page.WaitForTimeoutAsync(1000);

            // Collect all listing URLs from the listing page
            var listingCards = await ScrapeListingCardsAsync(page, profileUrl);
            _logger.LogInformation("Found {Count} listing cards on profile page", listingCards.Count);

            existingExternalIds ??= new HashSet<string>();
            var newCards = listingCards.Where(c => !existingExternalIds.Contains(c.ExternalId)).ToList();
            var existingCards = listingCards.Where(c => existingExternalIds.Contains(c.ExternalId)).ToList();
            _logger.LogInformation(
                "Listings breakdown: {New} new (need detail scrape), {Existing} existing (skip detail)",
                newCards.Count, existingCards.Count);

            // For existing listings, return card-level data only (no detail page visit)
            foreach (var card in existingCards)
            {
                cancellationToken.ThrowIfCancellationRequested();
                results.Add(new ScrapedListingData
                {
                    ExternalId = card.ExternalId,
                    Title = card.Title ?? string.Empty,
                    PriceText = card.PriceText,
                    Category = card.Category,
                    ExternalUrl = card.Url,
                    IsCardDataOnly = true
                });
            }

            // Visit detail pages ONLY for new listings
            foreach (var card in newCards)
            {
                cancellationToken.ThrowIfCancellationRequested();
                try
                {
                    var detailData = await ScrapeListingDetailAsync(page, card);
                    if (detailData != null)
                    {
                        results.Add(detailData);
                        _logger.LogInformation("Scraped listing: {Title} ({Id})", detailData.Title, detailData.ExternalId);
                    }

                    // Rate limiting between requests (reduced from 2-4s to 1-2s)
                    await page.WaitForTimeoutAsync(Random.Shared.Next(1000, 2000));
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to scrape listing detail: {Url}", card.Url);
                }
            }

            await context.CloseAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during Kleinanzeigen scraping");
            throw;
        }
        finally
        {
            if (browser != null) await browser.CloseAsync();
            playwright?.Dispose();
        }

        _logger.LogInformation("Scraping completed. Total listings scraped: {Count}", results.Count);
        return results;
    }

    private async Task AcceptCookieConsentAsync(IPage page)
    {
        try
        {
            // Try multiple selectors for cookie consent button
            var consentSelectors = new[]
            {
                "#gdpr-banner-accept",
                "button[data-testid='gdpr-banner-accept']",
                "button:has-text('Alle akzeptieren')",
                "button:has-text('Accept All')",
                "#ConsentManagementPage button.sc-gKsewC",
                "button.sc-dcJsrY"
            };

            foreach (var selector in consentSelectors)
            {
                try
                {
                    var button = page.Locator(selector).First;
                    if (await button.IsVisibleAsync(new LocatorIsVisibleOptions { Timeout = 3000 }))
                    {
                        await button.ClickAsync();
                        _logger.LogInformation("Cookie consent accepted via: {Selector}", selector);
                        await page.WaitForTimeoutAsync(1000);
                        return;
                    }
                }
                catch { /* Try next selector */ }
            }

            _logger.LogInformation("No cookie consent dialog found or already accepted");
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Error handling cookie consent");
        }
    }

    private async Task<List<ListingCard>> ScrapeListingCardsAsync(IPage page, string profileUrl)
    {
        var cards = new List<ListingCard>();
        var seenIds = new HashSet<string>();
        const int maxPages = 50; // Safety limit

        // Build base URL for pagination
        // Input:  https://www.kleinanzeigen.de/s-bestandsliste.html?userId=82831364
        // Page N: https://www.kleinanzeigen.de/s-bestandsliste.html?userId=82831364&pageNum=N&sortingField=SORTING_DATE
        var baseUri = new Uri(profileUrl);
        var baseUrl = $"{baseUri.Scheme}://{baseUri.Host}{baseUri.AbsolutePath}";
        var queryParams = System.Web.HttpUtility.ParseQueryString(baseUri.Query);
        var userId = queryParams["userId"] ?? "";

        for (int pageNum = 1; pageNum <= maxPages; pageNum++)
        {
            // Build page URL
            string pageUrl;
            if (pageNum == 1)
            {
                pageUrl = profileUrl;
            }
            else
            {
                pageUrl = $"{baseUrl}?userId={userId}&pageNum={pageNum}&sortingField=SORTING_DATE";
            }

            _logger.LogInformation("Scraping listing page {Page}: {Url}", pageNum, pageUrl);

            // Navigate to page (skip for page 1 since we're already there)
            if (pageNum > 1)
            {
                await page.GotoAsync(pageUrl, new PageGotoOptions
                {
                    WaitUntil = WaitUntilState.DOMContentLoaded,
                    Timeout = 30000
                });
                await page.WaitForTimeoutAsync(1000);
            }

            // Get all ad items on the current page
            var adElements = await page.QuerySelectorAllAsync("article.aditem, li.ad-listitem article, .aditem");

            if (adElements.Count == 0)
            {
                // Try alternative selectors
                adElements = await page.QuerySelectorAllAsync("[data-adid], .ad-listitem");
            }

            if (adElements.Count == 0)
            {
                _logger.LogInformation("No listings found on page {Page}, stopping pagination", pageNum);
                break;
            }

            var cardsFoundOnPage = 0;

            foreach (var element in adElements)
            {
                try
                {
                    var card = new ListingCard();

                    // Extract ad ID
                    var adId = await element.GetAttributeAsync("data-adid");
                    if (string.IsNullOrEmpty(adId))
                    {
                        var href = await element.QuerySelectorAsync("a[href*='/s-anzeige/']");
                        if (href != null)
                        {
                            var hrefVal = await href.GetAttributeAsync("href");
                            if (hrefVal != null)
                            {
                                // Extract ID from URL like /s-anzeige/fahrrad-xxx/12345678
                                var parts = hrefVal.TrimEnd('/').Split('/');
                                adId = parts.LastOrDefault();
                            }
                        }
                    }

                    if (string.IsNullOrEmpty(adId)) continue;

                    // Skip duplicates (same listing can appear across pages)
                    if (!seenIds.Add(adId)) continue;

                    card.ExternalId = adId;

                    // Extract URL
                    var linkEl = await element.QuerySelectorAsync("a[href*='/s-anzeige/']");
                    if (linkEl != null)
                    {
                        var hrefAttr = await linkEl.GetAttributeAsync("href");
                        if (hrefAttr != null)
                        {
                            card.Url = hrefAttr.StartsWith("http") ? hrefAttr : $"https://www.kleinanzeigen.de{hrefAttr}";
                        }
                    }

                    // Extract title
                    var titleEl = await element.QuerySelectorAsync("a.ellipsis, h2.text-module-begin, .aditem-main--middle--title, .text-module-begin a");
                    if (titleEl != null)
                    {
                        card.Title = (await titleEl.InnerTextAsync()).Trim();
                    }

                    // Extract price
                    var priceEl = await element.QuerySelectorAsync(".aditem-main--middle--price-shipping--price, .aditem-main--middle--price, p.aditem-main--middle--price-shipping--price");
                    if (priceEl != null)
                    {
                        card.PriceText = (await priceEl.InnerTextAsync()).Trim();
                    }

                    // Extract category from simpletag (more reliable for bicycle categories)
                    var categoryEl = await element.QuerySelectorAsync(".simpletag, .aditem-main--top--left span");
                    if (categoryEl != null)
                    {
                        var catText = (await categoryEl.InnerTextAsync()).Trim();
                        // Only use if it's a real bicycle category, not a location
                        if (!catText.Contains("Kleinanzeigen") && !catText.Contains("Freiburg") &&
                            !catText.Contains("Baden") && !catText.Contains("Breisgau"))
                        {
                            card.Category = catText;
                        }
                    }

                    if (!string.IsNullOrEmpty(card.Url))
                    {
                        cards.Add(card);
                        cardsFoundOnPage++;
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to parse listing card");
                }
            }

            _logger.LogInformation("Page {Page}: found {Count} new listings (total so far: {Total})", pageNum, cardsFoundOnPage, cards.Count);

            // If no new cards were found on this page, we've reached the end
            if (cardsFoundOnPage == 0)
            {
                _logger.LogInformation("No new listings on page {Page}, stopping pagination", pageNum);
                break;
            }

            // Rate limiting between page navigations
            if (pageNum < maxPages)
            {
                await page.WaitForTimeoutAsync(Random.Shared.Next(1000, 2000));
            }
        }

        return cards;
    }

    private async Task<ScrapedListingData?> ScrapeListingDetailAsync(IPage page, ListingCard card)
    {
        await page.GotoAsync(card.Url, new PageGotoOptions
        {
            WaitUntil = WaitUntilState.DOMContentLoaded,
            Timeout = 30000
        });

        await page.WaitForTimeoutAsync(800);

        var data = new ScrapedListingData
        {
            ExternalId = card.ExternalId,
            Title = card.Title ?? string.Empty,
            PriceText = card.PriceText,
            ExternalUrl = card.Url
        };

        // Extract title (more accurate from detail page)
        var titleEl = await page.QuerySelectorAsync("#viewad-title, h1.boxedarticle--title, h1[itemprop='name']");
        if (titleEl != null)
        {
            data.Title = (await titleEl.InnerTextAsync()).Trim();
        }

        // Extract price
        var priceEl = await page.QuerySelectorAsync("#viewad-price, .boxedarticle--price, h2.boxedarticle--price");
        if (priceEl != null)
        {
            var priceText = (await priceEl.InnerTextAsync()).Trim();
            data.PriceText = priceText;
            data.Price = ParsePrice(priceText);
        }

        // Extract description
        var descEl = await page.QuerySelectorAsync("#viewad-description-text, .boxedarticle--detail--text, p[itemprop='description']");
        if (descEl != null)
        {
            data.Description = (await descEl.InnerTextAsync()).Trim();
        }

        // PRIORITY 1: Extract "Art" (Kinder, Damen, Herren) from detail attributes table
        // This is the most reliable source for bicycle type classification
        var artValue = await ExtractAttributeValueAsync(page, "Art");
        if (!string.IsNullOrEmpty(artValue))
        {
            // Map "Art" value to category
            var artLower = artValue.ToLower();
            if (artLower.Contains("kinder") || artLower.Contains("kind"))
                data.Category = "Kinder-Fahrräder";
            else if (artLower.Contains("damen") || artLower.Contains("frau"))
                data.Category = "Damen-Fahrräder";
            else if (artLower.Contains("herren") || artLower.Contains("mann") || artLower.Contains("männer"))
                data.Category = "Herren-Fahrräder";
            else if (artLower.Contains("e-bike") || artLower.Contains("ebike") || artLower.Contains("pedelec") || artLower.Contains("elektro"))
                data.Category = "E-Bikes";
            else if (artLower.Contains("unisex"))
                data.Category = "Sonstige Fahrräder";
            else
                _logger.LogInformation("Unknown Art value: {Art}", artValue);
        }

        // PRIORITY 2: Extract category from breadcrumb - only if Art wasn't found
        if (string.IsNullOrEmpty(data.Category))
        {
            var breadcrumbLinks = await page.QuerySelectorAllAsync("#vap-brdcrmb .breadcrump-link, .breadcrump-link, a[itemprop='item'] span");
            foreach (var link in breadcrumbLinks)
            {
                var text = (await link.InnerTextAsync()).Trim();
                // Check if it's a bicycle category
                if (text.Contains("Fahrräder") || text.Contains("Herren") || text.Contains("Damen") ||
                    text.Contains("Kinder") || text.Contains("E-Bike") || text.Contains("Pedelec") ||
                    text.Contains("Rennr") || text.Contains("Mountain") || text.Contains("Trekking") ||
                    text.Contains("City") || text.Contains("Zubehör") || text.Contains("BMX") ||
                    text.Contains("Cruiser") || text.Contains("Holland"))
                {
                    // Prefer more specific categories (skip generic "Fahrräder")
                    if (text != "Fahrräder" && text != "Fahrräder & Zubehör")
                    {
                        data.Category = text;
                        break;
                    }
                }
            }
        }

        // PRIORITY 3: Fallback - detect category from title
        if (string.IsNullOrEmpty(data.Category) || data.Category == "Fahrräder")
        {
            data.Category = DetectCategoryFromTitle(data.Title);
        }
        // Final fallback: use card category if still empty and valid
        if (string.IsNullOrEmpty(data.Category) && !string.IsNullOrEmpty(card.Category) &&
            !card.Category.Contains("Kleinanzeigen") && !card.Category.Contains("Freiburg"))
        {
            data.Category = card.Category;
        }

        // Extract location
        var locationEl = await page.QuerySelectorAsync("#viewad-locality, .boxedarticle--detail--location, span[itemprop='locality']");
        if (locationEl != null)
        {
            data.Location = (await locationEl.InnerTextAsync()).Trim();
        }

        // Extract images
        var imageUrls = new List<string>();

        // Try gallery images
        var galleryImages = await page.QuerySelectorAllAsync("#viewad-image img, .galleryimage img, img[data-imgsrc], .gallery-container img");
        foreach (var img in galleryImages)
        {
            var src = await img.GetAttributeAsync("src");
            var dataSrc = await img.GetAttributeAsync("data-imgsrc");
            var imgSrc = dataSrc ?? src;

            if (!string.IsNullOrEmpty(imgSrc) && imgSrc.Contains("img.kleinanzeigen"))
            {
                // Convert thumbnail to full size
                var fullSizeUrl = ConvertToFullSizeUrl(imgSrc);
                if (!imageUrls.Contains(fullSizeUrl))
                {
                    imageUrls.Add(fullSizeUrl);
                }
            }
        }

        // Also try from picture/source elements
        var sourceElements = await page.QuerySelectorAllAsync("picture source[srcset], .gallery-container source[srcset]");
        foreach (var source in sourceElements)
        {
            var srcset = await source.GetAttributeAsync("srcset");
            if (!string.IsNullOrEmpty(srcset) && srcset.Contains("img.kleinanzeigen"))
            {
                var url = srcset.Split(',').Last().Trim().Split(' ').First();
                var fullUrl = ConvertToFullSizeUrl(url);
                if (!imageUrls.Contains(fullUrl))
                {
                    imageUrls.Add(fullUrl);
                }
            }
        }

        data.ImageUrls = imageUrls;

        return data;
    }

    private static decimal? ParsePrice(string priceText)
    {
        if (string.IsNullOrEmpty(priceText)) return null;

        // Remove common non-numeric text
        var cleaned = priceText
            .Replace("€", "")
            .Replace("EUR", "")
            .Replace("VB", "")
            .Replace("VHB", "")
            .Replace("Zu verschenken", "")
            .Replace(".", "")  // 1.000 → 1000
            .Replace(",", ".") // German decimal separator
            .Trim();

        if (decimal.TryParse(cleaned, System.Globalization.NumberStyles.Any,
            System.Globalization.CultureInfo.InvariantCulture, out var price))
        {
            return price;
        }

        return null;
    }

    private static string ConvertToFullSizeUrl(string imgUrl)
    {
        // Kleinanzeigen image URL patterns:
        // Thumbnail: .../$_2.JPG or .../$_57.JPG
        // Full size: .../$_59.JPG (large) or .../$_27.JPG (extra large)
        if (string.IsNullOrEmpty(imgUrl)) return imgUrl;

        // Replace thumbnail size with large size
        return System.Text.RegularExpressions.Regex.Replace(
            imgUrl,
            @"/\$_\d+\.JPG",
            "/$_59.JPG",
            System.Text.RegularExpressions.RegexOptions.IgnoreCase);
    }

    private async Task<string?> ExtractAttributeValueAsync(IPage page, string attributeName)
    {
        try
        {
            // Kleinanzeigen detail page has attribute table with format:
            // <li class="addetailslist--detail"> 
            //   Art
            //   <span class="addetailslist--detail--value">Kinder</span>
            // </li>
            var detailItems = await page.QuerySelectorAllAsync("#viewad-details li, .addetailslist--detail, .boxedarticle--details--item");
            foreach (var item in detailItems)
            {
                var text = (await item.InnerTextAsync()).Trim();
                if (text.StartsWith(attributeName, StringComparison.OrdinalIgnoreCase))
                {
                    // Try to get value from span
                    var valueEl = await item.QuerySelectorAsync("span.addetailslist--detail--value, span:last-child, .boxedarticle--details--item-value");
                    if (valueEl != null)
                    {
                        return (await valueEl.InnerTextAsync()).Trim();
                    }
                    // Fallback: parse from text (remove attribute name)
                    var lines = text.Split('\n', StringSplitOptions.RemoveEmptyEntries);
                    if (lines.Length > 1)
                    {
                        return lines[1].Trim();
                    }
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to extract attribute: {Attribute}", attributeName);
        }
        return null;
    }

    private static string? DetectCategoryFromTitle(string title)
    {
        if (string.IsNullOrEmpty(title)) return null;

        var titleLower = title.ToLower();

        if (titleLower.Contains("damen") || titleLower.Contains("frau"))
            return "Damen-Fahrräder";
        if (titleLower.Contains("herren") || titleLower.Contains("mann") || titleLower.Contains("männer"))
            return "Herren-Fahrräder";
        if (titleLower.Contains("kind") || titleLower.Contains("junge") || titleLower.Contains("mädchen") || titleLower.Contains("jugend"))
            return "Kinder-Fahrräder";
        if (titleLower.Contains("e-bike") || titleLower.Contains("ebike") || titleLower.Contains("pedelec") || titleLower.Contains("elektro"))
            return "E-Bikes";
        if (titleLower.Contains("trekking"))
            return "Trekkingräder";
        if (titleLower.Contains("mountain") || titleLower.Contains("mtb"))
            return "Mountainbikes";
        if (titleLower.Contains("city") || titleLower.Contains("stadt"))
            return "Cityräder";
        if (titleLower.Contains("rennrad") || titleLower.Contains("renn"))
            return "Rennräder";
        if (titleLower.Contains("bmx"))
            return "BMX";
        if (titleLower.Contains("holland") || titleLower.Contains("hollandrad"))
            return "Hollandräder";
        if (titleLower.Contains("cruiser"))
            return "Cruiser";
        if (titleLower.Contains("zubehör") || titleLower.Contains("ersatzteil") || titleLower.Contains("teil"))
            return "Zubehör";

        return null;
    }

    private class ListingCard
    {
        public string ExternalId { get; set; } = string.Empty;
        public string Url { get; set; } = string.Empty;
        public string? Title { get; set; }
        public string? PriceText { get; set; }
        public string? Category { get; set; }
    }
}
