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
        if (!IsValidEmail(normalized))
            return ReviewSendOutcome.SkippedInvalidEmail;

        if (await _unsubscribe.IsUnsubscribedAsync(normalized))
            return ReviewSendOutcome.SkippedUnsubscribed;

        // De-dup: at most one request per address per MinIntervalDays — shared by
        // the manual campaign and the automatic flow via the ReviewRequest table.
        var since = DateTime.UtcNow.AddDays(-Math.Max(1, _reviewOptions.MinIntervalDays));
        var alreadyContacted = await _db.ReviewRequests
            .AnyAsync(r => r.Email == normalized && r.SentAt >= since, cancellationToken);
        if (alreadyContacted)
            return ReviewSendOutcome.SkippedAlreadySent;

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

        _db.ReviewRequests.Add(new ReviewRequest
        {
            Email = normalized,
            Vorname = string.IsNullOrWhiteSpace(vorname) ? null : vorname.Trim(),
            SentAt = DateTime.UtcNow,
            Source = source,
        });
        await _db.SaveChangesAsync(cancellationToken);

        return ReviewSendOutcome.Sent;
    }

    // ── Erinnerungsecke ("Anı Köşesi") Einladungs-Kampagne ───────────────

    public async Task<CampaignPreviewDto> GetMemoryInvitePreviewAsync()
    {
        var (eligible, skipped) = await BuildMemoryRecipientsAsync();
        return new CampaignPreviewDto(eligible.Count, skipped);
    }

    public async Task RunMemoryInviteCampaignAsync(CancellationToken cancellationToken)
    {
        var (recipients, _) = await BuildMemoryRecipientsAsync();
        _status.SetTotal(recipients.Count);
        _logger.LogInformation("Memory invite campaign started: {Count} recipients.", recipients.Count);

        foreach (var r in recipients)
        {
            if (cancellationToken.IsCancellationRequested)
            {
                _logger.LogWarning("Memory invite campaign cancelled after partial send.");
                break;
            }

            var outcome = await SendMemoryInviteAsync(r.Email, r.Vorname, MemoryInviteSource.ManualCampaign, cancellationToken);
            if (outcome == ReviewSendOutcome.Sent)
                _status.IncrementSent();
            else if (outcome == ReviewSendOutcome.Failed)
                _status.IncrementFailed();

            try { await Task.Delay(ThrottleMs, cancellationToken); }
            catch (TaskCanceledException) { break; }
        }

        _status.Complete();
        _logger.LogInformation("Memory invite campaign finished.");
    }

    public async Task<ReviewSendOutcome> SendMemoryInviteAsync(
        string email, string? vorname, MemoryInviteSource source, CancellationToken cancellationToken = default)
    {
        var normalized = (email ?? string.Empty).Trim().ToLowerInvariant();
        if (!IsValidEmail(normalized))
            return ReviewSendOutcome.SkippedInvalidEmail;

        if (await _unsubscribe.IsUnsubscribedAsync(normalized))
            return ReviewSendOutcome.SkippedUnsubscribed;

        // Einmal-pro-Adresse: jede Adresse wird höchstens EINMAL eingeladen
        // (geteilt zwischen manueller Kampagne und Auto-Ablauf).
        var alreadyInvited = await _db.MemoryInvites
            .AnyAsync(m => m.Email == normalized, cancellationToken);
        if (alreadyInvited)
            return ReviewSendOutcome.SkippedAlreadySent;

        var address = email!.Trim();
        var url = _unsubscribe.BuildUnsubscribeUrl(address);

        try
        {
            await _email.SendMemoryInviteAsync(address, vorname, url);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Memory invite mail to {Email} failed.", normalized);
            return ReviewSendOutcome.Failed;
        }

        _db.MemoryInvites.Add(new MemoryInvite
        {
            Email = normalized,
            Vorname = string.IsNullOrWhiteSpace(vorname) ? null : vorname.Trim(),
            SentAt = DateTime.UtcNow,
            Source = source,
        });
        await _db.SaveChangesAsync(cancellationToken);

        return ReviewSendOutcome.Sent;
    }

    // Empfänger = alle bisherigen Miet-Kunden (formale Mietverträge + öffentliche
    // Buchungen), dedupliziert, ohne Abgemeldete und ohne bereits Eingeladene.
    private async Task<(List<Recipient> Eligible, int Skipped)> BuildMemoryRecipientsAsync()
    {
        var fromRentals = await _db.Rentals
            .Where(r => r.Customer.Email != null && r.Customer.Email != "")
            .Select(r => new { r.Customer.Email, r.Customer.Vorname })
            .ToListAsync();

        var fromBookings = await _db.RentalBookings
            .Where(b => b.Status != RentalBookingStatus.Cancelled && b.Email != null && b.Email != "")
            .Select(b => new { b.Email, Vorname = b.Vorname })
            .ToListAsync();

        var suppressed = (await _unsubscribe.GetUnsubscribedEmailsAsync()).ToHashSet();
        var alreadyInvited = (await _db.MemoryInvites.Select(m => m.Email).ToListAsync()).ToHashSet();

        var seen = new HashSet<string>();
        var eligible = new List<Recipient>();
        var skipped = 0;

        void Consider(string? rawEmail, string? vorname)
        {
            if (string.IsNullOrWhiteSpace(rawEmail)) return;
            var normalized = rawEmail.Trim().ToLowerInvariant();
            if (!IsValidEmail(normalized)) return;
            if (!seen.Add(normalized)) return;         // deduplizieren
            if (suppressed.Contains(normalized)) { skipped++; return; }
            if (alreadyInvited.Contains(normalized)) return; // schon eingeladen — still überspringen
            eligible.Add(new Recipient(vorname ?? string.Empty, rawEmail.Trim()));
        }

        foreach (var r in fromRentals) Consider(r.Email, r.Vorname);
        foreach (var b in fromBookings) Consider(b.Email, b.Vorname);

        return (eligible, skipped);
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
