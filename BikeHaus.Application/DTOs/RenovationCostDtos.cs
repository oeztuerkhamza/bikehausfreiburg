namespace BikeHaus.Application.DTOs;

public record RenovationCostListDto(
    int Id,
    DateTime Datum,
    decimal Betrag,
    string GemachteArbeit,
    string? Notizen
);

public record RenovationCostDto(
    int Id,
    DateTime Datum,
    decimal Betrag,
    string GemachteArbeit,
    string? Notizen,
    DateTime CreatedAt
);

public record RenovationCostCreateDto(
    DateTime Datum,
    decimal Betrag,
    string GemachteArbeit,
    string? Notizen
);

public record RenovationCostUpdateDto(
    DateTime Datum,
    decimal Betrag,
    string GemachteArbeit,
    string? Notizen
);
