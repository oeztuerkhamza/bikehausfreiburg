using BikeHaus.Domain.Enums;

namespace BikeHaus.Application.DTOs;

public record BusyPeriodDto(
    DateTime Start,
    DateTime End,
    string Type  // "rental" | "booking"
);

public record RentalAccessoryItemDto(
    int Id,
    string Bezeichnung,
    decimal Tagespreis,
    decimal? Verlustgebuehr,
    int Menge,
    decimal Gesamtpreis,
    bool Zurueckgegeben,
    // true = Preis gilt einmal pro Vermietung, nicht je Miettag; Gesamtpreis
    // ist dann Tagespreis × Menge ohne Multiplikation mit den Tagen.
    bool Einmalig
);

public record RentalAccessoryItemCreateDto(
    int? RentalAccessoryId,
    string Bezeichnung,
    decimal Tagespreis,
    decimal? Verlustgebuehr,
    int Menge,
    bool Einmalig = false
);

// ── Per-bike line inside a rental contract ──
public record RentalBikeDto(
    int Id,
    int BicycleId,
    BicycleDto Bicycle,
    string? Rahmennummer,
    string? Farbe,
    DateTime StartDatum,
    DateTime EndDatum,
    decimal Mietpreis,
    decimal Kaution,
    bool KautionZurueckgegeben,
    string? KautionRueckgabeUnterschrift,
    BikeConditionAtHandover ZustandBeiUebergabe,
    BikeConditionAtHandover? ZustandBeiRueckgabe,
    decimal SchadenAbzug,
    decimal VerspaetungsAbzug,
    DateTime? TatsaechlichesRueckgabeDatum,
    string? AbzugNotizen
);

public record RentalBikeCreateDto(
    int BicycleId,
    string? Rahmennummer,
    string? Farbe,
    DateTime StartDatum,
    DateTime EndDatum,
    decimal Mietpreis,
    decimal Kaution,
    BikeConditionAtHandover ZustandBeiUebergabe
);

public record RentalDto(
    int Id,
    string MietvertragNummer,
    List<RentalBikeDto> Bikes,
    CustomerDto Customer,
    DateTime StartDatum,
    DateTime EndDatum,
    // Belegdatum des Vertrags (Anlagetag, im Formular änderbar) — nicht der erste Miettag.
    DateTime Vertragsdatum,
    decimal Gesamtmiete,
    decimal Rabatt,
    decimal Kaution,
    bool KautionZurueckgegeben,            // true when every bike's deposit is returned
    PaymentMethod Zahlungsart,
    PaymentMethod KautionZahlungsart,
    RentalStatus Status,
    string? Notizen,
    DateTime CreatedAt,
    List<RentalAccessoryItemDto> Accessories,
    string? MieterUnterschrift,
    bool AgbAkzeptiert,
    string? UnterschriftOrt,
    string? AusweisPhotoPath,          // Vorderseite
    string? AusweisPhotoRueckseitePath // Rückseite
);

public record RentalListDto(
    int Id,
    string MietvertragNummer,
    string BikeInfo,                       // "Marke Modell (+N more)" for multi-bike rentals
    int BikeCount,
    string CustomerName,
    DateTime StartDatum,
    DateTime EndDatum,
    decimal Gesamtmiete,
    decimal Rabatt,
    decimal Kaution,
    RentalStatus Status,
    bool IsOverdue
);

// Kompaktes Element für die Belegungs-/Kalenderansicht (formale Mietverträge).
public record RentalCalendarItemDto(
    int Id,
    string MietvertragNummer,
    string BikeInfo,
    string CustomerName,
    DateTime StartDatum,
    DateTime EndDatum,
    RentalStatus Status,
    bool HasEBike
);

// ── Return checklist DTOs ──
public record RentalBikeReturnDto(
    int RentalBikeId,
    BikeConditionAtHandover ZustandBeiRueckgabe,
    decimal SchadenAbzug,
    decimal VerspaetungsAbzug,
    DateTime TatsaechlichesRueckgabeDatum,
    string? AbzugNotizen
);

public record RentalAccessoryReturnDto(
    int RentalAccessoryItemId,
    bool Zurueckgegeben
);

public record RentalReturnDto(
    List<RentalBikeReturnDto> Bikes,
    List<RentalAccessoryReturnDto>? Accessories
);

public record RentalCreateDto(
    List<RentalBikeCreateDto> Bikes,
    CustomerCreateDto Customer,
    decimal Rabatt,
    PaymentMethod Zahlungsart,
    PaymentMethod? KautionZahlungsart,
    string? Notizen,
    List<RentalAccessoryItemCreateDto>? Accessories,
    string? MieterUnterschrift,
    bool AgbAkzeptiert,
    string? UnterschriftOrt,
    string? AusweisPhotoPath,           // Vorderseite; z.B. aus einer übernommenen Buchung
    string? AusweisPhotoRueckseitePath = null, // Rückseite; ebenso aus einer übernommenen Buchung
    // Leer = Anlagetag. Gesetzt nur, wenn ein Vertrag nachgetragen wird.
    DateTime? Vertragsdatum = null
);

public record RentalBikeUpdateDto(
    int Id,
    int? BicycleId,
    string? Rahmennummer,
    string? Farbe,
    string? Rahmengroesse,
    string? Reifengroesse,
    string? Fahrradtyp,
    decimal? Mietpreis,
    decimal? Kaution
);

public record RentalUpdateDto(
    CustomerCreateDto? Customer,
    DateTime? StartDatum,
    DateTime? EndDatum,
    decimal? Rabatt,
    bool? KautionZurueckgegeben,           // applies to every bike in this rental
    string? KautionRueckgabeUnterschrift,
    PaymentMethod? Zahlungsart,
    PaymentMethod? KautionZahlungsart,
    string? Notizen,
    string? MieterUnterschrift,
    bool? AgbAkzeptiert,
    string? UnterschriftOrt,
    List<RentalBikeUpdateDto>? Bikes,
    List<RentalBikeCreateDto>? NewBikes,
    List<int>? RemoveBikeIds,
    List<RentalAccessoryItemCreateDto>? Accessories,
    string? MietvertragNummer = null,
    DateTime? Vertragsdatum = null
);
