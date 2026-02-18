using BikeHaus.Application.DTOs;
using BikeHaus.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace BikeHaus.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BicyclesController : ControllerBase
{
    private readonly IBicycleService _bicycleService;

    public BicyclesController(IBicycleService bicycleService)
    {
        _bicycleService = bicycleService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<BicycleDto>>> GetAll()
    {
        var bicycles = await _bicycleService.GetAllAsync();
        return Ok(bicycles);
    }

    [HttpGet("paginated")]
    public async Task<ActionResult<PaginatedResult<BicycleDto>>> GetPaginated(
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
        var result = await _bicycleService.GetPaginatedAsync(paginationParams);
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<BicycleDto>> GetById(int id)
    {
        var bicycle = await _bicycleService.GetByIdAsync(id);
        if (bicycle == null)
            return NotFound();
        return Ok(bicycle);
    }

    [HttpGet("available")]
    public async Task<ActionResult<IEnumerable<BicycleDto>>> GetAvailable()
    {
        var bicycles = await _bicycleService.GetAvailableAsync();
        return Ok(bicycles);
    }

    [HttpGet("search")]
    public async Task<ActionResult<IEnumerable<BicycleDto>>> Search([FromQuery] string term)
    {
        var bicycles = await _bicycleService.SearchAsync(term);
        return Ok(bicycles);
    }

    [HttpGet("by-stokno/{stokNo}")]
    public async Task<ActionResult<BicycleDto>> GetByStokNo(string stokNo)
    {
        var bicycle = await _bicycleService.GetByStokNoAsync(stokNo);
        if (bicycle == null)
            return NotFound();
        return Ok(bicycle);
    }

    [HttpGet("next-stokno")]
    public async Task<ActionResult<object>> GetNextStokNo()
    {
        var nextStokNo = await _bicycleService.GetNextStokNoAsync();
        return Ok(new { stokNo = nextStokNo });
    }

    [HttpPost]
    public async Task<ActionResult<BicycleDto>> Create([FromBody] BicycleCreateDto dto)
    {
        var bicycle = await _bicycleService.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = bicycle.Id }, bicycle);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<BicycleDto>> Update(int id, [FromBody] BicycleUpdateDto dto)
    {
        var bicycle = await _bicycleService.UpdateAsync(id, dto);
        return Ok(bicycle);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            await _bicycleService.DeleteAsync(id);
            return NoContent();
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
