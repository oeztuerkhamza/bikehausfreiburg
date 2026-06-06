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

Bike Haus Freiburg
Heckerstraße 27, 79114 Freiburg im Breisgau
Telefon / WhatsApp: +49 155 6630 0011
E-Mail: info.bikehausfreiburg@gmail.com

Sie erhalten diese E-Mail, weil Sie Kundin oder Kunde bei Bike Haus Freiburg
sind. Abmelden: [[ABMELDE]]
Datenschutz: https://bikehausfreiburg.com/de/datenschutz
""";

    private const string HtmlTemplate = """
<!DOCTYPE html>
<html lang="de" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="x-apple-disable-message-reformatting">
  <title>Bike Haus Freiburg</title>
</head>
<body style="margin:0; padding:0; background-color:#f4f5f7; font-family:Arial, Helvetica, sans-serif; color:#1f2937;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f5f7;">
    <tr>
      <td align="center" style="padding:24px 12px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:600px; max-width:600px; background-color:#ffffff; border-radius:12px; overflow:hidden;">
          <tr>
            <td style="padding:32px 32px 24px 32px; font-size:16px; line-height:1.7; color:#1f2937;">
              <p style="margin:0 0 16px 0;">[[ANREDE]]</p>
              <p style="margin:0 0 16px 0;">vielen Dank, dass Sie bei Bike Haus Freiburg waren. Wir hoffen, dass Sie mit Ihrem Fahrrad und unserem Service zufrieden sind.</p>
              <p style="margin:0 0 16px 0;">Wenn Sie kurz Zeit haben, würden wir uns sehr über eine Google-Bewertung freuen:</p>
              <p style="margin:0 0 20px 0;">
                <a href="https://g.page/r/CRnu1n--kiIYEBM/review" target="_blank" style="color:#0f172a; text-decoration:underline; font-weight:bold;">Google-Bewertung schreiben</a>
              </p>
              <p style="margin:0 0 4px 0; font-size:14px; color:#4b5563;">Bike Haus Freiburg</p>
              <p style="margin:0 0 4px 0; font-size:14px; color:#4b5563;">Heckerstraße 27, 79114 Freiburg im Breisgau</p>
              <p style="margin:0 0 4px 0; font-size:14px; color:#4b5563;">Telefon / WhatsApp: +49 155 6630 0011</p>
              <p style="margin:0 0 16px 0; font-size:14px; color:#4b5563;">E-Mail: info.bikehausfreiburg@gmail.com</p>
              <p style="margin:0 0 6px 0; font-size:12px; line-height:1.6; color:#6b7280;">Sie erhalten diese E-Mail, weil Sie Kundin oder Kunde bei Bike Haus Freiburg sind. Wenn Sie keine weiteren E-Mails von uns erhalten möchten, können Sie sich hier jederzeit abmelden:</p>
              <p style="margin:0 0 12px 0; font-size:12px; line-height:1.6;">
                <a href="[[ABMELDE]]" target="_blank" style="color:#374151; text-decoration:underline;">Abmelden</a>
              </p>
              <p style="margin:0; font-size:12px; line-height:1.6; color:#9ca3af;">
                <a href="https://bikehausfreiburg.com/de/datenschutz" target="_blank" style="color:#9ca3af;">Datenschutzerklärung</a>
                &nbsp;·&nbsp;
                <a href="https://bikehausfreiburg.com/de/impressum" target="_blank" style="color:#9ca3af;">Impressum</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
""";
}
