namespace BikeHaus.Application.DTOs;

public class HomepageAccessoryDto
{
    public int Id { get; set; }
    public string Titel { get; set; } = string.Empty;
    public string? Beschreibung { get; set; }
    public decimal Preis { get; set; }
    public string? PreisText { get; set; }
    public string? Kategorie { get; set; }
    public string? Marke { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public List<HomepageAccessoryImageDto> Images { get; set; } = new();
}

public class HomepageAccessoryImageDto
{
    public int Id { get; set; }
    public string FilePath { get; set; } = string.Empty;
    public int SortOrder { get; set; }
}

public class HomepageAccessoryCreateDto
{
    public string Titel { get; set; } = string.Empty;
    public string? Beschreibung { get; set; }
    public decimal Preis { get; set; }
    public string? PreisText { get; set; }
    public string? Kategorie { get; set; }
    public string? Marke { get; set; }
}

public class HomepageAccessoryUpdateDto
{
    public string Titel { get; set; } = string.Empty;
    public string? Beschreibung { get; set; }
    public decimal Preis { get; set; }
    public string? PreisText { get; set; }
    public string? Kategorie { get; set; }
    public string? Marke { get; set; }
    public bool IsActive { get; set; } = true;
}

public class HomepageAccessoryCategoryDto
{
    public string Name { get; set; } = string.Empty;
    public int Count { get; set; }
}
