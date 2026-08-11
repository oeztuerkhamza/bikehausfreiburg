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
    bool Flatpay,
    /// <summary>"Neu" oder "Gebraucht"; null, wo es kein Fahrrad gibt (Miete, reiner Zubehörverkauf).</summary>
    string? Zustand
);

/// <summary>Setzt/entfernt das Flatpay-Häkchen eines Belegs.</summary>
public record BelegFlatpayDto(BelegArt Art, int Id, bool Flatpay);

/// <summary>Eine Kartenzahlung aus dem Flatpay-Bericht, zu der kein Beleg passt.</summary>
public record FlatpayOffeneZahlungDto(DateTime Datum, decimal Betrag);

/// <summary>Ergebnis des Flatpay-Berichtsabgleichs.</summary>
public record FlatpayImportResultDto(
    /// <summary>Zeilen im Bericht (ohne Kopf- und Summenzeile).</summary>
    int Zeilen,
    /// <summary>Davon abgeschlossene Kartenzahlungen — nur die werden zugeordnet.</summary>
    int Zahlungen,
    /// <summary>Belege, die durch diesen Abgleich neu angehakt wurden.</summary>
    int NeuAngehakt,
    /// <summary>Zahlungen, deren Beleg schon angehakt war.</summary>
    int SchonAngehakt,
    /// <summary>Zahlungen ohne passenden Beleg — die bleiben Handarbeit.</summary>
    IReadOnlyList<FlatpayOffeneZahlungDto> Offen
);
