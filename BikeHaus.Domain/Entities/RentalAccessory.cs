namespace BikeHaus.Domain.Entities;

public class RentalAccessory : BaseEntity
{
    public string Bezeichnung { get; set; } = string.Empty;
    public decimal Tagespreis { get; set; }
    public decimal? Verlustgebuehr { get; set; }

    /// <summary>
    /// true = der Preis gilt einmal pro Vermietung statt je Miettag
    /// (z. B. Reparaturset oder Schlauch, den der Mieter behält).
    /// false = Tagespreis, wird mit den Miettagen multipliziert.
    /// </summary>
    public bool Einmalig { get; set; }
    public bool Aktiv { get; set; } = true;
    public string? Beschreibung { get; set; }

    // Relativer Pfad zum Zubehör-Foto (wird über /uploads ausgeliefert).
    public string? BildPfad { get; set; }
}
