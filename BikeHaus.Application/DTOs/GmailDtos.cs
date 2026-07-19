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

public record GmailSendRequest(
    string To,
    string Subject,
    string Body,
    string ThreadId,
    string? InReplyTo = null,
    string? References = null);
