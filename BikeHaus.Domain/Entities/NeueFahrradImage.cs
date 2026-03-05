namespace BikeHaus.Domain.Entities;

public class NeueFahrradImage : BaseEntity
{
    public int NeueFahrradId { get; set; }
    public string FilePath { get; set; } = string.Empty;
    public int SortOrder { get; set; }

    // Navigation property
    public NeueFahrrad Fahrrad { get; set; } = null!;
}
