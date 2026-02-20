using BikeHaus.Domain.Enums;

namespace BikeHaus.Application.DTOs;

// ── Purchase DTOs ──
public record PurchaseDto(
    int Id,
    string? BelegNummer,
    BicycleDto Bicycle,
    CustomerDto Seller,
    decimal Preis,
    decimal? VerkaufspreisVorschlag,
    PaymentMethod Zahlungsart,
    DateTime Kaufdatum,
    string? Notizen,
    SignatureDto? Signature,
    DateTime CreatedAt
);

public record PurchaseCreateDto(
    BicycleCreateDto Bicycle,
    CustomerCreateDto Seller,
    decimal Preis,
    decimal? VerkaufspreisVorschlag,
    PaymentMethod Zahlungsart,
    DateTime? Kaufdatum,
    string? Notizen,
    SignatureCreateDto? Signature,
    string? BelegNummer = null
);

public record PurchaseListDto(
    int Id,
    string? BelegNummer,
    string? StokNo,
    string BikeInfo,
    string SellerName,
    decimal Preis,
    decimal? VerkaufspreisVorschlag,
    PaymentMethod Zahlungsart,
    DateTime Kaufdatum,
    bool HasSale
);

// Update DTO - for editing existing purchases
public record PurchaseUpdateDto(
    BicycleUpdateDto Bicycle,
    CustomerUpdateDto Seller,
    decimal Preis,
    decimal? VerkaufspreisVorschlag,
    PaymentMethod Zahlungsart,
    DateTime Kaufdatum,
    string? Notizen,
    string? BelegNummer = null
);

// Bulk Purchase DTO - for buying multiple identical bicycles at once
public record BulkPurchaseCreateDto(
    BicycleCreateDto Bicycle,
    CustomerCreateDto Seller,
    int Anzahl,                        // Quantity
    decimal Preis,                     // Price per bike
    decimal? VerkaufspreisVorschlag,
    PaymentMethod Zahlungsart,
    DateTime? Kaufdatum,
    string? Notizen,
    string? BelegNummer = null
);

public record BulkPurchaseResultDto(
    int TotalCreated,
    IEnumerable<PurchaseDto> Purchases
);
