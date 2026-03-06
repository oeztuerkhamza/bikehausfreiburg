namespace BikeHaus.Domain.Entities;

public class HomepageAccessoryImage : BaseEntity
{
    public int HomepageAccessoryId { get; set; }
    public string FilePath { get; set; } = string.Empty;
    public int SortOrder { get; set; }

    // Navigation property
    public HomepageAccessory Accessory { get; set; } = null!;
}
