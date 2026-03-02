using BikeHaus.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace BikeHaus.API.Controllers;

[ApiController]
[Route("api/public")]
public class PublicController : ControllerBase
{
    private readonly IKleinanzeigenService _kleinanzeigenService;

    public PublicController(IKleinanzeigenService kleinanzeigenService)
    {
        _kleinanzeigenService = kleinanzeigenService;
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
}
