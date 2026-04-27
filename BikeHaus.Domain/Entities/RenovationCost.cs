namespace BikeHaus.Domain.Entities;

public class RenovationCost : BaseEntity
{
    public DateTime Datum { get; set; } = DateTime.UtcNow;
    public decimal Betrag { get; set; }
    public string GemachteArbeit { get; set; } = string.Empty; // Work done
    public string? Notizen { get; set; }
}
