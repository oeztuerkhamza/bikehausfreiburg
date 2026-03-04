using BikeHaus.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace BikeHaus.API.Controllers;

[ApiController]
[Route("api/public")]
public class PublicController : ControllerBase
{
    private readonly IKleinanzeigenService _kleinanzeigenService;
    private readonly INeueFahrradService _neueFahrradService;

    public PublicController(
        IKleinanzeigenService kleinanzeigenService,
        INeueFahrradService neueFahrradService)
    {
        _kleinanzeigenService = kleinanzeigenService;
        _neueFahrradService = neueFahrradService;
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
}
