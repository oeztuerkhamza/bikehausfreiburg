using BikeHaus.Application.DTOs;
using BikeHaus.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BikeHaus.API.Controllers;

[ApiController]
[Route("api/public")]
public class PublicController : ControllerBase
{
    private readonly IKleinanzeigenService _kleinanzeigenService;
    private readonly INeueFahrradService _neueFahrradService;
    private readonly IEBikeService _eBikeService;
    private readonly IBicycleService _bicycleService;
    private readonly IRepairShowcaseService _repairShowcaseService;
    private readonly IHomepageAccessoryService _homepageAccessoryService;
    private readonly IGoogleReviewsService _googleReviewsService;
    private readonly IWebHostEnvironment _env;
    private readonly IConfiguration _config;

    public PublicController(
        IKleinanzeigenService kleinanzeigenService,
        INeueFahrradService neueFahrradService,
        IEBikeService eBikeService,
        IBicycleService bicycleService,
        IRepairShowcaseService repairShowcaseService,
        IHomepageAccessoryService homepageAccessoryService,
        IGoogleReviewsService googleReviewsService,
        IWebHostEnvironment env,
        IConfiguration config)
    {
        _kleinanzeigenService = kleinanzeigenService;
        _neueFahrradService = neueFahrradService;
        _eBikeService = eBikeService;
        _bicycleService = bicycleService;
        _repairShowcaseService = repairShowcaseService;
        _homepageAccessoryService = homepageAccessoryService;
        _googleReviewsService = googleReviewsService;
        _env = env;
        _config = config;
    }

    /// <summary>
    /// Get all active Kleinanzeigen listings (public, no auth required)
    /// </summary>
    [HttpGet("listings")]
    public async Task<IActionResult> GetListings()
    {
        var listings = await _kleinanzeigenService.GetAllActiveListingsAsync();
        return Ok(listings);
    }

    /// <summary>
    /// Get listings by category
    /// </summary>
    [HttpGet("listings/category/{category}")]
    public async Task<IActionResult> GetListingsByCategory(string category)
    {
        var listings = await _kleinanzeigenService.GetListingsByCategoryAsync(Uri.UnescapeDataString(category));
        return Ok(listings);
    }

    /// <summary>
    /// Get a single listing by ID
    /// </summary>
    [HttpGet("listings/{id}")]
    public async Task<IActionResult> GetListing(int id)
    {
        var listing = await _kleinanzeigenService.GetListingByIdAsync(id);
        if (listing == null) return NotFound();
        return Ok(listing);
    }

    /// <summary>
    /// Get all active categories with listing counts
    /// </summary>
    [HttpGet("categories")]
    public async Task<IActionResult> GetCategories()
    {
        var categories = await _kleinanzeigenService.GetCategoriesAsync();
        return Ok(categories);
    }

    /// <summary>
    /// Get public shop info (name, address, contact, logo, hours)
    /// </summary>
    [HttpGet("shop-info")]
    public async Task<IActionResult> GetShopInfo()
    {
        var info = await _kleinanzeigenService.GetPublicShopInfoAsync();
        if (info == null)
        {
            return Ok(new { shopName = "Bike Haus Freiburg" });
        }
        return Ok(info);
    }

    /// <summary>
    /// Get last sync timestamp
    /// </summary>
    [HttpGet("last-sync")]
    public async Task<IActionResult> GetLastSync()
    {
        var lastSync = await _kleinanzeigenService.GetLastSyncTimeAsync();
        return Ok(new { lastSyncedAt = lastSync });
    }

    // ═══ Neue Fahrräder (New Bicycles) ═══

    /// <summary>
    /// Get all active new bicycle listings (public)
    /// </summary>
    [HttpGet("neue-fahrraeder")]
    public async Task<IActionResult> GetNeueFahrraeder()
    {
        var items = await _neueFahrradService.GetAllActiveAsync();
        return Ok(items);
    }

    /// <summary>
    /// Get new bicycles by category
    /// </summary>
    [HttpGet("neue-fahrraeder/category/{category}")]
    public async Task<IActionResult> GetNeueFahrraederByCategory(string category)
    {
        var items = await _neueFahrradService.GetByCategoryAsync(Uri.UnescapeDataString(category));
        return Ok(items);
    }

