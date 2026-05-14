using BikeHaus.Application.DTOs;
using BikeHaus.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BikeHaus.API.Controllers;

[Authorize]
[ApiController]
[Route("api/rental-bookings")]
public class RentalBookingsController : ControllerBase
{
    private readonly IRentalBookingService _service;
    private readonly IPdfService _pdfService;

    public RentalBookingsController(IRentalBookingService service, IPdfService pdfService)
    {
        _service = service;
        _pdfService = pdfService;
    }

    [HttpGet("paginated")]
    public async Task<ActionResult<PaginatedResult<RentalBookingListDto>>> GetPaginated(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? status = null,
        [FromQuery] string? search = null)
    {
        var paginationParams = new PaginationParams
        {
            Page = page,
            PageSize = pageSize,
            Status = status,
            SearchTerm = search
        };

        var result = await _service.GetPaginatedAsync(paginationParams);
        return Ok(result);
    }

    [HttpGet("pending-count")]
    public async Task<ActionResult> GetPendingCount()
    {
        var count = await _service.GetPendingCountAsync();
        return Ok(new { count });
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<RentalBookingDto>> GetById(int id)
    {
        var booking = await _service.GetByIdAsync(id);
        if (booking == null) return NotFound();
        return Ok(booking);
    }

    [HttpPost("{id}/approve")]
    public async Task<ActionResult<RentalBookingDto>> Approve(int id, [FromBody] RentalBookingApproveDto dto)
    {
        try
        {
            var updated = await _service.ApproveAsync(id, dto);
            return Ok(updated);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { error = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var success = await _service.DeleteAsync(id);
        if (!success) return NotFound();
        return NoContent();
    }

    [HttpPost("{id}/cancel")]
    public async Task<ActionResult<RentalBookingDto>> Cancel(int id, [FromBody] RentalBookingCancelDto dto)
    {
        try
        {
            var updated = await _service.CancelAsync(id, dto);
            return Ok(updated);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { error = ex.Message });
        }
    }

    [HttpGet("{id}/rechnung-pdf")]
    public async Task<IActionResult> DownloadBookingRechnung(int id)
    {
        try
        {
            var pdf = await _pdfService.GenerateBookingRechnungAsync(id);
            return File(pdf, "application/pdf", $"Mietrechnung-{id}.pdf");
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
    }

    [HttpGet("{id}/kaution-pdf")]
    public async Task<IActionResult> DownloadBookingKaution(int id)
    {
        try
        {
            var pdf = await _pdfService.GenerateBookingKautionsquittungAsync(id);
            return File(pdf, "application/pdf", $"Kautionsquittung-{id}.pdf");
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
    }
}
