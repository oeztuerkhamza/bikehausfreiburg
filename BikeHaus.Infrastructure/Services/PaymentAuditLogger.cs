using BikeHaus.Application.Interfaces;
using BikeHaus.Domain.Entities;
using BikeHaus.Infrastructure.Data;
using Microsoft.Extensions.Logging;
using System.Security.Cryptography;
using System.Text;

namespace BikeHaus.Infrastructure.Services;

/// <summary>
/// PCI DSS uyumlu audit logging — immutable, enkripte, hash'lenmiş
/// </summary>
public class PaymentAuditLogger : IPaymentAuditLogger
{
    private readonly BikeHausDbContext _dbContext;
    private readonly ILogger<PaymentAuditLogger> _logger;

    public PaymentAuditLogger(BikeHausDbContext dbContext, ILogger<PaymentAuditLogger> logger)
    {
        _dbContext = dbContext;
        _logger = logger;
    }

    public async Task LogPaymentCreatedAsync(
        int paymentId,
        int? userId,
        decimal amount,
        string method,
        string clientIp)
    {
        try
        {
            var auditLog = new PaymentAuditLog
            {
                Event = PaymentAuditLog.EventType.PaymentRequested,
                PaymentId = paymentId,
                UserId = userId,
                Amount = amount,
                ClientIpHash = HashIp(clientIp),
                IsSuccess = true,
                Details = $"Method: {method}",
                Timestamp = DateTimeOffset.UtcNow
            };

            _dbContext.PaymentAuditLogs.Add(auditLog);
            await _dbContext.SaveChangesAsync();

            _logger.LogInformation(
                "Payment created: PaymentId={PaymentId}, Amount={Amount}, Method={Method}",
                paymentId, amount, method);
        }
        catch (Exception ex)
        {
            // Audit log yazma başarısız olursa loglaya (sistem log'una)
            _logger.LogError(ex, "Failed to write audit log for payment creation");
        }
    }

    public async Task LogPaymentStatusChangeAsync(
        int paymentId,
        string oldStatus,
        string newStatus,
        string externalPaymentId)
    {
        try
        {
            var auditLog = new PaymentAuditLog
            {
                Event = PaymentAuditLog.EventType.PaymentStatusChanged,
                PaymentId = paymentId,
                ExternalPaymentId = externalPaymentId,
                IsSuccess = true,
                Details = $"Status: {oldStatus} → {newStatus}",
                Timestamp = DateTimeOffset.UtcNow
            };

            _dbContext.PaymentAuditLogs.Add(auditLog);
            await _dbContext.SaveChangesAsync();

            _logger.LogInformation(
                "Payment status changed: PaymentId={PaymentId}, {OldStatus} → {NewStatus}",
                paymentId, oldStatus, newStatus);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to log status change");
        }
    }

    public async Task LogRefundAsync(
        int paymentId,
        int adminUserId,
        decimal amount,
        string reason)
    {
        try
        {
            var auditLog = new PaymentAuditLog
            {
                Event = PaymentAuditLog.EventType.PaymentRefundInitiated,
                PaymentId = paymentId,
                UserId = adminUserId,
                Amount = amount,
                IsSuccess = true,
                Details = $"Reason: {reason}",
                Timestamp = DateTimeOffset.UtcNow
            };

            _dbContext.PaymentAuditLogs.Add(auditLog);
            await _dbContext.SaveChangesAsync();

            _logger.LogInformation(
                "Refund initiated: PaymentId={PaymentId}, Amount={Amount}, By={AdminUserId}",
                paymentId, amount, adminUserId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to log refund");
        }
    }

    public async Task LogWebhookReceivedAsync(
        string externalPaymentId,
        bool isValid,
        string details)
    {
        try
        {
            var auditLog = new PaymentAuditLog
            {
                Event = isValid
                    ? PaymentAuditLog.EventType.PaymentWebhookReceived
                    : PaymentAuditLog.EventType.WebhookValidationFailed,
                ExternalPaymentId = externalPaymentId,
                IsSuccess = isValid,
                Details = details,
                Timestamp = DateTimeOffset.UtcNow
            };

            _dbContext.PaymentAuditLogs.Add(auditLog);
            await _dbContext.SaveChangesAsync();

            _logger.LogInformation(
                "Webhook received: ExternalPaymentId={PaymentId}, Valid={IsValid}",
                externalPaymentId, isValid);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to log webhook");
        }
    }

    public async Task LogRateLimitExceededAsync(int? userId, string clientIp)
    {
        try
        {
            var auditLog = new PaymentAuditLog
            {
                Event = PaymentAuditLog.EventType.RateLimitExceeded,
                UserId = userId,
                ClientIpHash = HashIp(clientIp),
                IsSuccess = false,
                Details = "Rate limit exceeded on payment endpoint",
                Timestamp = DateTimeOffset.UtcNow
            };

            _dbContext.PaymentAuditLogs.Add(auditLog);
            await _dbContext.SaveChangesAsync();

            _logger.LogWarning(
                "Rate limit exceeded: UserId={UserId}, IP={IpHash}",
                userId, HashIp(clientIp));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to log rate limit");
        }
    }

    public async Task LogSuspiciousActivityAsync(
        int? paymentId,
        string reason,
        string details)
    {
        try
        {
            var auditLog = new PaymentAuditLog
            {
                Event = PaymentAuditLog.EventType.SuspiciousActivity,
                PaymentId = paymentId,
                IsSuccess = false,
                Details = $"{reason}: {details}",
                Timestamp = DateTimeOffset.UtcNow
            };

            _dbContext.PaymentAuditLogs.Add(auditLog);
            await _dbContext.SaveChangesAsync();

            _logger.LogWarning(
                "Suspicious activity: Reason={Reason}, Details={Details}",
                reason, details);

            // Admin'e alert gönderilebilir (email, Slack vs.)
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to log suspicious activity");
        }
    }

    /// <summary>
    /// IP adresini SHA256 ile hash'le (GDPR uyumlu)
    /// </summary>
    private static string HashIp(string ip)
    {
        if (string.IsNullOrEmpty(ip))
            return "";

        using var sha256 = SHA256.Create();
        var hash = sha256.ComputeHash(Encoding.UTF8.GetBytes(ip));
        return Convert.ToBase64String(hash)[..16]; // İlk 16 karakter
    }
}
