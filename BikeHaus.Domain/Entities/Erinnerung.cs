namespace BikeHaus.Domain.Entities;

/// <summary>
/// Kundenerinnerung ("Anı Köşesi") — vom Kunden über das öffentliche Formular
/// eingereichte Foto-Erinnerung einer Radtour. Wird erst nach Freigabe
/// (Onaylandi) öffentlich angezeigt.
/// </summary>
public class Erinnerung : BaseEntity
{
    public string Ad { get; set; } = string.Empty;          // Name des Kunden
    public string Ort { get; set; } = string.Empty;         // Ausflugsziel / Ort
    public string Geschichte { get; set; } = string.Empty;  // Kurze Geschichte (2-3 Sätze)
    public bool Onaylandi { get; set; } = false;            // Freigabe-Flag (wie RentalReview)
    public string? AdminNotiz { get; set; }

    // Navigation property
    public List<ErinnerungFoto> Fotos { get; set; } = new();
}
