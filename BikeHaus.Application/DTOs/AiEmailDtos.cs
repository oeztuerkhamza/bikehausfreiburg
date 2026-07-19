namespace BikeHaus.Application.DTOs;

/// <summary>
/// Anfrage zur Erstellung einer KI-gestützten E-Mail-Antwort.
/// Der Ladeninhaber diktiert oder tippt seine Notizen auf Türkisch (<see cref="Instruction"/>);
/// die KI antwortet dem Kunden in der Sprache der eingehenden E-Mail.
/// </summary>
public record AiEmailReplyRequest(
    string Body,
    string Instruction,
    string? FromName = null,
    string? FromEmail = null,
    string? Subject = null,
    string Tone = "formal");

/// <summary>Von der KI erzeugte E-Mail-Antwort.</summary>
public record AiEmailReplyResponse(
    string DetectedLanguage,
    string DetectedLanguageName,
    string ReplySubject,
    string ReplyBody);

public record AiTranslateRequest(string Text);

public record AiTranslateResponse(string Translation);
