using BikeHaus.Domain.Enums;

namespace BikeHaus.Application.DTOs;

// ── SaleAccessory DTOs ──
public record SaleAccessoryDto(
    int Id,
    string Bezeichnung,
    decimal Preis,
    int Menge,
    decimal Gesamtpreis
);

public record SaleAccessoryCreateDto(
    string Bezeichnung,
    decimal Preis,
    int Menge
);

// ── Sale DTOs ──
public record SaleDto(
    int Id,
    string BelegNummer,
    BicycleDto Bicycle,
    CustomerDto Buyer,
    int? PurchaseId,
    decimal Preis,
    PaymentMethod Zahlungsart,
    DateTime Verkaufsdatum,
    bool Garantie,
    string? GarantieBedingungen,
    string? Notizen,
    SignatureDto? BuyerSignature,
    SignatureDto? SellerSignature,
    List<SaleAccessoryDto> Accessories,
    decimal Gesamtbetrag,
    DateTime CreatedAt
);

public record SaleCreateDto(
    int BicycleId,
    int? PurchaseId,
    CustomerCreateDto Buyer,
    decimal Preis,
    PaymentMethod Zahlungsart,
    DateTime? Verkaufsdatum,
    bool Garantie,
    string? GarantieBedingungen,
    string? Notizen,
    SignatureCreateDto? BuyerSignature,
    SignatureCreateDto? SellerSignature,
    List<SaleAccessoryCreateDto>? Accessories
);

public record SaleListDto(
    int Id,
    string BelegNummer,
    string BikeInfo,
    string BuyerName,
    decimal Preis,
    PaymentMethod Zahlungsart,
    DateTime Verkaufsdatum,
    bool Garantie
);

// Update DTO - for editing existing sales
public record SaleUpdateDto(
    CustomerUpdateDto Buyer,
    decimal Preis,
    PaymentMethod Zahlungsart,
    DateTime Verkaufsdatum,
    bool Garantie,
    string? GarantieBedingungen,
    string? Notizen,
    List<SaleAccessoryCreateDto>? Accessories
);
