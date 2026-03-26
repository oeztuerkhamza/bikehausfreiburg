using BikeHaus.Application.DTOs;
using BikeHaus.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BikeHaus.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class RentalsController : ControllerBase
{
    private readonly IRentalService _rentalService;
    private readonly IPdfService _pdfService;

    public RentalsController(IRentalService rentalService, IPdfService pdfService)
    {
        _rentalService = rentalService;
        _pdfService = pdfService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<RentalListDto>>> GetAll()
    {
        var rentals = await _rentalService.GetAllAsync();
        return Ok(rentals);
    }

    [HttpGet("paginated")]
    public async Task<ActionResult<PaginatedResult<RentalListDto>>> GetPaginated(
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
        var result = await _rentalService.GetPaginatedAsync(paginationParams);
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<RentalDto>> GetById(int id)
    {
        var rental = await _rentalService.GetByIdAsync(id);
        if (rental == null)
            return NotFound();
        return Ok(rental);
    }

    [HttpPost]
    public async Task<ActionResult<RentalDto>> Create([FromBody] RentalCreateDto dto)
    {
        try
        {
            var rental = await _rentalService.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = rental.Id }, rental);
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

    [HttpPut("{id}")]
    public async Task<ActionResult<RentalDto>> Update(int id, [FromBody] RentalUpdateDto dto)
    {
        try
        {
            var rental = await _rentalService.UpdateAsync(id, dto);
            return Ok(rental);
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
        try
        {
            await _rentalService.DeleteAsync(id);
            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
    }

    [HttpPost("{id}/return")]
    public async Task<ActionResult<RentalDto>> ReturnBicycle(int id)
    {
        try
        {
            var rental = await _rentalService.ReturnBicycleAsync(id);
            return Ok(rental);
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

    [HttpPost("{id}/cancel")]
    public async Task<ActionResult<RentalDto>> Cancel(int id)
    {
        try
        {
            var rental = await _rentalService.CancelAsync(id);
            return Ok(rental);
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

    [HttpGet("{id}/mietvertrag-pdf")]
    public async Task<IActionResult> DownloadMietvertrag(int id)
    {
        try
        {
            var pdf = await _pdfService.GenerateMietvertragAsync(id);
            return File(pdf, "application/pdf", $"Mietvertrag-{id}.pdf");
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
    }

    [HttpGet("{id}/kaution-pdf")]
    public async Task<IActionResult> DownloadKautionsquittung(int id)
    {
        try
        {
            var pdf = await _pdfService.GenerateKautionsquittungAsync(id);
            return File(pdf, "application/pdf", $"Kautionsquittung-{id}.pdf");
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
    }
}
