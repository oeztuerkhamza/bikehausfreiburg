namespace BikeHaus.Application.DTOs;

// Einmalig = Preis gilt einmal pro Vermietung statt je Miettag (siehe
// RentalAccessory.Einmalig). Bei Create/Update mit Default false, damit
// Clients, die das Feld nicht kennen, weiterhin Tagespreis-Zubehör anlegen.

public record RentalAccessoryDto(
    int Id,
    string Bezeichnung,
    decimal Tagespreis,
    decimal? Verlustgebuehr,
    bool Aktiv,
    string? Beschreibung,
    string? BildPfad,
    bool Einmalig,
    DateTime CreatedAt
);

public record RentalAccessoryListDto(
    int Id,
    string Bezeichnung,
    decimal Tagespreis,
    decimal? Verlustgebuehr,
    bool Aktiv,
    string? Beschreibung,
    string? BildPfad,
    bool Einmalig,
    DateTime CreatedAt
);

public record RentalAccessoryCreateDto(
    string Bezeichnung,
    decimal Tagespreis,
    decimal? Verlustgebuehr,
    string? Beschreibung,
    bool Einmalig = false
);

public record RentalAccessoryUpdateDto(
    string Bezeichnung,
    decimal Tagespreis,
    decimal? Verlustgebuehr,
    string? Beschreibung,
    bool Aktiv,
    bool Einmalig = false
);
