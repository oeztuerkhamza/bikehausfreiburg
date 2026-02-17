using BikeHaus.Domain.Enums;

namespace BikeHaus.Application.DTOs;

// ── Bicycle DTOs ──
public record BicycleDto(
    int Id,
    string Marke,
    string Modell,
    string Rahmennummer,
    string Farbe,
    string Reifengroesse,
    string? Fahrradtyp,
    string? Beschreibung,
    BikeStatus Status,
    BikeCondition Zustand,
    DateTime CreatedAt
);

public record BicycleCreateDto(
    string Marke,
    string Modell,
    string Rahmennummer,
    string Farbe,
    string Reifengroesse,
    string? Fahrradtyp,
    string? Beschreibung,
    BikeCondition Zustand = BikeCondition.Gebraucht
);

public record BicycleUpdateDto(
    string Marke,
    string Modell,
    string Rahmennummer,
    string Farbe,
    string Reifengroesse,
    string? Fahrradtyp,
    string? Beschreibung,
    BikeStatus Status,
    BikeCondition Zustand
);
