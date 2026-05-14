namespace BikeHaus.Domain.Enums;

/// <summary>
/// Desteklenen ödeme yöntemleri (Mollie uyumlu)
/// </summary>
public enum PaymentMethodType
{
    CreditCard,     // Visa, Mastercard, Amex
    DebitCard,      // Girocard, EC Karten
    SepaDirectDebit, // SEPA Lastschrift
    Ideal,          // iDEAL (Netherlands)
    PayPal,
    Klarna,
    Bancontact,     // Belgium
    ApplePay,
    GooglePay,
    EPS,            // Österreich
    Giropay,        // Deutschland
    KBC,            // Belgium
    Przelewy24      // Poland
}

/// <summary>
/// Ödeme durumları (Mollie states)
/// </summary>
public enum PaymentStatus
{
    Pending,        // Ödeme bekleniyor
    Authorized,     // Ödeme yetkilendirildi
    Paid,           // Ödeme tamamlandı
    Canceled,       // İptal edildi
    Expired,        // Süre doldu
    Failed,         // Başarısız
    Refunded        // İade
}
