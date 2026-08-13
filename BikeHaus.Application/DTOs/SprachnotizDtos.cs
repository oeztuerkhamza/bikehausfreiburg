namespace BikeHaus.Application.DTOs;

/// <summary>Eine Sprachnotiz, wie die App sie anzeigt.</summary>
public record SprachnotizDto(
    int Id,
    string Titel,
    string Text,
    string RohText,
    DateTime? TerminAt,
    bool Erledigt,
    string? Sprache,
    DateTime CreatedAt,
    DateTime? UpdatedAt
);

/// <summary>
/// Neue Notiz. Geschickt wird der diktierte Rohtext; Titel, sauberer Text und
/// Termin holt der Server aus der Aufbereitung, sofern nicht mitgegeben.
/// </summary>
public record SprachnotizCreateDto(
    string RohText,
    string? Sprache = null,
    string? Titel = null,
    string? Text = null,
    DateTime? TerminAt = null,
    /// <summary>Aufbereitung durch Claude überspringen (z. B. offline getippt).</summary>
    bool Aufbereiten = true
);

/// <summary>Änderung an einer Notiz; leere Felder bleiben, wie sie sind.</summary>
public record SprachnotizUpdateDto(
    string? Titel = null,
    string? Text = null,
    DateTime? TerminAt = null,
    bool? TerminEntfernen = null,
    bool? Erledigt = null
);

/// <summary>Ergebnis der Aufbereitung eines diktierten Textes.</summary>
public record SprachnotizAufbereitetDto(
    string Titel,
    string Text,
    DateTime? TerminAt
);

/// <summary>Rohtext zum Aufbereiten, ohne ihn zu speichern.</summary>
public record SprachnotizAufbereitenRequest(string RohText, string? Sprache = null);
