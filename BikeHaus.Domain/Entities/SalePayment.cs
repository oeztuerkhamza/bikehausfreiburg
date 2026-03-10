using BikeHaus.Domain.Enums;

namespace BikeHaus.Domain.Entities;

public class SalePayment : BaseEntity
{
    public int SaleId { get; set; }
    public PaymentMethod Zahlungsart { get; set; }
    public decimal Betrag { get; set; }

    // Navigation
    public Sale Sale { get; set; } = null!;
}
