using BikeHaus.Application.DTOs;
using BikeHaus.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace BikeHaus.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class StatisticsController : ControllerBase
{
    private readonly IStatisticsService _statisticsService;

    public StatisticsController(IStatisticsService statisticsService)
    {
        _statisticsService = statisticsService;
    }

    [HttpGet]
    public async Task<ActionResult<StatisticsDto>> GetStatistics(
        [FromQuery] DateTime? startDate,
        [FromQuery] DateTime? endDate)
    {
        // Default to current month if no dates provided
        var start = startDate ?? new DateTime(DateTime.Now.Year, DateTime.Now.Month, 1);
        var end = endDate ?? DateTime.Now;

        var statistics = await _statisticsService.GetStatisticsAsync(start, end);
        return Ok(statistics);
    }

    [HttpGet("today")]
    public async Task<ActionResult<StatisticsDto>> GetTodayStatistics()
    {
        var today = DateTime.Today;
        var statistics = await _statisticsService.GetStatisticsAsync(today, today);
        return Ok(statistics);
    }

    [HttpGet("week")]
    public async Task<ActionResult<StatisticsDto>> GetWeekStatistics()
    {
        var today = DateTime.Today;
        var startOfWeek = today.AddDays(-(int)today.DayOfWeek + (int)DayOfWeek.Monday);
        var statistics = await _statisticsService.GetStatisticsAsync(startOfWeek, today);
        return Ok(statistics);
    }

    [HttpGet("month")]
    public async Task<ActionResult<StatisticsDto>> GetMonthStatistics()
    {
        var today = DateTime.Today;
        var startOfMonth = new DateTime(today.Year, today.Month, 1);
        var statistics = await _statisticsService.GetStatisticsAsync(startOfMonth, today);
        return Ok(statistics);
    }

    [HttpGet("quarter")]
    public async Task<ActionResult<StatisticsDto>> GetQuarterStatistics()
    {
        var today = DateTime.Today;
        var quarter = (today.Month - 1) / 3;
        var startOfQuarter = new DateTime(today.Year, quarter * 3 + 1, 1);
        var statistics = await _statisticsService.GetStatisticsAsync(startOfQuarter, today);
        return Ok(statistics);
    }

    [HttpGet("year")]
    public async Task<ActionResult<StatisticsDto>> GetYearStatistics()
    {
        var today = DateTime.Today;
        var startOfYear = new DateTime(today.Year, 1, 1);
        var statistics = await _statisticsService.GetStatisticsAsync(startOfYear, today);
        return Ok(statistics);
    }
}
