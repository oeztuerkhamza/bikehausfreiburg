using BikeHaus.Application.DTOs;
using BikeHaus.Application.Interfaces;
using BikeHaus.Domain.Entities;
using BikeHaus.Domain.Enums;
using BikeHaus.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace BikeHaus.Infrastructure.Services;

/// <summary>
/// Builds and sends the Google-review request campaign. Recipients are all
/// customers with a valid e-mail, minus anyone on the opt-out (Abmelde-) list.
///
/// Sent as a short PLAIN-TEXT message (no HTML, no List-Unsubscribe headers)
/// from the dedicated campaign sender, so it reads like a normal personal
/// mail and is far less likely to land in Gmail's "Promotions"/Werbung tab.
/// The opt-out link stays in the body text for legal compliance.
/// </summary>
public class CampaignService : ICampaignService
{
    // Throttle between messages so the SMTP server (Mailcow) does not rate-limit us.
    private const int ThrottleMs = 350;
    private const string Subject = "Wie war Ihr Besuch bei Bike Haus Freiburg?";

    private readonly BikeHausDbContext _db;
    private readonly IEmailService _email;
    private readonly IUnsubscribeService _unsubscribe;
    private readonly CampaignStatusStore _status;
    private readonly ReviewAutomationOptions _reviewOptions;
    private readonly ILogger<CampaignService> _logger;

    public CampaignService(
        BikeHausDbContext db,
        IEmailService email,
        IUnsubscribeService unsubscribe,
        CampaignStatusStore status,
        IOptions<ReviewAutomationOptions> reviewOptions,
        ILogger<CampaignService> logger)
    {
        _db = db;
        _email = email;
        _unsubscribe = unsubscribe;
        _status = status;
        _reviewOptions = reviewOptions.Value;
        _logger = logger;
    }

    public async Task<CampaignPreviewDto> GetReviewRequestPreviewAsync()
    {
        var (eligible, skipped) = await BuildRecipientsAsync();
        return new CampaignPreviewDto(eligible.Count, skipped);
    }

    public async Task<CampaignActionResult> SendTestAsync(string email)
    {
        var to = (email ?? string.Empty).Trim();
        if (!IsValidEmail(to.ToLowerInvariant()))
            return new CampaignActionResult(false, "Ungültige E-Mail-Adresse.");

        var url = _unsubscribe.BuildUnsubscribeUrl(to);
        var text = RenderText("Test", url);

        try
        {
            await _email.SendNewsletterAsync(to, "Test", "[TEST] " + Subject, text);
            return new CampaignActionResult(true, $"Test-Mail an {to} gesendet.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Test campaign mail to {Email} failed.", to);
            return new CampaignActionResult(false, "Senden fehlgeschlagen: " + ex.Message);
        }
    }

    public async Task RunReviewRequestCampaignAsync(CancellationToken cancellationToken)
    {
        var (recipients, _) = await BuildRecipientsAsync();
        _status.SetTotal(recipients.Count);
        _logger.LogInformation("Review campaign started: {Count} recipients.", recipients.Count);

        foreach (var r in recipients)
        {
            if (cancellationToken.IsCancellationRequested)
            {
                _logger.LogWarning("Review campaign cancelled after partial send.");
                break;
            }

            var outcome = await SendReviewRequestAsync(r.Email, r.Vorname, ReviewRequestSource.Manual, cancellationToken);
            if (outcome == ReviewSendOutcome.Sent)
                _status.IncrementSent();
            else if (outcome == ReviewSendOutcome.Failed)
                _status.IncrementFailed();
            // Skipped (unsubscribed / already contacted / invalid) — not counted.

            try { await Task.Delay(ThrottleMs, cancellationToken); }
            catch (TaskCanceledException) { break; }
        }

        _status.Complete();
        _logger.LogInformation("Review campaign finished.");
    }

    public async Task<ReviewSendOutcome> SendReviewRequestAsync(
        string email, string? vorname, ReviewRequestSource source, CancellationToken cancellationToken = default)
    {
        var normalized = (email ?? string.Empty).Trim().ToLowerInvariant();
        var gate = await CheckEligibilityAsync(normalized, cancellationToken);
        if (gate.HasValue)
            return gate.Value;

        var address = email!.Trim();
        var url = _unsubscribe.BuildUnsubscribeUrl(address);
        var text = RenderText(vorname ?? string.Empty, url);

        try
        {
            await _email.SendNewsletterAsync(address, vorname ?? string.Empty, Subject, text);
        }
        catch (Exception ex)
        {
            // Not recorded → eligible for retry on the next run (until MaxAgeDays).
            _logger.LogError(ex, "Review request mail to {Email} failed.", normalized);
            return ReviewSendOutcome.Failed;
        }

        await RecordSentAsync(normalized, vorname, source, cancellationToken);
        return ReviewSendOutcome.Sent;
    }

    // ── shared review-request gating ─────────────────────────────────────

