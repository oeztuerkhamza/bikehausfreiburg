namespace BikeHaus.Application.DTOs;

/// <summary>
/// Eine Kleinanzeigen-Unterhaltung: alle Nachrichten, die über dieselbe
/// Alias-Adresse (<c>…@mail.kleinanzeigen.de</c>) laufen – also ein Interessent
/// zu einer Anzeige. Wird als Chatverlauf dargestellt.
///
/// <para><c>Id</c> ist die Base64Url-kodierte Alias-Adresse (URL-tauglich),
/// <c>Alias</c> die Antwortadresse: eine E-Mail dorthin landet im Kleinanzeigen-Chat
/// des Interessenten. <c>LastDirection</c> ist "in" oder "out".</para>
/// </summary>
public record KleinanzeigenChatDto(
    string Id,
    string Alias,
    string PeerName,
    string AdTitle,
    string? AdId,
    string ThreadId,
    long UpdatedAt,
    int Unread,
    string LastMessage,
    string LastDirection,
    string Draft,
    string DraftTr,
    List<KleinanzeigenChatMessageDto> Messages);

/// <summary>
/// Einzelne Chatnachricht. <c>Direction</c>: "in" = vom Interessenten,
/// "out" = von uns gesendet. <c>Ts</c> ist ein Unix-Zeitstempel in Millisekunden.
/// </summary>
public record KleinanzeigenChatMessageDto(
    string Id,
    string Direction,
    string Body,
    string? Translation,
    long Ts,
    bool Unread);

public record KleinanzeigenComposeRequest(string Instruction);

public record KleinanzeigenSendRequest(string Text);

public record KleinanzeigenDraftRequest(string Draft, string? DraftTr = null);
