using BikeHaus.Domain.Enums;

namespace BikeHaus.Domain.Entities;

/// <summary>
/// Audit + Deduplizierung: eine tatsächlich versendete Einladung zur
/// Erinnerungsecke ("Anı Köşesi"). Sorgt dafür, dass jede Adresse höchstens
/// einmal eingeladen wird — geteilt von der manuellen Kampagne und dem
/// automatischen "am Folgetag um 08:00 nach Rückgabe"-Ablauf.
/// </summary>
public class MemoryInvite : BaseEntity
{
    /// <summary>Normalisierte (getrimmte, kleingeschriebene) Empfängeradresse.</summary>
    public string Email { get; set; } = string.Empty;

    public string? Vorname { get; set; }

    public DateTime SentAt { get; set; } = DateTime.UtcNow;

    public MemoryInviteSource Source { get; set; }
}
