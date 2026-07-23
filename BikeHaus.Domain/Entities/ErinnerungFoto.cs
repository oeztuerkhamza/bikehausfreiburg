namespace BikeHaus.Domain.Entities;

public class ErinnerungFoto : BaseEntity
{
    public int ErinnerungId { get; set; }
    public string FilePath { get; set; } = string.Empty;   // "/uploads/memories/{id}/{guid}.jpg"
    public int SortOrder { get; set; }

    // Navigation property
    public Erinnerung Erinnerung { get; set; } = null!;
}
