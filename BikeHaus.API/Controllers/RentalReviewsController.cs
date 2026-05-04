using BikeHaus.Application.DTOs;
using BikeHaus.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BikeHaus.API.Controllers;

[Authorize]
[ApiController]
[Route("api/rental-reviews")]
public class RentalReviewsController : ControllerBase
{
    private readonly IRentalReviewService _service;

    public RentalReviewsController(IRentalReviewService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<RentalReviewDto>>> GetAll()
    {
        var items = await _service.GetAllAsync();
        return Ok(items);
    }

    [HttpGet("pending")]
    public async Task<ActionResult<IEnumerable<RentalReviewDto>>> GetPending()
    {
        var items = await _service.GetPendingAsync();
        return Ok(items);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<RentalReviewDto>> GetById(int id)
    {
        var item = await _service.GetByIdAsync(id);
        if (item == null) return NotFound();
        return Ok(item);
    }

    [HttpPut("{id}/approve")]
    public async Task<ActionResult<RentalReviewDto>> Approve(int id, [FromBody] RentalReviewApproveDto dto)
    {
        var item = await _service.ApproveAsync(id, dto);
        if (item == null) return NotFound();
        return Ok(item);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted = await _service.DeleteAsync(id);
        if (!deleted) return NotFound();
        return NoContent();
    }
}
