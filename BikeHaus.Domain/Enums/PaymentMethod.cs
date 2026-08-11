namespace BikeHaus.Domain.Enums;

public enum PaymentMethod
{
    Bar,            // Cash
    PayPal,
    Karte,          // Card
    Überweisung,    // Bank transfer
    // Neue Werte immer ANHÄNGEN: der Wert wird als Zahl gespeichert, ein
    // Einschub würde bestehende Belege umdeuten.
    Raten,          // Ratenzahlung (Verkauf) — Laufzeit steht in SalePayment.RatenMonate
    // Nur für Rental.KautionZahlungsart: es wurde gar keine Kaution genommen.
    // Die Kaution ist dann zwingend 0 (siehe RentalService).
    OhneKaution
}
