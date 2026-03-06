namespace BikeHaus.Domain.Entities;

public class Invoice : BaseEntity
{
    public string RechnungsNummer { get; set; } = string.Empty;    // Invoice number
    public DateTime Datum { get; set; } = DateTime.UtcNow;          // Date
    public decimal Betrag { get; set; }                             // Amount
    public string Bezeichnung { get; set; } = string.Empty;         // Description (e.g., Zubehör)
    public string? Kategorie { get; set; }                          // Category
    public string? KundenName { get; set; }                         // Customer name
    public string? KundenAdresse { get; set; }                      // Customer address
    public string? Notizen { get; set; }                            // Notes
}
