namespace BikeHaus.Application.Interfaces;

/// <summary>
/// Kennungen der verbundenen Google-Postfächer. Es können mehrere Konten
/// gleichzeitig verbunden sein: der KI-E-Mail-Assistent nutzt das
/// Geschäftspostfach ("default"), die Kleinanzeigen-Chats dürfen an einem
/// anderen Konto hängen ("kleinanzeigen") — dort laufen die Anzeigen.
/// Jedes Konto wird getrennt verbunden und abgemeldet.
/// </summary>
public static class GmailAccounts
{
    public const string Default = "default";
    public const string Kleinanzeigen = "kleinanzeigen";

    /// <summary>Unbekannte oder leere Werte fallen auf das Standardpostfach zurück.</summary>
    public static string Normalize(string? account)
    {
        var a = (account ?? string.Empty).Trim().ToLowerInvariant();
        return a == Kleinanzeigen ? Kleinanzeigen : Default;
    }
}
