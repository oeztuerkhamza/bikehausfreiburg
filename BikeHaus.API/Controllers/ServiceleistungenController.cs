using BikeHaus.Application.DTOs;
using BikeHaus.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BikeHaus.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class ServiceleistungenController : ControllerBase
{
    private readonly IServiceleistungService _service;
    private readonly IPdfService _pdfService;

    public ServiceleistungenController(IServiceleistungService service, IPdfService pdfService)
    {
        _service = service;
        _pdfService = pdfService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ServiceleistungDto>>> GetAll()
    {
        var items = await _service.GetAllAsync();
        return Ok(items);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ServiceleistungDto>> GetById(int id)
    {
        var item = await _service.GetByIdAsync(id);
        if (item == null)
            return NotFound();
        return Ok(item);
    }

    [HttpPost]
    public async Task<ActionResult<ServiceleistungDto>> Create([FromBody] ServiceleistungCreateDto dto)
    {
        var created = await _service.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ServiceleistungDto>> Update(int id, [FromBody] ServiceleistungUpdateDto dto)
    {
        var updated = await _service.UpdateAsync(id, dto);
        if (updated == null)
            return NotFound();
        return Ok(updated);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted = await _service.DeleteAsync(id);
        if (!deleted)
            return NotFound();
        return NoContent();
    }

    [HttpGet("next-belegnummer")]
    public async Task<ActionResult<object>> GetNextBelegNummer()
    {
        var nummer = await _service.GetNextBelegNummerAsync();
        return Ok(new { belegNummer = nummer });
    }

    [HttpGet("{id}/servicebeleg")]
    public async Task<IActionResult> DownloadServicebeleg(int id)
    {
        var pdfBytes = await _pdfService.GenerateServicebelegAsync(id);
        return File(pdfBytes, "application/pdf", $"Servicebeleg_{id}.pdf");
    }
}
