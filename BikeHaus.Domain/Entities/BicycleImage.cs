namespace BikeHaus.Domain.Entities;

public class BicycleImage : BaseEntity
{
    public int BicycleId { get; set; }
    public string FilePath { get; set; } = string.Empty;
    public int SortOrder { get; set; }

    // Navigation
    public Bicycle Bicycle { get; set; } = null!;
}
