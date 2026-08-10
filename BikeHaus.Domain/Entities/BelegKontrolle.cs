namespace BikeHaus.Domain.Entities;

/// <summary>
/// Häkchen je Beleg in der Belegübersicht: "in Flatpay verbucht".
///
/// Bewusst eine eigene Tabelle statt einer Spalte an Sale/Rental/Purchase:
/// die Belegübersicht mischt drei Belegarten, und das Häkchen ist reine
/// Buchhaltungs-Kontrolle — es gehört nicht in den Beleg selbst.
/// Ein Eintrag entsteht erst, wenn das Häkchen zum ersten Mal gesetzt wird.
/// </summary>
public class BelegKontrolle : BaseEntity
{
    /// <summary>Belegart: "Miete", "Verkauf" oder "Ankauf".</summary>
    public string Art { get; set; } = string.Empty;

    /// <summary>Id des Belegs innerhalb seiner Art (Rental-, Sale- bzw. Purchase-Id).</summary>
    public int BelegId { get; set; }

    /// <summary>Beleg ist in Flatpay kontrolliert/verbucht.</summary>
    public bool Flatpay { get; set; }
}
