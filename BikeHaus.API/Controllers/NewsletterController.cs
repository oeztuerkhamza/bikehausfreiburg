using BikeHaus.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BikeHaus.API.Controllers;

/// <summary>
/// Admin-side management of the marketing opt-out (Abmelde-) list.
/// Lets the shop honour GDPR requests: view who unsubscribed, manually add an
/// address, or re-subscribe one that was removed by mistake.
/// </summary>
[ApiController]
[Route("api/newsletter")]
[Authorize]
public class NewsletterController : ControllerBase
{
    private readonly IUnsubscribeService _unsubscribe;

    public NewsletterController(IUnsubscribeService unsubscribe)
    {
        _unsubscribe = unsubscribe;
    }

    public record UnsubscribeRequest(string Email);

    /// <summary>All currently suppressed addresses.</summary>
    [HttpGet("unsubscribed")]
    public async Task<IActionResult> GetUnsubscribed()
    {
        var emails = await _unsubscribe.GetUnsubscribedEmailsAsync();
        return Ok(emails);
    }

    /// <summary>Manually add an address to the suppression list.</summary>
    [HttpPost("unsubscribe")]
    public async Task<IActionResult> Unsubscribe([FromBody] UnsubscribeRequest request)
    {
        var ok = await _unsubscribe.UnsubscribeAsync(request.Email, "manual");
        if (!ok)
            return BadRequest(new { message = "Ungültige E-Mail-Adresse." });
        return Ok(new { message = "Adresse wurde abgemeldet." });
    }

    /// <summary>Re-subscribe (remove from suppression list).</summary>
    [HttpDelete("unsubscribe")]
    public async Task<IActionResult> Resubscribe([FromQuery] string email)
    {
        var removed = await _unsubscribe.ResubscribeAsync(email);
        if (!removed)
            return NotFound(new { message = "Adresse war nicht abgemeldet." });
        return Ok(new { message = "Adresse wurde wieder angemeldet." });
    }
}
