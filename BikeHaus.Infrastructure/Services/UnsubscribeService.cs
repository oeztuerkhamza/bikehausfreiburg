using System.Security.Cryptography;
using System.Text;
using BikeHaus.Application.Interfaces;
using BikeHaus.Domain.Entities;
using BikeHaus.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace BikeHaus.Infrastructure.Services;

/// <summary>
/// Stateless HMAC token + suppression list. Token layout (URL-safe Base64):
///   payload "." signature
/// where payload = base64url(emailLower) and
///       signature = base64url(HMACSHA256(emailLower, secret))[0..16 bytes].
/// No per-recipient row is stored to issue a link; we only persist the actual
/// opt-out when the recipient clicks. This means links can be generated for a
/// whole mailing without bloating the DB, yet cannot be forged without the secret.
/// </summary>
public class UnsubscribeService : IUnsubscribeService
{
    private const int SignatureBytes = 16;
    private readonly BikeHausDbContext _db;
    private readonly ILogger<UnsubscribeService> _logger;
    private readonly byte[] _secret;
    private readonly string _baseUrl;

    public UnsubscribeService(BikeHausDbContext db, IConfiguration config, ILogger<UnsubscribeService> logger)
    {
        _db = db;
        _logger = logger;

        var secret = config["Unsubscribe:Secret"];
        if (string.IsNullOrWhiteSpace(secret))
            secret = config["Jwt:Key"]; // fall back to the JWT signing key
        if (string.IsNullOrWhiteSpace(secret))
            secret = "bikehaus-unsubscribe-fallback-secret-change-me";
        _secret = Encoding.UTF8.GetBytes(secret);

        _baseUrl = (config["Unsubscribe:PublicBaseUrl"] ?? "https://api.bikehausfreiburg.com")
            .TrimEnd('/');
    }

    public string CreateToken(string email)
    {
        var normalized = Normalize(email);
        var payload = Base64UrlEncode(Encoding.UTF8.GetBytes(normalized));
        var signature = Base64UrlEncode(ComputeSignature(normalized));
        return $"{payload}.{signature}";
    }

    public bool TryValidateToken(string? token, out string email)
    {
        email = string.Empty;
        if (string.IsNullOrWhiteSpace(token))
            return false;

        var parts = token.Split('.');
        if (parts.Length != 2)
            return false;

        try
        {
            var decoded = Encoding.UTF8.GetString(Base64UrlDecode(parts[0]));
            var providedSig = Base64UrlDecode(parts[1]);
            var expectedSig = ComputeSignature(decoded);

            if (!CryptographicOperations.FixedTimeEquals(providedSig, expectedSig))
                return false;

            email = decoded;
            return true;
        }
        catch
        {
            return false;
        }
    }

    public string BuildUnsubscribeUrl(string email)
        => $"{_baseUrl}/api/public/unsubscribe?token={Uri.EscapeDataString(CreateToken(email))}";

    public async Task<bool> UnsubscribeAsync(string email, string source)
    {
        var normalized = Normalize(email);
        if (!IsValidEmail(normalized))
            return false;

        var exists = await _db.EmailUnsubscribes.AnyAsync(e => e.Email == normalized);
        if (exists)
            return true; // idempotent

        _db.EmailUnsubscribes.Add(new EmailUnsubscribe
        {
            Email = normalized,
            Source = string.IsNullOrWhiteSpace(source) ? "link" : source,
            UnsubscribedAt = DateTime.UtcNow,
        });

        try
        {
            await _db.SaveChangesAsync();
        }
        catch (DbUpdateException)
        {
            // Unique-index race: another request inserted it. Treat as success.
            _logger.LogInformation("Unsubscribe race for {Email} — already present.", normalized);
        }

        return true;
    }

    public Task<bool> IsUnsubscribedAsync(string email)
    {
        var normalized = Normalize(email);
        return _db.EmailUnsubscribes.AnyAsync(e => e.Email == normalized);
    }

    public async Task<bool> ResubscribeAsync(string email)
    {
        var normalized = Normalize(email);
        var row = await _db.EmailUnsubscribes.FirstOrDefaultAsync(e => e.Email == normalized);
        if (row is null)
            return false;

        _db.EmailUnsubscribes.Remove(row);
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<IReadOnlyList<string>> GetUnsubscribedEmailsAsync()
        => await _db.EmailUnsubscribes
            .OrderByDescending(e => e.UnsubscribedAt)
            .Select(e => e.Email)
            .ToListAsync();

    // ── helpers ──────────────────────────────────────────────────────────

    private byte[] ComputeSignature(string normalizedEmail)
    {
        using var hmac = new HMACSHA256(_secret);
        var full = hmac.ComputeHash(Encoding.UTF8.GetBytes(normalizedEmail));
        var truncated = new byte[SignatureBytes];
        Array.Copy(full, truncated, SignatureBytes);
        return truncated;
    }

    private static string Normalize(string? email)
        => (email ?? string.Empty).Trim().ToLowerInvariant();

    private static bool IsValidEmail(string email)
        => !string.IsNullOrWhiteSpace(email)
           && email.Length <= 200
           && email.Contains('@')
           && email.IndexOf('@') > 0
           && email.IndexOf('@') < email.Length - 1;

    private static string Base64UrlEncode(byte[] bytes)
        => Convert.ToBase64String(bytes).TrimEnd('=').Replace('+', '-').Replace('/', '_');

    private static byte[] Base64UrlDecode(string value)
    {
        var s = value.Replace('-', '+').Replace('_', '/');
        switch (s.Length % 4)
        {
            case 2: s += "=="; break;
            case 3: s += "="; break;
        }
        return Convert.FromBase64String(s);
    }
}
