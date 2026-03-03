using BikeHaus.Application.Interfaces;
using BikeHaus.Infrastructure.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BikeHaus.API.Controllers;

[ApiController]
[Route("api/kleinanzeigen")]
[Authorize]
public class KleinanzeigenController : ControllerBase
{
    private readonly IKleinanzeigenService _kleinanzeigenService;
    private readonly KleinanzeigenSyncCoordinator _syncCoordinator;

    public KleinanzeigenController(
        IKleinanzeigenService kleinanzeigenService,
        KleinanzeigenSyncCoordinator syncCoordinator)
    {
        _kleinanzeigenService = kleinanzeigenService;
        _syncCoordinator = syncCoordinator;
    }

    /// <summary>
    /// Manually trigger Kleinanzeigen sync (admin only).
    /// Returns immediately — sync runs in the background.
    /// Poll GET /sync-status for progress.
    /// </summary>
    [HttpPost("sync")]
    public IActionResult TriggerSync()
    {
        var started = _syncCoordinator.TriggerSync();

        return Ok(new
        {
            syncing = true,
            started,
            message = started ? "Sync started" : "Sync already in progress",
            syncedAt = DateTime.UtcNow
        });
    }

    /// <summary>
    /// Get current sync status (polling endpoint)
    /// </summary>
    [HttpGet("sync-status")]
    public IActionResult GetSyncStatus()
    {
        return Ok(new
        {
            syncing = _syncCoordinator.IsSyncing,
            startedAt = _syncCoordinator.SyncStartedAt,
            result = _syncCoordinator.LastResult
        });
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

    /// <summary>
    /// Fix categories for existing listings based on title analysis
    /// </summary>
    [HttpPost("fix-categories")]
    public async Task<IActionResult> FixCategories()
    {
        var updatedCount = await _kleinanzeigenService.FixCategoriesAsync();
        return Ok(new { updated = updatedCount, message = $"Fixed categories for {updatedCount} listings" });
    }

    /// <summary>
    /// Force full re-sync by deleting all existing listings and triggering a new sync.
    /// This ensures all categories are fetched fresh from Kleinanzeigen "Art" attribute.
    /// </summary>
    [HttpPost("force-resync")]
    public async Task<IActionResult> ForceResync()
    {
        // First delete all existing listings
        var deletedCount = await _kleinanzeigenService.DeleteAllListingsAsync();

        // Then trigger a new sync
        var started = _syncCoordinator.TriggerSync();

        return Ok(new
        {
            deleted = deletedCount,
            syncing = true,
            started,
            message = $"Deleted {deletedCount} listings and started fresh sync"
        });
    }
}
