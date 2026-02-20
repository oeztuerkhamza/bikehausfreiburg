using BikeHaus.Domain.Entities;
using BikeHaus.Domain.Interfaces;
using BikeHaus.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace BikeHaus.Infrastructure.Repositories;

public class ExpenseRepository : Repository<Expense>, IExpenseRepository
{
    private readonly BikeHausDbContext _context;

    public ExpenseRepository(BikeHausDbContext context) : base(context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Expense>> GetByDateRangeAsync(DateTime startDate, DateTime endDate)
    {
        return await _context.Expenses
            .Where(e => e.Datum >= startDate && e.Datum <= endDate)
            .OrderByDescending(e => e.BelegNummer)
            .ToListAsync();
    }

    public async Task<IEnumerable<Expense>> SearchAsync(string query)
    {
        var q = query.ToLower();
        return await _context.Expenses
            .Where(e =>
                e.Bezeichnung.ToLower().Contains(q) ||
                (e.Kategorie != null && e.Kategorie.ToLower().Contains(q)) ||
                (e.Lieferant != null && e.Lieferant.ToLower().Contains(q)) ||
                (e.BelegNummer != null && e.BelegNummer.ToLower().Contains(q)))
            .OrderByDescending(e => e.BelegNummer)
            .ToListAsync();
    }
}
