using BikeHaus.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BikeHaus.API.Controllers;

[ApiController]
[Route("api/kleinanzeigen")]
[Authorize]
public class KleinanzeigenController : ControllerBase
{
    private readonly IKleinanzeigenService _kleinanzeigenService;

    public KleinanzeigenController(IKleinanzeigenService kleinanzeigenService)
    {
        _kleinanzeigenService = kleinanzeigenService;
    }

    /// <summary>
    /// Manually trigger Kleinanzeigen sync (admin only)
    /// </summary>
    [HttpPost("sync")]
    public async Task<IActionResult> TriggerSync()
    {
        var result = await _kleinanzeigenService.TriggerSyncAsync();
        return Ok(result);
    }

    /// <summary>
    /// Get last sync time
    /// </summary>
    [HttpGet("last-sync")]
    public async Task<IActionResult> GetLastSync()
    {
        var lastSync = await _kleinanzeigenService.GetLastSyncTimeAsync();
        return Ok(new { lastSyncedAt = lastSync });
    }

    /// <summary>
    /// Get all listings including inactive ones (admin view)
    /// </summary>
    [HttpGet("listings")]
    public async Task<IActionResult> GetAllListings()
    {
        var listings = await _kleinanzeigenService.GetAllActiveListingsAsync();
        return Ok(listings);
    }
}
