namespace BikeHaus.Infrastructure.Services;

/// <summary>
/// Konfiguration für die automatische Erinnerungs-Einladung nach einer
/// Rückgabe (<see cref="MemoryInviteAutomationBackgroundService"/>).
/// Bindet die Sektion "MemoryInviteAutomation".
/// </summary>
public class MemoryInviteAutomationOptions
{
    /// <summary>Master-Schalter. Wenn false, bleibt der Dienst untätig.</summary>
    public bool Enabled { get; set; } = false;

    /// <summary>Ortszeitzone für die Versandzeit (IANA-ID).</summary>
    public string TimeZone { get; set; } = "Europe/Berlin";

    /// <summary>Versandstunde am Folgetag (Ortszeit). 8 = 08:00.</summary>
    public int SendHourLocal { get; set; } = 8;

    /// <summary>Rückgaben, die älter als das sind, werden nicht mehr nachgeholt.</summary>
    public int MaxAgeDays { get; set; } = 14;

    /// <summary>Wie oft nach fälligen Rückgaben gescannt wird.</summary>
    public int ScanIntervalMinutes { get; set; } = 30;

    /// <summary>
    /// Harte Grenze: Rückgaben vor diesem Zeitpunkt werden NIE automatisch
    /// angeschrieben (verhindert einen Blast an Alt-Kunden beim Aktivieren).
    /// Pflicht, wenn <see cref="Enabled"/> true ist.
    /// </summary>
    public DateTime? NotBeforeUtc { get; set; }
}
