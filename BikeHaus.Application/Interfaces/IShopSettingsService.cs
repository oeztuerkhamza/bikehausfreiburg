using BikeHaus.Application.DTOs;

namespace BikeHaus.Application.Interfaces;

public interface IShopSettingsService
{
    Task<ShopSettingsDto?> GetSettingsAsync();
    Task<ShopSettingsDto> UpdateSettingsAsync(UpdateShopSettingsDto dto);
    Task<ShopSettingsDto> UploadLogoAsync(UploadLogoDto dto);
    Task DeleteLogoAsync();
}
