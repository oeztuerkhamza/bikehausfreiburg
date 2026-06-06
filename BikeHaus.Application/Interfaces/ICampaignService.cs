using BikeHaus.Application.DTOs;
using BikeHaus.Domain.Enums;

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

    /// <summary>
    /// Sends ONE review-request mail to a single recipient — but only if eligible:
    /// valid address, not unsubscribed, and not already contacted within the
    /// configured interval. Records a <c>ReviewRequest</c> on success. Shared by
    /// the automatic (post sale/rental) flow and the manual campaign so a customer
    /// is never contacted twice. Returns the outcome.
    /// </summary>
    Task<ReviewSendOutcome> SendReviewRequestAsync(
        string email, string? vorname, ReviewRequestSource source, CancellationToken cancellationToken = default);
}
