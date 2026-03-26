using BikeHaus.Domain.Enums;

namespace BikeHaus.Application.DTOs;

public record RentalDto(
    int Id,
    string MietvertragNummer,
    BicycleDto Bicycle,
    CustomerDto Customer,
    string? AusweisnNr,
    DateTime StartDatum,
    DateTime EndDatum,
    decimal Gesamtmiete,
    decimal Kaution,
    string? KautionInWorten,
    bool KautionZurueckgegeben,
    BikeConditionAtHandover ZustandBeiUebergabe,
    RentalStatus Status,
    string? Notizen,
    DateTime CreatedAt
);

public record RentalListDto(
    int Id,
    string MietvertragNummer,
    string BikeInfo,
    string CustomerName,
    DateTime StartDatum,
    DateTime EndDatum,
    decimal Gesamtmiete,
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
    decimal Kaution,
    string? KautionInWorten,
    BikeConditionAtHandover ZustandBeiUebergabe,
    string? Notizen
);

public record RentalUpdateDto(
    DateTime? EndDatum,
    decimal? Gesamtmiete,
    decimal? Kaution,
    string? KautionInWorten,
    bool? KautionZurueckgegeben,
    BikeConditionAtHandover? ZustandBeiUebergabe,
    string? Notizen
);
