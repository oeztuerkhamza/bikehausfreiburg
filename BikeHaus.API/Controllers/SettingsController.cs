using BikeHaus.Application.DTOs;
using BikeHaus.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.ComponentModel.DataAnnotations;

namespace BikeHaus.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SettingsController : ControllerBase
{
    private readonly IShopSettingsService _settingsService;
    private readonly IEmailService _emailService;

    public SettingsController(IShopSettingsService settingsService, IEmailService emailService)
    {
        _settingsService = settingsService;
        _emailService = emailService;
    }

    [HttpGet]
    public async Task<ActionResult<ShopSettingsDto>> GetSettings()
    {
        var settings = await _settingsService.GetSettingsAsync();
        if (settings == null)
        {
            // Return default settings if none exist
            return Ok(new ShopSettingsDto
            {
                ShopName = "Bike Haus Freiburg"
            });
        }
        return Ok(settings);
    }

    [Authorize]
    [HttpPut]
    public async Task<ActionResult<ShopSettingsDto>> UpdateSettings([FromBody] UpdateShopSettingsDto dto)
    {
        var settings = await _settingsService.UpdateSettingsAsync(dto);
        return Ok(settings);
    }

    [Authorize]
    [HttpPost("logo")]
    public async Task<ActionResult<ShopSettingsDto>> UploadLogo([FromBody] UploadLogoDto dto)
    {
        if (string.IsNullOrEmpty(dto.LogoBase64))
        {
            return BadRequest("Logo data is required");
        }

        var settings = await _settingsService.UploadLogoAsync(dto);
        return Ok(settings);
    }

    [Authorize]
    [HttpDelete("logo")]
    public async Task<IActionResult> DeleteLogo()
    {
        await _settingsService.DeleteLogoAsync();
        return NoContent();
    }

    [Authorize]
    [HttpPost("owner-signature")]
    public async Task<ActionResult<ShopSettingsDto>> UploadOwnerSignature([FromBody] UploadSignatureDto dto)
    {
        if (string.IsNullOrEmpty(dto.SignatureBase64))
        {
            return BadRequest("Signature data is required");
        }

        var settings = await _settingsService.UploadOwnerSignatureAsync(dto);
        return Ok(settings);
    }

    [Authorize]
    [HttpDelete("owner-signature")]
    public async Task<IActionResult> DeleteOwnerSignature()
    {
        await _settingsService.DeleteOwnerSignatureAsync();
        return NoContent();
    }

    [Authorize]
    [HttpPost("test-email")]
    public async Task<IActionResult> TestEmail([FromBody] TestEmailDto dto)
    {
        try
        {
            await _emailService.SendRentalBookingReceivedAsync(new RentalBookingEmailModel(
                ToEmail: dto.ToEmail,
                ToName: "Test (SMTP-Verbindungstest)",
                BuchungsNummer: "TEST-001",
                BikeBrand: "Test",
                BikeModel: "Fahrrad",
                FrameNumber: null,
                FrameSize: null,
                Color: null,
                StartDate: DateTime.Today,
                EndDate: DateTime.Today.AddDays(3),
                Days: 3,
                TotalPrice: null,
                Deposit: null,
                AccessoriesText: "-",
                PickupLocation: "Bike Haus Freiburg, Freiburg",
                ShopPhone: "",
                ShopEmail: "no-reply@bikehausfreiburg.com",
                Language: "de",
                SelfCancelUrl: null
            ));
            return Ok(new { message = $"Test-E-Mail wurde an {dto.ToEmail} gesendet." });
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }
}

public class TestEmailDto
{
    [Required]
    [EmailAddress]
    public string ToEmail { get; set; } = "";
}
