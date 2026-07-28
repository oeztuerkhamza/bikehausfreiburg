using BikeHaus.Domain.Enums;

namespace BikeHaus.Domain.Entities;

public class Reservation : BaseEntity
{
    public int BicycleId { get; set; }
    public int CustomerId { get; set; }
    public DateTime ReservierungsDatum { get; set; } = DateTime.UtcNow;  // Reservation Date
    public DateTime AblaufDatum { get; set; }                            // Expiration Date
    public decimal? Anzahlung { get; set; }                              // Deposit amount (optional)
    public PaymentMethod? AnzahlungZahlungsart { get; set; }             // How the deposit was paid
    // Vereinbarter Verkaufspreis zum Zeitpunkt der Reservierung. Bewusst eine
    // eigene Spalte statt Bicycle.VerkaufspreisVorschlag: der Beleg muss den
    // Preis zeigen, der mit dem Kunden vereinbart wurde, auch wenn der
    // Vorschlagspreis am Fahrrad später geändert wird.
    public decimal? Verkaufspreis { get; set; }
    public string? KundenUnterschrift { get; set; }                      // base64 PNG
    public string? Notizen { get; set; }                                 // Notes
    public ReservationStatus Status { get; set; } = ReservationStatus.Active;
    public string ReservierungsNummer { get; set; } = string.Empty;      // Reservation Number

    // If converted to sale, link to the sale
    public int? SaleId { get; set; }

    // Navigation Properties
    public Bicycle Bicycle { get; set; } = null!;
    public Customer Customer { get; set; } = null!;
    public Sale? Sale { get; set; }
}
