namespace BikeHaus.Application.Interfaces;

/// <summary>
/// Handles newsletter/marketing opt-out (Abmeldung): stateless signed tokens
/// for per-recipient links plus a persisted suppression list.
/// </summary>
public interface IUnsubscribeService
{
    /// <summary>Creates a tamper-proof token that encodes the given e-mail.</summary>
    string CreateToken(string email);

    /// <summary>
    /// Validates a token and extracts the e-mail. Returns false if the token is
    /// missing, malformed or the signature does not match.
    /// </summary>
    bool TryValidateToken(string? token, out string email);

    /// <summary>Full public URL the recipient clicks to unsubscribe.</summary>
    string BuildUnsubscribeUrl(string email);

    /// <summary>Adds the e-mail to the suppression list (idempotent). Returns false on invalid input.</summary>
    Task<bool> UnsubscribeAsync(string email, string source);

    /// <summary>True if the e-mail is currently suppressed.</summary>
    Task<bool> IsUnsubscribedAsync(string email);

    /// <summary>Re-subscribes (removes from suppression list). Admin-only use. Returns false if not found.</summary>
    Task<bool> ResubscribeAsync(string email);

    /// <summary>All currently suppressed e-mail addresses (most recent first).</summary>
    Task<IReadOnlyList<string>> GetUnsubscribedEmailsAsync();
}
