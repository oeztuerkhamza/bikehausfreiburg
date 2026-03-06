namespace BikeHaus.Application.DTOs;

// ── Expense DTOs ──
public record ExpenseListDto(
    int Id,
    string Bezeichnung,
    string? Kategorie,
    decimal Betrag,
    DateTime Datum,
    string? Lieferant,
    string? BelegNummer,
    string? BelegDatei,
    string? Notizen,
    DateTime? FaelligkeitsDatum,
    bool Bezahlt,
    string? Zahlungsart
);

public record ExpenseDto(
    int Id,
    string Bezeichnung,
    string? Kategorie,
    decimal Betrag,
    DateTime Datum,
    string? Lieferant,
    string? BelegNummer,
    string? BelegDatei,
    string? Notizen,
    DateTime? FaelligkeitsDatum,
    bool Bezahlt,
    string? Zahlungsart,
    DateTime CreatedAt
);

public record ExpenseCreateDto(
    string Bezeichnung,
    string? Kategorie,
    decimal Betrag,
    DateTime Datum,
    string? Lieferant,
    string? BelegNummer,
    string? Notizen,
    DateTime? FaelligkeitsDatum,
    bool Bezahlt,
    string? Zahlungsart
);

public record ExpenseUpdateDto(
    string Bezeichnung,
    string? Kategorie,
    decimal Betrag,
    DateTime Datum,
    string? Lieferant,
    string? BelegNummer,
    string? Notizen,
    DateTime? FaelligkeitsDatum,
    bool Bezahlt,
    string? Zahlungsart
);
