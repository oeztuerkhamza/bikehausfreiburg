using BikeHaus.Application.DTOs;
using BikeHaus.Application.Interfaces;
using BikeHaus.Infrastructure.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BikeHaus.API.Controllers;

/// <summary>
/// Admin-side newsletter / marketing tools: opt-out (Abmelde-) list management
/// plus the Google-review request campaign (preview, test send, bulk send).
/// </summary>
[ApiController]
[Route("api/newsletter")]
[Authorize]
public class NewsletterController : ControllerBase
{
    private readonly IUnsubscribeService _unsubscribe;
    private readonly ICampaignService _campaign;
    private readonly CampaignStatusStore _status;
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<NewsletterController> _logger;

    public NewsletterController(
        IUnsubscribeService unsubscribe,
        ICampaignService campaign,
        CampaignStatusStore status,
        IServiceScopeFactory scopeFactory,
        ILogger<NewsletterController> logger)
    {
        _unsubscribe = unsubscribe;
        _campaign = campaign;
        _status = status;
        _scopeFactory = scopeFactory;
        _logger = logger;
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

    // ── Google-Bewertungs-Kampagne ───────────────────────────────────────

    /// <summary>Recipient counts for the review campaign.</summary>
    [HttpGet("campaign/preview")]
    public async Task<ActionResult<CampaignPreviewDto>> CampaignPreview()
    {
        var preview = await _campaign.GetReviewRequestPreviewAsync();
        return Ok(preview);
    }

    /// <summary>Sends a single test mail to the given address.</summary>
    [HttpPost("campaign/test")]
    public async Task<ActionResult<CampaignActionResult>> CampaignTest([FromBody] CampaignTestRequest request)
    {
        var result = await _campaign.SendTestAsync(request.Email);
        return result.Ok ? Ok(result) : BadRequest(result);
    }

    /// <summary>Live status of the running/last campaign (for polling).</summary>
    [HttpGet("campaign/status")]
    public ActionResult<CampaignStatusDto> CampaignStatus()
        => Ok(_status.Snapshot());

    /// <summary>Starts the bulk send on a background task. Returns 202 + recipient total.</summary>
    [HttpPost("campaign/send")]
    public async Task<ActionResult<CampaignActionResult>> CampaignSend()
    {
        var preview = await _campaign.GetReviewRequestPreviewAsync();
        if (preview.RecipientCount == 0)
            return BadRequest(new CampaignActionResult(false, "Keine Empfänger (alle abgemeldet oder ohne E-Mail)."));

        // Atomically claim the runner; rejects a second concurrent send.
        if (!_status.TryBegin(preview.RecipientCount))
            return Conflict(new CampaignActionResult(false, "Eine Kampagne läuft bereits."));

        // Run detached: a fresh DI scope so the DbContext outlives this request.
        _ = Task.Run(async () =>
        {
            using var scope = _scopeFactory.CreateScope();
            var campaign = scope.ServiceProvider.GetRequiredService<ICampaignService>();
            try
            {
                await campaign.RunReviewRequestCampaignAsync(CancellationToken.None);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Review campaign crashed.");
                _status.Fail(ex.Message);
            }
        });

        return Accepted(new CampaignActionResult(true, "Kampagne gestartet.", preview.RecipientCount));
    }

}
