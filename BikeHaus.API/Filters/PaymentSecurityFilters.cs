using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Extensions.Logging;
using BikeHaus.Application.Interfaces;
using System.Security.Cryptography;
using System.Text;

namespace BikeHaus.API.Filters;

/// <summary>
/// Idempotency-Key header kontrolü ve işlemek
/// İstemci aynı key'i gönderirse cached response döner
/// </summary>
public class IdempotencyFilter : IAsyncActionFilter
{
    private readonly IIdempotencyService _idempotencyService;
    private readonly ILogger<IdempotencyFilter> _logger;

    public IdempotencyFilter(IIdempotencyService idempotencyService, ILogger<IdempotencyFilter> logger)
    {
        _idempotencyService = idempotencyService;
        _logger = logger;
    }

    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        // Sadece POST isteklerine uygulanır
        if (context.HttpContext.Request.Method != "POST")
        {
            await next();
            return;
        }

        // Idempotency-Key header'ını al
        if (!context.HttpContext.Request.Headers.TryGetValue("Idempotency-Key", out var idempotencyKey))
        {
            context.Result = new Microsoft.AspNetCore.Mvc.BadRequestObjectResult(
                new { error = "Idempotency-Key header required for POST requests" });
            return;
        }

        var key = idempotencyKey.ToString();

        // Key'i doğrula (UUID format)
        if (!_idempotencyService.IsValidKey(key))
        {
            context.Result = new Microsoft.AspNetCore.Mvc.BadRequestObjectResult(
                new { error = "Invalid Idempotency-Key format (must be UUID)" });
            return;
        }

        // Client IP'sini hash'le (GDPR)
        var clientIp = context.HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        var clientIpHash = HashIp(clientIp);

        // Cache'de varsa döndür
        var cachedResponse = await _idempotencyService.GetCachedResponseAsync(key, clientIpHash);
        if (cachedResponse != null)
        {
            _logger.LogInformation("Returning cached response for idempotency key: {Key}", key[..8]);
            context.Result = new Microsoft.AspNetCore.Mvc.ContentResult
            {
                Content = cachedResponse,
                ContentType = "application/json",
                StatusCode = 200
            };
            return;
        }

        // İsteği işle
        var executedContext = await next();

        // Response başarılıysa cache'e kaydet
        if (executedContext.Result is Microsoft.AspNetCore.Mvc.ObjectResult objectResult &&
            objectResult.StatusCode == 200)
        {
            var responseContent = System.Text.Json.JsonSerializer.Serialize(objectResult.Value);
            int? paymentId = context.RouteData.Values.TryGetValue("paymentId", out var id) && id != null && int.TryParse(id.ToString(), out var pid)
                ? pid
                : null;

            await _idempotencyService.SaveResponseAsync(key, clientIpHash, responseContent, paymentId);
        }
    }

    private static string HashIp(string ip)
    {
        using var sha256 = SHA256.Create();
        var hash = sha256.ComputeHash(Encoding.UTF8.GetBytes(ip));
        return Convert.ToBase64String(hash)[..16];
    }
}

/// <summary>
/// Ödeme endpoint'leri için rate limiting
/// IP başına ve kullanıcı başına
/// </summary>
public class PaymentRateLimitFilter : IAsyncActionFilter
{
    private readonly ILogger<PaymentRateLimitFilter> _logger;
    private readonly IPaymentAuditLogger _auditLogger;
    private static readonly Dictionary<string, (int Count, DateTime ResetTime)> _ipRateLimits = new();
    private static readonly Dictionary<int, (int Count, DateTime ResetTime)> _userRateLimits = new();

    private const int MaxRequestsPerMinutePerIp = 5;
    private const int MaxRequestsPerHourPerUser = 20;

    public PaymentRateLimitFilter(ILogger<PaymentRateLimitFilter> logger, IPaymentAuditLogger auditLogger)
    {
        _logger = logger;
        _auditLogger = auditLogger;
    }

    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        var clientIp = context.HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";

        // IP-based rate limiting (1 dakika pencere)
        if (!CheckIpRateLimit(clientIp))
        {
            _logger.LogWarning("IP rate limit exceeded: {Ip}", clientIp);
            await _auditLogger.LogRateLimitExceededAsync(null, clientIp);

            context.Result = new Microsoft.AspNetCore.Mvc.StatusCodeResult(429);
            await context.HttpContext.Response.WriteAsync("Too many requests from this IP. Try again later.");
            return;
        }

        // User-based rate limiting (1 saat pencere)
        var userIdClaim = context.HttpContext.User.FindFirst("sub") ??
                         context.HttpContext.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);

        if (userIdClaim != null && int.TryParse(userIdClaim.Value, out var userId))
        {
            if (!CheckUserRateLimit(userId))
            {
                _logger.LogWarning("User rate limit exceeded: {UserId}", userId);
                await _auditLogger.LogRateLimitExceededAsync(userId, clientIp);

                context.Result = new Microsoft.AspNetCore.Mvc.StatusCodeResult(429);
                await context.HttpContext.Response.WriteAsync("Too many payment attempts. Try again later.");
                return;
            }
        }

        await next();
    }

    private static bool CheckIpRateLimit(string ip)
    {
        lock (_ipRateLimits)
        {
            if (_ipRateLimits.TryGetValue(ip, out var limit))
            {
                if (DateTime.UtcNow < limit.ResetTime)
                {
                    if (limit.Count >= MaxRequestsPerMinutePerIp)
                        return false;

                    _ipRateLimits[ip] = (limit.Count + 1, limit.ResetTime);
                }
                else
                {
                    _ipRateLimits[ip] = (1, DateTime.UtcNow.AddMinutes(1));
                }
            }
            else
            {
                _ipRateLimits[ip] = (1, DateTime.UtcNow.AddMinutes(1));
            }

            return true;
        }
    }

    private static bool CheckUserRateLimit(int userId)
    {
        lock (_userRateLimits)
        {
            if (_userRateLimits.TryGetValue(userId, out var limit))
            {
                if (DateTime.UtcNow < limit.ResetTime)
                {
                    if (limit.Count >= MaxRequestsPerHourPerUser)
                        return false;

                    _userRateLimits[userId] = (limit.Count + 1, limit.ResetTime);
                }
                else
                {
                    _userRateLimits[userId] = (1, DateTime.UtcNow.AddHours(1));
                }
            }
            else
            {
                _userRateLimits[userId] = (1, DateTime.UtcNow.AddHours(1));
            }

            return true;
        }
    }
}

/// <summary>
/// Authorization — Payment Admin role kontrolü
/// </summary>
public class PaymentAdminAuthorizationFilter : IAsyncActionFilter
{
    private readonly ILogger<PaymentAdminAuthorizationFilter> _logger;

    public PaymentAdminAuthorizationFilter(ILogger<PaymentAdminAuthorizationFilter> logger)
    {
        _logger = logger;
    }

    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        var userRole = context.HttpContext.User.FindFirst("role")?.Value ??
                      context.HttpContext.User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;

        if (userRole != "PaymentAdmin" && userRole != "Admin")
        {
            _logger.LogWarning("Unauthorized payment admin access attempt");
            context.Result = new Microsoft.AspNetCore.Mvc.ForbidResult();
            return;
        }

        await next();
    }
}
