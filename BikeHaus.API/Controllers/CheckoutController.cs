using System.Globalization;
using BikeHaus.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Mollie.Api.Client.Abstract;
using Mollie.Api.Models;
using Mollie.Api.Models.Payment.Request;

namespace BikeHaus.API.Controllers;

[ApiController]
[Route("api/public")]
public class CheckoutController : ControllerBase
{
    private readonly IBicycleService _bicycleService;
    private readonly IPaymentClient _paymentClient;
    private readonly IConfiguration _config;

    public CheckoutController(
        IBicycleService bicycleService,
        IPaymentClient paymentClient,
        IConfiguration config)
    {
        _bicycleService = bicycleService;
        _paymentClient = paymentClient;
        _config = config;
    }

    [HttpPost("checkout/create-session")]
    public async Task<IActionResult> CreateSession([FromBody] CheckoutRequest req)
    {
        var bike = await _bicycleService.GetPublishedBicycleByIdAsync(req.BikeId);
        if (bike == null) return NotFound(new { error = "Fahrrad nicht gefunden" });
        if (bike.Preis == null || bike.Preis <= 0)
            return BadRequest(new { error = "Preis nicht verfügbar" });

        var baseUrl = _config["App:BaseUrl"]?.TrimEnd('/') ?? "https://bikehausfreiburg.com";
        var lang = req.Lang ?? "de";
        var amountStr = bike.Preis.Value.ToString("F2", CultureInfo.InvariantCulture);

        var paymentRequest = new PaymentRequest
        {
            Amount = new Amount(Currency.EUR, amountStr),
            Description = $"Fahrrad: {bike.Marke} {bike.Modell}",
            RedirectUrl = $"{baseUrl}/{lang}/showroom/danke?listing={req.ListingDisplayId}&bike={req.BikeId}",
            WebhookUrl = $"{baseUrl}/api/public/checkout/webhook",
        };

        var payment = await _paymentClient.CreatePaymentAsync(paymentRequest);
        return Ok(new { checkoutUrl = payment.Links.Checkout.Href });
    }

    [HttpPost("checkout/webhook")]
    public IActionResult Webhook()
    {
        // Mollie webhook — future: mark bike as sold
        return Ok();
    }
}

public record CheckoutRequest(int BikeId, int ListingDisplayId, string? Lang);
