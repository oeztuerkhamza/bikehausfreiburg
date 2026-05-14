using System.Globalization;
using System.Text.Json;
using BikeHaus.Application.Interfaces;
using BikeHaus.Domain.Entities;
using BikeHaus.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Mollie.Api.Client.Abstract;
using Mollie.Api.Models;
using Mollie.Api.Models.Payment.Request;
using Mollie.Api.Models.Payment;

namespace BikeHaus.API.Controllers;

[ApiController]
[Route("api/public")]
public class CheckoutController : ControllerBase
{
    private readonly IBicycleService _bicycleService;
    private readonly IPaymentClient _paymentClient;
    private readonly IEmailService _emailService;
    private readonly IConfiguration _config;
    private readonly ILogger<CheckoutController> _logger;
    private readonly BikeHausDbContext _db;

    public CheckoutController(
        IBicycleService bicycleService,
        IPaymentClient paymentClient,
        IEmailService emailService,
        IConfiguration config,
        ILogger<CheckoutController> logger,
        BikeHausDbContext db)
    {
        _bicycleService = bicycleService;
        _paymentClient = paymentClient;
        _emailService = emailService;
        _config = config;
        _logger = logger;
        _db = db;
    }

    [HttpPost("checkout/create-session")]
    public async Task<IActionResult> CreateSession([FromBody] CheckoutRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.Vorname) || string.IsNullOrWhiteSpace(req.Nachname) ||
            string.IsNullOrWhiteSpace(req.Email) || string.IsNullOrWhiteSpace(req.Adresse) ||
            string.IsNullOrWhiteSpace(req.Abholtag))
            return BadRequest(new { error = "Alle Felder sind erforderlich" });

        decimal bikeBasePrice;
        string bikeTitle;
        var bikeIdForOrder = 0;

        if (req.BikeId > 0)
        {
            var bike = await _bicycleService.GetPublishedBicycleByIdAsync(req.BikeId);
            if (bike == null) return NotFound(new { error = "Fahrrad nicht gefunden" });
            if (bike.Preis == null || bike.Preis <= 0)
                return BadRequest(new { error = "Preis nicht verfügbar" });

            bikeBasePrice = bike.Preis.Value;
            bikeTitle = $"{bike.Marke} {bike.Modell}";
            bikeIdForOrder = bike.Id;
        }
        else
        {
            var listing = await _db.KleinanzeigenListings
                .FirstOrDefaultAsync(x => x.Id == req.ListingDisplayId && x.IsActive);

            if (listing == null)
                return NotFound(new { error = "Fahrrad nicht gefunden" });
            if (listing.Price == null || listing.Price <= 0)
                return BadRequest(new { error = "Preis nicht verfügbar" });

            bikeBasePrice = listing.Price.Value;
            bikeTitle = listing.Title;
        }

        var requestedAccessories = (req.Accessories ?? new List<CheckoutAccessoryRequest>())
            .Where(a => a.Quantity > 0)
            .ToList();

        if (requestedAccessories.Any(a => a.Quantity > 10))
            return BadRequest(new { error = "Ungültige Zubehör-Menge" });

        decimal accessoriesTotal = 0m;
        var accessoryMetadata = new List<object>();

        if (requestedAccessories.Count > 0)
        {
            var requestedIds = requestedAccessories
                .Select(a => a.AccessoryId)
                .Distinct()
                .ToList();

            var accessories = await _db.HomepageAccessories
                .Where(a => a.IsActive && requestedIds.Contains(a.Id))
                .ToListAsync();

            if (accessories.Count != requestedIds.Count)
                return BadRequest(new { error = "Ein oder mehrere Zubehörartikel sind nicht verfügbar" });

            foreach (var selected in requestedAccessories)
            {
                var accessory = accessories.First(a => a.Id == selected.AccessoryId);
                var lineTotal = accessory.Preis * selected.Quantity;
                accessoriesTotal += lineTotal;

                accessoryMetadata.Add(new
                {
                    accessoryId = accessory.Id,
                    title = accessory.Titel,
                    quantity = selected.Quantity,
                    unitPrice = accessory.Preis,
                    lineTotal
                });
            }
        }

        var frontendBaseUrl = ResolveBaseUrl("App:FrontendBaseUrl");
        var backendBaseUrl = ResolveBaseUrl("App:BackendBaseUrl");
        var lang = req.Lang ?? "de";
        var totalPrice = bikeBasePrice + accessoriesTotal;
        var amountStr = totalPrice.ToString("F2", CultureInfo.InvariantCulture);

        var metadata = JsonSerializer.Serialize(new
        {
            bikeId = bikeIdForOrder,
            listingDisplayId = req.ListingDisplayId,
            bikeTitle,
            bikePrice = bikeBasePrice,
            accessoriesTotal,
            accessories = accessoryMetadata,
            price = totalPrice,
            vorname = req.Vorname,
            nachname = req.Nachname,
            email = req.Email,
            adresse = req.Adresse,
            abholtag = req.Abholtag,
            lang
        });

        var paymentRequest = new PaymentRequest
        {
            Amount = new Amount(Currency.EUR, amountStr),
            Description = accessoryMetadata.Count > 0
                ? $"Fahrrad + Zubehör: {bikeTitle}"
                : $"Fahrrad: {bikeTitle}",
            RedirectUrl = $"{frontendBaseUrl}/{lang}/showroom/danke?listing={req.ListingDisplayId}",
            WebhookUrl = backendBaseUrl.StartsWith("http://localhost", StringComparison.OrdinalIgnoreCase)
                ? null
                : $"{backendBaseUrl}/api/public/checkout/webhook",
            Metadata = metadata,
        };

        var payment = await _paymentClient.CreatePaymentAsync(paymentRequest);
        return Ok(new { checkoutUrl = payment.Links.Checkout.Href, paymentId = payment.Id });
    }

    [HttpPost("checkout/confirm-payment")]
    public async Task<IActionResult> ConfirmPayment([FromBody] ConfirmPaymentRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.PaymentId))
            return BadRequest(new { error = "paymentId gerekli" });

        try
        {
            var payment = await _paymentClient.GetPaymentAsync(req.PaymentId);

            if (payment.Status != PaymentStatus.Paid)
                return Ok(new { confirmed = false, status = payment.Status?.ToString() });

            if (!TryDeserializeMetadata(payment.Metadata, out var meta) || meta == null)
                return Ok(new { confirmed = false, error = "metadata okunamadı" });

            // Sold bike/listing from showroom remove
            if (meta.BikeId > 0)
                await _bicycleService.UnpublishFromWebsiteAsync(meta.BikeId);
            else if (meta.ListingDisplayId > 0)
            {
                var listing = await _db.KleinanzeigenListings.FirstOrDefaultAsync(x => x.Id == meta.ListingDisplayId);
                if (listing != null) { listing.IsActive = false; listing.UpdatedAt = DateTime.UtcNow; await _db.SaveChangesAsync(); }
            }

            // Online-Verkauf in DB speichern (idempotent)
            var existing = await _db.OnlineSales.FirstOrDefaultAsync(x => x.MolliePaymentId == req.PaymentId);
            if (existing == null)
            {
                _db.OnlineSales.Add(new OnlineSale
                {
                    BikeId = meta.ListingDisplayId > 0 ? meta.ListingDisplayId : meta.BikeId,
                    BikeTitle = meta.BikeTitle ?? $"Fahrrad #{meta.ListingDisplayId}",
                    Preis = meta.Price,
                    Vorname = meta.Vorname ?? "",
                    Nachname = meta.Nachname ?? "",
                    Email = meta.Email ?? "",
                    Adresse = meta.Adresse ?? "",
                    Abholtag = meta.Abholtag ?? "",
                    MolliePaymentId = req.PaymentId,
                    IsVerarbeitet = false,
                    CreatedAt = DateTime.UtcNow
                });
                await _db.SaveChangesAsync();

                var adminEmail = _config["Smtp:AdminEmail"] ?? "info.bikehausfreiburg@gmail.com";
                await _emailService.SendOnlineSaleNotificationAsync(new(
                    BikeTitle: meta.BikeTitle ?? $"Fahrrad #{meta.BikeId}",
                    Price: meta.Price,
                    Vorname: meta.Vorname ?? "",
                    Nachname: meta.Nachname ?? "",
                    Email: meta.Email ?? "",
                    Adresse: meta.Adresse ?? "",
                    Abholtag: meta.Abholtag ?? "",
                    AdminEmail: adminEmail
                ));
            }

            return Ok(new { confirmed = true });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Fehler beim Bestätigen der Zahlung {Id}", req.PaymentId);
            return StatusCode(500, new { error = "Zahlung konnte nicht bestätigt werden" });
        }
    }

    [HttpPost("checkout/webhook")]
    public async Task<IActionResult> Webhook()
    {
        string paymentId;
        using (var reader = new StreamReader(Request.Body))
        {
            var body = await reader.ReadToEndAsync();
            paymentId = body.Split('=').LastOrDefault()?.Trim() ?? "";
            if (body.Contains("id="))
                paymentId = System.Web.HttpUtility.ParseQueryString(body)["id"] ?? paymentId;
        }

        if (string.IsNullOrEmpty(paymentId))
        {
            _logger.LogWarning("Mollie webhook: keine Payment-ID erhalten");
            return Ok();
        }

        try
        {
            var payment = await _paymentClient.GetPaymentAsync(paymentId);

            if (payment.Status != PaymentStatus.Paid)
            {
                _logger.LogInformation("Mollie webhook: Payment {Id} noch nicht bezahlt ({Status})", paymentId, payment.Status);
                return Ok();
            }

            if (!TryDeserializeMetadata(payment.Metadata, out var meta) ||
                meta == null ||
                (meta.BikeId <= 0 && meta.ListingDisplayId <= 0))
            {
                _logger.LogWarning("Mollie webhook: Metadata konnte nicht gelesen werden für {Id}", paymentId);
                return Ok();
            }

            // 1. Sold bike/listing from showroom remove
            if (meta.BikeId > 0)
            {
                await _bicycleService.UnpublishFromWebsiteAsync(meta.BikeId);
            }
            else if (meta.ListingDisplayId > 0)
            {
                var listing = await _db.KleinanzeigenListings.FirstOrDefaultAsync(x => x.Id == meta.ListingDisplayId);
                if (listing != null)
                {
                    listing.IsActive = false;
                    listing.UpdatedAt = DateTime.UtcNow;
                    await _db.SaveChangesAsync();
                }
            }

            // 2. Online-Verkauf in DB speichern (idempotent by MolliePaymentId)
            var existingSale = await _db.OnlineSales.FirstOrDefaultAsync(x => x.MolliePaymentId == paymentId);
            if (existingSale == null)
            {
                var onlineSale = new OnlineSale
                {
                    BikeId = meta.ListingDisplayId > 0 ? meta.ListingDisplayId : meta.BikeId,
                    BikeTitle = meta.BikeTitle ?? $"Fahrrad #{meta.ListingDisplayId}",
                    Preis = meta.Price,
                    Vorname = meta.Vorname ?? "",
                    Nachname = meta.Nachname ?? "",
                    Email = meta.Email ?? "",
                    Adresse = meta.Adresse ?? "",
                    Abholtag = meta.Abholtag ?? "",
                    MolliePaymentId = paymentId,
                    IsVerarbeitet = false,
                    CreatedAt = DateTime.UtcNow
                };
                _db.OnlineSales.Add(onlineSale);
                await _db.SaveChangesAsync();
            }

            // 3. Admin-Benachrichtigung senden
            var adminEmail = _config["Smtp:AdminEmail"] ?? "info.bikehausfreiburg@gmail.com";
            await _emailService.SendOnlineSaleNotificationAsync(new(
                BikeTitle: meta.BikeTitle ?? $"Fahrrad #{meta.BikeId}",
                Price: meta.Price,
                Vorname: meta.Vorname ?? "",
                Nachname: meta.Nachname ?? "",
                Email: meta.Email ?? "",
                Adresse: meta.Adresse ?? "",
                Abholtag: meta.Abholtag ?? "",
                AdminEmail: adminEmail
            ));

            _logger.LogInformation("Online-Verkauf abgeschlossen: {Bike} an {Name}", meta.BikeTitle, $"{meta.Vorname} {meta.Nachname}");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Fehler beim Verarbeiten des Mollie-Webhooks für {Id}", paymentId);
        }

        return Ok();
    }

    private string ResolveBaseUrl(string preferredConfigKey)
    {
        var configured = _config[preferredConfigKey]
            ?? _config["App:BaseUrl"];

        if (!string.IsNullOrWhiteSpace(configured))
            return configured.TrimEnd('/');

        var requestBase = $"{Request.Scheme}://{Request.Host}";
        return requestBase.TrimEnd('/');
    }

    private static bool TryDeserializeMetadata(object? metadata, out OnlineOrderMeta? meta)
    {
        meta = null;

        if (metadata == null)
            return false;

        var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };

        try
        {
            if (metadata is JsonElement element)
            {
                meta = element.Deserialize<OnlineOrderMeta>(options);
                return meta != null;
            }

            if (metadata is string raw)
            {
                meta = JsonSerializer.Deserialize<OnlineOrderMeta>(raw, options);
                return meta != null;
            }

            meta = JsonSerializer.Deserialize<OnlineOrderMeta>(JsonSerializer.Serialize(metadata), options);
            return meta != null;
        }
        catch
        {
            return false;
        }
    }
}

public record CheckoutRequest(
    int BikeId,
    int ListingDisplayId,
    string? Lang,
    string Vorname,
    string Nachname,
    string Email,
    string Adresse,
    string Abholtag,
    List<CheckoutAccessoryRequest>? Accessories
);

public record CheckoutAccessoryRequest(
    int AccessoryId,
    int Quantity
);

public record ConfirmPaymentRequest(string PaymentId);

public class OnlineOrderMeta
{
    public int BikeId { get; set; }
    public int ListingDisplayId { get; set; }
    public string? BikeTitle { get; set; }
    public decimal Price { get; set; }
    public string? Vorname { get; set; }
    public string? Nachname { get; set; }
    public string? Email { get; set; }
    public string? Adresse { get; set; }
    public string? Abholtag { get; set; }
    public string? Lang { get; set; }
}
