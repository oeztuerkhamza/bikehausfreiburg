namespace BikeHaus.Application.DTOs;

// ── AccessoryCatalog DTOs ──
public record AccessoryCatalogDto(
    int Id,
    string Bezeichnung,
    decimal Standardpreis,
    string? Kategorie,
    bool Aktiv,
    DateTime CreatedAt
);

public record AccessoryCatalogCreateDto(
    string Bezeichnung,
    decimal Standardpreis,
    string? Kategorie
);

public record AccessoryCatalogUpdateDto(
    string Bezeichnung,
    decimal Standardpreis,
    string? Kategorie,
    bool Aktiv
);

public record AccessoryCatalogListDto(
    int Id,
    string Bezeichnung,
    decimal Standardpreis,
    string? Kategorie,
    bool Aktiv
);
