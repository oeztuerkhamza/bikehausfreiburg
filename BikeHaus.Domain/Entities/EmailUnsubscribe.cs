namespace BikeHaus.Domain.Entities;

/// <summary>
/// Suppression list entry. An e-mail address present here must NOT receive
/// marketing/newsletter mails (Google-Bewertung, Aktionen, ...).
/// Stored independently of <see cref="Customer"/> so it stays effective even
/// if the customer record is edited or the address is not a customer at all.
/// </summary>
public class EmailUnsubscribe : BaseEntity
{
    /// <summary>Normalized (trimmed, lower-case) e-mail address. Unique.</summary>
    public string Email { get; set; } = string.Empty;

    /// <summary>When the address was suppressed.</summary>
    public DateTime UnsubscribedAt { get; set; } = DateTime.UtcNow;

    /// <summary>Where the opt-out came from: "link", "one-click", "manual".</summary>
    public string Source { get; set; } = "link";
}
