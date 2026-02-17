namespace BikeHaus.Application.DTOs;

public class ShopSettingsDto
{
    public int Id { get; set; }
    public string ShopName { get; set; } = string.Empty;
    public string? Strasse { get; set; }
    public string? Hausnummer { get; set; }
    public string? PLZ { get; set; }
    public string? Stadt { get; set; }
    public string? Telefon { get; set; }
    public string? Email { get; set; }
    public string? Website { get; set; }
    public string? Steuernummer { get; set; }
    public string? UstIdNr { get; set; }
    public string? Bankname { get; set; }
    public string? IBAN { get; set; }
    public string? BIC { get; set; }
    public string? LogoBase64 { get; set; }
    public string? LogoFileName { get; set; }
    public string? Oeffnungszeiten { get; set; }
    public string? Zusatzinfo { get; set; }
    public string? FullAddress { get; set; }
}

public class UpdateShopSettingsDto
{
    public string ShopName { get; set; } = string.Empty;
    public string? Strasse { get; set; }
    public string? Hausnummer { get; set; }
    public string? PLZ { get; set; }
    public string? Stadt { get; set; }
    public string? Telefon { get; set; }
    public string? Email { get; set; }
    public string? Website { get; set; }
    public string? Steuernummer { get; set; }
    public string? UstIdNr { get; set; }
    public string? Bankname { get; set; }
    public string? IBAN { get; set; }
    public string? BIC { get; set; }
    public string? Oeffnungszeiten { get; set; }
    public string? Zusatzinfo { get; set; }
}

public class UploadLogoDto
{
    public string LogoBase64 { get; set; } = string.Empty;
    public string FileName { get; set; } = string.Empty;
}
