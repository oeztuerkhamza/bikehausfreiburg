using BikeHaus.Domain.Enums;

namespace BikeHaus.Domain.Entities;

/// <summary>
/// PCI DSS uyumlu ödeme kaydı.
/// Hassas veriler (kart, CVV, IBAN) ASLA burada saklanmaz.
/// Mollie/Stripe tokenları veya sadece referanslar tutulur.
/// </summary>
public class Payment : BaseEntity
{
    /// <summary>
    /// İçerik sipariş/satış referansı
    /// </summary>
    public int? OnlineSaleId { get; set; }
    public OnlineSale? OnlineSale { get; set; }

    /// <summary>
    /// Externe ödeme sağlayıcı ID (Mollie: tr_xxx, Stripe: pi_xxx)
    /// </summary>
    public string ExternalPaymentId { get; set; } = "";

    /// <summary>
    /// Ödeme tutarı EUR cinsinden (2 ondalık)
    /// </summary>
    public decimal Amount { get; set; }

    /// <summary>
    /// Para birimi (zorunlu olarak EUR)
    /// </summary>
    public string Currency { get; set; } = "EUR";

    /// <summary>
    /// Ödeme durumu: pending, authorized, paid, canceled, expired, failed, refunded
    /// </summary>
    public string Status { get; set; } = "pending";

    /// <summary>
    /// Ödeme yöntemi (kart, SEPA, PayPal, iDEAL vs.)
    /// </summary>
    public string Method { get; set; } = "";

    /// <summary>
    /// Küçük açıklama (Mollie'ye gönderilen description)
    /// </summary>
    public string Description { get; set; } = "";

    /// <summary>
    /// Ödemeyi başlatan müşteri
    /// </summary>
    public int? UserId { get; set; }
    public User? User { get; set; }

    /// <summary>
    /// Başarılı ödeme işleminde Mollie'nin döndürdüğü konsümer ID
    /// (GDPR: şifrelenmiş olarak saklı)
    /// </summary>
    public string? MollieConsumerId { get; set; }

    /// <summary>
    /// 3D Secure gerekli mi kontrol için
    /// </summary>
    public bool Requires3Ds { get; set; } = true;

    /// <summary>
    /// Webhook'tan gelen son update zamanı
    /// </summary>
    public DateTimeOffset? LastWebhookAt { get; set; }

    /// <summary>
    /// İade (refund) işlemi var mı
    /// </summary>
    public bool IsRefunded { get; set; }

    public new DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public new DateTimeOffset? UpdatedAt { get; set; }
}

/// <summary>
/// Ödeme işlemleri için immutable (INSERT-only) audit log.
/// GDPR ve PCI DSS uyumluluğu için kritik.
/// </summary>
public class PaymentAuditLog : BaseEntity
{
    public enum EventType
    {
        PaymentRequested,           // Ödeme oluşturuldu
        PaymentWebhookReceived,     // Webhook geldi
        PaymentStatusChanged,       // Durum değişti
        PaymentSucceeded,           // Başarılı
        PaymentFailed,              // Başarısız
        PaymentRefundInitiated,     // İade başlatıldı
        PaymentRefundCompleted,     // İade tamamlandı
        WebhookValidationFailed,    // Webhook imzası yanlış
        RateLimitExceeded,          // Rate limit aşıldı
        UnauthorizedAccess,         // Yetkilendirme hatası
        SuspiciousActivity          // Şüpheli işlem
    }

    /// <summary>
    /// Olay türü
    /// </summary>
    public EventType Event { get; set; }

    /// <summary>
    /// İlgili ödeme ID'si
    /// </summary>
    public int? PaymentId { get; set; }

    /// <summary>
    /// İşlemi yapan kullanıcı (admin veya sistem)
    /// </summary>
    public int? UserId { get; set; }

    /// <summary>
    /// Mollie payment ID (dış referans)
    /// </summary>
    public string? ExternalPaymentId { get; set; }

    /// <summary>
    /// Tutar (audit için)
    /// </summary>
    public decimal Amount { get; set; }

    /// <summary>
    /// İstemci IP adresi (GDPR uyumlu HASH)
    /// </summary>
    public string? ClientIpHash { get; set; }

    /// <summary>
    /// User-Agent string (device tracking)
    /// </summary>
    public string? UserAgent { get; set; }

    /// <summary>
    /// Ek bilgi (error message, status geçişi vs.)
    /// </summary>
    public string Details { get; set; } = "";

    /// <summary>
    /// İşlem sonucu (success, failure, etc.)
    /// </summary>
    public bool IsSuccess { get; set; }

    /// <summary>
    /// İşlem zamanı (immutable)
    /// </summary>
    public DateTimeOffset Timestamp { get; set; } = DateTimeOffset.UtcNow;

    // Not: Bu tablo INSERT-only olmalı. UPDATE ve DELETE yetkisi yok.
    // Index: PaymentId, UserId, Timestamp, Event
}

/// <summary>
/// Ödeme işlemlerinde idempotency koruması.
/// Aynı isteği iki kez gönderirsek, ilk yanıt cache'den gelir.
/// </summary>
public class IdempotencyKey : BaseEntity
{
    /// <summary>
    /// İstemci tarafından üretilen benzersiz key (UUID)
    /// </summary>
    public string Key { get; set; } = "";

    /// <summary>
    /// İstemci IP'si (GDPR hash)
    /// </summary>
    public string ClientIpHash { get; set; } = "";

    /// <summary>
    /// İlk isteğin yanıtı (JSON)
    /// </summary>
    public string CachedResponse { get; set; } = "";

    /// <summary>
    /// Cache süresi bitişi (24 saat TTL)
    /// </summary>
    public DateTimeOffset ExpiresAt { get; set; }

    /// <summary>
    /// İlişkili ödeme (var ise)
    /// </summary>
    public int? PaymentId { get; set; }
}

/// <summary>
/// Mollie/Stripe ödeme sağlayıcı konfigürasyonu.
/// Dinamik olarak DB'den yüklenebilir.
/// </summary>
public class PaymentProviderConfig : BaseEntity
{
    public enum ProviderType { Mollie, Stripe }

    /// <summary>
    /// Sağlayıcı türü
    /// </summary>
    public ProviderType Provider { get; set; }

    /// <summary>
    /// API anahtarı (şifreli olarak saklanır)
    /// </summary>
    public string ApiKey { get; set; } = "";

    /// <summary>
    /// Webhook secret (imza doğrulaması için)
    /// </summary>
    public string WebhookSecret { get; set; } = "";

    /// <summary>
    /// Test mode mi yoksa production mu
    /// </summary>
    public bool IsTestMode { get; set; }

    /// <summary>
    /// Kullanılıyor mu
    /// </summary>
    public bool IsActive { get; set; }

    /// <summary>
    /// SEPA indirim oranı (örn: 0.005 = %0.5)
    /// </summary>
    public decimal SepaDiscountRate { get; set; } = 0.005m;

    /// <summary>
    /// PayPal işlem ücreti (örn: 0.029 = %2.9)
    /// </summary>
    public decimal PaypalSurchargeRate { get; set; } = 0.029m;

    /// <summary>
    /// Klarna işlem ücreti
    /// </summary>
    public decimal KlarnaSurchargeRate { get; set; } = 0.03m;

    public new DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public new DateTimeOffset? UpdatedAt { get; set; }
}
