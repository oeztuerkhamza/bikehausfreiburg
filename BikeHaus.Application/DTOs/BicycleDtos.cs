using BikeHaus.Domain.Enums;

namespace BikeHaus.Application.DTOs;

// ── Bicycle DTOs ──
public record BicycleDto(
    int Id,
    string Marke,
    string Modell,
    string? Rahmennummer,
    string? Rahmengroesse,
    string? Farbe,
    string Reifengroesse,
    string? Fahrradtyp,
    string? Art,
    string? Beschreibung,
    BikeStatus Status,
    BikeCondition Zustand,
    bool IsRentable,
    decimal? RentalPriceDay1,
    decimal? RentalPriceDay3,
    decimal? RentalPriceDay7,
    decimal? RentalPriceDay14,
    decimal? RentalPriceDay30,
    decimal? RentalPricePerDayFrom10,
    bool IsPublishedOnWebsite,
    bool IsPublishedOnKleinanzeigen,
    decimal? VerkaufspreisVorschlag,
    string? KleinanzeigenAnzeigeNr,
    DateTime CreatedAt,
    List<BicycleImageDto>? Images = null
);

public record BicycleCreateDto(
    string Marke,
    string? Modell,
    string? Rahmennummer,
    string? Rahmengroesse,
    string? Farbe,
    string Reifengroesse,
    string? Fahrradtyp,
    string? Art,
    string? Beschreibung,
    BikeCondition Zustand = BikeCondition.Gebraucht,
    bool IsRentable = false,
    decimal? RentalPriceDay1 = null,
    decimal? RentalPriceDay3 = null,
    decimal? RentalPriceDay7 = null,
    decimal? RentalPriceDay14 = null,
    decimal? RentalPriceDay30 = null,
    decimal? RentalPricePerDayFrom10 = null
);

public record BicycleUpdateDto(
    string Marke,
    string? Modell,
    string? Rahmennummer,
    string? Rahmengroesse,
    string? Farbe,
    string Reifengroesse,
    string? Fahrradtyp,
    string? Art,
    string? Beschreibung,
    BikeStatus Status,
    BikeCondition Zustand,
    decimal? VerkaufspreisVorschlag = null,
    bool IsRentable = false,
    decimal? RentalPriceDay1 = null,
    decimal? RentalPriceDay3 = null,
    decimal? RentalPriceDay7 = null,
    decimal? RentalPriceDay14 = null,
    decimal? RentalPriceDay30 = null,
    decimal? RentalPricePerDayFrom10 = null
);

public record BicycleImageDto(
    int Id,
    int BicycleId,
    string FilePath,
    int SortOrder
);

// ── Request DTOs ──
public record SetAnzeigeNrRequest(string AnzeigeNr);

// ── Public Bicycle DTO (for website display) ──
public record PublicBicycleDto(int Id,
    string Marke,
    string Modell,
    string? Farbe,
    string Reifengroesse,
    string? Fahrradtyp,
    string? Art,
    string? Beschreibung,
    string? Rahmengroesse,
    BikeCondition Zustand,
    decimal? Preis,
    DateTime CreatedAt,
    List<BicycleImageDto> Images
);
