namespace BikeHaus.Application.DTOs;

/// <summary>Belegart in der gemeinsamen Übersicht.</summary>
public enum BelegArt
{
    Miete,
    Verkauf
}

/// <summary>
/// Eine Zeile der gemeinsamen Beleg-Übersicht. Miet- und Verkaufsbelege
/// erscheinen dort nebeneinander, deshalb sind die Felder bewusst neutral
/// gehalten (Datum = Verkaufsdatum bzw. Mietbeginn).
/// </summary>
public record BelegListDto(
    BelegArt Art,
    int Id,
    string BelegNummer,
    DateTime Datum,
    string KundeName,
    string FahrradInfo,
    decimal Betrag
);
