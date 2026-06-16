namespace BikeHaus.Application.DTOs;

public record EBikeDto(
    int Id,
    string Titel,
    string? Beschreibung,
    decimal Preis,
    string? PreisText,
    string? Kategorie,
    string? Marke,
    string? Modell,
    string? Farbe,
    string? Rahmengroesse,
    string? Reifengroesse,
    string? Gangschaltung,
    string Zustand,
    decimal? Angebot,
    bool IsActive,
    string? MotorMarke,
    string? MotorPosition,
    int? AkkuKapazitaetWh,
    int? ReichweiteKm,
    int? MotorLeistungNm,
    DateTime CreatedAt,
    List<EBikeImageDto> Images
);

public record EBikeImageDto(
    int Id,
    string FilePath,
    int SortOrder
);

public record EBikeCreateDto(
    string Titel,
    string? Beschreibung,
    decimal Preis,
    string? PreisText,
    string? Kategorie,
    string? Marke,
    string? Modell,
    string? Farbe,
    string? Rahmengroesse,
    string? Reifengroesse,
    string? Gangschaltung,
    string Zustand,
    decimal? Angebot,
    string? MotorMarke,
    string? MotorPosition,
    int? AkkuKapazitaetWh,
    int? ReichweiteKm,
    int? MotorLeistungNm
);

public record EBikeUpdateDto(
    string Titel,
    string? Beschreibung,
    decimal Preis,
    string? PreisText,
    string? Kategorie,
    string? Marke,
    string? Modell,
    string? Farbe,
    string? Rahmengroesse,
    string? Reifengroesse,
    string? Gangschaltung,
    string Zustand,
    decimal? Angebot,
    string? MotorMarke,
    string? MotorPosition,
    int? AkkuKapazitaetWh,
    int? ReichweiteKm,
    int? MotorLeistungNm,
    bool IsActive
);

public record EBikeCategoryDto(
    string Name,
    int Count
);

// Public projection: excludes admin-only fields (IsActive), keeps spec + new fields + images.
public record PublicEBikeDto(
    int Id,
    string Titel,
    string? Beschreibung,
    decimal Preis,
    string? PreisText,
    string? Kategorie,
    string? Marke,
    string? Modell,
    string? Farbe,
    string? Rahmengroesse,
    string? Reifengroesse,
    string? Gangschaltung,
    string Zustand,
    decimal? Angebot,
    string? MotorMarke,
    string? MotorPosition,
    int? AkkuKapazitaetWh,
    int? ReichweiteKm,
    int? MotorLeistungNm,
    DateTime CreatedAt,
    List<EBikeImageDto> Images
);
