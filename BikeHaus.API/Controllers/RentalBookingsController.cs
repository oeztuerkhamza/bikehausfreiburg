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

    public RentalBookingsController(IRentalBookingService service)
    {
        _service = service;
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
}
