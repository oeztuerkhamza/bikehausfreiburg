namespace BikeHaus.Application.DTOs;

public record RentalAccessoryDto(
    int Id,
    string Bezeichnung,
    decimal Tagespreis,
    bool Aktiv,
    string? Beschreibung,
    DateTime CreatedAt
);

public record RentalAccessoryListDto(
    int Id,
    string Bezeichnung,
    decimal Tagespreis,
    bool Aktiv
);

public record RentalAccessoryCreateDto(
    string Bezeichnung,
    decimal Tagespreis,
    string? Beschreibung
);

public record RentalAccessoryUpdateDto(
    string Bezeichnung,
    decimal Tagespreis,
    string? Beschreibung,
    bool Aktiv
);
