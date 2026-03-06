namespace BikeHaus.Application.DTOs;

public record InvoiceListDto(
    int Id,
    string RechnungsNummer,
    DateTime Datum,
    decimal Betrag,
    string Bezeichnung,
    string? Kategorie,
    string? KundenName,
    string? KundenAdresse,
    string? Notizen
);

public record InvoiceDto(
    int Id,
    string RechnungsNummer,
    DateTime Datum,
    decimal Betrag,
    string Bezeichnung,
    string? Kategorie,
    string? KundenName,
    string? KundenAdresse,
    string? Notizen,
    DateTime CreatedAt
);

public record InvoiceCreateDto(
    string? RechnungsNummer,
    DateTime Datum,
    decimal Betrag,
    string Bezeichnung,
    string? Kategorie,
    string? KundenName,
    string? KundenAdresse,
    string? Notizen
);

public record InvoiceUpdateDto(
    string RechnungsNummer,
    DateTime Datum,
    decimal Betrag,
    string Bezeichnung,
    string? Kategorie,
    string? KundenName,
    string? KundenAdresse,
    string? Notizen
);
