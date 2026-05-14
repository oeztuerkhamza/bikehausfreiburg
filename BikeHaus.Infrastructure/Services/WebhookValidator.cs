using BikeHaus.Application.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.Security.Cryptography;
using System.Text;

namespace BikeHaus.Infrastructure.Services;

/// <summary>
/// Mollie webhook validasyonu — imza doğrulaması
/// </summary>
public class WebhookValidator : IWebhookValidator
{
    private readonly IConfiguration _config;
    private readonly ILogger<WebhookValidator> _logger;

    public WebhookValidator(IConfiguration config, ILogger<WebhookValidator> logger)
    {
        _config = config;
        _logger = logger;
    }

    public bool ValidateMollieSignature(string rawBody, string signature)
    {
        try
        {
            // 1️⃣ Webhook secret'ı al (environment variable'dan)
            var webhookSecret = _config["Mollie:WebhookSecret"]
                ?? throw new InvalidOperationException("Mollie:WebhookSecret not configured");

            // 2️⃣ HMAC-SHA256 ile hash'le
            using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(webhookSecret));
            var hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(rawBody));
            var expectedSignature = Convert.ToBase64String(hash);

            // 3️⃣ Gelen signature ile karşılaştır (timing attack koruması)
            var isValid = CryptographicOperations.FixedTimeEquals(
                Encoding.UTF8.GetBytes(expectedSignature),
                Encoding.UTF8.GetBytes(signature));

            if (!isValid)
            {
                _logger.LogWarning(
                    "Webhook signature mismatch. Expected: {Expected}, Got: {Got}",
                    expectedSignature[..16], signature[..16]);
            }

            return isValid;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Webhook signature validation error");
            return false;
        }
    }

    public bool ValidateWebhookSource(string clientIp)
    {
        // Mollie'nin bilinen IP'leri (opsiyonel ek güvenlik)
        var allowedIps = new[]
        {
            "87.233.217.240",  // Mollie DC1
            "87.233.217.241",  // Mollie DC2
            "192.0.2.1"        // Test IP
        };

        var isAllowed = allowedIps.Contains(clientIp);

        if (!isAllowed)
        {
            _logger.LogWarning("Webhook from unknown IP: {Ip}", clientIp);
            // Loglama yap ama reddetme — IP'ler değişebilir
        }

        return true; // Imza doğrulaması yeter
    }
}

