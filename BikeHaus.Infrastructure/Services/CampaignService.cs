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

vielen Dank, dass Sie sich für Bike Haus Freiburg entschieden haben. Wir
hoffen, Sie sind mit Ihrem Fahrrad und unserem Service zufrieden.

Wenn Sie einen Moment Zeit haben, würden wir uns sehr über eine kurze
Bewertung bei Google freuen:

>> https://g.page/r/CRnu1n--kiIYEBM/review

----------------------------------------------------------------

SERVICE & WARTUNG — Inspektion, Wartung und Pflege:
https://bikehausfreiburg.com/de/service

FAHRRADVERLEIH — Freiburg entdecken, online buchen:
https://bikehausfreiburg.com/de/fahrradverleih

----------------------------------------------------------------

Bike Haus Freiburg
Heckerstraße 27, 79114 Freiburg im Breisgau
Telefon / WhatsApp: +49 155 6630 0011
info.bikehausfreiburg@gmail.com

Sie erhalten diese E-Mail, weil Sie Kundin oder Kunde bei Bike Haus
Freiburg sind. Abmelden: [[ABMELDE]]
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
  <div style="display:none; max-height:0; overflow:hidden; opacity:0;">
    Vielen Dank für Ihren Besuch bei Bike Haus Freiburg – wir würden uns über Ihre Bewertung freuen.
  </div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f5f7;">
    <tr>
      <td align="center" style="padding:24px 12px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:600px; max-width:600px; background-color:#ffffff; border-radius:12px; overflow:hidden;">
          <tr>
            <td style="background-color:#0f172a; padding:24px 32px;" align="center">
              <a href="https://bikehausfreiburg.com/de" target="_blank" style="text-decoration:none;">
                <img src="https://bikehausfreiburg.com/assets/logo.png" alt="Bike Haus Freiburg" width="180" style="display:block; width:180px; max-width:180px; height:auto; margin:0 auto;">
              </a>
              <div style="font-size:13px; color:#9ca3af; margin-top:10px;">Fahrradverkauf &amp; Verleih · Heckerstraße 27, Freiburg</div>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 32px 8px 32px;">
              <p style="margin:0 0 16px 0; font-size:16px; line-height:1.6;">[[ANREDE]]</p>
              <p style="margin:0 0 16px 0; font-size:16px; line-height:1.6;">vielen Dank, dass Sie sich für Bike Haus Freiburg entschieden haben. Wir hoffen, Sie sind mit Ihrem Fahrrad und unserem Service zufrieden.</p>
              <p style="margin:0 0 8px 0; font-size:16px; line-height:1.6;">Wenn Sie einen Moment Zeit haben, würden wir uns sehr über eine kurze Bewertung bei Google freuen. Das hilft anderen Radfahrerinnen und Radfahrern in Freiburg, uns zu finden – und uns, noch besser zu werden.</p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:16px 32px 32px 32px;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="border-radius:8px; background-color:#f59e0b;">
                    <a href="https://g.page/r/CRnu1n--kiIYEBM/review" target="_blank" style="display:inline-block; padding:14px 32px; font-size:16px; font-weight:bold; color:#1f2937; text-decoration:none; border-radius:8px;">⭐ Jetzt bei Google bewerten</a>
                  </td>
                </tr>
              </table>
              <p style="margin:14px 0 0 0; font-size:13px; color:#6b7280;">Es dauert nur eine Minute – vielen Dank!</p>
            </td>
          </tr>
          <tr><td style="padding:0 32px;"><hr style="border:none; border-top:1px solid #e5e7eb; margin:0;"></td></tr>
          <tr>
            <td style="padding:28px 32px 8px 32px;">
              <a href="https://bikehausfreiburg.com/de/service" target="_blank" style="text-decoration:none;">
                <img src="https://bikehausfreiburg.com/assets/images/sections/bg-services.jpg" alt="Fahrrad-Service und Wartung bei Bike Haus Freiburg" width="536" style="width:100%; max-width:536px; height:auto; border-radius:8px; display:block;">
              </a>
              <h2 style="margin:16px 0 8px 0; font-size:18px; color:#0f172a;">Service &amp; Wartung</h2>
              <p style="margin:0 0 12px 0; font-size:15px; line-height:1.6; color:#374151;">Inspektion, Wartung und Pflege – damit Ihr Rad sicher und zuverlässig läuft. Vereinbaren Sie einfach einen Termin bei uns im Laden.</p>
              <a href="https://bikehausfreiburg.com/de/service" target="_blank" style="font-size:15px; font-weight:bold; color:#0ea5e9; text-decoration:none;">Mehr zum Service &rarr;</a>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 32px 8px 32px;">
              <a href="https://bikehausfreiburg.com/de/fahrradverleih" target="_blank" style="text-decoration:none;">
                <img src="https://bikehausfreiburg.com/assets/images/sections/bg-rental.jpg" alt="Fahrradverleih bei Bike Haus Freiburg" width="536" style="width:100%; max-width:536px; height:auto; border-radius:8px; display:block;">
              </a>
              <h2 style="margin:16px 0 8px 0; font-size:18px; color:#0f172a;">Fahrradverleih</h2>
              <p style="margin:0 0 12px 0; font-size:15px; line-height:1.6; color:#374151;">Freiburg und das Umland entdecken – ob für einen Tag oder länger. Bei uns finden Sie das passende Rad. Online ansehen und buchen.</p>
              <a href="https://bikehausfreiburg.com/de/fahrradverleih" target="_blank" style="font-size:15px; font-weight:bold; color:#0ea5e9; text-decoration:none;">Räder ansehen &amp; buchen &rarr;</a>
            </td>
          </tr>
          <tr><td style="padding:24px 32px 0 32px;"><hr style="border:none; border-top:1px solid #e5e7eb; margin:0;"></td></tr>
          <tr>
            <td style="padding:20px 32px 28px 32px;">
              <p style="margin:0 0 6px 0; font-size:13px; line-height:1.6; color:#6b7280;">
                <strong>Bike Haus Freiburg</strong><br>
                Heckerstraße 27, 79114 Freiburg im Breisgau<br>
                Telefon / WhatsApp: +49 155 6630 0011<br>
                E-Mail: info.bikehausfreiburg@gmail.com<br>
                Web: <a href="https://bikehausfreiburg.com" target="_blank" style="color:#6b7280;">bikehausfreiburg.com</a>
              </p>
              <p style="margin:14px 0 6px 0; font-size:12px; line-height:1.6; color:#9ca3af;">Sie erhalten diese E-Mail, weil Sie Kundin oder Kunde bei Bike Haus Freiburg sind. Wenn Sie keine weiteren E-Mails von uns erhalten möchten, können Sie sich hier jederzeit abmelden:</p>
              <p style="margin:0 0 14px 0;">
                <a href="[[ABMELDE]]" target="_blank" style="font-size:13px; font-weight:bold; color:#374151; text-decoration:underline;">Vom Newsletter abmelden</a>
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
