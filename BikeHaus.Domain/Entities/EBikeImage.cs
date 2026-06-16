namespace BikeHaus.Domain.Entities;

public class EBikeImage : BaseEntity
{
    public int EBikeId { get; set; }
    public string FilePath { get; set; } = string.Empty;
    public int SortOrder { get; set; }

    // Navigation property
    public EBike EBike { get; set; } = null!;
}
