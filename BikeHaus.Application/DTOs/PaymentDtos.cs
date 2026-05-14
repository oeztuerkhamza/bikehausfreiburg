using BikeHaus.Domain.Enums;

namespace BikeHaus.Application.DTOs;

/// <summary>
/// Ödeme oluşturma isteği — ASLA kart bilgisi, CVV veya IBAN içermez.
/// </summary>
public class CreatePaymentRequest
{
    /// <summary>
    /// Online satış ID
    /// </summary>
    public int OnlineSaleId { get; set; }

    /// <summary>
    /// Ödeme yöntemi (kart, SEPA, PayPal vs.)
    /// </summary>
    public PaymentMethodType Method { get; set; }

    /// <summary>
    /// Müşteri e-postası
    /// </summary>
    public string? CustomerEmail { get; set; }

    /// <summary>
    /// Müşteri adı
    /// </summary>
    public string? CustomerName { get; set; }
}

/// <summary>
/// Ödeme yanıtı
/// </summary>
public class PaymentResponse
{
    /// <summary>
    /// Bike Haus ödeme ID
    /// </summary>
    public int PaymentId { get; set; }

    /// <summary>
    /// Mollie/Stripe dış ID
    /// </summary>
    public string ExternalPaymentId { get; set; } = "";

    /// <summary>
    /// Checkout URL (Mollie/Stripe hosted page)
    /// </summary>
    public string CheckoutUrl { get; set; } = "";

    /// <summary>
    /// Ödeme durumu
    /// </summary>
    public string Status { get; set; } = "";

    /// <summary>
    /// Ödeme tutarı
    /// </summary>
    public decimal Amount { get; set; }

    /// <summary>
    /// Gerçek ödenecek tutarı (surcharge/discount ile)
    /// </summary>
    public decimal TotalAmount { get; set; }

    /// <summary>
    /// Surcharge veya discount tutarı
    /// </summary>
    public decimal AdjustmentAmount { get; set; }

    /// <summary>
    /// Açıklama (nedir bu ayarlama)
    /// </summary>
    public string AdjustmentReason { get; set; } = "";

    /// <summary>
    /// Redirect sonrası beklenmesi gereken QR kod (varsa)
    /// </summary>
    public string? QrCode { get; set; }
}

/// <summary>
/// Ödeme sonuç kontrolü (checkout'tan döndükten sonra)
/// </summary>
public class PaymentStatusRequest
{
    /// <summary>
    /// Bike Haus payment ID
    /// </summary>
    public int PaymentId { get; set; }
}

public class PaymentStatusResponse
{
    /// <summary>
    /// Ödeme durumu
    /// </summary>
    public string Status { get; set; } = "";

    /// <summary>
    /// Başarılı mı?
    /// </summary>
    public bool IsPaid { get; set; }

    /// <summary>
    /// Başarısız ise hata mesajı
    /// </summary>
    public string? ErrorMessage { get; set; }

    /// <summary>
    /// Mollie referansı (hata ayıklamada yardımcı)
    /// </summary>
    public string? ExternalPaymentId { get; set; }
}

/// <summary>
/// İade (refund) isteği — yalnızca admin
/// </summary>
public class RefundRequest
{
    /// <summary>
    /// Bike Haus payment ID
    /// </summary>
    public int PaymentId { get; set; }

    /// <summary>
    /// İade tutarı (tam veya kısmi)
    /// </summary>
    public decimal? Amount { get; set; }

    /// <summary>
    /// İade nedeni
    /// </summary>
    public string Reason { get; set; } = "";
}

public class RefundResponse
{
    /// <summary>
    /// İade işlemi başarılı mı
    /// </summary>
    public bool IsSuccess { get; set; }

    /// <summary>
    /// Mollie refund ID
    /// </summary>
    public string RefundId { get; set; } = "";

    /// <summary>
    /// İade durumu
    /// </summary>
    public string Status { get; set; } = "";

    /// <summary>
    /// Hata mesajı (varsa)
    /// </summary>
    public string? ErrorMessage { get; set; }
}

/// <summary>
/// Fiyat hesaplaması — ödeme yöntemi seçildiğinde frontend'e gönderilir
/// </summary>
public class PricingInfo
{
    /// <summary>
    /// Taban fiyat (ürün)
    /// </summary>
    public decimal BaseAmount { get; set; }

    /// <summary>
    /// Ödeme yöntemi (örn: PayPal)
    /// </summary>
    public PaymentMethodType Method { get; set; }

    /// <summary>
    /// Surcharge veya discount
    /// </summary>
    public decimal Adjustment { get; set; }

    /// <summary>
    /// Açıklama
    /// </summary>
    public string AdjustmentLabel { get; set; } = "";

    /// <summary>
    /// Son tutarı
    /// </summary>
    public decimal TotalAmount { get; set; }

    /// <summary>
    /// Tutarlı mı?
    /// </summary>
    public bool IsValid { get; set; }
}

/// <summary>
/// Mollie webhook'u işlemek için
/// </summary>
public class MollieWebhookPayload
{
    /// <summary>
    /// Mollie payment ID
    /// </summary>
    public string Id { get; set; } = "";
}