    /// <summary>
    /// Get a single new bicycle by ID
    /// </summary>
    [HttpGet("neue-fahrraeder/{id}")]
    public async Task<IActionResult> GetNeueFahrrad(int id)
    {
        var item = await _neueFahrradService.GetByIdAsync(id);
        if (item == null) return NotFound();
        return Ok(item);
    }

    /// <summary>
    /// Get new bicycle categories with counts
    /// </summary>
    [HttpGet("neue-fahrraeder/categories")]
    public async Task<IActionResult> GetNeueFahrraederCategories()
    {
        var categories = await _neueFahrradService.GetCategoriesAsync();
        return Ok(categories);
    }

    // ═══ E-Bikes ═══

    /// <summary>
    /// Get all active e-bikes (public)
    /// </summary>
    [AllowAnonymous]
    [HttpGet("e-bikes")]
    public async Task<IActionResult> GetEBikes()
    {
        var items = await _eBikeService.GetAllActiveAsync();
        return Ok(items.Select(ToPublic));
    }

    /// <summary>
    /// Get e-bikes by category (public)
    /// </summary>
    [AllowAnonymous]
    [HttpGet("e-bikes/category/{category}")]
    public async Task<IActionResult> GetEBikesByCategory(string category)
    {
        var items = await _eBikeService.GetByCategoryAsync(Uri.UnescapeDataString(category));
        return Ok(items.Select(ToPublic));
    }

    /// <summary>
    /// Get e-bike categories with counts (public)
    /// </summary>
    [AllowAnonymous]
    [HttpGet("e-bikes/categories")]
    public async Task<IActionResult> GetEBikeCategories()
    {
        var categories = await _eBikeService.GetCategoriesAsync();
        return Ok(categories);
    }

    /// <summary>
    /// Get a single active e-bike by ID (public)
    /// </summary>
    [AllowAnonymous]
    [HttpGet("e-bikes/{id}")]
    public async Task<IActionResult> GetEBike(int id)
    {
        var item = await _eBikeService.GetByIdAsync(id);
        if (item == null || !item.IsActive) return NotFound();
        return Ok(ToPublic(item));
    }

    private static PublicEBikeDto ToPublic(EBikeDto dto) => new(
        dto.Id,
        dto.Titel,
        dto.Beschreibung,
        dto.Preis,
        dto.PreisText,
        dto.Kategorie,
        dto.Marke,
        dto.Modell,
        dto.Farbe,
        dto.Rahmengroesse,
        dto.Reifengroesse,
        dto.Gangschaltung,
        dto.Zustand,
        dto.Angebot,
        dto.MotorMarke,
        dto.MotorPosition,
        dto.AkkuKapazitaetWh,
        dto.ReichweiteKm,
        dto.MotorLeistungNm,
        dto.CreatedAt,
        dto.Images
    );

    // ═══ Gebrauchte Fahrräder (Published Used Bicycles) ═══

    /// <summary>
    /// Get all bicycles published on the website (public)
    /// </summary>
    [HttpGet("gebrauchte-fahrraeder")]
    public async Task<IActionResult> GetGebrauchteFahrraeder()
    {
        var items = await _bicycleService.GetPublishedOnWebsiteAsync();
        return Ok(items);
    }

    /// <summary>
    /// Get a single published bicycle by ID
    /// </summary>
    [HttpGet("gebrauchte-fahrraeder/{id}")]
    public async Task<IActionResult> GetGebrauchteFahrrad(int id)
    {
        var item = await _bicycleService.GetPublishedBicycleByIdAsync(id);
        if (item == null) return NotFound();
        return Ok(item);
    }

    // ═══ Repair Showcases ═══

    /// <summary>
    /// Get all active repair showcases (public)
    /// </summary>
    [HttpGet("repair-showcases")]
    public async Task<IActionResult> GetRepairShowcases()
    {
        var items = await _repairShowcaseService.GetAllActiveAsync();
        return Ok(items);
    }

    /// <summary>
    /// Get a single repair showcase by ID
    /// </summary>
    [HttpGet("repair-showcases/{id}")]
    public async Task<IActionResult> GetRepairShowcase(int id)
    {
        var item = await _repairShowcaseService.GetByIdAsync(id);
        if (item == null) return NotFound();
        return Ok(item);
    }

    // ═══ Homepage Accessories ═══

