namespace BikeHaus.Application.DTOs;

public record GmailStatusDto(bool Connected, string? Email);

public record GmailListItemDto(
    string Id,
    string ThreadId,
    string FromName,
    string FromEmail,
    string Subject,
    string Snippet,
    string Date,
    bool Unread);

public record GmailMessageDto(
    string Id,
    string ThreadId,
    string MessageIdHeader,
    string References,
    string FromName,
    string FromEmail,
    string To,
    string Subject,
    string Date,
    string Body);

/// <summary>Kurzinfo eines Threads aus der Trefferliste (ohne Nachrichteninhalte).</summary>
public record GmailThreadSummaryDto(string Id, string HistoryId, string Snippet);

/// <summary>
/// Einzelne Nachricht innerhalb eines Threads – inklusive Richtung (<see cref="Sent"/>)
/// und Zeitstempel, damit daraus ein Chatverlauf gebaut werden kann.
/// </summary>
public record GmailThreadMessageDto(
    string Id,
    string ThreadId,
    string MessageIdHeader,
    string References,
    string FromName,
    string FromEmail,
    string To,
    string Subject,
    string Date,
    string Body,
    bool Unread,
    bool Sent,
    long TimestampMs);

public record GmailThreadDto(string Id, string HistoryId, List<GmailThreadMessageDto> Messages);

public record GmailSendRequest(
    string To,
    string Subject,
    string Body,
    string ThreadId,
    string? InReplyTo = null,
    string? References = null);
