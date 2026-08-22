namespace BikeHaus.Application.DTOs;

// ── Serviceleistung DTOs ──
public record ServiceleistungDto(
    int Id,
    string BelegNummer,
    DateTime Datum,
    string KundeName,
    string? KundeTelefon,
    string? KundeEmail,
    string? KundeAdresse,
    string? FahrradMarke,
    string? FahrradModell,
    string? Rahmennummer,
    string? Farbe,
    string DurchgefuehrteArbeiten,
    string? VerwendeteTeile,
    decimal? Preis,
    string? Zahlungsart,
    string? Notizen,
    DateTime CreatedAt
);

public record ServiceleistungCreateDto(
    DateTime Datum,
    string KundeName,
    string? KundeTelefon,
    string? KundeEmail,
    string? KundeAdresse,
    string? FahrradMarke,
    string? FahrradModell,
    string? Rahmennummer,
    string? Farbe,
    string DurchgefuehrteArbeiten,
    string? VerwendeteTeile,
    decimal? Preis,
    string? Zahlungsart,
    string? Notizen
);

public record ServiceleistungUpdateDto(
    DateTime Datum,
    string KundeName,
    string? KundeTelefon,
    string? KundeEmail,
    string? KundeAdresse,
    string? FahrradMarke,
    string? FahrradModell,
    string? Rahmennummer,
    string? Farbe,
    string DurchgefuehrteArbeiten,
    string? VerwendeteTeile,
    decimal? Preis,
    string? Zahlungsart,
    string? Notizen
);
