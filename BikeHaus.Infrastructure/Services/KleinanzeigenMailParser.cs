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
        "Antwort zur Anzeige",
        "Du hast eine Antwort",
        "Du hast eine neue Nachricht",
        "Deine Anzeige",
        "Antworten",
        "kleinanzeigen",
        "Anzeigennummer:",
        "Zur Anzeige",
        "Jetzt antworten",
    ];

    private static readonly Regex AdIdRegex = new(@"Anzeigennummer:?\s*(\d{5,})", RegexOptions.Compiled);

    /// <summary>Ab hier steht der Text des Interessenten: "Nachricht von X" bzw. "Antwort von X".</summary>
    private static readonly Regex SenderMarkerRegex =
        new(@"(?:Nachricht|Antwort)\s+von\b", RegexOptions.Compiled | RegexOptions.IgnoreCase);
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

    /// <summary>Ergebnis der Zerlegung einer eingehenden Benachrichtigungsmail.</summary>
    public record IncomingMessage(string Text, string? SenderName, string? Phone);

    /// <summary>
    /// Zerlegt die Mail in Name, Telefonnummer und den eigentlichen Text.
    ///
    /// Der Block hinter "Nachricht von" kommt in zwei Varianten vor — mal steht der
    /// Name allein auf seiner Zeile, mal folgt direkt eine Telefonnummer und der
    /// Text hängt in derselben Zeile dahinter:
    /// <code>
    ///   Nachricht von Tayfun\nHallo, ist das Rad noch da?
    ///   Nachricht von Kelvin (Tel.: 1633688266) Hallo. Das Rad kostet 349?
    ///   Antwort von Kelvin Ok.
    /// </code>
    /// Deshalb wird hier bewusst nicht zeilenweise gearbeitet. Im letzten Fall
    /// steht der Name ohne jedes Trennzeichen vor dem Text — dann hilft
    /// <paramref name="knownSenderName"/> (aus dem Von-Kopf der Mail): fängt der
    /// Rest damit an, wird genau dieser Vorspann abgeschnitten.
    /// </summary>
    public static IncomingMessage ParseIncoming(string? body, string? knownSenderName = null)
    {
        if (string.IsNullOrWhiteSpace(body)) return new IncomingMessage(string.Empty, null, null);

        var text = body.Replace("\r\n", "\n").Replace('\r', '\n');
        string? name = null, phone = null;

        // Erste Anfrage: "Nachricht von …", jede weitere Antwort: "Antwort von …".
        var marker = SenderMarkerRegex.Match(text);
        if (marker.Success)
        {
            var rest = text[(marker.Index + marker.Length)..];

            // 1) "Name (Tel.: 0123…) Text" — die Klammer begrenzt den Namen.
            var withPhone = Regex.Match(rest,
                @"^\s*(?<name>[^\n(]{1,60}?)\s*\(\s*Tel\.?\s*:?\s*(?<tel>[^)]{3,40})\s*\)\s*(?<msg>.*)$",
                RegexOptions.Singleline);
            // 2) "Name\nText" — Name steht allein auf der Zeile.
            var withLine = Regex.Match(rest,
                @"^[ \t]*(?<name>[^\n]{1,60})\n(?<msg>.*)$",
                RegexOptions.Singleline);

            if (withPhone.Success)
            {
                name = withPhone.Groups["name"].Value.Trim();
                phone = withPhone.Groups["tel"].Value.Trim();
                text = withPhone.Groups["msg"].Value;
            }
            else if (withLine.Success)
            {
                name = withLine.Groups["name"].Value.Trim();
                text = withLine.Groups["msg"].Value;
            }
            else if (!string.IsNullOrWhiteSpace(knownSenderName) &&
                     rest.TrimStart().StartsWith(knownSenderName.Trim(), StringComparison.OrdinalIgnoreCase))
            {
                // 3) "Antwort von Kelvin Ok." — nichts trennt Name und Text außer
                //    dem Namen selbst, den wir aus dem Von-Kopf kennen.
                var trimmed = rest.TrimStart();
                name = knownSenderName.Trim();
                text = trimmed[name.Length..].TrimStart(' ', '\t', ':', ',', '-', '\n');
            }
            else
            {
                text = rest;
            }
        }

        var cut = FirstMarkerIndex(text);
        if (cut > 0) text = text[..cut];

        var cleaned = CleanBlock(text);
        // Ändert Kleinanzeigen das Mailformat, bleibt vom Filtern womöglich nichts
        // übrig. Dann lieber den Rohtext zeigen als die Nachricht verschwinden
        // lassen — der Chat muss vollständig bleiben.
        if (cleaned.Length == 0) cleaned = text.Trim();

        return new IncomingMessage(cleaned, string.IsNullOrWhiteSpace(name) ? null : name, phone);
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
