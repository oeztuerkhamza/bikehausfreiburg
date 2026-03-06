namespace BikeHaus.Domain.Entities;

public class RepairShowcaseImage : BaseEntity
{
    public int RepairShowcaseId { get; set; }
    public string FilePath { get; set; } = string.Empty;
    public int SortOrder { get; set; }

    // Navigation property
    public RepairShowcase RepairShowcase { get; set; } = null!;
}
