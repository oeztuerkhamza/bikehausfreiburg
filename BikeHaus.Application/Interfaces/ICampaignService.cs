using BikeHaus.Application.DTOs;

namespace BikeHaus.Application.Interfaces;

/// <summary>
/// Google-review request campaign: recipient selection (customers with e-mail,
/// minus opt-outs), template rendering and sending.
/// </summary>
public interface ICampaignService
{
    /// <summary>How many customers would receive the mail and how many are skipped (opt-out).</summary>
    Task<CampaignPreviewDto> GetReviewRequestPreviewAsync();

    /// <summary>Sends a single test mail to the given address. Returns a status message.</summary>
    Task<CampaignActionResult> SendTestAsync(string email);

    /// <summary>
    /// Runs the full campaign: iterate all eligible customers, render + send,
    /// updating the shared status store. Intended to be called on a background task.
    /// </summary>
    Task RunReviewRequestCampaignAsync(CancellationToken cancellationToken);
}
