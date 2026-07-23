namespace BikeHaus.Domain.Entities;

/// <summary>
/// Kundenerinnerung ("Anı Köşesi") — vom Kunden über das öffentliche Formular
/// eingereichte Foto-Erinnerung einer Radtour. Wird erst nach Freigabe
/// (Onaylandi) öffentlich angezeigt.
/// </summary>
public class Erinnerung : BaseEntity
{
    public string Ad { get; set; } = string.Empty;          // Name des Kunden
    public int? Alter { get; set; }                         // Alter des Kunden
    public string Land { get; set; } = string.Empty;        // Land / Herkunft
    public string Geschichte { get; set; } = string.Empty;  // Kurze Geschichte (2-3 Sätze)
    public string? Email { get; set; }                      // Nur zur Verifizierung/Kontakt — NIE öffentlich
    public int Aufrufe { get; set; } = 0;                   // Öffentliche Anzeige-Zähler
    public bool Onaylandi { get; set; } = false;            // Freigabe-Flag (wie RentalReview)
    public string? AdminNotiz { get; set; }

    // Navigation property
    public List<ErinnerungFoto> Fotos { get; set; } = new();
}