    /// <summary>
    /// Get all active homepage accessories (public)
    /// </summary>
    [HttpGet("homepage-accessories")]
    public async Task<IActionResult> GetHomepageAccessories()
    {
        var items = await _homepageAccessoryService.GetAllActiveAsync();
        return Ok(items);
    }

    /// <summary>
    /// Get homepage accessories by category
    /// </summary>
    [HttpGet("homepage-accessories/category/{category}")]
    public async Task<IActionResult> GetHomepageAccessoriesByCategory(string category)
    {
        var items = await _homepageAccessoryService.GetByCategoryAsync(Uri.UnescapeDataString(category));
        return Ok(items);
    }

    /// <summary>
    /// Get a single homepage accessory by ID
    /// </summary>
    [HttpGet("homepage-accessories/{id}")]
    public async Task<IActionResult> GetHomepageAccessory(int id)
    {
        var item = await _homepageAccessoryService.GetByIdAsync(id);
        if (item == null) return NotFound();
        return Ok(item);
    }

    /// <summary>
    /// Get homepage accessory categories with counts
    /// </summary>
    [HttpGet("homepage-accessories/categories")]
    public async Task<IActionResult> GetHomepageAccessoryCategories()
    {
        var categories = await _homepageAccessoryService.GetCategoriesAsync();
        return Ok(categories);
    }

    // ═══ Google Reviews ═══

    /// <summary>
    /// Get cached Google Reviews for the shop
    /// </summary>
    [HttpGet("google-reviews")]
    public async Task<IActionResult> GetGoogleReviews()
    {
        var reviews = await _googleReviewsService.GetReviewsAsync();
        if (reviews == null) return Ok(new { rating = 0, totalReviews = 0, reviews = Array.Empty<object>(), placeUrl = "" });
        return Ok(reviews);
    }

    /// <summary>
    /// Serve gallery image files
    /// </summary>
    [HttpGet("gallery-image/{*filePath}")]
    public IActionResult GetGalleryImage(string filePath)
    {
        string fullPath;
        if (_env.IsDevelopment())
        {
            fullPath = Path.Combine(Directory.GetCurrentDirectory(), filePath);
        }
        else
        {
            // In production, resolve from FileStorage:BasePath
            // filePath = "uploads/gallery/4/guid.jpg" → strip "uploads/" and combine with BasePath
            var basePath = _config["FileStorage:BasePath"] ?? "/app/data/uploads";
            var relativePart = filePath.StartsWith("uploads/", StringComparison.OrdinalIgnoreCase)
                ? filePath.Substring("uploads/".Length)
                : filePath;
            fullPath = Path.Combine(basePath, relativePart);
        }

        if (!System.IO.File.Exists(fullPath))
            return NotFound();

        var contentType = filePath.EndsWith(".png", StringComparison.OrdinalIgnoreCase) ? "image/png"
            : filePath.EndsWith(".webp", StringComparison.OrdinalIgnoreCase) ? "image/webp"
            : "image/jpeg";
        return PhysicalFile(fullPath, contentType);
    }

