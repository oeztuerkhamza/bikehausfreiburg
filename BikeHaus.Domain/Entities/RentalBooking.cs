using BikeHaus.Domain.Enums;

namespace BikeHaus.Domain.Entities;

public class RentalBooking : BaseEntity
{
    public int BicycleId { get; set; }
    public string BuchungsNummer { get; set; } = string.Empty;

    public DateTime StartDatum { get; set; }
    public DateTime EndDatum { get; set; }
    public string? Abholzeit { get; set; }                      // Pickup time on the start day, "HH:mm"

    public string Vorname { get; set; } = string.Empty;
    public string Nachname { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? Telefon { get; set; }
    public string? Strasse { get; set; }
    public string? HausNr { get; set; }
    public string? PLZ { get; set; }
    public string? Ort { get; set; }
    public string? Sprache { get; set; }

    public string? Notizen { get; set; }
    public string? AdminNotizen { get; set; }

    // Ausweisfoto Vorderseite; siehe Kommentar in Rental.AusweisPhotoPath —
    // der Name blieb aus Kompatibilitätsgründen erhalten, bezeichnet aber
    // die Vorderseite. AusweisPhotoRueckseitePath ist die Rückseite.
    public string? AusweisPhotoPath { get; set; }
    public string? AusweisPhotoRueckseitePath { get; set; }

    public decimal? Gesamtpreis { get; set; }
    public RentalBookingStatus Status { get; set; } = RentalBookingStatus.Pending;

    public DateTime? ApprovedAt { get; set; }
    public DateTime? CancelledAt { get; set; }
    public string? MieterUnterschrift { get; set; }

    // Versandmarker fuer die automatische Erinnerungsmail vor der Abholung
    // (RentalBookingReminderBackgroundService). Darf nur einmal rausgehen; der
    // Zeitstempel wird direkt nach erfolgreichem Versand gesetzt, damit ein
    // spaeterer Lauf sie nicht erneut verschickt.
    public DateTime? ErinnerungGesendetAm { get; set; }

    public Bicycle Bicycle { get; set; } = null!;
    public ICollection<RentalBookingAccessory> Accessories { get; set; } = new List<RentalBookingAccessory>();
    public ICollection<RentalBookingBike> Bikes { get; set; } = new List<RentalBookingBike>();
}
