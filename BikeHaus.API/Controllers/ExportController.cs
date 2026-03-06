using BikeHaus.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BikeHaus.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class ExportController : ControllerBase
{
    private readonly IExportService _exportService;
    private readonly ILogger<ExportController> _logger;

    public ExportController(IExportService exportService, ILogger<ExportController> logger)
    {
        _exportService = exportService;
        _logger = logger;
    }

    [HttpGet("zip")]
    public async Task<IActionResult> ExportZip([FromQuery] DateTime startDate, [FromQuery] DateTime endDate)
    {
        if (startDate > endDate)
            return BadRequest(new { message = "Start date must be before end date." });

        try
        {
            _logger.LogInformation("Generating export ZIP for {Start} to {End}", startDate, endDate);
            var zipData = await _exportService.GenerateExportZipAsync(startDate.Date, endDate.Date.AddDays(1).AddTicks(-1));
            var fileName = $"Belege_{startDate:yyyy-MM-dd}_bis_{endDate:yyyy-MM-dd}.zip";
            _logger.LogInformation("Export ZIP generated: {FileName} ({Size} bytes)", fileName, zipData.Length);
            return File(zipData, "application/zip", fileName);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating export ZIP");
            return StatusCode(500, new { message = "Export failed: " + ex.Message });
        }
    }
}
