using System.Linq.Expressions;
using System.Text.RegularExpressions;
using BikeHaus.Domain.Entities;
using BikeHaus.Domain.Interfaces;
using BikeHaus.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace BikeHaus.Infrastructure.Repositories;

public class ReturnRepository : Repository<Return>, IReturnRepository
{
    public ReturnRepository(BikeHausDbContext context) : base(context) { }

    public async Task<Return?> GetWithDetailsAsync(int id)
    {
        return await _dbSet
            .Include(r => r.Sale)
                .ThenInclude(s => s.Bicycle)
            .Include(r => r.Sale)
                .ThenInclude(s => s.Buyer)
            .Include(r => r.Sale)
                .ThenInclude(s => s.Accessories)
            .Include(r => r.Sale)
                .ThenInclude(s => s.Zahlungen)
            .Include(r => r.Bicycle)
            .Include(r => r.Customer)
            .Include(r => r.CustomerSignature)
            .Include(r => r.ShopSignature)
            .Include(r => r.Documents)
            .FirstOrDefaultAsync(r => r.Id == id);
    }

    public async Task<IEnumerable<Return>> GetBySaleIdAsync(int saleId)
    {
        return await _dbSet
            .Include(r => r.Bicycle)
            .Include(r => r.Customer)
            .Where(r => r.SaleId == saleId)
            .OrderByDescending(r => r.BelegNummer)
            .ToListAsync();
    }

    public async Task<bool> ExistsByBicycleIdAsync(int bicycleId)
    {
        return await _dbSet.AnyAsync(r => r.BicycleId == bicycleId);
    }

    public async Task<IEnumerable<Return>> GetRecentReturnsAsync(int count = 10)
    {
        return await _dbSet
            .Include(r => r.Bicycle)
            .Include(r => r.Customer)
            .Include(r => r.Sale)
            .OrderByDescending(r => r.BelegNummer)
            .Take(count)
            .ToListAsync();
    }

    /// <summary>
    /// Fortlaufende Rückgabe-Belegnummer: höchste vergebene Nummer + 1.
    ///
    /// Verglichen wird der Zahlenwert, nicht der Text. Ein rein alphabetischer
    /// Vergleich ("999" &gt; "1000", "9" &gt; "12") liefert nicht die zuletzt
    /// vergebene Nummer und erzeugt dadurch Duplikate. Von jeder Belegnummer
    /// zählt die Ziffernfolge am Ende, damit auch manuell vergebene Nummern
    /// mit Präfix (z. B. "RG-012") die Sequenz weiterzählen.
    /// </summary>
    public async Task<string> GenerateBelegNummerAsync()
    {
        var alleBelege = await _dbSet
            .Select(r => r.BelegNummer)
            .Where(b => !string.IsNullOrWhiteSpace(b))
            .ToListAsync();

        var maxNumber = 0;
        foreach (var beleg in alleBelege)
        {
            var match = Regex.Match(beleg, @"(\d+)$");
            if (match.Success && int.TryParse(match.Groups[1].Value, out var parsed) && parsed > maxNumber)
                maxNumber = parsed;
        }

        return $"{maxNumber + 1:D3}";
    }

    public async Task<bool> BelegNummerExistsAsync(string belegNummer)
    {
        return await _dbSet.AnyAsync(r => r.BelegNummer == belegNummer);
    }

    public override async Task<IEnumerable<Return>> GetAllAsync()
    {
        return await _dbSet
            .Include(r => r.Bicycle)
            .Include(r => r.Customer)
            .Include(r => r.Sale)
            .OrderByDescending(r => r.BelegNummer)
            .ToListAsync();
    }

    public async Task<(IEnumerable<Return> Items, int TotalCount)> GetPaginatedAsync(
        int page, int pageSize,
        Expression<Func<Return, bool>>? predicate = null)
    {
        var query = _dbSet
            .Include(r => r.Bicycle)
            .Include(r => r.Customer)
            .Include(r => r.Sale)
            .AsQueryable();

        if (predicate != null)
            query = query.Where(predicate);

        var totalCount = await query.CountAsync();

        var items = await query
            .OrderByDescending(r => r.BelegNummer)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return (items, totalCount);
    }
}
