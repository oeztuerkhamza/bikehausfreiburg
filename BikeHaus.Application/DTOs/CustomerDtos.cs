namespace BikeHaus.Application.DTOs;

// ── Customer DTOs ──
public record CustomerDto(
    int Id,
    string Vorname,
    string Nachname,
    string? Strasse,
    string? Hausnummer,
    string? PLZ,
    string? Stadt,
    string? Telefon,
    string? Email,
    string FullName,
    string? FullAddress
);

public record CustomerCreateDto(
    string Vorname,
    string Nachname,
    string? Strasse,
    string? Hausnummer,
    string? PLZ,
    string? Stadt,
    string? Telefon,
    string? Email
);

public record CustomerUpdateDto(
    string Vorname,
    string Nachname,
    string? Strasse,
    string? Hausnummer,
    string? PLZ,
    string? Stadt,
    string? Telefon,
    string? Email
);
