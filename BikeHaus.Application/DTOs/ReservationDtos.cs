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
    bool IsExpired,
    PaymentMethod? AnzahlungZahlungsart = null,
    decimal? Verkaufspreis = null,
    // Offener Restbetrag = Verkaufspreis − Anzahlung (null, wenn kein Preis
    // hinterlegt ist). Serverseitig gerechnet, damit Beleg und Oberfläche
    // dieselbe Zahl zeigen.
    decimal? Restbetrag = null,
    string? KundenUnterschrift = null
);

public record ReservationCreateDto(
    int BicycleId,
    CustomerCreateDto Customer,
    DateTime? ReservierungsDatum,
    // Ablaufdatum direkt aus dem Kalender. ReservierungsTage bleibt als
    // Rückfallebene für ältere Aufrufer erhalten und wird nur benutzt, wenn
    // kein Datum mitkommt.
    DateTime? AblaufDatum,
    int ReservierungsTage,   // Number of days for reservation
    decimal? Anzahlung,
    string? Notizen,
    PaymentMethod? AnzahlungZahlungsart = null,
    decimal? Verkaufspreis = null,
    string? KundenUnterschrift = null
);

public record ReservationListDto(
    int Id,
    string ReservierungsNummer,
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
    string? Notizen,
    PaymentMethod? AnzahlungZahlungsart = null,
    decimal? Verkaufspreis = null,
    string? KundenUnterschrift = null
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
