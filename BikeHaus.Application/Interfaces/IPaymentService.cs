using BikeHaus.Application.DTOs;
using BikeHaus.Domain.Entities;
using BikeHaus.Domain.Enums;

namespace BikeHaus.Application.Interfaces;

/// <summary>
/// Mollie/Stripe ödeme işlemleri
/// </summary>
public interface IPaymentService
{
    /// <summary>
    /// Ödeme oluştur (Mollie'ye gönder)
    /// </summary>
    Task<PaymentResponse> CreatePaymentAsync(
        CreatePaymentRequest request,
        string userId,
        string clientIp,
        string userAgent);

    /// <summary>
    /// Ödeme durumunu kontrol et
    /// </summary>
    Task<PaymentStatusResponse> GetPaymentStatusAsync(int paymentId, string userId);

    /// <summary>
    /// İade işlemi (admin only)
    /// </summary>
    Task<RefundResponse> RefundPaymentAsync(
        RefundRequest request,
        string adminUserId);

    /// <summary>
    /// Mollie webhook'u işle
    /// </summary>
    Task<bool> ProcessMollieWebhookAsync(
        string rawBody,
        string mollieSignature);

    /// <summary>
    /// Fiyatlandırma bilgisi (surcharge/discount)
    /// </summary>
    Task<PricingInfo> CalculatePricingAsync(
        decimal baseAmount,
        PaymentMethodType method);
}

/// <summary>
/// Fiyatlandırma kuralları
/// </summary>
public interface IPricingService
{
    /// <summary>
    /// Ödeme yöntemi bazında fiyatlandırma hesapla
    /// AB yasal: Kart ve SEPA'ya surcharge yasak
    /// </summary>
    PricingInfo CalculatePricing(
        decimal baseAmount,
        PaymentMethodType method);

    /// <summary>
    /// Gerçek ödenecek tutar
    /// </summary>
    decimal GetTotalAmount(decimal baseAmount, PaymentMethodType method);
}

/// <summary>
/// Webhook validasyonu ve işlenmesi
/// </summary>
public interface IWebhookValidator
{
    /// <summary>
    /// Mollie webhook imzasını doğrula (Mollie API anahtarı ile)
    /// </summary>
    bool ValidateMollieSignature(string rawBody, string signature);

    /// <summary>
    /// Webhook kaynağını doğrula (IP whitelist, vs.)
    /// </summary>
    bool ValidateWebhookSource(string clientIp);
}

/// <summary>
/// Audit logging — PCI DSS uyumlu
/// </summary>
public interface IPaymentAuditLogger
{
    /// <summary>
    /// Ödeme oluşturuldu
    /// </summary>
    Task LogPaymentCreatedAsync(
        int paymentId,
        int? userId,
        decimal amount,
        string method,
        string clientIp);

    /// <summary>
    /// Ödeme durumu değişti
    /// </summary>
    Task LogPaymentStatusChangeAsync(
        int paymentId,
        string oldStatus,
        string newStatus,
        string externalPaymentId);

    /// <summary>
    /// İade başlatıldı
    /// </summary>
    Task LogRefundAsync(
        int paymentId,
        int adminUserId,
        decimal amount,
        string reason);

    /// <summary>
    /// Webhook geldi (başarılı veya başarısız)
    /// </summary>
    Task LogWebhookReceivedAsync(
        string externalPaymentId,
        bool isValid,
        string details);

    /// <summary>
    /// Rate limit aşıldı
    /// </summary>
    Task LogRateLimitExceededAsync(
        int? userId,
        string clientIp);

    /// <summary>
    /// Şüpheli işlem
    /// </summary>
    Task LogSuspiciousActivityAsync(
        int? paymentId,
        string reason,
        string details);
}

/// <summary>
/// Idempotency key yönetimi
/// </summary>
public interface IIdempotencyService
{
    /// <summary>
    /// Aynı key'de cached response'u al
    /// </summary>
    Task<string?> GetCachedResponseAsync(string key, string clientIpHash);

    /// <summary>
    /// Response'u cache'e kaydet (24 saat TTL)
    /// </summary>
    Task SaveResponseAsync(
        string key,
        string clientIpHash,
        string response,
        int? paymentId);

    /// <summary>
    /// Key'i UUID formatında valid mi?
    /// </summary>
    bool IsValidKey(string key);
}

/// <summary>
/// Mollie API client (Mollie.Api.Client wrapper)
/// </summary>
public interface IMolliePaymentClient
{
    /// <summary>
    /// Ödeme oluştur
    /// </summary>
    Task<string> CreatePaymentAsync(
        decimal amount,
        string currency,
        string description,
        string redirectUrl,
        string webhookUrl,
        PaymentMethodType method);

    /// <summary>
    /// Ödeme durumunu sorgula
    /// </summary>
    Task<(string Status, decimal Amount)> GetPaymentStatusAsync(string molliePaymentId);

    /// <summary>
    /// İade işlemi başlat
    /// </summary>
    Task<string> RefundPaymentAsync(
        string molliePaymentId,
        decimal? amount = null);
}

/// <summary>
/// CSRF token yönetimi
/// </summary>
public interface ICsrfTokenService
{
    /// <summary>
    /// CSRF token oluştur
    /// </summary>
    string GenerateToken();

    /// <summary>
    /// CSRF token doğrula
    /// </summary>
    bool ValidateToken(string token);
}
