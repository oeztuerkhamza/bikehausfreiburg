using BikeHaus.Domain.Enums;

namespace BikeHaus.Application.DTOs;

// ── Purchase DTOs ──
public record PurchaseDto(
    int Id,
    string? BelegNummer,
    string? AnzeigeNr,
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
    string? BelegNummer = null,
    string? AnzeigeNr = null
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
    string? BelegNummer = null,
    string? AnzeigeNr = null
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
    string? BelegNummer = null,
    string? AnzeigeNr = null
);

public record BulkPurchaseResultDto(
    int TotalCreated,
    IEnumerable<PurchaseDto> Purchases
);

// ── Missing Purchase DTOs ──
// Sales whose bicycle has no purchase record
public record MissingPurchaseSaleDto(
    int SaleId,
    string SaleBelegNummer,
    int BicycleId,
    string BikeInfo,
    string? StokNo,
    string BuyerName,
    decimal SalePreis,
    DateTime Verkaufsdatum,
    // Bicycle details for pre-filling the purchase form
    string Marke,
    string Modell,
    string? Rahmennummer,
    string? Rahmengroesse,
    string? Farbe,
    string Reifengroesse,
    string? Fahrradtyp,
    string? Art,
    string? Beschreibung,
    BikeCondition Zustand
);

// Create purchase for an existing bicycle (no new bike creation)
public record PurchaseCreateForExistingBikeDto(
    int BicycleId,
    CustomerCreateDto Seller,
    decimal Preis,
    decimal? VerkaufspreisVorschlag,
    PaymentMethod Zahlungsart,
    DateTime? Kaufdatum,
    string? Notizen,
    SignatureCreateDto? Signature,
    string? BelegNummer = null,
    string? AnzeigeNr = null,
    // Optional bicycle field updates
    string? Marke = null,
    string? Modell = null,
    string? Rahmennummer = null,
    string? Rahmengroesse = null,
    string? Farbe = null,
    string? Reifengroesse = null,
    string? Fahrradtyp = null,
    string? Art = null,
    BikeCondition? Zustand = null,
    string? StokNo = null
);
