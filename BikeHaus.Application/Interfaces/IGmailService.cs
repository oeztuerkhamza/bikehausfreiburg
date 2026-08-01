using BikeHaus.Application.DTOs;

namespace BikeHaus.Application.Interfaces;

/// <summary>
/// Server-seitige Gmail-Anbindung. Der OAuth-Refresh-Token wird zentral gespeichert,
/// sodass die Verbindung einmalig hergestellt wird und danach von jedem Rechner und
/// Browser aus ohne erneutes Anmelden nutzbar ist.
///
/// Es können mehrere Google-Konten parallel verbunden sein (Parameter
/// <c>account</c>): "default" für den KI-E-Mail-Assistenten, "kleinanzeigen" für
/// die Kleinanzeigen-Chats — dort laufen die Anzeigen oft über ein anderes Postfach.
/// Ohne Angabe gilt immer das Standardkonto.
/// </summary>
public interface IGmailService
{
    GmailStatusDto GetStatus(string? account = null);
    string BuildAuthUrl(string state, string? account = null);
    Task HandleCallbackAsync(string code, string? account, CancellationToken ct);
    void Disconnect(string? account = null);

    Task<List<GmailListItemDto>> ListInboxAsync(string? query, int maxResults, CancellationToken ct, string? account = null);
    Task<GmailMessageDto> GetMessageAsync(string id, CancellationToken ct, string? account = null);

    /// <summary>Threads zu einer Gmail-Suchanfrage (nur IDs/HistoryId – günstig, für Cache-Prüfung).</summary>
    Task<List<GmailThreadSummaryDto>> ListThreadsAsync(string? query, int maxResults, CancellationToken ct, string? account = null);

    /// <summary>Kompletter Thread mit allen Nachrichten (ein- und ausgehend).</summary>
    Task<GmailThreadDto> GetThreadAsync(string threadId, CancellationToken ct, string? account = null);

    Task MarkAsReadAsync(string id, CancellationToken ct, string? account = null);
    Task TrashAsync(string id, CancellationToken ct, string? account = null);
    Task SendReplyAsync(GmailSendRequest request, CancellationToken ct, string? account = null);
}
