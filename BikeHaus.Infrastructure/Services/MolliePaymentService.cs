using BikeHaus.Application.DTOs;
using BikeHaus.Application.Interfaces;
using BikeHaus.Domain.Entities;
using BikeHaus.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using BikeHaus.Infrastructure.Data;

namespace BikeHaus.Infrastructure.Services;

/// <summary>
/// PCI DSS uyumlu Mollie ödeme servisi
/// </summary>
public class MolliePaymentService : IPaymentService
{
    private readonly IMolliePaymentClient _mollieClient;
    private readonly IPricingService _pricingService;
    private readonly IPaymentAuditLogger _auditLogger;
    private readonly IIdempotencyService _idempotencyService;
    private readonly IWebhookValidator _webhookValidator;
    private readonly BikeHausDbContext _dbContext;
    private readonly ILogger<MolliePaymentService> _logger;

    public MolliePaymentService(
        IMolliePaymentClient mollieClient,
        IPricingService pricingService,
        IPaymentAuditLogger auditLogger,
        IIdempotencyService idempotencyService,
        IWebhookValidator webhookValidator,
        BikeHausDbContext dbContext,
        ILogger<MolliePaymentService> logger)
    {
        _mollieClient = mollieClient;
        _pricingService = pricingService;
        _auditLogger = auditLogger;
        _idempotencyService = idempotencyService;
        _webhookValidator = webhookValidator;
        _dbContext = dbContext;
        _logger = logger;
    }

