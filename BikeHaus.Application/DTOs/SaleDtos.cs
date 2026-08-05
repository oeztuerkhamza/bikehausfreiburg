using BikeHaus.Domain.Enums;

namespace BikeHaus.Application.DTOs;

// ── SalePayment DTOs ──
// RatenMonate/MonatsRate sind nur bei Zahlungsart.Raten gesetzt.
public record SalePaymentDto(
    int Id,
    PaymentMethod Zahlungsart,
    decimal Betrag,
    int? RatenMonate = null,
    decimal? MonatsRate = null
);

public record SalePaymentCreateDto(
    PaymentMethod Zahlungsart,
    decimal Betrag,
    int? RatenMonate = null
);

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
    List<SalePaymentDto> Zahlungen,
    decimal Rabatt,
    decimal Gesamtbetrag,
    // Effective Ankauf values: from the linked Purchase if present, else the
    // sale-level fallback fields. Used for the export documents.
    decimal? AnkaufPreis,
    DateTime? AnkaufDatum,
    DateTime CreatedAt
);

public record SaleCreateDto(
    int BicycleId,
    bool IsAccessoryOnly,
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
    List<SaleAccessoryCreateDto>? Accessories,
    List<SalePaymentCreateDto>? Zahlungen = null,
    decimal Rabatt = 0,
    string? BelegNummer = null
);

public record SaleListDto(
    int Id,
    string BelegNummer,
    int BicycleId,
    int? PurchaseId,
    string BikeInfo,
    string? Rahmennummer,
    int? Lagernummer,
    string? Reifengroesse,
    string BuyerName,
    decimal Preis,
    decimal Gesamtbetrag,
    decimal Rabatt,
    PaymentMethod Zahlungsart,
    List<SalePaymentDto> Zahlungen,
    DateTime Verkaufsdatum,
    bool Garantie,
    BikeCondition Zustand,
    // True when this (second-hand) sale's frame number also appears on an Ankauf receipt.
    // Set in SaleService, not in the mapping — defaults to false.
    bool HasMatchingPurchase = false
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
    List<SaleAccessoryCreateDto>? Accessories,
    List<SalePaymentCreateDto>? Zahlungen = null,
    decimal Rabatt = 0,
    string? BelegNummer = null,
    // Ankauf price/date. Applied to the linked Purchase when one exists,
    // otherwise stored on the sale as the export fallback.
    decimal? AnkaufPreis = null,
    DateTime? AnkaufDatum = null
);
