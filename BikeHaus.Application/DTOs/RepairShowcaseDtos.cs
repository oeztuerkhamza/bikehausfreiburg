namespace BikeHaus.Application.DTOs;

public class RepairShowcaseDto
{
    public int Id { get; set; }
    public string Titel { get; set; } = string.Empty;
    public string? Beschreibung { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public List<RepairShowcaseImageDto> Images { get; set; } = new();
}

public class RepairShowcaseImageDto
{
    public int Id { get; set; }
    public string FilePath { get; set; } = string.Empty;
    public int SortOrder { get; set; }
}

public class RepairShowcaseCreateDto
{
    public string Titel { get; set; } = string.Empty;
    public string? Beschreibung { get; set; }
}

public class RepairShowcaseUpdateDto
{
    public string Titel { get; set; } = string.Empty;
    public string? Beschreibung { get; set; }
    public bool IsActive { get; set; } = true;
}
