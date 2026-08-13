using BikeHaus.Application.DTOs;
using BikeHaus.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BikeHaus.API.Controllers;

/// <summary>
/// Diktierte Notizen der Notiz-App. Die Spracherkennung läuft auf dem Telefon,
/// hier kommt der Text an, wird aufbereitet und zentral gespeichert.
/// </summary>
[Authorize]
[ApiController]
[Route("api/[controller]")]
public class SprachnotizenController(ISprachnotizService service, ILogger<SprachnotizenController> logger)
    : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<SprachnotizDto>>> GetAll() =>
        Ok(await service.GetAllAsync());

    [HttpGet("{id}")]
    public async Task<ActionResult<SprachnotizDto>> GetById(int id)
    {
        var notiz = await service.GetByIdAsync(id);
        return notiz == null ? NotFound() : Ok(notiz);
    }

    [HttpPost]
    public async Task<ActionResult<SprachnotizDto>> Create(
        [FromBody] SprachnotizCreateDto dto, CancellationToken ct)
    {
        try
        {
            var notiz = await service.CreateAsync(dto, ct);
            return CreatedAtAction(nameof(GetById), new { id = notiz.Id }, notiz);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<SprachnotizDto>> Update(int id, [FromBody] SprachnotizUpdateDto dto)
    {
        var notiz = await service.UpdateAsync(id, dto);
        return notiz == null ? NotFound() : Ok(notiz);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id) =>
        await service.DeleteAsync(id) ? NoContent() : NotFound();

    /// <summary>Rohtext aufbereiten, ohne zu speichern — für "nochmal aufbereiten" in der App.</summary>
    [HttpPost("aufbereiten")]
    public async Task<ActionResult<SprachnotizAufbereitetDto>> Aufbereiten(
        [FromBody] SprachnotizAufbereitenRequest request, CancellationToken ct)
    {
        try
        {
            return Ok(await service.AufbereitenAsync(request.RohText, request.Sprache, ct));
        }
        catch (InvalidOperationException ex)
        {
            // Kein API-Schlüssel: die App soll den Rohtext behalten, nicht abstürzen.
            logger.LogWarning(ex, "Aufbereitung nicht möglich.");
            return StatusCode(503, new { message = ex.Message });
        }
    }
}
