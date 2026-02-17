using BikeHaus.Application.DTOs;
using BikeHaus.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace BikeHaus.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SettingsController : ControllerBase
{
    private readonly IShopSettingsService _settingsService;

    public SettingsController(IShopSettingsService settingsService)
    {
        _settingsService = settingsService;
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

    [HttpPut]
    public async Task<ActionResult<ShopSettingsDto>> UpdateSettings([FromBody] UpdateShopSettingsDto dto)
    {
        var settings = await _settingsService.UpdateSettingsAsync(dto);
        return Ok(settings);
    }

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

    [HttpDelete("logo")]
    public async Task<IActionResult> DeleteLogo()
    {
        await _settingsService.DeleteLogoAsync();
        return NoContent();
    }
}
