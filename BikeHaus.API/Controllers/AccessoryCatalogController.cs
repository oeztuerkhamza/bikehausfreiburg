using BikeHaus.Application.DTOs;
using BikeHaus.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace BikeHaus.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AccessoryCatalogController : ControllerBase
{
    private readonly IAccessoryCatalogService _service;

    public AccessoryCatalogController(IAccessoryCatalogService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<AccessoryCatalogListDto>>> GetAll()
    {
        var items = await _service.GetAllAsync();
        return Ok(items);
    }

    [HttpGet("active")]
    public async Task<ActionResult<IEnumerable<AccessoryCatalogListDto>>> GetActive()
    {
        var items = await _service.GetActiveAsync();
        return Ok(items);
    }

    [HttpGet("search")]
    public async Task<ActionResult<IEnumerable<AccessoryCatalogListDto>>> Search([FromQuery] string q)
    {
        if (string.IsNullOrWhiteSpace(q))
            return Ok(Enumerable.Empty<AccessoryCatalogListDto>());

        var items = await _service.SearchAsync(q);
        return Ok(items);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<AccessoryCatalogDto>> GetById(int id)
    {
        var item = await _service.GetByIdAsync(id);
        if (item == null) return NotFound();
        return Ok(item);
    }

    [HttpPost]
    public async Task<ActionResult<AccessoryCatalogDto>> Create(AccessoryCatalogCreateDto dto)
    {
        var created = await _service.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<AccessoryCatalogDto>> Update(int id, AccessoryCatalogUpdateDto dto)
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