    /// <summary>
    /// Dynamic sitemap with all product URLs for SEO
    /// </summary>
    [HttpGet("sitemap-products.xml")]
    [Produces("application/xml")]
    public async Task<IActionResult> GetProductSitemap()
    {
        var baseUrl = "https://bikehausfreiburg.com";
        var now = DateTime.UtcNow.ToString("yyyy-MM-dd");
        var langs = new[] { "de", "en", "fr", "tr" };

        var sb = new System.Text.StringBuilder();
        sb.AppendLine("<?xml version=\"1.0\" encoding=\"UTF-8\"?>");
        sb.AppendLine("<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\"");
        sb.AppendLine("        xmlns:xhtml=\"http://www.w3.org/1999/xhtml\"");
        sb.AppendLine("        xmlns:image=\"http://www.google.com/schemas/sitemap-image/1.1\">");

        // Gebrauchte Fahrräder (used bikes in showroom)
        var usedBikes = await _bicycleService.GetPublishedOnWebsiteAsync();
        if (usedBikes != null)
        {
            foreach (var bike in usedBikes)
            {
                foreach (var lang in langs)
                {
                    sb.AppendLine("  <url>");
                    sb.AppendLine($"    <loc>{baseUrl}/{lang}/showroom/{bike.Id}</loc>");
                    foreach (var altLang in langs)
                    {
                        sb.AppendLine($"    <xhtml:link rel=\"alternate\" hreflang=\"{altLang}\" href=\"{baseUrl}/{altLang}/showroom/{bike.Id}\"/>");
                    }
                    sb.AppendLine($"    <lastmod>{now}</lastmod>");
                    sb.AppendLine("    <changefreq>weekly</changefreq>");
                    sb.AppendLine("    <priority>0.8</priority>");
                    sb.AppendLine("  </url>");
                }
            }
        }

        // Neue Fahrräder (new bikes)
        var newBikes = await _neueFahrradService.GetAllActiveAsync();
        if (newBikes != null)
        {
            foreach (var bike in newBikes)
            {
                foreach (var lang in langs)
                {
                    sb.AppendLine("  <url>");
                    sb.AppendLine($"    <loc>{baseUrl}/{lang}/neue-fahrraeder/{bike.Id}</loc>");
                    foreach (var altLang in langs)
                    {
                        sb.AppendLine($"    <xhtml:link rel=\"alternate\" hreflang=\"{altLang}\" href=\"{baseUrl}/{altLang}/neue-fahrraeder/{bike.Id}\"/>");
                    }
                    sb.AppendLine($"    <lastmod>{now}</lastmod>");
                    sb.AppendLine("    <changefreq>weekly</changefreq>");
                    sb.AppendLine("    <priority>0.8</priority>");
                    sb.AppendLine("  </url>");
                }
            }
        }

        // E-Bikes
        var eBikes = await _eBikeService.GetAllActiveAsync();
        if (eBikes != null)
        {
            foreach (var bike in eBikes)
            {
                foreach (var lang in langs)
                {
                    sb.AppendLine("  <url>");
                    sb.AppendLine($"    <loc>{baseUrl}/{lang}/e-bikes/{bike.Id}</loc>");
                    foreach (var altLang in langs)
                    {
                        sb.AppendLine($"    <xhtml:link rel=\"alternate\" hreflang=\"{altLang}\" href=\"{baseUrl}/{altLang}/e-bikes/{bike.Id}\"/>");
                    }
                    sb.AppendLine($"    <lastmod>{now}</lastmod>");
                    sb.AppendLine("    <changefreq>weekly</changefreq>");
                    sb.AppendLine("    <priority>0.8</priority>");
                    sb.AppendLine("  </url>");
                }
            }
        }

        // Homepage Accessories
        var accessories = await _homepageAccessoryService.GetAllActiveAsync();
        if (accessories != null)
        {
            foreach (var acc in accessories)
            {
                foreach (var lang in langs)
                {
                    sb.AppendLine("  <url>");
                    sb.AppendLine($"    <loc>{baseUrl}/{lang}/zubehoer/{acc.Id}</loc>");
                    foreach (var altLang in langs)
                    {
                        sb.AppendLine($"    <xhtml:link rel=\"alternate\" hreflang=\"{altLang}\" href=\"{baseUrl}/{altLang}/zubehoer/{acc.Id}\"/>");
                    }
                    sb.AppendLine($"    <lastmod>{now}</lastmod>");
                    sb.AppendLine("    <changefreq>weekly</changefreq>");
                    sb.AppendLine("    <priority>0.7</priority>");
                    sb.AppendLine("  </url>");
                }
            }
        }

        // ── Rental bikes (Mietfahrräder) — list + per-bike detail ──
        // Language-specific slugs: de/tr → mietfahrraeder, en → rental-bikes, fr → velos-de-location
        var rentalLangs = new[] { "de", "en", "fr", "tr" };
        static string RentalSlug(string lang) => lang switch
        {
            "en" => "rental-bikes",
            "fr" => "velos-de-location",
            _ => "mietfahrraeder",
        };

        // Catalog list page (one URL per language with hreflang alternates)
        foreach (var lang in rentalLangs)
        {
            sb.AppendLine("  <url>");
            sb.AppendLine($"    <loc>{baseUrl}/{lang}/{RentalSlug(lang)}</loc>");
            foreach (var altLang in rentalLangs)
            {
                sb.AppendLine($"    <xhtml:link rel=\"alternate\" hreflang=\"{altLang}\" href=\"{baseUrl}/{altLang}/{RentalSlug(altLang)}\"/>");
            }
            sb.AppendLine($"    <xhtml:link rel=\"alternate\" hreflang=\"x-default\" href=\"{baseUrl}/de/mietfahrraeder\"/>");
            sb.AppendLine($"    <lastmod>{now}</lastmod>");
            sb.AppendLine("    <changefreq>daily</changefreq>");
            sb.AppendLine("    <priority>0.9</priority>");
            sb.AppendLine("  </url>");
        }

        // Per-bike rental detail pages
        var rentalBikes = await _bicycleService.GetRentableBicyclesAsync();
        if (rentalBikes != null)
        {
            foreach (var bike in rentalBikes)
            {
                foreach (var lang in rentalLangs)
                {
                    sb.AppendLine("  <url>");
                    sb.AppendLine($"    <loc>{baseUrl}/{lang}/{RentalSlug(lang)}/{bike.Id}</loc>");
                    foreach (var altLang in rentalLangs)
                    {
                        sb.AppendLine($"    <xhtml:link rel=\"alternate\" hreflang=\"{altLang}\" href=\"{baseUrl}/{altLang}/{RentalSlug(altLang)}/{bike.Id}\"/>");
                    }
                    sb.AppendLine($"    <xhtml:link rel=\"alternate\" hreflang=\"x-default\" href=\"{baseUrl}/de/mietfahrraeder/{bike.Id}\"/>");
                    sb.AppendLine($"    <lastmod>{now}</lastmod>");
                    sb.AppendLine("    <changefreq>weekly</changefreq>");
                    sb.AppendLine("    <priority>0.75</priority>");
                    sb.AppendLine("  </url>");
                }
            }
        }

        sb.AppendLine("</urlset>");

        return Content(sb.ToString(), "application/xml", System.Text.Encoding.UTF8);
    }

