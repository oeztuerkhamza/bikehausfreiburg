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
    bool Zurueckgegeben
);

public record RentalAccessoryItemCreateDto(
    int? RentalAccessoryId,
    string Bezeichnung,
    decimal Tagespreis,
    decimal? Verlustgebuehr,
    int Menge
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
    string? AusweisPhotoPath
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
    string? AusweisPhotoPath
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
    List<RentalAccessoryItemCreateDto>? Accessories
);
