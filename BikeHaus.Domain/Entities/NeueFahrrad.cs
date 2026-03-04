namespace BikeHaus.Domain.Entities;

public class NeueFahrrad : BaseEntity
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

    // Navigation property
    public List<NeueFahrradImage> Images { get; set; } = new();
}
