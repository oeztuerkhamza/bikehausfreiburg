using BikeHaus.Application.DTOs;
using BikeHaus.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BikeHaus.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class RentalStatisticsController : ControllerBase
{
    private readonly IRentalStatisticsService _rentalStatisticsService;

    public RentalStatisticsController(IRentalStatisticsService rentalStatisticsService)
    {
        _rentalStatisticsService = rentalStatisticsService;
    }

    [HttpGet]
    public async Task<ActionResult<RentalStatisticsDto>> GetRentalStatistics(
        [FromQuery] DateTime? startDate,
        [FromQuery] DateTime? endDate)
    {
        // Standard: laufender Monat, falls keine Daten übergeben werden.
        var start = startDate ?? new DateTime(DateTime.Now.Year, DateTime.Now.Month, 1);
        var end = endDate ?? DateTime.Now;

        var statistics = await _rentalStatisticsService.GetRentalStatisticsAsync(start, end);
        return Ok(statistics);
    }
}
