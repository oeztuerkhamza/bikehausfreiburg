using BikeHaus.Application.DTOs;
using BikeHaus.Application.Interfaces;
using BikeHaus.Domain.Entities;
using BikeHaus.Domain.Interfaces;

namespace BikeHaus.Application.Services;

public class ExpenseService : IExpenseService
{
    private readonly IExpenseRepository _repository;

    public ExpenseService(IExpenseRepository repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<ExpenseListDto>> GetAllAsync()
    {
        var expenses = await _repository.GetAllAsync();
        return expenses
            .OrderByDescending(e => e.BelegNummer)
            .Select(MapToListDto);
    }

    public async Task<ExpenseDto?> GetByIdAsync(int id)
    {
        var expense = await _repository.GetByIdAsync(id);
        return expense == null ? null : MapToDto(expense);
    }

    public async Task<IEnumerable<ExpenseListDto>> SearchAsync(string query)
    {
        var expenses = await _repository.SearchAsync(query);
        return expenses.Select(MapToListDto);
    }

    public async Task<ExpenseDto> CreateAsync(ExpenseCreateDto dto)
    {
        var expense = new Expense
        {
            Bezeichnung = dto.Bezeichnung,
            Kategorie = dto.Kategorie,
            Betrag = dto.Betrag,
            Datum = dto.Datum,
            Lieferant = dto.Lieferant,
            BelegNummer = dto.BelegNummer,
            Notizen = dto.Notizen
        };

        var created = await _repository.AddAsync(expense);
        return MapToDto(created);
    }

    public async Task<ExpenseDto?> UpdateAsync(int id, ExpenseUpdateDto dto)
    {
        var expense = await _repository.GetByIdAsync(id);
        if (expense == null) return null;

        expense.Bezeichnung = dto.Bezeichnung;
        expense.Kategorie = dto.Kategorie;
        expense.Betrag = dto.Betrag;
        expense.Datum = dto.Datum;
        expense.Lieferant = dto.Lieferant;
        expense.BelegNummer = dto.BelegNummer;
        expense.Notizen = dto.Notizen;
        expense.UpdatedAt = DateTime.UtcNow;

        await _repository.UpdateAsync(expense);
        return MapToDto(expense);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var expense = await _repository.GetByIdAsync(id);
        if (expense == null) return false;

        await _repository.DeleteAsync(id);
        return true;
    }

    public async Task<IEnumerable<ExpenseListDto>> GetByDateRangeAsync(DateTime startDate, DateTime endDate)
    {
        var expenses = await _repository.GetByDateRangeAsync(startDate, endDate);
        return expenses.Select(MapToListDto);
    }

    private static ExpenseListDto MapToListDto(Expense e) => new(
        e.Id, e.Bezeichnung, e.Kategorie, e.Betrag,
        e.Datum, e.Lieferant, e.BelegNummer, e.Notizen
    );

    private static ExpenseDto MapToDto(Expense e) => new(
        e.Id, e.Bezeichnung, e.Kategorie, e.Betrag,
        e.Datum, e.Lieferant, e.BelegNummer, e.Notizen, e.CreatedAt
    );
}
