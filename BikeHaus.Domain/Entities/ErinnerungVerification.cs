namespace BikeHaus.Domain.Entities;

/// <summary>
/// Kurzlebiger 4-stelliger E-Mail-Bestätigungscode für Erinnerungs-Einreichungen.
/// Der Nutzer fordert einen Code an, gibt ihn ein und darf danach absenden.
/// </summary>
public class ErinnerungVerification : BaseEntity
{
    public string Email { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;   // 4-stellig
    public DateTime ExpiresAt { get; set; }
    public bool Used { get; set; } = false;
}
