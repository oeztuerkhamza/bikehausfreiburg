using BikeHaus.Application.DTOs;
using BikeHaus.Application.Interfaces;
using BikeHaus.Domain.Entities;
using BikeHaus.Domain.Interfaces;

namespace BikeHaus.Application.Services;

public class ShopSettingsService : IShopSettingsService
{
    private readonly IShopSettingsRepository _repository;

    public ShopSettingsService(IShopSettingsRepository repository)
    {
        _repository = repository;
    }

    public async Task<ShopSettingsDto?> GetSettingsAsync()
    {
        var settings = await _repository.GetSettingsAsync();
        if (settings == null) return null;

        return MapToDto(settings);
    }

    public async Task<ShopSettingsDto> UpdateSettingsAsync(UpdateShopSettingsDto dto)
    {
        var settings = await _repository.GetSettingsAsync();

        if (settings == null)
        {
            // Create new settings if none exist
            settings = new ShopSettings
            {
                ShopName = dto.ShopName,
                Strasse = dto.Strasse,
                Hausnummer = dto.Hausnummer,
                PLZ = dto.PLZ,
                Stadt = dto.Stadt,
                Telefon = dto.Telefon,
                Email = dto.Email,
                Website = dto.Website,
                Steuernummer = dto.Steuernummer,
                UstIdNr = dto.UstIdNr,
                Bankname = dto.Bankname,
                IBAN = dto.IBAN,
                BIC = dto.BIC,
                Oeffnungszeiten = dto.Oeffnungszeiten,
                Zusatzinfo = dto.Zusatzinfo
            };
            await _repository.AddAsync(settings);
        }
        else
        {
            // Update existing settings
            settings.ShopName = dto.ShopName;
            settings.Strasse = dto.Strasse;
            settings.Hausnummer = dto.Hausnummer;
            settings.PLZ = dto.PLZ;
            settings.Stadt = dto.Stadt;
            settings.Telefon = dto.Telefon;
            settings.Email = dto.Email;
            settings.Website = dto.Website;
            settings.Steuernummer = dto.Steuernummer;
            settings.UstIdNr = dto.UstIdNr;
            settings.Bankname = dto.Bankname;
            settings.IBAN = dto.IBAN;
            settings.BIC = dto.BIC;
            settings.Oeffnungszeiten = dto.Oeffnungszeiten;
            settings.Zusatzinfo = dto.Zusatzinfo;
            settings.UpdatedAt = DateTime.UtcNow;

            await _repository.UpdateAsync(settings);
        }

        return MapToDto(settings);
    }

    public async Task<ShopSettingsDto> UploadLogoAsync(UploadLogoDto dto)
    {
        var settings = await _repository.GetSettingsAsync();

        if (settings == null)
        {
            settings = new ShopSettings
            {
                ShopName = "Bike Haus Freiburg",
                LogoBase64 = dto.LogoBase64,
                LogoFileName = dto.FileName
            };
            await _repository.AddAsync(settings);
        }
        else
        {
            settings.LogoBase64 = dto.LogoBase64;
            settings.LogoFileName = dto.FileName;
            settings.UpdatedAt = DateTime.UtcNow;
            await _repository.UpdateAsync(settings);
        }

        return MapToDto(settings);
    }

    public async Task DeleteLogoAsync()
    {
        var settings = await _repository.GetSettingsAsync();
        if (settings != null)
        {
            settings.LogoBase64 = null;
            settings.LogoFileName = null;
            settings.UpdatedAt = DateTime.UtcNow;
            await _repository.UpdateAsync(settings);
        }
    }

    private static ShopSettingsDto MapToDto(ShopSettings settings)
    {
        return new ShopSettingsDto
        {
            Id = settings.Id,
            ShopName = settings.ShopName,
            Strasse = settings.Strasse,
            Hausnummer = settings.Hausnummer,
            PLZ = settings.PLZ,
            Stadt = settings.Stadt,
            Telefon = settings.Telefon,
            Email = settings.Email,
            Website = settings.Website,
            Steuernummer = settings.Steuernummer,
            UstIdNr = settings.UstIdNr,
            Bankname = settings.Bankname,
            IBAN = settings.IBAN,
            BIC = settings.BIC,
            LogoBase64 = settings.LogoBase64,
            LogoFileName = settings.LogoFileName,
            Oeffnungszeiten = settings.Oeffnungszeiten,
            Zusatzinfo = settings.Zusatzinfo,
            FullAddress = settings.FullAddress
        };
    }
}
