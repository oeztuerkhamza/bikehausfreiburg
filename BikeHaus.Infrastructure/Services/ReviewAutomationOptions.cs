namespace BikeHaus.Infrastructure.Services;

/// <summary>
/// Config for the automatic review-request flow (<see cref="ReviewAutomationBackgroundService"/>).
/// Bound from the "ReviewAutomation" section.
/// </summary>
public class ReviewAutomationOptions
{
    /// <summary>Master switch. When false the background service stays idle.</summary>
    public bool Enabled { get; set; } = false;

    /// <summary>How long after a Sale/Rental is created the mail is sent.</summary>
    public int DelayHours { get; set; } = 4;

    /// <summary>Minimum days between two review requests to the same address (shared with the manual campaign).</summary>
    public int MinIntervalDays { get; set; } = 90;

    /// <summary>
    /// Absolute Obergrenze, wie oft eine Adresse INSGESAMT (über die gesamte
    /// Historie) eine Bewertungsanfrage erhält. Standard 2. Geteilt von der
    /// manuellen Kampagne und dem automatischen Ablauf.
    /// </summary>
    public int MaxSendsPerCustomer { get; set; } = 2;

    /// <summary>Transactions older than this are no longer retried (bounds the scan + avoids infinite retries on bad addresses).</summary>
    public int MaxAgeDays { get; set; } = 7;

    /// <summary>How often the background service scans for matured transactions.</summary>
    public int ScanIntervalMinutes { get; set; } = 30;

    /// <summary>
    /// Hard cutoff: transactions created before this instant are NEVER contacted.
    /// Set to the go-live moment so existing/historical customers are not emailed.
    /// Required when <see cref="Enabled"/> is true — the service refuses to run without it.
    /// </summary>
    public DateTime? NotBeforeUtc { get; set; }
}
