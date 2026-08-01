namespace BikeHaus.Application.DTOs;

/// <summary>
/// Eine Kleinanzeigen-Unterhaltung: alle Nachrichten, die über dieselbe
/// Alias-Adresse (<c>…@mail.kleinanzeigen.de</c>) laufen – also ein Interessent
/// zu einer Anzeige. Wird als Chatverlauf dargestellt.
///
/// <para>Titel, Bild, Preis und Link der Anzeige kommen — soweit vorhanden — aus
/// den gescrapten Kleinanzeigen-Daten (Abgleich über die Anzeigennummer);
/// sonst bleibt nur, was in der Mail stand.</para>
///
/// <para><c>Id</c> ist die Base64Url-kodierte Alias-Adresse (URL-tauglich),
/// <c>Alias</c> die Antwortadresse: eine E-Mail dorthin landet im Kleinanzeigen-Chat
/// des Interessenten. <c>LastDirection</c> ist "in" oder "out".</para>
/// </summary>
public record KleinanzeigenChatDto(
    string Id,
    string Alias,
    string PeerName,
    string? PeerPhone,
    string AdTitle,
    string? AdId,
    string? AdImageUrl,
    decimal? AdPrice,
    string? AdUrl,
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

/// <summary>
/// Welches Google-Postfach die Kleinanzeigen-Chats gerade benutzen.
/// <c>OwnAccount</c> = ein eigens dafür verbundenes Konto (sonst läuft es über
/// das Konto des KI-E-Mail-Assistenten).
/// </summary>
public record KleinanzeigenAccountDto(bool Connected, string? Email, bool OwnAccount);

/// <summary>Titel, Preis, Link und Foto einer Anzeige.</summary>
public record KleinanzeigenAdInfoDto(string? Title, decimal? Price, string Url, string? ImageUrl);

public record KleinanzeigenComposeRequest(string Instruction);

public record KleinanzeigenSendRequest(string Text);

public record KleinanzeigenDraftRequest(string Draft, string? DraftTr = null);
