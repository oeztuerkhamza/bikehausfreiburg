using BikeHaus.Domain.Enums;

namespace BikeHaus.Domain.Entities;

public class Rental : BaseEntity
{
    // Mietvertrag-Nummer
    public string MietvertragNummer { get; set; } = string.Empty;

    // Mieter (Renter)
    public int CustomerId { get; set; }

    // Overall rental window (typically the union of per-bike periods)
    public DateTime StartDatum { get; set; }
    public DateTime EndDatum { get; set; }

    // Aggregate totals — denormalised sums across Bikes
    public decimal Gesamtmiete { get; set; }  // Sum of Bikes.Mietpreis (after Rabatt)
    public decimal Rabatt { get; set; }
    public decimal Kaution { get; set; }      // Sum of Bikes.Kaution

    // Single payment method for the whole rental
    public PaymentMethod Zahlungsart { get; set; } = PaymentMethod.Bar;
    public PaymentMethod KautionZahlungsart { get; set; } = PaymentMethod.Bar;

    // Status (applies to all bikes in this rental)
    public RentalStatus Status { get; set; } = RentalStatus.Active;

    // Zeitpunkt der Rückgabe (gesetzt, wenn Status → Returned). Stabiler Anker
    // für die automatische Erinnerungs-Einladung (Folgetag 08:00).
    public DateTime? RueckgabeAt { get; set; }

    // Notizen
    public string? Notizen { get; set; }

    // Ausweisfoto Vorderseite. Der Feldname stammt aus der Zeit vor der
    // Rückseite (Migration AddAusweisPhotoPath) und wurde absichtlich NICHT
    // umbenannt, damit bestehende Mietverträge ihr Foto ohne Datenmigration
    // behalten — dieses Feld ist die Vorderseite, AusweisPhotoRueckseitePath
    // ist die Rückseite.
    public string? AusweisPhotoPath { get; set; }
    public string? AusweisPhotoRueckseitePath { get; set; }

    // Mieter-Unterschrift & AGB-Bestätigung
    public string? MieterUnterschrift { get; set; }  // base64 PNG
    public bool AgbAkzeptiert { get; set; }
    public string? UnterschriftOrt { get; set; }

    // Navigation Properties
    public Customer Customer { get; set; } = null!;
    public ICollection<RentalBike> Bikes { get; set; } = new List<RentalBike>();
    public ICollection<RentalAccessoryItem> Accessories { get; set; } = new List<RentalAccessoryItem>();
}