    public async Task<PaymentResponse> CreatePaymentAsync(
        CreatePaymentRequest request,
        string userId,
        string clientIp,
        string userAgent)
    {
        _logger.LogInformation(
            "Payment creation initiated: SaleId={SaleId}, Method={Method}, UserId={UserId}",
            request.OnlineSaleId, request.Method, userId);

        try
        {
            // 1️⃣ Online satışı kontrol et — müşteriye ait mi?
            var sale = await _dbContext.OnlineSales
                .FirstOrDefaultAsync(s => s.Id == (int)request.OnlineSaleId);

            if (sale == null)
            {
                await _auditLogger.LogSuspiciousActivityAsync(
                    null,
                    "InvalidSaleId",
                    $"Sale ID {request.OnlineSaleId} not found");
                throw new InvalidOperationException("Satış bulunamadı");
            }

            // 2️⃣ Fiyatlandırma hesapla (surcharge/discount)
            var pricingInfo = _pricingService.CalculatePricing(
                sale.Preis, request.Method);

            if (!pricingInfo.IsValid)
            {
                await _auditLogger.LogSuspiciousActivityAsync(
                    null,
                    "InvalidPricing",
                    $"Pricing calculation failed for method {request.Method}");
                throw new InvalidOperationException("Fiyatlandırma hesaplanamadı");
            }

            // 3️⃣ Mollie'ye gönder
            var molliePaymentId = await _mollieClient.CreatePaymentAsync(
                pricingInfo.TotalAmount,
                "EUR",
                $"Bike Haus - Satış #{sale.Id}",
                $"https://bikehausfreiburg.com/checkout/result?orderId={sale.Id}",
                $"https://api.bikehausfreiburg.com/api/payment/webhook/mollie",
                request.Method);

            // 4️⃣ Payment kaydı oluştur
            var payment = new Payment
            {
                OnlineSaleId = request.OnlineSaleId,
                ExternalPaymentId = molliePaymentId,
                Amount = sale.Preis,
                Currency = "EUR",
                Status = "pending",
                Method = request.Method.ToString(),
                Description = $"Online Sales #{sale.Id}",
                UserId = int.TryParse(userId, out var uid) ? uid : null,
                Requires3Ds = true,
                CreatedAt = DateTimeOffset.UtcNow
            };

            _dbContext.Payments.Add(payment);
            await _dbContext.SaveChangesAsync();

            // 5️⃣ Audit log
            await _auditLogger.LogPaymentCreatedAsync(
                payment.Id,
                int.TryParse(userId, out var uid2) ? uid2 : null,
                pricingInfo.TotalAmount,
                request.Method.ToString(),
                clientIp);

            // 6️⃣ Mollie'den checkout URL'yi al
            var (status, _) = await _mollieClient.GetPaymentStatusAsync(molliePaymentId);

            // Örnek: https://www.mollie.com/checkout/select-method/...
            var checkoutUrl = $"https://www.mollie.com/checkout/select-method/{molliePaymentId}";

            return new PaymentResponse
            {
                PaymentId = payment.Id,
                ExternalPaymentId = molliePaymentId,
                CheckoutUrl = checkoutUrl,
                Status = status,
                Amount = sale.Preis,
                TotalAmount = pricingInfo.TotalAmount,
                AdjustmentAmount = pricingInfo.Adjustment,
                AdjustmentReason = pricingInfo.AdjustmentLabel
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Payment creation failed: SaleId={SaleId}", request.OnlineSaleId);
            await _auditLogger.LogSuspiciousActivityAsync(
                null,
                "PaymentCreationFailed",
                ex.Message);
            throw;
        }
    }

    public async Task<PaymentStatusResponse> GetPaymentStatusAsync(int paymentId, string userId)
    {
        try
        {
            var userIdInt = int.TryParse(userId, out var uid) ? uid : 0;
            var payment = await _dbContext.Payments
                .FirstOrDefaultAsync(p => p.Id == paymentId && p.UserId == userIdInt);

            if (payment == null)
            {
                await _auditLogger.LogSuspiciousActivityAsync(
                    paymentId,
                    "UnauthorizedPaymentAccess",
                    $"User {userId} tried to access payment {paymentId}");
                throw new UnauthorizedAccessException("Ödemeye erişim yok");
            }

            // Mollie'den güncel durum al
            var (status, _) = await _mollieClient.GetPaymentStatusAsync(payment.ExternalPaymentId);

            return new PaymentStatusResponse
            {
                Status = status,
                IsPaid = status == "paid",
                ExternalPaymentId = payment.ExternalPaymentId
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get payment status: PaymentId={PaymentId}", paymentId);
            throw;
        }
    }

    public async Task<RefundResponse> RefundPaymentAsync(RefundRequest request, string adminUserId)
    {
        try
        {
            // Admin yetkilendirmesi kontrol edilir (middleware'de)
            var payment = await _dbContext.Payments
                .FirstOrDefaultAsync(p => p.Id == request.PaymentId);

            if (payment == null)
                throw new InvalidOperationException("Ödeme bulunamadı");

            if (payment.IsRefunded)
                throw new InvalidOperationException("Bu ödeme zaten iade edilmiş");

            // İade tutarı kontrolü
            var refundAmount = request.Amount ?? payment.Amount;
            if (refundAmount > payment.Amount)
                throw new InvalidOperationException("İade tutarı orijinal tutarı aşamaz");

            // Mollie'ye gönder
            var refundId = await _mollieClient.RefundPaymentAsync(
                payment.ExternalPaymentId,
                refundAmount > 0 ? refundAmount : null);

            // Payment güncelle
            payment.IsRefunded = true;
            payment.UpdatedAt = DateTimeOffset.UtcNow;
            await _dbContext.SaveChangesAsync();

            // Audit log
            await _auditLogger.LogRefundAsync(
                payment.Id,
                int.TryParse(adminUserId, out var adminUid) ? adminUid : 0,
                refundAmount,
                request.Reason);

            return new RefundResponse
            {
                IsSuccess = true,
                RefundId = refundId,
                Status = "initiated"
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Refund failed: PaymentId={PaymentId}", request.PaymentId);
            return new RefundResponse
            {
                IsSuccess = false,
                ErrorMessage = ex.Message
            };
        }
    }

    public async Task<bool> ProcessMollieWebhookAsync(string rawBody, string mollieSignature)
    {
        try
        {
            // 1️⃣ Webhook imzasını doğrula
            if (!_webhookValidator.ValidateMollieSignature(rawBody, mollieSignature))
            {
                await _auditLogger.LogWebhookReceivedAsync(
                    "unknown",
                    false,
                    "Invalid signature");
                _logger.LogWarning("Invalid Mollie webhook signature");
                return false;
            }

            // 2️⃣ Webhook payload'u parse et
            var webhookData = System.Text.Json.JsonSerializer.Deserialize<MollieWebhookPayload>(rawBody);
            if (webhookData?.Id == null)
            {
                await _auditLogger.LogWebhookReceivedAsync("unknown", false, "No payment ID in webhook");
                return false;
            }

            // 3️⃣ Mollie API'yi sorgu (webhook'a körü körüne güvenme!)
            var (status, amount) = await _mollieClient.GetPaymentStatusAsync(webhookData.Id);

            // 4️⃣ Ödemeyi DB'de bul
            var payment = await _dbContext.Payments
                .Include(p => p.OnlineSale)
                .FirstOrDefaultAsync(p => p.ExternalPaymentId == webhookData.Id);

            if (payment == null)
            {
                await _auditLogger.LogWebhookReceivedAsync(
                    webhookData.Id,
                    true,
                    "Payment not found in DB (might be old)");
                return true; // 200 OK dön ama işlem yapma
            }

            // 5️⃣ Durum değişikliğini loglaya
            var oldStatus = payment.Status;
            payment.Status = status;
            payment.LastWebhookAt = DateTimeOffset.UtcNow;
            payment.UpdatedAt = DateTimeOffset.UtcNow;

            await _dbContext.SaveChangesAsync();
            await _auditLogger.LogPaymentStatusChangeAsync(
                payment.Id,
                oldStatus,
                status,
                webhookData.Id);

            // 6️⃣ Ödeme başarıysa siparişi tamamla
            if (status == "paid" && payment.OnlineSale != null)
            {
                payment.OnlineSale.IsVerarbeitet = true;
                await _dbContext.SaveChangesAsync();

                // Email gönder vb. (OutOfScope)
                _logger.LogInformation("Order fulfilled: SaleId={SaleId}", payment.OnlineSaleId);
            }

            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Webhook processing failed");
            return false;
        }
    }

    public async Task<PricingInfo> CalculatePricingAsync(
        decimal baseAmount,
        PaymentMethodType method)
    {
        var pricing = _pricingService.CalculatePricing(baseAmount, method);
        return await Task.FromResult(pricing);
    }
}
