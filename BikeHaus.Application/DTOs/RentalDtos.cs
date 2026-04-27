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
    decimal Gesamtpreis
);

public record RentalAccessoryItemCreateDto(
    int? RentalAccessoryId,
    string Bezeichnung,
    decimal Tagespreis,
    decimal? Verlustgebuehr,
    int Menge
);

public record RentalDto(
    int Id,
    string MietvertragNummer,
    BicycleDto Bicycle,
    CustomerDto Customer,
    string? AusweisnNr,
    DateTime StartDatum,
    DateTime EndDatum,
    decimal Gesamtmiete,
    decimal Rabatt,
    decimal Kaution,
    bool KautionZurueckgegeben,
    string? KautionRueckgabeUnterschrift,
    PaymentMethod Zahlungsart,
    BikeConditionAtHandover ZustandBeiUebergabe,
    RentalStatus Status,
    string? Notizen,
    DateTime CreatedAt,
    List<RentalAccessoryItemDto> Accessories
);

public record RentalListDto(
    int Id,
    string MietvertragNummer,
    string BikeInfo,
    string CustomerName,
    DateTime StartDatum,
    DateTime EndDatum,
    decimal Gesamtmiete,
    decimal Rabatt,
    decimal Kaution,
    RentalStatus Status,
    bool IsOverdue
);

public record RentalCreateDto(
    int BicycleId,
    CustomerCreateDto Customer,
    string? AusweisnNr,
    DateTime StartDatum,
    DateTime EndDatum,
    decimal Gesamtmiete,
    decimal Rabatt,
    decimal Kaution,
    PaymentMethod Zahlungsart,
    BikeConditionAtHandover ZustandBeiUebergabe,
    string? Notizen,
    List<RentalAccessoryItemCreateDto>? Accessories
);

public record RentalUpdateDto(
    CustomerCreateDto? Customer,
    string? AusweisnNr,
    DateTime? StartDatum,
    DateTime? EndDatum,
    decimal? Gesamtmiete,
    decimal? Rabatt,
    decimal? Kaution,
    bool? KautionZurueckgegeben,
    string? KautionRueckgabeUnterschrift,
    PaymentMethod? Zahlungsart,
    BikeConditionAtHandover? ZustandBeiUebergabe,
    string? Notizen
);
