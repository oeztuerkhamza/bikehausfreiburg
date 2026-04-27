namespace BikeHaus.Application.DTOs;

public record RentalAccessoryDto(
    int Id,
    string Bezeichnung,
    decimal Tagespreis,
    decimal? Verlustgebuehr,
    bool Aktiv,
    string? Beschreibung,
    DateTime CreatedAt
);

public record RentalAccessoryListDto(
    int Id,
    string Bezeichnung,
    decimal Tagespreis,
    decimal? Verlustgebuehr,
    bool Aktiv,
    DateTime CreatedAt
);

public record RentalAccessoryCreateDto(
    string Bezeichnung,
    decimal Tagespreis,
    decimal? Verlustgebuehr,
    string? Beschreibung
);

public record RentalAccessoryUpdateDto(
    string Bezeichnung,
    decimal Tagespreis,
    decimal? Verlustgebuehr,
    string? Beschreibung,
    bool Aktiv
);
