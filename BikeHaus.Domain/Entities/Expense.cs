namespace BikeHaus.Domain.Entities;

/// <summary>
/// Represents a shop expense (e.g., buying accessories, parts, supplies for the shop).
/// These appear as costs/expenses in the statistics.
/// </summary>
public class Expense : BaseEntity
{
    public string Bezeichnung { get; set; } = string.Empty;     // Description/Name
    public string? Kategorie { get; set; }                       // Category (e.g., Zubehör, Werkzeug, etc.)
    public decimal Betrag { get; set; }                          // Amount
    public DateTime Datum { get; set; } = DateTime.UtcNow;       // Date
    public string? Lieferant { get; set; }                       // Supplier
    public string? BelegNummer { get; set; }                     // Receipt number
    public string? Notizen { get; set; }                         // Notes
}
