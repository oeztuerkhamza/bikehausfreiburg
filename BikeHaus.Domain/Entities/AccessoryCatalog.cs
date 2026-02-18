namespace BikeHaus.Domain.Entities;

/// <summary>
/// Catalog of accessories/parts that can be added to sales (e.g., helmet, lock, lights)
/// </summary>
public class AccessoryCatalog : BaseEntity
{
    public string Bezeichnung { get; set; } = string.Empty;  // Name/Description
    public decimal Standardpreis { get; set; }               // Default price
    public string? Kategorie { get; set; }                   // Category (optional)
    public bool Aktiv { get; set; } = true;                  // Active/available
}
