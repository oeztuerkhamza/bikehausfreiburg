using System.Net;
using BikeHaus.Application.DTOs;
using BikeHaus.Application.Interfaces;
using BikeHaus.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace BikeHaus.Infrastructure.Services;

/// <summary>
/// Builds and sends the Google-review request campaign. Recipients are all
/// customers with a valid e-mail, minus anyone on the opt-out (Abmelde-) list.
/// The mail content is intentionally minimal so Gmail is less likely to
/// classify it as Promotions.
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
    private readonly ILogger<CampaignService> _logger;

    public CampaignService(
        BikeHausDbContext db,
        IEmailService email,
        IUnsubscribeService unsubscribe,
        CampaignStatusStore status,
        ILogger<CampaignService> logger)
    {
        _db = db;
        _email = email;
        _unsubscribe = unsubscribe;
        _status = status;
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
        var html = RenderHtml("Test", url);
        var text = RenderText("Test", url);

        try
        {
            await _email.SendNewsletterAsync(to, "Test", "[TEST] " + Subject, html, text, url);
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

            try
            {
                var url = _unsubscribe.BuildUnsubscribeUrl(r.Email);
                var anrede = string.IsNullOrWhiteSpace(r.Vorname) ? string.Empty : r.Vorname;
                var html = RenderHtml(anrede, url);
                var text = RenderText(anrede, url);

                await _email.SendNewsletterAsync(r.Email, r.Vorname, Subject, html, text, url);
                _status.IncrementSent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Review campaign mail to {Email} failed.", r.Email);
                _status.IncrementFailed();
            }

            try { await Task.Delay(ThrottleMs, cancellationToken); }
            catch (TaskCanceledException) { break; }
        }

        _status.Complete();
        _logger.LogInformation("Review campaign finished.");
    }

    // ── recipient selection ──────────────────────────────────────────────

    private async Task<(List<Recipient> Eligible, int Skipped)> BuildRecipientsAsync()
    {
        var raw = await _db.Customers
            .Where(c => c.Email != null && c.Email != "")
            .Select(c => new { c.Vorname, c.Email })
            .ToListAsync();

        var suppressed = (await _unsubscribe.GetUnsubscribedEmailsAsync()).ToHashSet();

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

    private static string RenderHtml(string vorname, string unsubscribeUrl)
    {
        var anrede = string.IsNullOrWhiteSpace(vorname)
            ? "Hallo,"
            : $"Hallo {WebUtility.HtmlEncode(vorname.Trim())},";
        return HtmlTemplate
            .Replace("[[ANREDE]]", anrede)
            .Replace("[[ABMELDE]]", WebUtility.HtmlEncode(unsubscribeUrl));
    }

    private static string RenderText(string vorname, string unsubscribeUrl)
    {
        var anrede = string.IsNullOrWhiteSpace(vorname) ? "Hallo," : $"Hallo {vorname.Trim()},";
        return TextTemplate
            .Replace("[[ANREDE]]", anrede)
            .Replace("[[ABMELDE]]", unsubscribeUrl);
    }

    private const string TextTemplate = """
[[ANREDE]]

vielen Dank, dass Sie bei Bike Haus Freiburg waren. Wir hoffen, dass Sie mit
Ihrem Fahrrad und unserem Service zufrieden sind.

Wenn Sie kurz Zeit haben, würden wir uns sehr über eine Google-Bewertung
freuen:

https://g.page/r/CRnu1n--kiIYEBM/review

Viele Grüße
Ihr Team vom Bike Haus Freiburg

Bike Haus Freiburg
Heckerstraße 27, 79114 Freiburg im Breisgau
Telefon / WhatsApp: +49 155 6630 0011
E-Mail: info.bikehausfreiburg@gmail.com

Sie erhalten diese E-Mail, weil Sie Kundin oder Kunde bei Bike Haus Freiburg
sind. Abmelden: [[ABMELDE]]
Datenschutz: https://bikehausfreiburg.com/de/datenschutz
""";

    // Deliberately NOT a marketing "card" layout. Gmail classifies centered
    // 600px cards, background colours, presentation tables and styled CTA
    // buttons as "Promotions". This template mirrors the plain-text version:
    // white background, left-aligned, system font, the review link as a bare
    // inline URL (no button), and a single small opt-out line in the footer.
    private const string HtmlTemplate = """
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0; padding:0; background:#ffffff; font-family:Arial, Helvetica, sans-serif; font-size:15px; line-height:1.6; color:#222222;">
  <div style="max-width:600px; padding:16px;">
    <p style="margin:0 0 14px 0;">[[ANREDE]]</p>
    <p style="margin:0 0 14px 0;">vielen Dank, dass Sie bei Bike Haus Freiburg waren. Wir hoffen, dass Sie mit Ihrem Fahrrad und unserem Service zufrieden sind.</p>
    <p style="margin:0 0 14px 0;">Wenn Sie kurz Zeit haben, würden wir uns sehr über eine Google-Bewertung freuen:<br>
      <a href="https://g.page/r/CRnu1n--kiIYEBM/review" style="color:#1a56db;">https://g.page/r/CRnu1n--kiIYEBM/review</a></p>
    <p style="margin:0 0 14px 0;">Viele Grüße<br>Ihr Team vom Bike Haus Freiburg</p>
    <p style="margin:0 0 14px 0; color:#444444;">
      Bike Haus Freiburg<br>
      Heckerstraße 27, 79114 Freiburg im Breisgau<br>
      Telefon / WhatsApp: +49 155 6630 0011<br>
      E-Mail: info.bikehausfreiburg@gmail.com
    </p>
    <p style="margin:0; font-size:12px; color:#888888;">
      Sie erhalten diese E-Mail, weil Sie Kundin oder Kunde bei Bike Haus Freiburg sind.
      <a href="[[ABMELDE]]" style="color:#888888;">Abmelden</a>
      &nbsp;·&nbsp;
      <a href="https://bikehausfreiburg.com/de/datenschutz" style="color:#888888;">Datenschutz</a>
    </p>
  </div>
</body>
</html>
""";
}
