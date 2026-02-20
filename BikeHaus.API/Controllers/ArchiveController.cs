using BikeHaus.Application.DTOs;
using BikeHaus.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace BikeHaus.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ArchiveController : ControllerBase
{
    private readonly IArchiveService _archiveService;

    public ArchiveController(IArchiveService archiveService)
    {
        _archiveService = archiveService;
    }

    [HttpGet("search")]
    public async Task<ActionResult<IEnumerable<ArchiveSearchResultDto>>> Search([FromQuery] string q)
    {
        var results = await _archiveService.SearchAsync(q);
        return Ok(results);
    }

    [HttpGet("history/{bicycleId}")]
    public async Task<ActionResult<ArchiveBicycleHistoryDto>> GetHistory(int bicycleId)
    {
        var history = await _archiveService.GetBicycleHistoryAsync(bicycleId);
        if (history == null) return NotFound();
        return Ok(history);
    }
}
