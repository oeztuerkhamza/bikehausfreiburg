using BikeHaus.Application.DTOs;
using BikeHaus.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BikeHaus.API.Controllers;

/// <summary>
/// Kleinanzeigen-Nachrichten als Chat (WhatsApp-ähnlich) statt als E-Mail-Liste.
///
/// Datenquelle ist das verbundene Gmail-Postfach: Kleinanzeigen leitet jede
/// Interessenten-Nachricht von einer eigenen Alias-Adresse weiter; eine Antwort
/// dorthin erscheint beim Interessenten wieder in der Kleinanzeigen-App.
///
/// Nicht zu verwechseln mit <see cref="KleinanzeigenController"/> — der steuert
/// den Anzeigen-Scraper.
/// </summary>
[Route("api/[controller]")]
[ApiController]
[Authorize]
public class KleinanzeigenChatController(IKleinanzeigenChatService chat) : ControllerBase
{
    /// <summary>
    /// Welches Postfach die Chats gerade benutzen. Ein eigenes Konto verbindet man
    /// über <c>GET /api/gmail/auth-url?account=kleinanzeigen</c>.
    /// </summary>
    [HttpGet("account")]
    public ActionResult<KleinanzeigenAccountDto> Account() => Ok(chat.GetAccountStatus());

    /// <summary>Eigenes Kleinanzeigen-Postfach abmelden (Mail-Konto bleibt verbunden).</summary>
    [HttpPost("account/disconnect")]
    public IActionResult DisconnectAccount()
    {
        chat.DisconnectAccount();
        return Ok(new { ok = true });
    }

    [HttpGet("conversations")]
    public async Task<ActionResult<List<KleinanzeigenChatDto>>> Conversations(CancellationToken ct)
    {
        try
        {
            return Ok(await chat.ListConversationsAsync(ct));
        }
        catch (InvalidOperationException ex)
        {
            // Gmail nicht verbunden / Sitzung abgelaufen — wie im Mail-Assistenten 409.
            return StatusCode(409, new { message = ex.Message });
        }
    }

    [HttpGet("conversations/{id}")]
    public async Task<ActionResult<KleinanzeigenChatDto>> Conversation(string id, CancellationToken ct)
    {
        try
        {
            return Ok(await chat.GetConversationAsync(id, ct));
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { message = "Unterhaltung nicht gefunden." });
        }
        catch (InvalidOperationException ex)
        {
            return StatusCode(409, new { message = ex.Message });
        }
    }

    /// <summary>Übersetzt die eingegangenen Nachrichten ins Türkische (einmalig, zentral gespeichert).</summary>
    [HttpPost("conversations/{id}/translate")]
    public async Task<ActionResult<KleinanzeigenChatDto>> Translate(string id, CancellationToken ct)
    {
        try
        {
            return Ok(await chat.TranslateIncomingAsync(id, ct));
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { message = "Unterhaltung nicht gefunden." });
        }
        catch (InvalidOperationException ex)
        {
            return StatusCode(503, new { message = ex.Message });
        }
    }

    /// <summary>Erzeugt aus der türkischen Anweisung eine kurze Antwort und legt sie als Entwurf ab.</summary>
    [HttpPost("conversations/{id}/compose")]
    public async Task<ActionResult<KleinanzeigenChatDto>> Compose(
        string id, [FromBody] KleinanzeigenComposeRequest request, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request?.Instruction))
            return BadRequest(new { message = "Anweisung erforderlich." });

        try
        {
            return Ok(await chat.ComposeAsync(id, request.Instruction, ct));
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { message = "Unterhaltung nicht gefunden." });
        }
        catch (InvalidOperationException ex)
        {
            return StatusCode(503, new { message = ex.Message });
        }
    }

    [HttpPut("conversations/{id}/draft")]
    public async Task<IActionResult> SaveDraft(
        string id, [FromBody] KleinanzeigenDraftRequest request, CancellationToken ct)
    {
        try
        {
            await chat.SaveDraftAsync(id, request?.Draft ?? string.Empty, request?.DraftTr, ct);
            return Ok(new { ok = true });
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { message = "Unterhaltung nicht gefunden." });
        }
    }

    [HttpPost("conversations/{id}/send")]
    public async Task<ActionResult<KleinanzeigenChatDto>> Send(
        string id, [FromBody] KleinanzeigenSendRequest request, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request?.Text))
            return BadRequest(new { message = "Text erforderlich." });

        try
        {
            return Ok(await chat.SendAsync(id, request.Text, ct));
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { message = "Unterhaltung nicht gefunden." });
        }
        catch (InvalidOperationException ex)
        {
            return StatusCode(409, new { message = ex.Message });
        }
    }

    [HttpPost("conversations/{id}/read")]
    public async Task<IActionResult> MarkRead(string id, CancellationToken ct)
    {
        try
        {
            await chat.MarkReadAsync(id, ct);
            return Ok(new { ok = true });
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { message = "Unterhaltung nicht gefunden." });
        }
        catch (InvalidOperationException ex)
        {
            return StatusCode(409, new { message = ex.Message });
        }
    }
}
