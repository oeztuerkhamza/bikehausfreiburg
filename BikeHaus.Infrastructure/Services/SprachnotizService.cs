using System.Text.Json;
using Anthropic.SDK;
using Anthropic.SDK.Constants;
using Anthropic.SDK.Messaging;
using BikeHaus.Application.DTOs;
using BikeHaus.Application.Interfaces;
using BikeHaus.Domain.Entities;
using BikeHaus.Domain.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace BikeHaus.Infrastructure.Services;

/// <summary>
/// Diktierte Notizen. Die Spracherkennung passiert auf dem Telefon; hier kommt
/// nur noch der Rohtext an. Claude macht daraus einen lesbaren Text mit Titel
/// und liest einen Termin heraus ("morgen um 15 Uhr").
/// </summary>
public class SprachnotizService(
    IRepository<Sprachnotiz> repository,
    IConfiguration configuration,
    ILogger<SprachnotizService> logger) : ISprachnotizService
{
    // Termine sind Ladenzeiten, keine UTC-Zeitpunkte: gerechnet und gespeichert
    // wird in Ortszeit, damit "morgen um 15 Uhr" auch im Winter 15 Uhr bleibt.
    private static readonly TimeZoneInfo Ortszeit = FindOrtszeit();

    public async Task<IEnumerable<SprachnotizDto>> GetAllAsync()
    {
        var alle = await repository.GetAllAsync();
        return alle
            .OrderBy(n => n.Erledigt)
            .ThenByDescending(n => n.CreatedAt)
            .ThenByDescending(n => n.Id)
            .Select(ToDto)
            .ToList();
    }

    public async Task<SprachnotizDto?> GetByIdAsync(int id)
    {
        var notiz = await repository.GetByIdAsync(id);
        return notiz == null ? null : ToDto(notiz);
    }

    public async Task<SprachnotizDto> CreateAsync(SprachnotizCreateDto dto, CancellationToken ct = default)
    {
        var rohText = (dto.RohText ?? string.Empty).Trim();
        if (rohText.Length == 0)
            throw new ArgumentException("Die Notiz ist leer.", nameof(dto));

        var titel = dto.Titel?.Trim();
        var text = dto.Text?.Trim();
        var termin = dto.TerminAt;

        // Aufbereiten nur, wenn die App keinen fertigen Text mitschickt. Klappt
        // sie nicht (kein API-Schlüssel, kein Netz), wird der Rohtext gespeichert —
        // eine Notiz darf nie an der KI scheitern.
        if (dto.Aufbereiten && string.IsNullOrWhiteSpace(text))
        {
            try
            {
                var aufbereitet = await AufbereitenAsync(rohText, dto.Sprache, ct);
                titel ??= aufbereitet.Titel;
                text = aufbereitet.Text;
                termin ??= aufbereitet.TerminAt;
            }
            catch (Exception ex)
            {
                logger.LogWarning(ex, "Sprachnotiz konnte nicht aufbereitet werden — Rohtext wird gespeichert.");
            }
        }

        var notiz = new Sprachnotiz
        {
            RohText = rohText,
            Text = string.IsNullOrWhiteSpace(text) ? rohText : text,
            Titel = string.IsNullOrWhiteSpace(titel) ? TitelAusText(rohText) : titel,
            TerminAt = termin,
            Sprache = dto.Sprache,
            CreatedAt = DateTime.UtcNow,
        };

        await repository.AddAsync(notiz);
        return ToDto(notiz);
    }

    public async Task<SprachnotizDto?> UpdateAsync(int id, SprachnotizUpdateDto dto)
    {
        var notiz = await repository.GetByIdAsync(id);
        if (notiz == null) return null;

        if (dto.Titel != null) notiz.Titel = dto.Titel.Trim();
        if (dto.Text != null) notiz.Text = dto.Text.Trim();
        // Termin löschen und Termin setzen sind zwei verschiedene Wünsche —
        // ein leeres Feld allein kann beides bedeuten, deshalb das eigene Flag.
        if (dto.TerminEntfernen == true) notiz.TerminAt = null;
        else if (dto.TerminAt.HasValue) notiz.TerminAt = dto.TerminAt;
        if (dto.Erledigt.HasValue) notiz.Erledigt = dto.Erledigt.Value;

        notiz.UpdatedAt = DateTime.UtcNow;
        await repository.UpdateAsync(notiz);
        return ToDto(notiz);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var notiz = await repository.GetByIdAsync(id);
        if (notiz == null) return false;
        await repository.DeleteAsync(id);
        return true;
    }

    public async Task<SprachnotizAufbereitetDto> AufbereitenAsync(
        string rohText, string? sprache, CancellationToken ct = default)
    {
        rohText = (rohText ?? string.Empty).Trim();
        if (rohText.Length == 0)
            return new SprachnotizAufbereitetDto(string.Empty, string.Empty, null);

        var apiKey = configuration["Anthropic:ApiKey"] ?? string.Empty;
        if (string.IsNullOrWhiteSpace(apiKey))
            throw new InvalidOperationException("Anthropic API-Schlüssel ist nicht konfiguriert (Anthropic:ApiKey).");

        var jetzt = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, Ortszeit);

        var system =
            "Du bekommst eine diktierte Notiz eines Fahrradladens, so wie die Spracherkennung sie " +
            "verstanden hat: ohne Satzzeichen, mit Versprechern und Wortwiederholungen.\n\n" +
            "Deine Aufgabe:\n" +
            "1. Schreibe den Text sauber auf: Satzzeichen, Groß-/Kleinschreibung, offensichtliche " +
            "Erkennungsfehler korrigiert, Füllwörter und Wiederholungen raus. Mehrere Punkte als " +
            "Aufzählung mit \"- \" je Zeile. ÄNDERE NICHTS AM INHALT und erfinde nichts dazu. " +
            "Behalte die Sprache des Diktats bei (meist Türkisch, manchmal Deutsch).\n" +
            "2. Finde eine kurze Überschrift, höchstens 6 Wörter, in derselben Sprache.\n" +
            "3. Nennt die Notiz einen Termin oder eine Frist (\"yarın saat üçte\", \"morgen um 15 Uhr\", " +
            "\"Freitag früh\"), rechne ihn in ein Datum um. Jetzt ist " +
            $"{jetzt:dddd, dd.MM.yyyy HH:mm} (Ortszeit Deutschland). Ohne Uhrzeitangabe nimm 09:00. " +
            "Steht kein Termin drin, gib null zurück — rate nicht.\n\n" +
            "Antworte AUSSCHLIESSLICH mit JSON, ohne Vor- und Nachwort, ohne Code-Zäune:\n" +
            "{\"titel\": \"…\", \"text\": \"…\", \"terminAt\": \"2026-08-13T15:00\" oder null}";

        var client = new AnthropicClient(new APIAuthentication(apiKey));
        var response = await client.Messages.GetClaudeMessageAsync(
            new MessageParameters
            {
                Model = AnthropicModels.Claude45Haiku,
                MaxTokens = 1200,
                System = [new SystemMessage(system, null!)],
                Messages =
                [
                    new Message { Role = RoleType.User, Content = [new TextContent { Text = rohText }] }
                ]
            }, ct);

        var antwort = string.Concat(response.Content.OfType<TextContent>().Select(c => c.Text)).Trim();
        return Parse(antwort, rohText);
    }

    /// <summary>
    /// Liest das JSON der Antwort. Antwortet das Modell doch mit Prosa oder in
    /// Code-Zäunen, bleibt der Rohtext stehen statt einer kaputten Notiz.
    /// </summary>
    private SprachnotizAufbereitetDto Parse(string antwort, string rohText)
    {
        var start = antwort.IndexOf('{');
        var ende = antwort.LastIndexOf('}');
        if (start >= 0 && ende > start)
        {
            try
            {
                using var doc = JsonDocument.Parse(antwort[start..(ende + 1)]);
                var wurzel = doc.RootElement;

                var titel = wurzel.TryGetProperty("titel", out var t) ? t.GetString() : null;
                var text = wurzel.TryGetProperty("text", out var x) ? x.GetString() : null;

                DateTime? termin = null;
                if (wurzel.TryGetProperty("terminAt", out var d) &&
                    d.ValueKind == JsonValueKind.String &&
                    DateTime.TryParse(d.GetString(), out var geparst))
                {
                    // Ortszeit ohne Zeitzone speichern: die App zeigt sie so an
                    // und übergibt sie so an Kalender und Erinnerung.
                    termin = DateTime.SpecifyKind(geparst, DateTimeKind.Unspecified);
                }

                return new SprachnotizAufbereitetDto(
                    string.IsNullOrWhiteSpace(titel) ? TitelAusText(rohText) : titel!.Trim(),
                    string.IsNullOrWhiteSpace(text) ? rohText : text!.Trim(),
                    termin);
            }
            catch (JsonException ex)
            {
                logger.LogWarning(ex, "Antwort der Notiz-Aufbereitung war kein gültiges JSON.");
            }
        }

        return new SprachnotizAufbereitetDto(TitelAusText(rohText), rohText, null);
    }

    /// <summary>Notlösung für den Titel: die ersten Wörter des Diktats.</summary>
    private static string TitelAusText(string text)
    {
        var eineZeile = text.Replace('\n', ' ').Trim();
        if (eineZeile.Length <= 40) return eineZeile;
        var schnitt = eineZeile.LastIndexOf(' ', 40);
        return eineZeile[..(schnitt > 15 ? schnitt : 40)] + "…";
    }

    private static SprachnotizDto ToDto(Sprachnotiz n) => new(
        n.Id, n.Titel, n.Text, n.RohText, n.TerminAt, n.Erledigt, n.Sprache, n.CreatedAt, n.UpdatedAt);

    /// <summary>
    /// Zeitzonen-Id: Linux/ICU kennt "Europe/Berlin", Windows historisch nur
    /// "W. Europe Standard Time". Fällt beides aus, wird UTC genommen.
    /// </summary>
    private static TimeZoneInfo FindOrtszeit()
    {
        foreach (var id in new[] { "Europe/Berlin", "W. Europe Standard Time" })
        {
            try { return TimeZoneInfo.FindSystemTimeZoneById(id); }
            catch (TimeZoneNotFoundException) { }
            catch (InvalidTimeZoneException) { }
        }
        return TimeZoneInfo.Utc;
    }
}
