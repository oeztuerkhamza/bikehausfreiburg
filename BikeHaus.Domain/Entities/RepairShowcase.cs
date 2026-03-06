namespace BikeHaus.Domain.Entities;

public class RepairShowcase : BaseEntity
{
    public string Titel { get; set; } = string.Empty;
    public string? Beschreibung { get; set; }
    public bool IsActive { get; set; } = true;

    // Navigation property
    public List<RepairShowcaseImage> Images { get; set; } = new();
}
