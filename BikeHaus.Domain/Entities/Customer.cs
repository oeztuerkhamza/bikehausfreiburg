namespace BikeHaus.Domain.Entities;

public class Customer : BaseEntity
{
    public string Vorname { get; set; } = string.Empty;        // First Name
    public string Nachname { get; set; } = string.Empty;       // Last Name
    public string? Strasse { get; set; }                        // Street
    public string? Hausnummer { get; set; }                     // House Number
    public string? PLZ { get; set; }                            // Postal Code
    public string? Stadt { get; set; }                          // City
    public string? Telefon { get; set; }                        // Phone
    public string? Email { get; set; }

    public string FullName => $"{Vorname} {Nachname}";
    public string? FullAddress => Strasse != null ? $"{Strasse} {Hausnummer}, {PLZ} {Stadt}" : null;

    // Navigation Properties
    public ICollection<Purchase> Purchases { get; set; } = new List<Purchase>();
    public ICollection<Sale> Sales { get; set; } = new List<Sale>();
    public ICollection<Return> Returns { get; set; } = new List<Return>();
}
