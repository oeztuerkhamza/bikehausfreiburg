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

    // ── Erinnerungsecke ("Anı Köşesi") Einladungs-Kampagne ──

    /// <summary>Wie viele Miet-Kunden würden die Einladung erhalten (noch nicht eingeladen, nicht abgemeldet).</summary>
    Task<CampaignPreviewDto> GetMemoryInvitePreviewAsync();

    /// <summary>Sendet die Einladung an ALLE bisherigen Miet-Kunden. Für einen Background-Task gedacht.</summary>
    Task RunMemoryInviteCampaignAsync(CancellationToken cancellationToken);

    /// <summary>
    /// Sendet EINE Einladung — nur wenn geeignet: gültige Adresse, nicht abgemeldet,
    /// noch nie eingeladen. Schreibt bei Erfolg einen <c>MemoryInvite</c>. Geteilt von
    /// der manuellen Kampagne und dem automatischen Ablauf (Folgetag 08:00 nach Rückgabe).
    /// </summary>
    Task<ReviewSendOutcome> SendMemoryInviteAsync(
        string email, string? vorname, MemoryInviteSource source, CancellationToken cancellationToken = default);
}
