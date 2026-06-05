using BikeHaus.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BikeHaus.API.Controllers;

/// <summary>
/// Public opt-out endpoint for marketing/newsletter mails (Abmeldung).
/// Linked from the footer of every campaign mail. No auth: the signed token
/// in the URL identifies the recipient.
/// </summary>
[ApiController]
[Route("api/public/unsubscribe")]
[AllowAnonymous]
public class UnsubscribeController : ControllerBase
{
    private readonly IUnsubscribeService _unsubscribe;
    private readonly ILogger<UnsubscribeController> _logger;

    public UnsubscribeController(IUnsubscribeService unsubscribe, ILogger<UnsubscribeController> logger)
    {
        _unsubscribe = unsubscribe;
        _logger = logger;
    }

    /// <summary>
    /// Recipient clicks the "Abmelden" link in the e-mail (browser GET).
    /// Returns a small self-contained confirmation page.
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> Unsubscribe([FromQuery] string? token)
    {
        if (!_unsubscribe.TryValidateToken(token, out var email))
        {
            _logger.LogWarning("Unsubscribe GET with invalid/missing token.");
            return Content(BuildPage(success: false, email: null), "text/html; charset=utf-8");
        }

        await _unsubscribe.UnsubscribeAsync(email, "link");
        _logger.LogInformation("Unsubscribed {Email} via link.", email);
        return Content(BuildPage(success: true, email: email), "text/html; charset=utf-8");
    }

    /// <summary>
    /// RFC 8058 one-click unsubscribe (List-Unsubscribe-Post). Mail clients like
    /// Gmail POST here directly; must succeed without any further interaction.
    /// </summary>
    [HttpPost]
    [Consumes("application/x-www-form-urlencoded")]
    public async Task<IActionResult> UnsubscribeOneClick([FromQuery] string? token)
    {
        if (!_unsubscribe.TryValidateToken(token, out var email))
            return BadRequest();

        await _unsubscribe.UnsubscribeAsync(email, "one-click");
        _logger.LogInformation("Unsubscribed {Email} via one-click.", email);
        return Ok();
    }

    private static string BuildPage(bool success, string? email)
    {
        var title = success ? "Erfolgreich abgemeldet" : "Link ungültig";
        var heading = success ? "Sie wurden abgemeldet" : "Abmeldung nicht möglich";
        var message = success
            ? (string.IsNullOrEmpty(email)
                ? "Sie erhalten von uns keine weiteren Werbe-E-Mails mehr."
                : $"Die Adresse <strong>{System.Net.WebUtility.HtmlEncode(email)}</strong> erhält von uns keine weiteren Werbe-E-Mails mehr.")
            : "Dieser Abmelde-Link ist ungültig oder abgelaufen. Bitte antworten Sie auf unsere E-Mail oder schreiben Sie an info.bikehausfreiburg@gmail.com – wir tragen Sie manuell aus.";
        var accent = success ? "#16a34a" : "#dc2626";

        return $@"<!DOCTYPE html>
<html lang=""de"">
<head>
  <meta charset=""utf-8"">
  <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"">
  <meta name=""robots"" content=""noindex"">
  <title>{title} · Bike Haus Freiburg</title>
  <style>
    body {{ margin:0; background:#f4f5f7; font-family:Arial,Helvetica,sans-serif; color:#1f2937; }}
    .wrap {{ max-width:520px; margin:48px auto; background:#fff; border-radius:12px; overflow:hidden; box-shadow:0 1px 4px rgba(0,0,0,.08); }}
    .head {{ background:#0f172a; padding:24px; text-align:center; color:#fff; font-size:18px; font-weight:bold; letter-spacing:.5px; }}
    .body {{ padding:32px; }}
    h1 {{ font-size:20px; margin:0 0 12px; color:{accent}; }}
    p {{ font-size:15px; line-height:1.6; margin:0 0 12px; }}
    a.btn {{ display:inline-block; margin-top:12px; color:#0ea5e9; text-decoration:none; font-weight:bold; }}
    .foot {{ padding:0 32px 28px; font-size:12px; color:#9ca3af; line-height:1.6; }}
  </style>
</head>
<body>
  <div class=""wrap"">
    <div class=""head"">BIKE&nbsp;HAUS&nbsp;FREIBURG</div>
    <div class=""body"">
      <h1>{heading}</h1>
      <p>{message}</p>
      <a class=""btn"" href=""https://bikehausfreiburg.com/de"">Zur Website &rarr;</a>
    </div>
    <div class=""foot"">
      Bike Haus Freiburg · Heckerstraße 27, 79114 Freiburg im Breisgau<br>
      info.bikehausfreiburg@gmail.com
    </div>
  </div>
</body>
</html>";
    }
}
