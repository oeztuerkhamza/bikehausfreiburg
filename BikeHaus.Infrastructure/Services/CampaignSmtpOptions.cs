namespace BikeHaus.Infrastructure.Services;

/// <summary>
/// Dedicated sender used ONLY for the review/newsletter campaign
/// (<see cref="ICampaignService"/> → <c>SendNewsletterAsync</c>). All other
/// (transactional) mail keeps using the default <see cref="SmtpOptions"/>
/// no-reply@ sender — this never touches it.
///
/// The same Mailcow host/port/TLS is reused; only the SMTP login and the
/// From identity differ. If <see cref="Username"/> or <see cref="Password"/>
/// is empty, the campaign silently falls back to the default sender, so a
/// missing secret degrades gracefully instead of failing the send.
/// </summary>
public class CampaignSmtpOptions
{
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string FromEmail { get; set; } = string.Empty;
    public string FromName { get; set; } = string.Empty;
}
