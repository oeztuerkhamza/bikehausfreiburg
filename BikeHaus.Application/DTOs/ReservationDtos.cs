using BikeHaus.Domain.Enums;

namespace BikeHaus.Application.DTOs;

public record ReservationDto(
    int Id,
    string ReservierungsNummer,
    BicycleDto Bicycle,
    CustomerDto Customer,
    DateTime ReservierungsDatum,
    DateTime AblaufDatum,
    decimal? Anzahlung,
    string? Notizen,
    ReservationStatus Status,
    int? SaleId,
    DateTime CreatedAt,
    bool IsExpired
);

public record ReservationCreateDto(
    int BicycleId,
    CustomerCreateDto Customer,
    DateTime? ReservierungsDatum,
    int ReservierungsTage,   // Number of days for reservation
    decimal? Anzahlung,
    string? Notizen
);

public record ReservationListDto(
    int Id,
    string ReservierungsNummer,
    string? StokNo,
    string BikeInfo,
    string CustomerName,
    DateTime ReservierungsDatum,
    DateTime AblaufDatum,
    decimal? Anzahlung,
    ReservationStatus Status,
    bool IsExpired
);

public record ReservationUpdateDto(
    DateTime? AblaufDatum,
    decimal? Anzahlung,
    string? Notizen
);

// Used when converting reservation to sale
public record ReservationConvertToSaleDto(
    decimal Preis,
    PaymentMethod Zahlungsart,
    bool Garantie,
    string? GarantieBedingungen,
    string? Notizen,
    SignatureCreateDto? BuyerSignature,
    SignatureCreateDto? SellerSignature,
    List<SaleAccessoryCreateDto>? Accessories
);
