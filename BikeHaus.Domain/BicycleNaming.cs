using System.Text.RegularExpressions;

namespace BikeHaus.Domain;

/// <summary>
/// Sortierhilfen für Fahrradnamen.
/// </summary>
public static partial class BicycleNaming
{
    /// <summary>
    /// Führende Bestandsnummer in <c>Marke</c>, z. B. "14 - Cube Trekking" oder
    /// "E12- Conway 625". Bei E-Bikes steht ein Buchstabe vor der Nummer, und
    /// das Leerzeichen vor dem Bindestrich fehlt teilweise.
    /// </summary>
    [GeneratedRegex(@"^\s*[A-Za-z]?\d+\s*[-–]\s*", RegexOptions.CultureInvariant)]
    private static partial Regex LeadingIndexRegex();

    /// <summary>
    /// Sortierschlüssel für <c>Marke</c>: ohne die vorangestellte Bestandsnummer.
    ///
    /// Ohne dieses Abschneiden sortiert die Nummer als Text — 1, 10, 11, …, 2, 20 —
    /// und reißt damit die Marken auseinander: "10 - Ideal" landet zwischen
    /// "1 - Prophete" und "11 - Prophete". Verglichen wird zusätzlich
    /// case-insensitiv, weil dieselbe Marke im Bestand als "Ideal", "IDEAL" und
    /// "ideal" vorkommt und sonst an drei Stellen einsortiert würde.
    /// </summary>
    public static string SortKey(string? marke) =>
        LeadingIndexRegex().Replace(marke ?? string.Empty, string.Empty).Trim();

    /// <summary>Vergleicher für die Namenssortierung (Marke, dann Modell).</summary>
    public static readonly StringComparer NameComparer =
        StringComparer.InvariantCultureIgnoreCase;

    /// <summary>
    /// E-Bike anhand des Fahrradtyps. Zuverlässiger als der "E"-Präfix im Namen:
    /// im Bestand tragen alle E-Bikes Fahrradtyp "E-Bike".
    /// </summary>
    public static bool IsEbike(string? fahrradtyp) =>
        string.Equals(fahrradtyp?.Trim(), "E-Bike", StringComparison.OrdinalIgnoreCase);
}