    /// <summary>
    /// IndexNow API key verification file
    /// </summary>
    [HttpGet("indexnow-key")]
    public IActionResult GetIndexNowKey()
    {
        var key = _config["IndexNow:ApiKey"] ?? "b7e4c8a1d3f54e89a2c6b0d7f1e3a5c9";
        return Content(key, "text/plain");
    }

    /// <summary>
    /// Manually trigger IndexNow submission for recent product URLs
    /// </summary>
    [HttpPost("notify-indexnow")]
    public async Task<IActionResult> NotifyIndexNow([FromServices] IIndexNowService indexNowService)
    {
        var baseUrl = "https://bikehausfreiburg.com";
        var langs = new[] { "de", "en", "fr", "tr" };
        var urls = new List<string>();

        // Static pages
        foreach (var lang in langs)
        {
            urls.Add($"{baseUrl}/{lang}");
            urls.Add($"{baseUrl}/{lang}/showroom");
            urls.Add($"{baseUrl}/{lang}/neue-fahrraeder");
            urls.Add($"{baseUrl}/{lang}/zubehoer");
            urls.Add($"{baseUrl}/{lang}/ratgeber");
        }
        // Rental catalog list (per-language slug)
        urls.Add($"{baseUrl}/de/mietfahrraeder");
        urls.Add($"{baseUrl}/en/rental-bikes");
        urls.Add($"{baseUrl}/fr/velos-de-location");
        urls.Add($"{baseUrl}/tr/mietfahrraeder");

        // Dynamic product pages
        var usedBikes = await _bicycleService.GetPublishedOnWebsiteAsync();
        if (usedBikes != null)
        {
            foreach (var bike in usedBikes)
            {
                urls.Add($"{baseUrl}/de/showroom/{bike.Id}");
            }
        }

        var newBikes = await _neueFahrradService.GetAllActiveAsync();
        if (newBikes != null)
        {
            foreach (var bike in newBikes)
            {
                urls.Add($"{baseUrl}/de/neue-fahrraeder/{bike.Id}");
            }
        }

        var rentalBikesIndex = await _bicycleService.GetRentableBicyclesAsync();
        if (rentalBikesIndex != null)
        {
            foreach (var bike in rentalBikesIndex)
            {
                urls.Add($"{baseUrl}/de/mietfahrraeder/{bike.Id}");
            }
        }

        await indexNowService.SubmitUrlsAsync(urls);

        return Ok(new { submitted = urls.Count, message = "IndexNow notification sent" });
    }
}
