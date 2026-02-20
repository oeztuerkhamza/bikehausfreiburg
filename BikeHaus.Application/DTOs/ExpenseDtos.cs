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
    string? Notizen
);

public record ExpenseDto(
    int Id,
    string Bezeichnung,
    string? Kategorie,
    decimal Betrag,
    DateTime Datum,
    string? Lieferant,
    string? BelegNummer,
    string? Notizen,
    DateTime CreatedAt
);

public record ExpenseCreateDto(
    string Bezeichnung,
    string? Kategorie,
    decimal Betrag,
    DateTime Datum,
    string? Lieferant,
    string? BelegNummer,
    string? Notizen
);

public record ExpenseUpdateDto(
    string Bezeichnung,
    string? Kategorie,
    decimal Betrag,
    DateTime Datum,
    string? Lieferant,
    string? BelegNummer,
    string? Notizen
);
