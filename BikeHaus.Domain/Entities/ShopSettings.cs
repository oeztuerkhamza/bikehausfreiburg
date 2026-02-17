namespace BikeHaus.Domain.Entities;

public class ShopSettings : BaseEntity
{
    // Shop Information
    public string ShopName { get; set; } = string.Empty;
    public string? Strasse { get; set; }
    public string? Hausnummer { get; set; }
    public string? PLZ { get; set; }
    public string? Stadt { get; set; }
    public string? Telefon { get; set; }
    public string? Email { get; set; }
    public string? Website { get; set; }
    public string? Steuernummer { get; set; }      // Tax Number
    public string? UstIdNr { get; set; }           // VAT ID
    public string? Bankname { get; set; }
    public string? IBAN { get; set; }
    public string? BIC { get; set; }
    
    // Logo (stored as base64 or file path)
    public string? LogoBase64 { get; set; }
    public string? LogoFileName { get; set; }
    
    // Additional Info
    public string? Oeffnungszeiten { get; set; }   // Opening Hours
    public string? Zusatzinfo { get; set; }        // Additional Info for documents

    public string FullAddress => !string.IsNullOrEmpty(Strasse) 
        ? $"{Strasse} {Hausnummer}, {PLZ} {Stadt}" 
        : string.Empty;
}
