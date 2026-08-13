namespace BikeHaus.Domain.Entities;

/// <summary>
/// Eine diktierte Notiz. Das Telefon wandelt die Sprache in Text; dieser
/// Rohtext bleibt erhalten, daneben steht die von Claude aufbereitete Fassung
/// (Satzzeichen, Titel) und ein evtl. erkannter Termin.
/// </summary>
public class Sprachnotiz : BaseEntity
{
    /// <summary>Kurze Überschrift, aus dem Text abgeleitet.</summary>
    public string Titel { get; set; } = string.Empty;

    /// <summary>Aufbereiteter Text — das, was der Benutzer liest und bearbeitet.</summary>
    public string Text { get; set; } = string.Empty;

    /// <summary>Wie diktiert, unverändert. Bleibt als Beleg stehen, falls die Aufbereitung danebengreift.</summary>
    public string RohText { get; set; } = string.Empty;

    /// <summary>Erkannter oder eingetragener Termin ("morgen um 15 Uhr"). Ohne Termin null.</summary>
    public DateTime? TerminAt { get; set; }

    /// <summary>Erledigt-Haken; erledigte Notizen rutschen ans Ende der Liste.</summary>
    public bool Erledigt { get; set; }

    /// <summary>Diktiersprache, z. B. "tr-TR" oder "de-DE".</summary>
    public string? Sprache { get; set; }
}