/// <summary>
/// Mollie API client wrapper — HTTP-based interface
/// </summary>
public class MolliePaymentClient : IMolliePaymentClient
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _config;
    private readonly ILogger<MolliePaymentClient> _logger;
    private readonly string _apiKey;

    public MolliePaymentClient(
        HttpClient httpClient,
        IConfiguration config,
        ILogger<MolliePaymentClient> logger)
    {
        _httpClient = httpClient;
        _config = config;
        _logger = logger;
        _apiKey = config["Mollie:ApiKey"] ?? throw new InvalidOperationException("Mollie:ApiKey not configured");

        // Configure HTTP client for Mollie
        _httpClient.BaseAddress = new Uri("https://api.mollie.com/v2/");
        _httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {_apiKey}");
        _httpClient.DefaultRequestHeaders.Add("Accept", "application/json");
    }

    public async Task<string> CreatePaymentAsync(
        decimal amount,
        string currency,
        string description,
        string redirectUrl,
        string webhookUrl,
        BikeHaus.Domain.Enums.PaymentMethodType method)
    {
        try
        {
            var requestContent = new
            {
                amount = amount.ToString("F2", System.Globalization.CultureInfo.InvariantCulture),
                currency,
                description = description[..255],
                redirectUrl,
                webhookUrl,
                locale = "de_DE",
                method = MapPaymentMethod(method)
            };

            var json = System.Text.Json.JsonSerializer.Serialize(requestContent);
            var content = new StringContent(json, Encoding.UTF8, "application/json");
            var response = await _httpClient.PostAsync("payments", content);

            response.EnsureSuccessStatusCode();
            var responseContent = await response.Content.ReadAsStringAsync();

            // Parse response to get payment ID
            using var doc = System.Text.Json.JsonDocument.Parse(responseContent);
            var paymentId = doc.RootElement.GetProperty("id").GetString();

            _logger.LogInformation(
                "Mollie payment created: MollieId={PaymentId}, Amount={Amount}",
                paymentId, amount);

            return paymentId ?? throw new InvalidOperationException("No payment ID in response");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Mollie payment creation failed");
            throw;
        }
    }

    public async Task<(string Status, decimal Amount)> GetPaymentStatusAsync(string molliePaymentId)
    {
        try
        {
            var response = await _httpClient.GetAsync($"payments/{molliePaymentId}");
            response.EnsureSuccessStatusCode();
            var responseContent = await response.Content.ReadAsStringAsync();

            using var doc = System.Text.Json.JsonDocument.Parse(responseContent);
            var status = doc.RootElement.GetProperty("status").GetString() ?? "unknown";
            var amount = doc.RootElement.GetProperty("amount").GetProperty("value").GetDecimal();

            return (status, amount);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get Mollie payment status: {MollieId}", molliePaymentId);
            throw;
        }
    }

    public async Task<string> RefundPaymentAsync(string molliePaymentId, decimal? amount = null)
    {
        try
        {
            var requestContent = amount.HasValue
                ? new
                {
                    amount = new
                    {
                        currency = "EUR",
                        value = amount.Value.ToString("F2", System.Globalization.CultureInfo.InvariantCulture)
                    }
                }
                : (object)new { };

            var json = System.Text.Json.JsonSerializer.Serialize(requestContent);
            var content = new StringContent(json, Encoding.UTF8, "application/json");
            var response = await _httpClient.PostAsync($"payments/{molliePaymentId}/refunds", content);

            if (!response.IsSuccessStatusCode)
            {
                var errorBody = await response.Content.ReadAsStringAsync();
                _logger.LogWarning(
                    "Mollie refund returned non-success. PaymentId={PaymentId}, Status={StatusCode}, Body={Body}",
                    molliePaymentId,
                    (int)response.StatusCode,
                    errorBody);

                throw new InvalidOperationException(
                    $"Mollie refund failed ({(int)response.StatusCode}): {errorBody}");
            }

            var responseContent = await response.Content.ReadAsStringAsync();

            using var doc = System.Text.Json.JsonDocument.Parse(responseContent);
            var refundId = doc.RootElement.GetProperty("id").GetString();

            _logger.LogInformation(
                "Mollie refund initiated: RefundId={RefundId}, MolliePaymentId={PaymentId}",
                refundId, molliePaymentId);

            return refundId ?? throw new InvalidOperationException("No refund ID in response");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Mollie refund failed: {MollieId}", molliePaymentId);
            throw;
        }
    }

    /// <summary>
    /// PaymentMethodType'ı Mollie API'sinin beklediği string'e dönüştür
    /// </summary>
    private static string MapPaymentMethod(BikeHaus.Domain.Enums.PaymentMethodType method)
    {
        return method switch
        {
            BikeHaus.Domain.Enums.PaymentMethodType.CreditCard => "creditcard",
            BikeHaus.Domain.Enums.PaymentMethodType.DebitCard => "debitcard",
            BikeHaus.Domain.Enums.PaymentMethodType.SepaDirectDebit => "directdebit",
            BikeHaus.Domain.Enums.PaymentMethodType.Ideal => "ideal",
            BikeHaus.Domain.Enums.PaymentMethodType.PayPal => "paypal",
            BikeHaus.Domain.Enums.PaymentMethodType.Klarna => "klarnapaylater",
            BikeHaus.Domain.Enums.PaymentMethodType.Bancontact => "bancontact",
            BikeHaus.Domain.Enums.PaymentMethodType.ApplePay => "applepay",
            BikeHaus.Domain.Enums.PaymentMethodType.GooglePay => "googlepay",
            BikeHaus.Domain.Enums.PaymentMethodType.EPS => "eps",
            BikeHaus.Domain.Enums.PaymentMethodType.Giropay => "giropay",
            BikeHaus.Domain.Enums.PaymentMethodType.KBC => "kbc",
            BikeHaus.Domain.Enums.PaymentMethodType.Przelewy24 => "przelewy24",
            _ => throw new ArgumentException($"Unsupported payment method: {method}")
        };
    }
}
