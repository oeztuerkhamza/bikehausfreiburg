using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using FluentValidation;
using BikeHaus.Application.DTOs;
using BikeHaus.Application.Interfaces;
using BikeHaus.API.Filters;
using System.Security.Claims;

namespace BikeHaus.API.Controllers;

/// <summary>
/// Ödeme işlemleri — PCI DSS uyumlu endpoint'ler
/// Tüm hassas veriler backend'de işlenir, frontend'e gönderilmez
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class PaymentController : ControllerBase
{
    private readonly IPaymentService _paymentService;
    private readonly IValidator<CreatePaymentRequest> _createPaymentValidator;
    private readonly IValidator<RefundRequest> _refundValidator;
    private readonly IPaymentAuditLogger _auditLogger;
    private readonly ILogger<PaymentController> _logger;

    public PaymentController(
        IPaymentService paymentService,
        IValidator<CreatePaymentRequest> createPaymentValidator,
        IValidator<RefundRequest> refundValidator,
        IPaymentAuditLogger auditLogger,
        ILogger<PaymentController> logger)
    {
        _paymentService = paymentService;
        _createPaymentValidator = createPaymentValidator;
        _refundValidator = refundValidator;
        _auditLogger = auditLogger;
        _logger = logger;
    }

    /// <summary>
    /// Ödeme oluştur — Mollie checkout URL'si döner
    /// POST /api/payment/create
    /// Headers: Authorization: Bearer {token}, Idempotency-Key: {uuid}, X-XSRF-TOKEN: {token}
    /// </summary>
    [HttpPost("create")]
    [Authorize]
    [ServiceFilter(typeof(IdempotencyFilter))]
    [ServiceFilter(typeof(PaymentRateLimitFilter))]
    public async Task<IActionResult> CreatePayment([FromBody] CreatePaymentRequest request)
    {
        try
        {
            // 1️⃣ Input validation
            var validationResult = await _createPaymentValidator.ValidateAsync(request);
            if (!validationResult.IsValid)
            {
                _logger.LogWarning("Payment creation validation failed: {Errors}",
                    string.Join(", ", validationResult.Errors));
                return BadRequest(new
                {
                    error = "Validation failed",
                    details = validationResult.Errors
                        .Select(e => new { field = e.PropertyName, message = e.ErrorMessage })
                });
            }

            // 2️⃣ Kullanıcı ID'sini al (JWT token'dan)
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ??
                        User.FindFirst("sub")?.Value;

            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { error = "User ID not found in token" });
            }

            // 3️⃣ Client IP ve User-Agent'ı al
            var clientIp = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
            var userAgent = Request.Headers["User-Agent"].ToString();

            // 4️⃣ Ödeme oluştur
            var paymentResponse = await _paymentService.CreatePaymentAsync(
                request, userId, clientIp, userAgent);

            // 5️⃣ Başarılı yanıt
            return Ok(paymentResponse);
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning("Payment creation failed: {Message}", ex.Message);
            await _auditLogger.LogSuspiciousActivityAsync(null, "PaymentCreationFailed", ex.Message);
            return BadRequest(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error during payment creation");
            await _auditLogger.LogSuspiciousActivityAsync(null, "PaymentError", ex.Message);
            return StatusCode(500, new { error = "Payment processing failed" });
        }
    }

    /// <summary>
    /// Ödeme durumunu kontrol et
    /// GET /api/payment/status/{paymentId}
    /// </summary>
    [HttpGet("status/{paymentId:int}")]
    [Authorize]
    public async Task<IActionResult> GetPaymentStatus(int paymentId)
    {
        try
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ??
                        User.FindFirst("sub")?.Value;

            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var statusResponse = await _paymentService.GetPaymentStatusAsync(paymentId, userId);
            return Ok(statusResponse);
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized(new { error = "You don't have access to this payment" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting payment status: {PaymentId}", paymentId);
            return StatusCode(500, new { error = "Failed to get payment status" });
        }
    }

    /// <summary>
    /// İade işlemi — sadece PaymentAdmin rol'ü yapabilir
    /// POST /api/payment/refund
    /// </summary>
    [HttpPost("refund")]
    [Authorize]
    [ServiceFilter(typeof(PaymentAdminAuthorizationFilter))]
    public async Task<IActionResult> RefundPayment([FromBody] RefundRequest request)
    {
        try
        {
            // Input validation
            var validationResult = await _refundValidator.ValidateAsync(request);
            if (!validationResult.IsValid)
            {
                return BadRequest(new
                {
                    error = "Validation failed",
                    details = validationResult.Errors
                        .Select(e => new { field = e.PropertyName, message = e.ErrorMessage })
                });
            }

            var adminUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ??
                             User.FindFirst("sub")?.Value;

            if (string.IsNullOrEmpty(adminUserId))
                return Unauthorized();

            var refundResponse = await _paymentService.RefundPaymentAsync(request, adminUserId);

            if (!refundResponse.IsSuccess)
                return BadRequest(refundResponse);

            return Ok(refundResponse);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Refund processing failed");
            return StatusCode(500, new { error = "Refund processing failed" });
        }
    }

    /// <summary>
    /// Mollie webhook — public endpoint
    /// POST /api/payment/webhook/mollie
    /// Headers: X-Mollie-Signature: {signature}
    /// </summary>
    [HttpPost("webhook/mollie")]
    [AllowAnonymous]
    public async Task<IActionResult> MollieWebhook()
    {
        try
        {
            // 1️⃣ Raw body'yi oku (signature doğrulaması için)
            using var reader = new StreamReader(Request.Body);
            var rawBody = await reader.ReadToEndAsync();

            // 2️⃣ Webhook signature'ı al
            if (!Request.Headers.TryGetValue("X-Mollie-Signature", out var signatureHeader))
            {
                _logger.LogWarning("Mollie webhook missing signature");
                return Unauthorized(new { error = "Missing webhook signature" });
            }

            // 3️⃣ Webhook'u işle
            var isValid = await _paymentService.ProcessMollieWebhookAsync(
                rawBody, signatureHeader.ToString());

            if (!isValid)
            {
                _logger.LogWarning("Invalid Mollie webhook signature");
                return Unauthorized(new { error = "Invalid signature" });
            }

            // 4️⃣ Mollie'ye 200 OK dön (idempotent)
            return Ok();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing Mollie webhook");
            // Webhook başarısız olsa bile 200 dön (Mollie retry'ı trigger etmemek için)
            return Ok();
        }
    }

    /// <summary>
    /// Fiyatlandırma bilgisi (surcharge/discount)
    /// GET /api/payment/pricing?baseAmount={amount}&method={method}
    /// </summary>
    [HttpGet("pricing")]
    public async Task<IActionResult> GetPricing(
        [FromQuery] decimal baseAmount,
        [FromQuery] BikeHaus.Domain.Enums.PaymentMethodType method)
    {
        try
        {
            if (baseAmount <= 0 || baseAmount > 50000)
                return BadRequest(new { error = "Invalid amount" });

            var pricing = await _paymentService.CalculatePricingAsync(baseAmount, method);

            return Ok(pricing);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error calculating pricing");
            return StatusCode(500, new { error = "Failed to calculate pricing" });
        }
    }

    /// <summary>
    /// Health check — webhook testi için
    /// GET /api/payment/health
    /// </summary>
    [HttpGet("health")]
    [AllowAnonymous]
    public IActionResult Health()
    {
        return Ok(new { status = "ok", timestamp = DateTimeOffset.UtcNow });
    }
}
