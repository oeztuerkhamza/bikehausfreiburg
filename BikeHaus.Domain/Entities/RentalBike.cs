using BikeHaus.Domain.Enums;

namespace BikeHaus.Domain.Entities;

public class RentalBike : BaseEntity
{
    public int RentalId { get; set; }
    public int BicycleId { get; set; }

    // Snapshot fields captured at handover (preserved if Bicycle changes later)
    public string? Rahmennummer { get; set; }
    public string? Farbe { get; set; }

    // Per-bike rental window (bikes in the same Rental can have different periods,
    // mirroring the RentalBookingBike model)
    public DateTime StartDatum { get; set; }
    public DateTime EndDatum { get; set; }

    // Per-bike rental price (excluding accessories). Sum across bikes feeds Rental.Gesamtmiete.
    public decimal Mietpreis { get; set; }

    // Per-bike deposit; sum feeds Rental.Kaution
    public decimal Kaution { get; set; }
    public bool KautionZurueckgegeben { get; set; } = false;
    public string? KautionRueckgabeUnterschrift { get; set; }

    // Zeitpunkt der Kautionsrückgabe. Eigenes Feld statt UpdatedAt, weil jede
    // spätere Änderung am Mietvertrag UpdatedAt überschreibt — der Beleg soll
    // auch beim erneuten Herunterladen das richtige Datum zeigen.
    public DateTime? KautionRueckgabeDatum { get; set; }

    // Condition at handover is tracked per bike
    public BikeConditionAtHandover ZustandBeiUebergabe { get; set; } = BikeConditionAtHandover.Gut;

    // Return checklist — filled when the bike is handed back
    public BikeConditionAtHandover? ZustandBeiRueckgabe { get; set; }
    public decimal SchadenAbzug { get; set; } = 0;        // damage deduction
    public decimal VerspaetungsAbzug { get; set; } = 0;   // late-return fee
    public DateTime? TatsaechlichesRueckgabeDatum { get; set; }
    public string? AbzugNotizen { get; set; }

    // Navigation
    public Rental Rental { get; set; } = null!;
    public Bicycle Bicycle { get; set; } = null!;
}
