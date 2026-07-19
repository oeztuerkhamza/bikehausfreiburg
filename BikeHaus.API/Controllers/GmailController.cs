using BikeHaus.Application.DTOs;
using BikeHaus.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BikeHaus.API.Controllers;

/// <summary>
/// Serverseitige Gmail-Anbindung für den KI-E-Mail-Assistenten. Die Verbindung wird
/// einmalig hergestellt und zentral gespeichert; danach ist sie von jedem Rechner und
/// Browser aus (mit gültigem Admin-Login) ohne erneute Google-Anmeldung nutzbar.
/// </summary>
[Route("api/[controller]")]
[ApiController]
[Authorize]
public class GmailController(IGmailService gmail) : ControllerBase
{
    [HttpGet("status")]
    public ActionResult<GmailStatusDto> Status() => Ok(gmail.GetStatus());

    [HttpGet("auth-url")]
    public ActionResult<object> AuthUrl()
    {
        var state = Guid.NewGuid().ToString("N");
        try
        {
            return Ok(new { url = gmail.BuildAuthUrl(state) });
        }
        catch (InvalidOperationException ex)
        {
            return StatusCode(503, new { message = ex.Message });
        }
    }

    /// <summary>OAuth-Redirect-Ziel von Google. Öffentlich, da ohne JWT aufgerufen.</summary>
    [HttpGet("callback")]
    [AllowAnonymous]
    public async Task<IActionResult> Callback([FromQuery] string? code, [FromQuery] string? error, CancellationToken ct)
    {
        if (!string.IsNullOrEmpty(error))
            return ClosePopup(false, error);
        if (string.IsNullOrEmpty(code))
            return ClosePopup(false, "missing_code");

        try
        {
            await gmail.HandleCallbackAsync(code, ct);
            return ClosePopup(true, null);
        }
        catch (Exception ex)
        {
            return ClosePopup(false, ex.Message);
        }
    }

    [HttpPost("disconnect")]
    public IActionResult Disconnect()
    {
        gmail.Disconnect();
        return Ok(new { ok = true });
    }

    [HttpGet("messages")]
    public async Task<ActionResult<List<GmailListItemDto>>> Messages(
        [FromQuery] string? q, [FromQuery] int max, CancellationToken ct)
    {
        try
        {
            var items = await gmail.ListInboxAsync(q, max <= 0 ? 20 : Math.Min(max, 50), ct);
            return Ok(items);
        }
        catch (InvalidOperationException ex)
        {
            return StatusCode(409, new { message = ex.Message });
        }
    }

    [HttpGet("messages/{id}")]
    public async Task<ActionResult<GmailMessageDto>> Message(string id, CancellationToken ct)
    {
        try
        {
            return Ok(await gmail.GetMessageAsync(id, ct));
        }
        catch (InvalidOperationException ex)
        {
            return StatusCode(409, new { message = ex.Message });
        }
    }

    [HttpPost("messages/{id}/read")]
    public async Task<IActionResult> MarkRead(string id, CancellationToken ct)
    {
        await gmail.MarkAsReadAsync(id, ct);
        return Ok(new { ok = true });
    }

    [HttpPost("messages/{id}/trash")]
    public async Task<IActionResult> Trash(string id, CancellationToken ct)
    {
        await gmail.TrashAsync(id, ct);
        return Ok(new { ok = true });
    }

    [HttpPost("send")]
    public async Task<IActionResult> Send([FromBody] GmailSendRequest request, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.To) || string.IsNullOrWhiteSpace(request.Body))
            return BadRequest(new { message = "Empfänger und Text erforderlich." });
        await gmail.SendReplyAsync(request, ct);
        return Ok(new { ok = true });
    }

    private ContentResult ClosePopup(bool success, string? error)
    {
        var payload = success ? "gmail-connected" : "gmail-error";
        var safeError = System.Text.Encodings.Web.JavaScriptEncoder.Default.Encode(error ?? "");
        var html = $@"<!doctype html><html><head><meta charset=""utf-8""><title>Gmail</title></head>
<body style=""font-family:sans-serif;text-align:center;padding:40px;color:#334"">
<p>{(success ? "✅ Gmail verbunden. Dieses Fenster kann geschlossen werden." : "❌ Verbindung fehlgeschlagen.")}</p>
<script>
  try {{ window.opener && window.opener.postMessage({{ type: '{payload}', error: '{safeError}' }}, '*'); }} catch (e) {{}}
  setTimeout(function() {{ window.close(); }}, 800);
</script>
</body></html>";
        return Content(html, "text/html");
    }
}
