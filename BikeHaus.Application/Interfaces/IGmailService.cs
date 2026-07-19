using BikeHaus.Application.DTOs;

namespace BikeHaus.Application.Interfaces;

/// <summary>
/// Server-seitige Gmail-Anbindung. Der OAuth-Refresh-Token wird zentral gespeichert,
/// sodass die Verbindung einmalig hergestellt wird und danach von jedem Rechner und
/// Browser aus ohne erneutes Anmelden nutzbar ist.
/// </summary>
public interface IGmailService
{
    GmailStatusDto GetStatus();
    string BuildAuthUrl(string state);
    Task HandleCallbackAsync(string code, CancellationToken ct);
    void Disconnect();

    Task<List<GmailListItemDto>> ListInboxAsync(string? query, int maxResults, CancellationToken ct);
    Task<GmailMessageDto> GetMessageAsync(string id, CancellationToken ct);
    Task MarkAsReadAsync(string id, CancellationToken ct);
    Task TrashAsync(string id, CancellationToken ct);
    Task SendReplyAsync(GmailSendRequest request, CancellationToken ct);
}
