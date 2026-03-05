namespace BikeHaus.Application.DTOs;

public class NeueFahrradDto
{
    public int Id { get; set; }
    public string Titel { get; set; } = string.Empty;
    public string? Beschreibung { get; set; }
    public decimal Preis { get; set; }
    public string? PreisText { get; set; }
    public string? Kategorie { get; set; }
    public string? Marke { get; set; }
    public string? Modell { get; set; }
    public string? Farbe { get; set; }
    public string? Rahmengroesse { get; set; }
    public string? Reifengroesse { get; set; }
    public string? Gangschaltung { get; set; }
    public string Zustand { get; set; } = "Neu";
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public List<NeueFahrradImageDto> Images { get; set; } = new();
}

public class NeueFahrradImageDto
{
    public int Id { get; set; }
    public string FilePath { get; set; } = string.Empty;
    public int SortOrder { get; set; }
}

public class NeueFahrradCreateDto
{
    public string Titel { get; set; } = string.Empty;
    public string? Beschreibung { get; set; }
    public decimal Preis { get; set; }
    public string? PreisText { get; set; }
    public string? Kategorie { get; set; }
    public string? Marke { get; set; }
    public string? Modell { get; set; }
    public string? Farbe { get; set; }
    public string? Rahmengroesse { get; set; }
    public string? Reifengroesse { get; set; }
    public string? Gangschaltung { get; set; }
    public string Zustand { get; set; } = "Neu";
}

public class NeueFahrradUpdateDto
{
    public string Titel { get; set; } = string.Empty;
    public string? Beschreibung { get; set; }
    public decimal Preis { get; set; }
    public string? PreisText { get; set; }
    public string? Kategorie { get; set; }
    public string? Marke { get; set; }
    public string? Modell { get; set; }
    public string? Farbe { get; set; }
    public string? Rahmengroesse { get; set; }
    public string? Reifengroesse { get; set; }
    public string? Gangschaltung { get; set; }
    public string Zustand { get; set; } = "Neu";
    public bool IsActive { get; set; } = true;
}

public class NeueFahrradCategoryDto
{
    public string Name { get; set; } = string.Empty;
    public int Count { get; set; }
}
