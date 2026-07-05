namespace BikeHaus.Domain.Entities;

public class RentalAccessory : BaseEntity
{
    public string Bezeichnung { get; set; } = string.Empty;
    public decimal Tagespreis { get; set; }
    public decimal? Verlustgebuehr { get; set; }
    public bool Aktiv { get; set; } = true;
    public string? Beschreibung { get; set; }

    // Relativer Pfad zum Zubehör-Foto (wird über /uploads ausgeliefert).
    public string? BildPfad { get; set; }
}
