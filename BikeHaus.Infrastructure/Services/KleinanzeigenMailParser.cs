using System.Text;
using System.Text.RegularExpressions;

namespace BikeHaus.Infrastructure.Services;

/// <summary>
/// Zerlegt eine Kleinanzeigen-Benachrichtigungsmail in das, was im Chat wirklich
/// interessiert: Name des Interessenten, Anzeigentitel, Anzeigennummer und der
/// eigentliche Nachrichtentext – ohne den Rahmen von Kleinanzeigen
/// ("Ein Interessent hat…", "Beantworte diese Nachricht…", Footer, Rechtstexte).
///
/// Aufbau der Mail (Stand 2026):
/// <code>
/// Betreff: Anfrage zu deiner Anzeige "Bulls Mountainbike …"
/// Von:     Tayfun über Kleinanzeigen &lt;…-ek-ek@mail.kleinanzeigen.de&gt;
///
///   Ein Interessent hat eine Anfrage zu deiner Anzeige … (Anzeigennummer: 3456283104) gesendet.
///   Nachricht von Tayfun
///   Hallo wie kann ich dies Fahrrad kaufen ?
///   Beantworte diese Nachricht einfach mit der "Antworten"-Funktion …
/// </code>
/// </summary>
public static class KleinanzeigenMailParser
{
    /// <summary>Domain der Alias-Adressen, über die der Chat läuft.</summary>
    public const string AliasDomain = "mail.kleinanzeigen.de";

    // Ab hier ist nur noch Kleinanzeigen-Rahmen, kein Kundentext mehr.
    private static readonly string[] EndMarkers =
    [
        "Beantworte diese Nachricht",
        "Antworte einfach auf diese",
        "Schütze dich vor Betrug",
        "Zum Schutz unserer Nutzer",
        "Dein Team von Kleinanzeigen",
        "Wenn du Fragen hast",
        "Diese E-Mail wurde automatisch",
        "kleinanzeigen.de GmbH",
        "Allgemeine Nutzungsbedingungen",
    ];

    // Zeilen, die im Textteil nichts zu suchen haben.
    private static readonly string[] NoiseLines =
    [
        "Ein Interessent hat",
        "Anfrage zu deiner Anzeige",
        "Neue Nachricht zu deiner Anzeige",
        "Nachricht zu deiner Anzeige",
        "Antwort auf deine Anzeige",
        "Deine Anzeige",
        "Antworten",
        "kleinanzeigen",
        "Anzeigennummer:",
        "Zur Anzeige",
        "Jetzt antworten",
    ];

    private static readonly Regex AdIdRegex = new(@"Anzeigennummer:?\s*(\d{5,})", RegexOptions.Compiled);
    private static readonly Regex SenderLineRegex =
        new(@"^\s*Nachricht von\s+(.+?)\s*$", RegexOptions.Compiled | RegexOptions.Multiline);
    private static readonly Regex QuoteHeaderRegex =
        new(@"^\s*(Am .+ schrieb .+:|-{2,}\s*Ursprüngliche Nachricht\s*-{2,}|On .+ wrote:)\s*$",
            RegexOptions.Compiled | RegexOptions.Multiline);

    /// <summary>Läuft diese Adresse über den Kleinanzeigen-Nachrichten-Alias?</summary>
    public static bool IsAliasAddress(string? email) =>
        !string.IsNullOrWhiteSpace(email) &&
        email.Contains(AliasDomain, StringComparison.OrdinalIgnoreCase);

    /// <summary>Erste Alias-Adresse aus einer Empfängerliste ("A &lt;a@x&gt;, b@y").</summary>
    public static string? ExtractAlias(string? headerValue)
    {
        if (string.IsNullOrWhiteSpace(headerValue)) return null;
        foreach (Match m in Regex.Matches(headerValue, @"[^\s<>,;""]+@[^\s<>,;""]+"))
        {
            var candidate = m.Value.Trim().Trim('>', '<', '"', ',', ';');
            if (IsAliasAddress(candidate)) return candidate.ToLowerInvariant();
        }
        return null;
    }

    /// <summary>"Tayfun über Kleinanzeigen" → "Tayfun".</summary>
    public static string CleanPeerName(string? fromName, string? fallbackAlias)
    {
        var name = (fromName ?? string.Empty).Trim().Trim('"').Trim();
        foreach (var suffix in new[] { " über Kleinanzeigen", " via Kleinanzeigen", " über eBay Kleinanzeigen" })
        {
            var idx = name.IndexOf(suffix, StringComparison.OrdinalIgnoreCase);
            if (idx > 0) name = name[..idx].Trim();
        }
        if (!string.IsNullOrWhiteSpace(name)) return name;

        var local = fallbackAlias?.Split('@').FirstOrDefault();
        return string.IsNullOrWhiteSpace(local) ? "Kleinanzeigen" : local!;
    }

