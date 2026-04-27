using BikeHaus.Domain.Enums;

namespace BikeHaus.Application.DTOs;

public record RentalBookingAccessoryCreateDto(
    int RentalAccessoryId,
    int Menge
);

public record RentalBookingAccessoryDto(
    int Id,
    string Bezeichnung,
    decimal Tagespreis,
    int Menge,
    decimal Gesamtpreis
);

public record RentalBookingCreateDto(
    int BicycleId,
    DateTime StartDatum,
    DateTime EndDatum,
    string Vorname,
    string Nachname,
    string? Email,
    string? Telefon,
    string Sprache,
    string? Notizen,
    List<RentalBookingAccessoryCreateDto>? Accessories
);

public record RentalBookingDto(
    int Id,
    string BuchungsNummer,
    BicycleDto Bicycle,
    DateTime StartDatum,
    DateTime EndDatum,
    string Vorname,
    string Nachname,
    string? Email,
    string? Telefon,
    string? Sprache,
    string? Notizen,
    string? AdminNotizen,
    decimal? Gesamtpreis,
    RentalBookingStatus Status,
    DateTime CreatedAt,
    DateTime? ApprovedAt,
    DateTime? CancelledAt,
    List<RentalBookingAccessoryDto> Accessories
);

public record RentalBookingListDto(
    int Id,
    string BuchungsNummer,
    string BikeInfo,
    string CustomerName,
    DateTime StartDatum,
    DateTime EndDatum,
    decimal? Gesamtpreis,
    RentalBookingStatus Status,
    DateTime CreatedAt
);

public record RentalBookingApproveDto(string? AdminNotizen);

public record RentalBookingCancelDto(string? AdminNotizen);

public record RentalBookingRangeDto(DateTime StartDatum, DateTime EndDatum);
