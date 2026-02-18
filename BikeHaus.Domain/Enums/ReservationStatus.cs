namespace BikeHaus.Domain.Enums;

public enum ReservationStatus
{
    Active,      // Aktif rezervasyon
    Converted,   // Satışa dönüştürüldü
    Expired,     // Süresi doldu
    Cancelled    // İptal edildi
}
