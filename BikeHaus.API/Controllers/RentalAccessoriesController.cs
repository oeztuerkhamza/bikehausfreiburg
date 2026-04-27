using BikeHaus.Application.DTOs;
using BikeHaus.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BikeHaus.API.Controllers;

[Authorize]
[ApiController]
[Route("api/rental-accessories")]
public class RentalAccessoriesController : ControllerBase
{
    private readonly IRentalAccessoryService _service;

    public RentalAccessoriesController(IRentalAccessoryService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<RentalAccessoryListDto>>> GetAll()
    {
        var items = await _service.GetAllAsync();
        return Ok(items);
    }

    [HttpGet("active")]
    public async Task<ActionResult<IEnumerable<RentalAccessoryListDto>>> GetActive()
    {
        var items = await _service.GetActiveAsync();
        return Ok(items);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<RentalAccessoryDto>> GetById(int id)
    {
        var item = await _service.GetByIdAsync(id);
        if (item == null) return NotFound();
        return Ok(item);
    }

    [HttpPost]
    public async Task<ActionResult<RentalAccessoryDto>> Create(RentalAccessoryCreateDto dto)
    {
        var created = await _service.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<RentalAccessoryDto>> Update(int id, RentalAccessoryUpdateDto dto)
    {
        try
        {
            var updated = await _service.UpdateAsync(id, dto);
            return Ok(updated);
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        await _service.DeleteAsync(id);
        return NoContent();
    }
}
