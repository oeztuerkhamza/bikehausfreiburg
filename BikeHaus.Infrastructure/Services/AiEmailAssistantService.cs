using System.Text;
using System.Text.Json;
using Anthropic.SDK;
using Anthropic.SDK.Constants;
using Anthropic.SDK.Messaging;
using BikeHaus.Application.DTOs;
using BikeHaus.Application.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace BikeHaus.Infrastructure.Services;

/// <summary>
/// Erzeugt professionelle, kundenfreundliche E-Mail-Antworten mit Claude.
/// Die eingehende E-Mail wird analysiert, die Sprache erkannt und die Antwort
/// in genau dieser Sprache formuliert. Die Notizen des Inhabers kommen auf Türkisch.
/// </summary>
public class AiEmailAssistantService(
    IShopSettingsService shopSettingsService,
    IConfiguration configuration,
    ILogger<AiEmailAssistantService> logger) : IAiEmailAssistantService
{
    public async Task<AiEmailReplyResponse> GenerateReplyAsync(AiEmailReplyRequest request, CancellationToken ct)
    {
        var apiKey = configuration["Anthropic:ApiKey"] ?? string.Empty;
        if (string.IsNullOrWhiteSpace(apiKey))
            throw new InvalidOperationException("Anthropic API-Schlüssel ist nicht konfiguriert (Anthropic:ApiKey).");

        var shopContext = await BuildShopContextAsync();
        var systemPrompt = BuildSystemPrompt(shopContext, request.Tone);
        var userPrompt = BuildUserPrompt(request);

        var client = new AnthropicClient(new APIAuthentication(apiKey));

        var response = await client.Messages.GetClaudeMessageAsync(
            new MessageParameters
            {
                Model = AnthropicModels.Claude45Haiku,
                MaxTokens = 1500,
                System = [new SystemMessage(systemPrompt, null!)],
                Messages =
                [
                    new Message
                    {
                        Role = RoleType.User,
                        Content = [new TextContent { Text = userPrompt }]
                    }
                ]
            }, ct);

        var text = string.Concat(response.Content.OfType<TextContent>().Select(c => c.Text)).Trim();
        return ParseResponse(text, request.Subject);
    }

    public async Task<string> TranslateToTurkishAsync(string text, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(text)) return string.Empty;

        var apiKey = configuration["Anthropic:ApiKey"] ?? string.Empty;
        if (string.IsNullOrWhiteSpace(apiKey))
            throw new InvalidOperationException("Anthropic API-Schlüssel ist nicht konfiguriert (Anthropic:ApiKey).");

        const string system =
            "Du bist ein professioneller Übersetzer. Übersetze den folgenden eingehenden " +
            "E-Mail-Text ins Türkische. Gib AUSSCHLIESSLICH die türkische Übersetzung zurück – " +
            "ohne Vorbemerkung, ohne Anführungszeichen, ohne Erklärung. Behalte Absätze und " +
            "Zeilenumbrüche bei. Ist der Text bereits Türkisch, gib ihn unverändert zurück. " +
            "Übersetze keine URLs, E-Mail-Adressen oder Telefonnummern.";

        var client = new AnthropicClient(new APIAuthentication(apiKey));
        var response = await client.Messages.GetClaudeMessageAsync(
            new MessageParameters
            {
                Model = AnthropicModels.Claude45Haiku,
                MaxTokens = 1500,
                System = [new SystemMessage(system, null!)],
                Messages =
                [
                    new Message { Role = RoleType.User, Content = [new TextContent { Text = text }] }
                ]
            }, ct);

        return string.Concat(response.Content.OfType<TextContent>().Select(c => c.Text)).Trim();
    }

    // ── Prompt building ──────────────────────────────────────────────────────

    private async Task<string> BuildShopContextAsync()
    {
        try
        {
            var s = await shopSettingsService.GetSettingsAsync();
            if (s == null) return "BikeHaus Freiburg";

            var sb = new StringBuilder();
            sb.AppendLine($"Shop-Name: {s.ShopName}");
            if (!string.IsNullOrWhiteSpace(s.Strasse))
                sb.AppendLine($"Adresse: {s.Strasse} {s.Hausnummer}, {s.PLZ} {s.Stadt}");
            if (!string.IsNullOrWhiteSpace(s.Telefon))
                sb.AppendLine($"Telefon: {s.Telefon}");
            if (!string.IsNullOrWhiteSpace(s.Email))
                sb.AppendLine($"E-Mail: {s.Email}");
            if (!string.IsNullOrWhiteSpace(s.Website))
                sb.AppendLine($"Website: {s.Website}");
            if (!string.IsNullOrWhiteSpace(s.Oeffnungszeiten))
                sb.AppendLine($"Öffnungszeiten: {s.Oeffnungszeiten}");
            var owner = string.Join(" ", new[] { s.InhaberVorname, s.InhaberNachname }.Where(x => !string.IsNullOrWhiteSpace(x)));
            if (!string.IsNullOrWhiteSpace(owner))
                sb.AppendLine($"Inhaber/Ansprechpartner: {owner}");
            return sb.ToString().Trim();
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Shop-Einstellungen konnten für die KI-E-Mail nicht geladen werden.");
            return "BikeHaus Freiburg";
        }
    }

    private static string BuildSystemPrompt(string shopContext, string tone)
    {
        // Kleinanzeigen-Chat: die Antwort erscheint beim Interessenten nicht als
        // E-Mail, sondern als Chatnachricht in der Kleinanzeigen-App. Deshalb kurz,
        // ohne Betreffzeile und ohne Signaturblock — nur ein knapper Gruß.
        if (string.Equals(tone, "chat", StringComparison.OrdinalIgnoreCase))
            return BuildChatSystemPrompt(shopContext);

        var toneText = tone?.ToLowerInvariant() switch
        {
            "friendly" or "samimi" or "freundlich" => "warm und freundlich, aber dennoch professionell",
            _ => "höflich, professionell und geschäftlich (Sie-Form / förmliche Anrede)"
        };

        return $$"""
            Du bist die Kundenservice-Assistenz von BikeHaus Freiburg, einem Fahrradgeschäft.
            Du verfasst professionelle E-Mail-Antworten an Kunden, die ein Mitarbeiter vor dem
            Senden kurz prüft.

            WAS WIR ANBIETEN:
            - Verkauf von gebrauchten und neuen Fahrrädern (inkl. E-Bikes)
            - Fahrradverleih / Vermietung (tageweise, mit Kaution)
            - Fahrrad-Service und Wartung
            - Zubehör

            SHOP-INFORMATIONEN (nutze diese für Signatur und Kontaktangaben):
            {{shopContext}}

            SEHR WICHTIGE Sprachregel für den Service-Bereich:
            - Nenne unsere Werkstattleistungen IMMER "Service" oder "Wartung".
            - Verwende NIEMALS die Wörter "Reparatur", "reparieren" oder "Werkstatt".
              Beispiel richtig: "Gerne vereinbaren wir einen Service-Termin."
              Beispiel FALSCH: "Wir reparieren Ihr Fahrrad in der Werkstatt."

            DEINE AUFGABE:
            1. Erkenne die Sprache der eingehenden Kunden-E-Mail.
            2. Schreibe die Antwort AUSSCHLIESSLICH in genau DIESER Sprache
               (schreibt der Kunde auf Deutsch → Antwort auf Deutsch; Französisch → Französisch usw.).
            3. Die Notizen des Inhabers sind auf TÜRKISCH verfasst. Es sind Anweisungen,
               WAS inhaltlich gesagt werden soll. Übersetze und formuliere den Inhalt passend
               in der Sprache des Kunden aus – gib die türkischen Notizen niemals wörtlich wieder.
            4. Ton: {{toneText}}.
            5. Struktur: passende Anrede, klarer Textkörper, freundlicher Abschluss und Signatur
               mit dem Shop-Namen und den relevanten Kontaktdaten.

            KÜRZE — WICHTIG:
            - Gib GENAU den Inhalt der Notizen wieder — nicht mehr. Der Textkörper bleibt KURZ
              (meist 2–4 Sätze). Füge NICHTS hinzu, was nicht in den Notizen steht: keine
              zusätzlichen Angebote, keine Erklärungen, keine Werbefloskeln, kein Aufzählen von
              Leistungen. Anrede, Abschluss und Signatur bleiben knapp.

            ABSOLUTE REGELN:
            - ERFINDE KEINE Preise, Verfügbarkeiten, Termine oder Öffnungszeiten. Nutze nur, was
              in den Notizen oder den SHOP-INFORMATIONEN steht. Wenn du eine konkrete Zahl nicht
              sicher weißt, biete an, es zu prüfen, oder frage nach Details – statt zu raten.
            - Verspreche nichts, was das Geschäft nicht halten kann. Keine rechtlichen oder
              medizinischen Zusagen.
            - Ist die Anfrage unklar, stelle EINE gezielte Rückfrage.
            - Wenn ein Mensch nötig ist (Reklamation, individuelle Preisverhandlung, Sonderfall),
              schreibe freundlich, dass sich ein Kollege persönlich meldet.

            ANTWORTFORMAT – gib AUSSCHLIESSLICH ein einzelnes JSON-Objekt zurück, ohne Markdown,
            ohne Code-Fences, ohne weiteren Text:
            {
              "detectedLanguage": "ISO-639-1 Code der Kundensprache, z.B. de, en, fr, tr",
              "detectedLanguageName": "Name der Sprache in der Kundensprache",
              "replySubject": "Betreff der Antwort (in der Kundensprache, i.d.R. mit 'Re:')",
              "replyBody": "Vollständiger E-Mail-Text inkl. Anrede und Signatur, mit \n als Zeilenumbruch"
            }
            """;
    }

    /// <summary>
    /// Antwort für den Kleinanzeigen-Chat: kurz wie eine Chatnachricht, mit knapper
    /// Grußzeile statt Signaturblock, in der Anredeform des Interessenten (du/Sie).
    /// </summary>
    private static string BuildChatSystemPrompt(string shopContext)
    {
        return $$"""
            Du bist die Kundenservice-Assistenz von BikeHaus Freiburg, einem Fahrradgeschäft.
            Du schreibst Antworten im CHAT von Kleinanzeigen (kleinanzeigen.de). Ein Mitarbeiter
            prüft die Antwort vor dem Senden.

            WAS WIR ANBIETEN:
            - Verkauf von gebrauchten und neuen Fahrrädern (inkl. E-Bikes)
            - Fahrradverleih / Vermietung (tageweise, mit Kaution)
            - Fahrrad-Service und Wartung
            - Zubehör

            SHOP-INFORMATIONEN:
            {{shopContext}}

            SEHR WICHTIGE Sprachregel für den Service-Bereich:
            - Nenne unsere Werkstattleistungen IMMER "Service" oder "Wartung".
            - Verwende NIEMALS die Wörter "Reparatur", "reparieren" oder "Werkstatt".

            DEINE AUFGABE:
            1. Erkenne die Sprache der Nachricht des Interessenten und antworte AUSSCHLIESSLICH
               in genau dieser Sprache.
            2. Die Notizen des Inhabers sind auf TÜRKISCH und sagen, WAS geantwortet werden soll.
               Formuliere den Inhalt in der Sprache des Interessenten aus — gib die türkischen
               Notizen niemals wörtlich wieder.
            3. Übernimm die Anredeform des Interessenten: schreibt er "du", antworte mit "du";
               schreibt er "Sie", antworte mit "Sie". Im Zweifel "du" (auf Kleinanzeigen üblich).

            FORMAT — SEHR WICHTIG (das ist eine Chatnachricht, keine E-Mail):
            - GANZ KURZ: kurze Begrüßung mit dem Namen (falls bekannt) + 1 bis 3 Sätze Inhalt.
            - Danach GENAU zwei Zeilen als Abschluss:
              Viele Grüße
              BikeHaus Freiburg
            - KEIN Betreff, KEINE förmliche Anrede ("Sehr geehrte…"), KEIN Signaturblock mit
              Adresse, Telefon, Website oder Öffnungszeiten. Keine Aufzählung von Leistungen,
              keine Werbefloskeln.

            ABSOLUTE REGELN:
            - ERFINDE KEINE Preise, Verfügbarkeiten, Termine oder Öffnungszeiten. Nutze nur, was
              in den Notizen oder den SHOP-INFORMATIONEN steht. Was du nicht sicher weißt, wird
              nicht behauptet — dann lieber kurz nachfragen.
            - Keine Telefonnummern oder Adressen nennen, außer die Notizen verlangen es
              ausdrücklich.
            - Ist die Anfrage unklar, stelle EINE kurze Rückfrage.

            ANTWORTFORMAT – gib AUSSCHLIESSLICH ein einzelnes JSON-Objekt zurück, ohne Markdown,
            ohne Code-Fences, ohne weiteren Text:
            {
              "detectedLanguage": "ISO-639-1 Code der Sprache des Interessenten, z.B. de, en, tr",
              "detectedLanguageName": "Name der Sprache",
              "replySubject": "",
              "replyBody": "Die kurze Chatnachricht, mit \n als Zeilenumbruch"
            }
            """;
    }

    private static string BuildUserPrompt(AiEmailReplyRequest request)
    {
        var isChat = string.Equals(request.Tone, "chat", StringComparison.OrdinalIgnoreCase);
        var sb = new StringBuilder();
        sb.AppendLine(isChat ? "=== BISHERIGER CHATVERLAUF ===" : "=== EINGEHENDE KUNDEN-E-MAIL ===");
        if (isChat)
        {
            if (!string.IsNullOrWhiteSpace(request.FromName))
                sb.AppendLine($"Interessent: {request.FromName}");
            if (!string.IsNullOrWhiteSpace(request.Subject))
                sb.AppendLine($"Anzeige: {request.Subject}");
        }
        else
        {
            if (!string.IsNullOrWhiteSpace(request.FromName) || !string.IsNullOrWhiteSpace(request.FromEmail))
                sb.AppendLine($"Von: {request.FromName} <{request.FromEmail}>");
            if (!string.IsNullOrWhiteSpace(request.Subject))
                sb.AppendLine($"Betreff: {request.Subject}");
        }
        sb.AppendLine();
        sb.AppendLine(string.IsNullOrWhiteSpace(request.Body) ? "(kein Text)" : request.Body);
        sb.AppendLine();
        sb.AppendLine("=== NOTIZEN DES INHABERS (Türkisch – Inhalt der Antwort) ===");
        sb.AppendLine(string.IsNullOrWhiteSpace(request.Instruction)
            ? "(keine besonderen Notizen – antworte höflich und hilfsbereit auf die Anfrage)"
            : request.Instruction);
        return sb.ToString().Trim();
    }

    // ── Response parsing ─────────────────────────────────────────────────────

    private AiEmailReplyResponse ParseResponse(string text, string? originalSubject)
    {
        var json = ExtractJson(text);
        if (json != null)
        {
            try
            {
                using var doc = JsonDocument.Parse(json);
                var root = doc.RootElement;
                var lang = GetString(root, "detectedLanguage") ?? "de";
                var langName = GetString(root, "detectedLanguageName") ?? lang;
                var subject = GetString(root, "replySubject")
                    ?? (originalSubject != null ? $"Re: {originalSubject}" : "Re:");
                var body = GetString(root, "replyBody") ?? text;
                return new AiEmailReplyResponse(lang, langName, subject, body.Trim());
            }
            catch (JsonException ex)
            {
                logger.LogWarning(ex, "KI-E-Mail-Antwort konnte nicht als JSON geparst werden. Fallback auf Rohtext.");
            }
        }

        // Fallback: use the raw model text as the body.
        var fallbackSubject = originalSubject != null ? $"Re: {originalSubject}" : "Re:";
        return new AiEmailReplyResponse("de", "Deutsch", fallbackSubject, text);
    }

    private static string? ExtractJson(string text)
    {
        if (string.IsNullOrWhiteSpace(text)) return null;
        var start = text.IndexOf('{');
        var end = text.LastIndexOf('}');
        if (start >= 0 && end > start)
            return text.Substring(start, end - start + 1);
        return null;
    }

    private static string? GetString(JsonElement root, string name) =>
        root.TryGetProperty(name, out var el) && el.ValueKind == JsonValueKind.String
            ? el.GetString()
            : null;
}
