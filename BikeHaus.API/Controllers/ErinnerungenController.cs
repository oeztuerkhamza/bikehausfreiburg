using BikeHaus.Application.DTOs;
using BikeHaus.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BikeHaus.API.Controllers;

[Authorize]
[ApiController]
[Route("api/erinnerungen")]
public class ErinnerungenController : ControllerBase
{
    private readonly IErinnerungService _service;

    public ErinnerungenController(IErinnerungService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ErinnerungDto>>> GetAll()
    {
        var items = await _service.GetAllAsync();
        return Ok(items);
    }

    [HttpGet("pending")]
    public async Task<ActionResult<IEnumerable<ErinnerungDto>>> GetPending()
    {
        var items = await _service.GetPendingAsync();
        return Ok(items);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ErinnerungDto>> GetById(int id)
    {
        var item = await _service.GetByIdAsync(id);
        if (item == null) return NotFound();
        return Ok(item);
    }

    [HttpPut("{id}/approve")]
    public async Task<ActionResult<ErinnerungDto>> Approve(int id, [FromBody] ErinnerungApproveDto dto)
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
