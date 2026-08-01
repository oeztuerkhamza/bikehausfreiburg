using BikeHaus.Application.DTOs;

namespace BikeHaus.Application.Interfaces;

/// <summary>
/// Kleinanzeigen-Nachrichten als Chat. Quelle ist das verbundene Gmail-Postfach:
/// Kleinanzeigen leitet jede Interessenten-Nachricht als E-Mail von einer
/// Alias-Adresse (<c>…@mail.kleinanzeigen.de</c>) weiter; eine Antwort an genau
/// diese Adresse erscheint beim Interessenten wieder in der Kleinanzeigen-App.
/// Gespeichert werden nur Übersetzungen und Entwürfe – die Nachrichten bleiben in Gmail.
/// </summary>
public interface IKleinanzeigenChatService
{
    /// <summary>Verbundenes Postfach der Kleinanzeigen-Chats.</summary>
    KleinanzeigenAccountDto GetAccountStatus();

    /// <summary>Meldet das eigene Kleinanzeigen-Postfach ab (das Mail-Konto bleibt unberührt).</summary>
    void DisconnectAccount();

    /// <summary>Unterhaltungen (neueste zuerst), ohne Nachrichtenverlauf.</summary>
    Task<List<KleinanzeigenChatDto>> ListConversationsAsync(CancellationToken ct);

    /// <summary>Eine Unterhaltung inklusive aller Nachrichten.</summary>
    Task<KleinanzeigenChatDto> GetConversationAsync(string id, CancellationToken ct);

    /// <summary>Übersetzt alle noch nicht übersetzten eingehenden Nachrichten ins Türkische.</summary>
    Task<KleinanzeigenChatDto> TranslateIncomingAsync(string id, CancellationToken ct);

    /// <summary>
    /// Erzeugt aus der türkischen Anweisung eine kurze Antwort in der Sprache des
    /// Interessenten und speichert sie als Entwurf (inkl. türkischer Rückübersetzung).
    /// </summary>
    Task<KleinanzeigenChatDto> ComposeAsync(string id, string instruction, CancellationToken ct);

    /// <summary>Sendet den Text per Gmail an die Alias-Adresse und löscht den Entwurf.</summary>
    Task<KleinanzeigenChatDto> SendAsync(string id, string text, CancellationToken ct);

    Task SaveDraftAsync(string id, string draft, string? draftTr, CancellationToken ct);

    /// <summary>Markiert alle ungelesenen Nachrichten der Unterhaltung in Gmail als gelesen.</summary>
    Task MarkReadAsync(string id, CancellationToken ct);
}
