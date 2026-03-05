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
    string? StokNo,
    string? Fahrradtyp,
    string? Art,
    string? Beschreibung,
    BikeStatus Status,
    BikeCondition Zustand,
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
    string? StokNo,
    string? Fahrradtyp,
    string? Art,
    string? Beschreibung,
    BikeCondition Zustand = BikeCondition.Gebraucht
);

public record BicycleUpdateDto(
    string Marke,
    string? Modell,
    string? Rahmennummer,
    string? Rahmengroesse,
    string? Farbe,
    string Reifengroesse,
    string? StokNo,
    string? Fahrradtyp,
    string? Art,
    string? Beschreibung,
    BikeStatus Status,
    BikeCondition Zustand,
    decimal? VerkaufspreisVorschlag = null
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
