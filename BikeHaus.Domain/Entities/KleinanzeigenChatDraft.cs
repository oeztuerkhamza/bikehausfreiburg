namespace BikeHaus.Domain.Entities;

/// <summary>
/// Noch nicht gesendeter Antwortentwurf einer Kleinanzeigen-Unterhaltung.
///
/// Zentral gespeichert, damit ein am Handy begonnener Entwurf auch im Adminpanel
/// weitergeschrieben werden kann (und umgekehrt). Nach dem Senden wird der
/// Eintrag gelöscht.
/// </summary>
public class KleinanzeigenChatDraft : BaseEntity
{
    /// <summary>
    /// Schlüssel der Unterhaltung: die Kleinanzeigen-Alias-Adresse des Interessenten
    /// (z. B. <c>…-ek-ek@mail.kleinanzeigen.de</c>), klein geschrieben. Eindeutig.
    /// </summary>
    public string ConversationKey { get; set; } = string.Empty;

    /// <summary>Antworttext in der Sprache des Interessenten (wird so gesendet).</summary>
    public string Draft { get; set; } = string.Empty;

    /// <summary>Türkische Rückübersetzung zur Kontrolle.</summary>
    public string DraftTr { get; set; } = string.Empty;
}
