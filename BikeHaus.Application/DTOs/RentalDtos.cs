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
    decimal Rabatt,
    decimal Kaution,
    bool KautionZurueckgegeben,
    PaymentMethod Zahlungsart,
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
    string? Notizen
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
    PaymentMethod? Zahlungsart,
    BikeConditionAtHandover? ZustandBeiUebergabe,
    string? Notizen
);
