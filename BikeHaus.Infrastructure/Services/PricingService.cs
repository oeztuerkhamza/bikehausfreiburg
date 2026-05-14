using BikeHaus.Application.DTOs;
using BikeHaus.Application.Interfaces;
using BikeHaus.Domain.Enums;
using Microsoft.Extensions.Logging;

namespace BikeHaus.Infrastructure.Services;

/// <summary>
/// AB yasal uyumluluk ile fiyatlandırma — surcharge/discount kuralları
/// PSD2: Kart ve SEPA'ya surcharge yasak
/// </summary>
public class PricingService : IPricingService
{
    private readonly ILogger<PricingService> _logger;

    // Config'den gelmeli, hardcode YAPMA
    private readonly decimal _sepaDiscountRate = 0.005m;      // %0.5 indirim
    private readonly decimal _paypalSurchargeRate = 0.029m;   // %2.9 ek ücret
    private readonly decimal _klarnaSurchargeRate = 0.03m;    // %3 ek ücret

    public PricingService(ILogger<PricingService> logger)
    {
        _logger = logger;
    }

    public PricingInfo CalculatePricing(decimal baseAmount, PaymentMethodType method)
    {
        try
        {
            return method switch
            {
                // 🟢 AB Kanunu: Kredi kartına surcharge YASAK (PSD2)
                PaymentMethodType.CreditCard => new PricingInfo
                {
                    BaseAmount = baseAmount,
                    Method = method,
                    Adjustment = 0,
                    AdjustmentLabel = "Kredi kartı ile ödeme — fark yok",
                    TotalAmount = baseAmount,
                    IsValid = true
                },

                // 🟢 AB Kanunu: Banka kartına surcharge YASAK
                PaymentMethodType.DebitCard => new PricingInfo
                {
                    BaseAmount = baseAmount,
                    Method = method,
                    Adjustment = 0,
                    AdjustmentLabel = "Banka kartı ile ödeme — fark yok",
                    TotalAmount = baseAmount,
                    IsValid = true
                },

                // 🟢 AB Kanunu: SEPA'ya surcharge YASAK, ama indirim yapılabilir
                PaymentMethodType.SepaDirectDebit => new PricingInfo
                {
                    BaseAmount = baseAmount,
                    Method = method,
                    Adjustment = -baseAmount * _sepaDiscountRate,
                    AdjustmentLabel = $"SEPA Lastschrift %{_sepaDiscountRate * 100:F1} indirim",
                    TotalAmount = baseAmount * (1 - _sepaDiscountRate),
                    IsValid = true
                },

                // 🟡 İDEAL (Netherlands) — surcharge yok
                PaymentMethodType.Ideal => new PricingInfo
                {
                    BaseAmount = baseAmount,
                    Method = method,
                    Adjustment = 0,
                    AdjustmentLabel = "iDEAL ile ödeme",
                    TotalAmount = baseAmount,
                    IsValid = true
                },

                // 🔴 PayPal — surcharge mümkün (2.9% + 0.35€)
                // Burada sadece % alıyoruz, fixed fee eklenebilir
                PaymentMethodType.PayPal => new PricingInfo
                {
                    BaseAmount = baseAmount,
                    Method = method,
                    Adjustment = baseAmount * _paypalSurchargeRate,
                    AdjustmentLabel = $"PayPal işlem ücreti %{_paypalSurchargeRate * 100:F1}",
                    TotalAmount = baseAmount * (1 + _paypalSurchargeRate),
                    IsValid = true
                },

                // 🔴 Klarna — surcharge mümkün (BNPL)
                PaymentMethodType.Klarna => new PricingInfo
                {
                    BaseAmount = baseAmount,
                    Method = method,
                    Adjustment = baseAmount * _klarnaSurchargeRate,
                    AdjustmentLabel = $"Taksit/Peşin Plus işlem ücreti %{_klarnaSurchargeRate * 100:F1}",
                    TotalAmount = baseAmount * (1 + _klarnaSurchargeRate),
                    IsValid = true
                },

                // Diğer yöntemler
                PaymentMethodType.Bancontact => new PricingInfo
                {
                    BaseAmount = baseAmount,
                    Method = method,
                    Adjustment = 0,
                    AdjustmentLabel = "Bancontact ile ödeme",
                    TotalAmount = baseAmount,
                    IsValid = true
                },

                PaymentMethodType.ApplePay => new PricingInfo
                {
                    BaseAmount = baseAmount,
                    Method = method,
                    Adjustment = 0,
                    AdjustmentLabel = "Apple Pay ile ödeme",
                    TotalAmount = baseAmount,
                    IsValid = true
                },

                PaymentMethodType.GooglePay => new PricingInfo
                {
                    BaseAmount = baseAmount,
                    Method = method,
                    Adjustment = 0,
                    AdjustmentLabel = "Google Pay ile ödeme",
                    TotalAmount = baseAmount,
                    IsValid = true
                },

                _ => throw new ArgumentException($"Desteklenmeyen ödeme yöntemi: {method}")
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Pricing calculation error for method {Method}", method);
            return new PricingInfo
            {
                IsValid = false,
                BaseAmount = baseAmount,
                Method = method
            };
        }
    }

    public decimal GetTotalAmount(decimal baseAmount, PaymentMethodType method)
    {
        var pricing = CalculatePricing(baseAmount, method);
        return pricing.TotalAmount;
    }
}
