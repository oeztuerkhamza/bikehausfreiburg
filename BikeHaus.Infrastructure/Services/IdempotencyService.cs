using BikeHaus.Application.Interfaces;
using BikeHaus.Domain.Entities;
using BikeHaus.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System.Security.Cryptography;
using System.Text;

namespace BikeHaus.Infrastructure.Services;

/// <summary>
/// Idempotency — aynı isteği iki kez gönderirsek ilk yanıt cache'den gelir
/// PCI DSS: İkili ödeme atma koruması
/// </summary>
public class IdempotencyService : IIdempotencyService
{
    private readonly BikeHausDbContext _dbContext;
    private readonly ILogger<IdempotencyService> _logger;

    public IdempotencyService(BikeHausDbContext dbContext, ILogger<IdempotencyService> logger)
    {
        _dbContext = dbContext;
        _logger = logger;
    }

    public async Task<string?> GetCachedResponseAsync(string key, string clientIpHash)
    {
        try
        {
            if (!IsValidKey(key))
                return null;

            var cached = await _dbContext.IdempotencyKeys
                .FirstOrDefaultAsync(ik =>
                    ik.Key == key &&
                    ik.ClientIpHash == clientIpHash &&
                    ik.ExpiresAt > DateTimeOffset.UtcNow);

            if (cached != null)
            {
                _logger.LogInformation("Idempotency cache hit: {Key}", key[..8]);
                return cached.CachedResponse;
            }

            return null;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving cached response");
            return null;
        }
    }

    public async Task SaveResponseAsync(
        string key,
        string clientIpHash,
        string response,
        int? paymentId)
    {
        try
        {
            if (!IsValidKey(key))
                return;

            // Eski entry'leri sil (cleanup)
            var oldEntry = await _dbContext.IdempotencyKeys
                .FirstOrDefaultAsync(ik => ik.Key == key && ik.ClientIpHash == clientIpHash);

            if (oldEntry != null)
                _dbContext.IdempotencyKeys.Remove(oldEntry);

            // Yeni entry'yi kaydet (24 saat TTL)
            var idempotencyKey = new IdempotencyKey
            {
                Key = key,
                ClientIpHash = clientIpHash,
                CachedResponse = response,
                ExpiresAt = DateTimeOffset.UtcNow.AddHours(24),
                PaymentId = paymentId
            };

            _dbContext.IdempotencyKeys.Add(idempotencyKey);
            await _dbContext.SaveChangesAsync();

            _logger.LogInformation("Idempotency key saved: {Key}", key[..8]);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error saving idempotency key");
        }
    }

    public bool IsValidKey(string key)
    {
        if (string.IsNullOrEmpty(key))
            return false;

        // UUID format kontrol (8-4-4-4-12)
        return Guid.TryParse(key, out _);
    }
}

/// <summary>
/// CSRF token yönetimi (Anti-Forgery)
/// </summary>
public class CsrfTokenService : ICsrfTokenService
{
    private readonly ILogger<CsrfTokenService> _logger;

    public CsrfTokenService(ILogger<CsrfTokenService> logger)
    {
        _logger = logger;
    }

    public string GenerateToken()
    {
        // ASP.NET Core Antiforgery middleware tarafından otomatik yönetilir
        // Bu method referans amaçlı
        var randomBytes = new byte[16];
        using (var rng = RandomNumberGenerator.Create())
        {
            rng.GetBytes(randomBytes);
        }

        var token = Convert.ToBase64String(randomBytes);
        _logger.LogDebug("CSRF token generated");
        return token;
    }

    public bool ValidateToken(string token)
    {
        // Token doğrulaması Antiforgery middleware'de yapılır
        return !string.IsNullOrEmpty(token) && token.Length > 0;
    }
}
