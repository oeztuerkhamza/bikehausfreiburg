using BikeHaus.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BikeHaus.API.Controllers;

/// <summary>
/// Gemeinsame Übersicht über Miet- und Verkaufsbelege eines Zeitraums.
/// </summary>
[Authorize]
[ApiController]
[Route("api/[controller]")]
public class BelegeController(IBelegeService belegeService, ILogger<BelegeController> logger) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetBelege([FromQuery] DateTime startDate, [FromQuery] DateTime endDate)
    {
        if (startDate > endDate)
            return BadRequest(new { message = "Startdatum muss vor dem Enddatum liegen." });

        var belege = await belegeService.GetBelegeAsync(startDate.Date, endDate.Date.AddDays(1).AddTicks(-1));
        return Ok(belege);
    }

    /// <summary>Alle Belege des Zeitraums in EINER PDF-Datei, in Listenreihenfolge.</summary>
    [HttpGet("pdf")]
    public async Task<IActionResult> ExportPdf([FromQuery] DateTime startDate, [FromQuery] DateTime endDate)
    {
        if (startDate > endDate)
            return BadRequest(new { message = "Startdatum muss vor dem Enddatum liegen." });

        try
        {
            var pdf = await belegeService.GenerateCombinedPdfAsync(
                startDate.Date, endDate.Date.AddDays(1).AddTicks(-1));

            if (pdf.Length == 0)
                return NotFound(new { message = "Im gewählten Zeitraum gibt es keine Belege." });

            var fileName = $"Belege_{startDate:yyyy-MM-dd}_bis_{endDate:yyyy-MM-dd}.pdf";
            return File(pdf, "application/pdf", fileName);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Sammel-PDF für {Start} bis {End} fehlgeschlagen", startDate, endDate);
            return StatusCode(500, new { message = "Export fehlgeschlagen: " + ex.Message });
        }
    }
}