    /// <summary>
    /// Returns the skip outcome if the address is NOT eligible right now
    /// (invalid, unsubscribed, over the lifetime cap, or contacted within
    /// MinIntervalDays). Returns null when the address is eligible to be
    /// contacted. Split out of <see cref="SendReviewRequestAsync"/> so the
    /// gating rules live in exactly one place regardless of which flow
    /// (automatic post-sale/rental, manual campaign) triggers a send.
    /// </summary>
    private async Task<ReviewSendOutcome?> CheckEligibilityAsync(string normalizedEmail, CancellationToken cancellationToken)
    {
        if (!IsValidEmail(normalizedEmail))
            return ReviewSendOutcome.SkippedInvalidEmail;

        if (await _unsubscribe.IsUnsubscribedAsync(normalizedEmail))
            return ReviewSendOutcome.SkippedUnsubscribed;

        // Harte Obergrenze: eine Adresse wird INSGESAMT höchstens
        // MaxSendsPerCustomer (Standard 2) mal kontaktiert — über die gesamte
        // Historie, geteilt von manueller Kampagne und Auto-Ablauf (Sale/Rental).
        var maxSends = Math.Max(1, _reviewOptions.MaxSendsPerCustomer);
        var totalContacted = await _db.ReviewRequests
            .CountAsync(r => r.Email == normalizedEmail, cancellationToken);
        if (totalContacted >= maxSends)
            return ReviewSendOutcome.SkippedAlreadySent;

        // Zusätzlich Mindestabstand: nicht zweimal innerhalb MinIntervalDays.
        var since = DateTime.UtcNow.AddDays(-Math.Max(1, _reviewOptions.MinIntervalDays));
        var recentlyContacted = await _db.ReviewRequests
            .AnyAsync(r => r.Email == normalizedEmail && r.SentAt >= since, cancellationToken);
        if (recentlyContacted)
            return ReviewSendOutcome.SkippedAlreadySent;

        return null;
    }

    private async Task RecordSentAsync(
        string normalizedEmail, string? vorname, ReviewRequestSource source, CancellationToken cancellationToken)
    {
        _db.ReviewRequests.Add(new ReviewRequest
        {
            Email = normalizedEmail,
            Vorname = string.IsNullOrWhiteSpace(vorname) ? null : vorname.Trim(),
            SentAt = DateTime.UtcNow,
            Source = source,
        });
        await _db.SaveChangesAsync(cancellationToken);
    }

    // ── recipient selection ──────────────────────────────────────────────

    private async Task<(List<Recipient> Eligible, int Skipped)> BuildRecipientsAsync()
    {
        var raw = await _db.Customers
            .Where(c => c.Email != null && c.Email != "")
            .Select(c => new { c.Vorname, c.Email })
            .ToListAsync();

        var suppressed = (await _unsubscribe.GetUnsubscribedEmailsAsync()).ToHashSet();

        // Already-contacted within the de-dup window (same rule the per-send loop
        // enforces). Excluded here too so the preview count and the campaign total
        // reflect only genuinely-new recipients — "An alle senden" never re-mails
        // someone who already received the request.
        var since = DateTime.UtcNow.AddDays(-Math.Max(1, _reviewOptions.MinIntervalDays));
        var alreadyContacted = (await _db.ReviewRequests
            .Where(r => r.SentAt >= since)
            .Select(r => r.Email)
            .ToListAsync())
            .ToHashSet();

        // Harte Obergrenze: Adressen, die insgesamt bereits MaxSendsPerCustomer
        // mal kontaktiert wurden, bekommen nie wieder eine Anfrage.
        var maxSends = Math.Max(1, _reviewOptions.MaxSendsPerCustomer);
        var capped = (await _db.ReviewRequests
            .GroupBy(r => r.Email)
            .Where(g => g.Count() >= maxSends)
            .Select(g => g.Key)
            .ToListAsync())
            .ToHashSet();

        var seen = new HashSet<string>();
        var eligible = new List<Recipient>();
        var skipped = 0;

        foreach (var c in raw)
        {
            var normalized = c.Email!.Trim().ToLowerInvariant();
            if (!IsValidEmail(normalized))
                continue;
            if (!seen.Add(normalized))
                continue; // de-duplicate shared addresses

            if (suppressed.Contains(normalized))
            {
                skipped++;
                continue;
            }

            if (capped.Contains(normalized))
                continue; // 2x-Limit erreicht — nie wieder kontaktieren

            if (alreadyContacted.Contains(normalized))
                continue; // already received the request — skip silently

            eligible.Add(new Recipient(c.Vorname ?? string.Empty, c.Email!.Trim()));
        }

        return (eligible, skipped);
    }

    private static bool IsValidEmail(string email)
        => !string.IsNullOrWhiteSpace(email)
           && email.Length <= 200
           && email.IndexOf('@') > 0
           && email.IndexOf('@') < email.Length - 1;

    private readonly record struct Recipient(string Vorname, string Email);

    // ── rendering ────────────────────────────────────────────────────────

    private static string RenderText(string vorname, string unsubscribeUrl)
    {
        var anrede = string.IsNullOrWhiteSpace(vorname) ? "Hallo," : $"Hallo {vorname.Trim()},";
        return TextTemplate
            .Replace("[[ANREDE]]", anrede)
            .Replace("[[ABMELDE]]", unsubscribeUrl);
    }

    // Short, personal, plain text — reads like a one-to-one mail, not a
    // newsletter. One review link, one opt-out link, no marketing chrome.
    private const string TextTemplate = """
[[ANREDE]]

vielen Dank, dass Sie bei Bike Haus Freiburg waren. Ich hoffe, Sie sind mit
Ihrem Fahrrad und unserem Service zufrieden.

Wenn Sie einen Moment Zeit haben, würde ich mich sehr über eine kurze
Google-Bewertung freuen:

https://g.page/r/CRnu1n--kiIYEBM/review

Das hilft uns wirklich weiter. Vielen Dank!

Viele Grüße
Cevdet Akarsu
Bike Haus Freiburg
Heckerstraße 27, 79114 Freiburg im Breisgau
Telefon / WhatsApp: +49 155 6630 0011

Falls Sie keine weiteren E-Mails von uns möchten, können Sie sich hier
abmelden: [[ABMELDE]]
""";
}
