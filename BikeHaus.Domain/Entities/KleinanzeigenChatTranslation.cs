namespace BikeHaus.Domain.Entities;

/// <summary>
/// Türkische Übersetzung einer eingehenden Kleinanzeigen-Chatnachricht.
///
/// Die Nachrichten selbst liegen in Gmail und werden nicht gespiegelt – nur die
/// Übersetzung wird gespeichert, damit sie einmal erzeugt wird und danach auf
/// jedem Gerät (Handy-App wie Adminpanel) identisch erscheint.
/// </summary>
public class KleinanzeigenChatTranslation : BaseEntity
{
    /// <summary>Gmail-Message-ID der übersetzten Nachricht. Eindeutig.</summary>
    public string GmailMessageId { get; set; } = string.Empty;

    /// <summary>Türkische Übersetzung des Nachrichtentextes.</summary>
    public string TranslationTr { get; set; } = string.Empty;
}
