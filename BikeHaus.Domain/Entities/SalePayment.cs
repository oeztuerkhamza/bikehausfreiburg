using BikeHaus.Domain.Enums;

namespace BikeHaus.Domain.Entities;

public class SalePayment : BaseEntity
{
    public int SaleId { get; set; }
    public PaymentMethod Zahlungsart { get; set; }
    public decimal Betrag { get; set; }

    // Laufzeit in Monaten — nur bei Zahlungsart.Raten gesetzt. Steht an der
    // Zahlung statt am Verkauf, damit die Monatsrate direkt aus dem
    // finanzierten Betrag dieser Zeile folgt (Anzahlung bar, Rest in Raten).
    public int? RatenMonate { get; set; }

    // Monatsrate; letzte Rate trägt den Rundungsrest.
    public decimal? MonatsRate => RatenMonate is > 0 ? Math.Round(Betrag / RatenMonate.Value, 2) : null;

    // Navigation
    public Sale Sale { get; set; } = null!;
}
