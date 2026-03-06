namespace BikeHaus.Domain.Entities;

public class HomepageAccessory : BaseEntity
{
    public string Titel { get; set; } = string.Empty;
    public string? Beschreibung { get; set; }
    public decimal Preis { get; set; }
    public string? PreisText { get; set; }
    public string? Kategorie { get; set; }
    public string? Marke { get; set; }
    public bool IsActive { get; set; } = true;

    // Navigation property
    public List<HomepageAccessoryImage> Images { get; set; } = new();
}
