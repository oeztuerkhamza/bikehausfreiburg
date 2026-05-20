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

public record RentalBookingBikeCreateDto(
    int BicycleId,
    DateTime StartDatum,
    DateTime EndDatum,
    string? Rahmennummer,
    string? Farbe,
    decimal? Kaution
);

public record RentalBookingBikeDto(
    int Id,
    int BicycleId,
    string Marke,
    string Modell,
    string? Rahmennummer,
    string? Farbe,
    string? Rahmengroesse,
    string? Art,
    decimal? Kaution,
    DateTime StartDatum,
    DateTime EndDatum,
    decimal? Gesamtpreis
);

public record RentalBookingCreateDto(
    List<RentalBookingBikeCreateDto> Bikes,
    string Vorname,
    string Nachname,
    string? Email,
    string? Telefon,
    string? Strasse,
    string? HausNr,
    string? PLZ,
    string? Ort,
    string Sprache,
    string? Notizen,
    List<RentalBookingAccessoryCreateDto>? Accessories
);

public record RentalBookingDto(
    int Id,
    string BuchungsNummer,
    BicycleDto? Bicycle,
    List<RentalBookingBikeDto> Bikes,
    DateTime StartDatum,
    DateTime EndDatum,
    string Vorname,
    string Nachname,
    string? Email,
    string? Telefon,
    string? Strasse,
    string? HausNr,
    string? PLZ,
    string? Ort,
    string? Sprache,
    string? Notizen,
    string? AdminNotizen,
    decimal? Gesamtpreis,
    RentalBookingStatus Status,
    DateTime CreatedAt,
    DateTime? ApprovedAt,
    DateTime? CancelledAt,
    List<RentalBookingAccessoryDto> Accessories,
    string? AusweisPhotoPath
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

public record RentalBookingSignatureDto(string MieterUnterschrift);

public record RentalBookingRangeDto(DateTime StartDatum, DateTime EndDatum);

public record RentalBookingUpdateBikeDto(int NewBicycleId);