    /// <summary>Anzeigentitel aus dem Betreff ("… deiner Anzeige \"Titel\"").</summary>
    public static string ExtractAdTitle(string? subject)
    {
        var s = (subject ?? string.Empty).Trim();
        if (s.Length == 0) return "Kleinanzeigen";

        // Betreff-Präfixe von Antworten entfernen.
        s = Regex.Replace(s, @"^(Re|AW|Fwd|WG)\s*:\s*", "", RegexOptions.IgnoreCase).Trim();

        var quoted = Regex.Match(s, "[\"„»](.+?)[\"“«]");
        if (quoted.Success) return quoted.Groups[1].Value.Trim();

        var after = Regex.Match(s, @"Anzeige\s*[:\-]?\s*(.+)$", RegexOptions.IgnoreCase);
        if (after.Success) return after.Groups[1].Value.Trim().Trim('"');

        return s;
    }

    public static string? ExtractAdId(string? body)
    {
        if (string.IsNullOrWhiteSpace(body)) return null;
        var m = AdIdRegex.Match(body);
        return m.Success ? m.Groups[1].Value : null;
    }

    /// <summary>Name aus der Zeile "Nachricht von …", falls vorhanden.</summary>
    public static string? ExtractSenderFromBody(string? body)
    {
        if (string.IsNullOrWhiteSpace(body)) return null;
        var m = SenderLineRegex.Match(body);
        return m.Success ? m.Groups[1].Value.Trim() : null;
    }

    /// <summary>
    /// Der eigentliche Text des Interessenten. Beginnt nach "Nachricht von …"
    /// und endet vor dem ersten Kleinanzeigen-Rahmenblock.
    /// </summary>
    public static string ExtractIncomingText(string? body)
    {
        if (string.IsNullOrWhiteSpace(body)) return string.Empty;

        var text = body.Replace("\r\n", "\n").Replace('\r', '\n');

        var sender = SenderLineRegex.Match(text);
        if (sender.Success)
            text = text[(sender.Index + sender.Length)..];

        var cut = FirstMarkerIndex(text);
        if (cut > 0) text = text[..cut];

        var cleaned = CleanBlock(text);
        if (cleaned.Length > 0) return cleaned;

        // Ändert Kleinanzeigen das Mailformat, bleibt vom Filtern womöglich nichts
        // übrig. Dann lieber den Rohtext zeigen als die Nachricht verschwinden
        // lassen — der Chat muss vollständig bleiben.
        return text.Trim();
    }

    /// <summary>
    /// Unser eigener gesendeter Text – ohne zitierten Verlauf und ohne den
    /// Kleinanzeigen-Rahmen, falls der Anbieter etwas anhängt.
    ///
    /// Anders als beim eingehenden Text werden hier KEINE Links oder Zeilen
    /// weggeworfen: was wir geschrieben haben, soll im Verlauf genau so stehen.
    /// </summary>
    public static string ExtractOutgoingText(string? body)
    {
        if (string.IsNullOrWhiteSpace(body)) return string.Empty;

        var text = StripQuotedHistory(body);

        var cut = FirstMarkerIndex(text);
        if (cut > 0) text = text[..cut];

        return Regex.Replace(text.Trim(), "\n{3,}", "\n\n");
    }

    /// <summary>
    /// Entfernt zitierten Verlauf ("Am … schrieb …:", Zeilen mit "&gt;") aus einem
    /// Text, der gesendet werden soll.
    ///
    /// Beim Antworten geht bewusst NUR der neue Text raus: Kleinanzeigen zeigt dem
    /// Interessenten den kompletten Mailtext im Chat an — ein angehängter Verlauf
    /// stünde dort als Wiederholung und ließe die Antwort maschinell wirken.
    /// </summary>
    public static string StripQuotedHistory(string? text)
    {
        if (string.IsNullOrWhiteSpace(text)) return string.Empty;

        var normalized = text.Replace("\r\n", "\n").Replace('\r', '\n');

        var quote = QuoteHeaderRegex.Match(normalized);
        if (quote.Success) normalized = normalized[..quote.Index];

        var lines = normalized.Split('\n').Where(l => !l.TrimStart().StartsWith('>'));
        return Regex.Replace(string.Join("\n", lines).Trim(), "\n{3,}", "\n\n");
    }

    private static int FirstMarkerIndex(string text)
    {
        var cut = -1;
        foreach (var marker in EndMarkers)
        {
            var idx = text.IndexOf(marker, StringComparison.OrdinalIgnoreCase);
            if (idx >= 0 && (cut < 0 || idx < cut)) cut = idx;
        }
        return cut;
    }

    /// <summary>Zitatzeilen, Links und Rahmenzeilen raus, Leerzeilen zusammenfassen.</summary>
    private static string CleanBlock(string text)
    {
        var sb = new StringBuilder();
        foreach (var raw in text.Split('\n'))
        {
            var line = raw.Trim();
            if (line.Length == 0) { sb.Append('\n'); continue; }
            if (line.StartsWith('>')) continue;
            if (line.StartsWith("http://") || line.StartsWith("https://")) continue;
            if (line.All(c => c is '-' or '=' or '_' or '*' or ' ')) continue;
            if (NoiseLines.Any(n => line.StartsWith(n, StringComparison.OrdinalIgnoreCase))) continue;
            sb.Append(line).Append('\n');
        }

        var result = Regex.Replace(sb.ToString(), "\n{3,}", "\n\n").Trim();
        return result;
    }
}
