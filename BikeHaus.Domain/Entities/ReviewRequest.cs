using BikeHaus.Domain.Enums;

namespace BikeHaus.Domain.Entities;

/// <summary>
/// Audit + de-duplication record: one Google-review request mail that was
/// actually sent to a customer. Used to enforce "at most one request per
/// address per N days" across BOTH the automatic (post sale/rental) flow and
/// the manual campaign, so a customer is never contacted twice.
/// </summary>
public class ReviewRequest : BaseEntity
{
    /// <summary>Normalised (trimmed, lower-cased) recipient address.</summary>
    public string Email { get; set; } = string.Empty;

    public string? Vorname { get; set; }

    public DateTime SentAt { get; set; } = DateTime.UtcNow;

    public ReviewRequestSource Source { get; set; }
}
