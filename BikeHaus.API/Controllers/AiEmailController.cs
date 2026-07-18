using BikeHaus.Application.DTOs;
using BikeHaus.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BikeHaus.API.Controllers;

/// <summary>
/// KI-gestützter E-Mail-Assistent. Erstellt professionelle Antworten in der
/// Sprache der eingehenden Kunden-E-Mail. Der eigentliche Gmail-Zugriff
/// (Lesen/Senden) erfolgt clientseitig über die Google-API des angemeldeten Nutzers.
/// </summary>
[Route("api/[controller]")]
[ApiController]
[Authorize]
public class AiEmailController(IAiEmailAssistantService assistantService) : ControllerBase
{
    [HttpPost("generate-reply")]
    public async Task<ActionResult<AiEmailReplyResponse>> GenerateReply(
        [FromBody] AiEmailReplyRequest request,
        CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.Body) && string.IsNullOrWhiteSpace(request.Instruction))
            return BadRequest(new { message = "E-Mail-Text oder Notizen erforderlich." });

        try
        {
            var result = await assistantService.GenerateReplyAsync(request, ct);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return StatusCode(503, new { message = ex.Message });
        }
    }
}
