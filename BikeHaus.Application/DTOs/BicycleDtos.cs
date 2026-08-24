using BikeHaus.Domain.Enums;

namespace BikeHaus.Application.DTOs;

// ── Bicycle DTOs ──
public record BicycleDto(
    int Id,
    string Marke,
    string Modell,
    string? Rahmennummer,
    string? Rahmengroesse,
    string? Farbe,
    string Reifengroesse,
    string? Fahrradtyp,
    string? Art,
    string? Beschreibung,
    BikeStatus Status,
    BikeCondition Zustand,
    bool IsRentable,
    decimal? RentalPriceDay1,
    decimal? RentalPriceDay2,
    decimal? RentalPriceDay3,
    decimal? RentalPriceDay4,
    decimal? RentalPriceDay5,
    decimal? RentalPriceDay6,
    decimal? RentalPriceDay7,
    decimal? RentalPriceAdditionalDayAfter7,
    decimal? Kaution,
    bool IsPublishedOnWebsite,
    bool IsPublishedOnKleinanzeigen,
    decimal? VerkaufspreisVorschlag,
    string? KleinanzeigenAnzeigeNr,
    DateTime CreatedAt,
    List<BicycleImageDto>? Images = null,
    int? Lagernummer = null,
    // Nur Mietfahrräder; die Nummer bleibt intern (siehe PublicRentalBicycleDto).
    string? Fahrradnummer = null,
    int? KoerpergroesseVonCm = null,
    int? KoerpergroesseBisCm = null,
    string? Gangschaltung = null
);

public record BicycleCreateDto(
    string Marke,
    string? Modell,
    string? Rahmennummer,
    string? Rahmengroesse,
    string? Farbe,
    string Reifengroesse,
    string? Fahrradtyp,
    string? Art,
    string? Beschreibung,
    BikeCondition Zustand = BikeCondition.Gebraucht,
    bool IsRentable = false,
    decimal? RentalPriceDay1 = null,
    decimal? RentalPriceDay2 = null,
    decimal? RentalPriceDay3 = null,
    decimal? RentalPriceDay4 = null,
    decimal? RentalPriceDay5 = null,
    decimal? RentalPriceDay6 = null,
    decimal? RentalPriceDay7 = null,
    decimal? RentalPriceAdditionalDayAfter7 = null,
    decimal? Kaution = null,
    int? Lagernummer = null,
    // Beim Anlegen erlaubt (anders als die Kaution): wer ein Rad direkt aus
    // einem Beleg heraus anlegt — etwa beim Reservieren eines noch nicht
    // erfassten Fahrrads — soll den vereinbarten Preis gleich hinterlegen.
    decimal? VerkaufspreisVorschlag = null,
    string? Fahrradnummer = null,
    int? KoerpergroesseVonCm = null,
    int? KoerpergroesseBisCm = null,
    string? Gangschaltung = null
);

public record BicycleUpdateDto(
    string Marke,
    string? Modell,
    string? Rahmennummer,
    string? Rahmengroesse,
    string? Farbe,
    string Reifengroesse,
    string? Fahrradtyp,
    string? Art,
    string? Beschreibung,
    BikeStatus Status,
    BikeCondition Zustand,
    decimal? VerkaufspreisVorschlag = null,
    // bool? statt bool: ein fehlendes Feld darf nicht als "false" ankommen und
    // das Rad stillschweigend aus der Vermietflotte nehmen. null = behalten.
    bool? IsRentable = null,
    decimal? RentalPriceDay1 = null,
    decimal? RentalPriceDay2 = null,
    decimal? RentalPriceDay3 = null,
    decimal? RentalPriceDay4 = null,
    decimal? RentalPriceDay5 = null,
    decimal? RentalPriceDay6 = null,
    decimal? RentalPriceDay7 = null,
    decimal? RentalPriceAdditionalDayAfter7 = null,
    // Kaution fehlt hier bewusst: die am Fahrrad hinterlegte Kaution lässt sich
    // NUR über PUT /api/bicycles/{id}/kaution ändern (Seite „Mietfahrräder").
    // Solange sie Teil dieses Vollersatz-DTOs war, konnte sie jedes Formular
    // mitschicken, das nebenbei ein Fahrrad speichert — beim Anlegen eines
    // Mietvertrags wurde sie so geleert. Ein trotzdem mitgeschicktes Feld
    // landet jetzt im Nirwana, statt den Wert zu überschreiben.
    int? Lagernummer = null,
    // null = beibehalten (gleiche Regel wie bei den Preisfeldern), damit ein
    // Formular ohne diese Felder sie nicht leert.
    string? Fahrradnummer = null,
    int? KoerpergroesseVonCm = null,
    int? KoerpergroesseBisCm = null,
    string? Gangschaltung = null
);

public record BicycleImageDto(
    int Id,
    int BicycleId,
    string FilePath,
    int SortOrder
);

// ── Request DTOs ──
public record SetAnzeigeNrRequest(string AnzeigeNr);

// Einziger Weg, die am Fahrrad hinterlegte Kaution zu ändern (Seite
// „Mietfahrräder"). null = keine Kaution hinterlegt.
public record SetKautionRequest(decimal? Kaution);

// ── Public Bicycle DTO (for website display) ──
public record PublicBicycleDto(int Id,
    string Marke,
    string Modell,
    string? Farbe,
    string Reifengroesse,
    string? Fahrradtyp,
    string? Art,
    string? Beschreibung,
    string? Rahmengroesse,
    BikeCondition Zustand,
    decimal? Preis,
    DateTime CreatedAt,
    List<BicycleImageDto> Images,
    // Wird im Showroom-Titel mitgeführt, weil die Filter (Gänge, Zoll, size)
    // den Titel auswerten — genau wie bei den Kleinanzeigen-Anzeigen.
    string? Gangschaltung = null
);
