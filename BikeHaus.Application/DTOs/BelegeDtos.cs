namespace BikeHaus.Application.DTOs;

/// <summary>Belegart in der gemeinsamen Übersicht.</summary>
public enum BelegArt
{
    Miete,
    Verkauf,
    Ankauf
}

/// <summary>Ein Zahlungsanteil eines Belegs (z. B. "Karte 300,00 €").</summary>
public record BelegZahlungDto(string Zahlungsart, decimal Betrag);

/// <summary>
/// Eine Zeile der gemeinsamen Beleg-Übersicht. Miet- und Verkaufsbelege
/// erscheinen dort nebeneinander, deshalb sind die Felder bewusst neutral
/// gehalten (Datum = Verkaufsdatum bzw. Mietbeginn).
///
/// Die Liste ist ein internes Buchhaltungsdokument: Ankaufnummer und
/// Ankaufpreis stehen deshalb dabei, sofern zum Verkauf ein Kaufbeleg
/// gefunden wird.
/// </summary>
public record BelegListDto(
    BelegArt Art,
    int Id,
    string BelegNummer,
    DateTime Datum,
    string KundeName,
    string FahrradInfo,
    decimal Betrag,
    IReadOnlyList<BelegZahlungDto> Zahlungen,
    string? AnkaufBelegNummer,
    decimal? AnkaufPreis,
    bool Flatpay
);

/// <summary>Setzt/entfernt das Flatpay-Häkchen eines Belegs.</summary>
public record BelegFlatpayDto(BelegArt Art, int Id, bool Flatpay);
