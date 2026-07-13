using System.Linq.Expressions;
using System.Text.RegularExpressions;
using BikeHaus.Domain.Entities;
using BikeHaus.Domain.Enums;
using BikeHaus.Domain.Interfaces;
using BikeHaus.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace BikeHaus.Infrastructure.Repositories;

public class RentalRepository : Repository<Rental>, IRentalRepository
{
    private readonly BikeHausDbContext _dbContext;

    public RentalRepository(BikeHausDbContext context) : base(context)
    {
        _dbContext = context;
    }

    public async Task<Rental?> GetWithDetailsAsync(int id)
    {
        return await _dbSet
            .Include(r => r.Bikes).ThenInclude(b => b.Bicycle)
            .Include(r => r.Customer)
            .Include(r => r.Accessories)
            .FirstOrDefaultAsync(r => r.Id == id);
    }

    public async Task<Rental?> GetActiveByBicycleIdAsync(int bicycleId)
    {
        return await _dbSet
            .Include(r => r.Bikes).ThenInclude(b => b.Bicycle)
            .Include(r => r.Customer)
            .Include(r => r.Accessories)
            .FirstOrDefaultAsync(r => r.Status == RentalStatus.Active && r.Bikes.Any(b => b.BicycleId == bicycleId));
    }

    public async Task<string> GenerateMietvertragNummerAsync()
    {
        // Get max number from Sale BelegNummern
        var saleBelegNummern = await _dbContext.Sales
            .Select(s => s.BelegNummer)
            .Where(b => !string.IsNullOrWhiteSpace(b))
            .ToListAsync();

        var maxNumber = 0;
        foreach (var beleg in saleBelegNummern)
        {
            var match = Regex.Match(beleg, @"(\d+)$");
            if (match.Success && int.TryParse(match.Groups[1].Value, out var parsed) && parsed > maxNumber)
                maxNumber = parsed;
        }

        // Also check existing rental MietvertragNummern
        var rentalNummern = await _dbSet
            .Select(r => r.MietvertragNummer)
            .Where(n => !string.IsNullOrWhiteSpace(n))
            .ToListAsync();

        foreach (var nummer in rentalNummern)
        {
            var match = Regex.Match(nummer, @"(\d+)$");
            if (match.Success && int.TryParse(match.Groups[1].Value, out var parsed) && parsed > maxNumber)
                maxNumber = parsed;
        }

        return $"{maxNumber + 1:D3}";
    }

    public async Task<bool> MietvertragNummerExistsAsync(string mietvertragNummer, int excludeRentalId)
    {
        // Vergeben, wenn eine andere Vermietung diese Nummer trägt …
        var existsInRentals = await _dbSet
            .AnyAsync(r => r.Id != excludeRentalId && r.MietvertragNummer == mietvertragNummer);
        if (existsInRentals)
            return true;

        // … oder ein Verkauf, da Verkauf + Vermietung sich einen Nummernkreis teilen.
        return await _dbContext.Sales
            .AnyAsync(s => s.BelegNummer == mietvertragNummer);
    }

    public override async Task<IEnumerable<Rental>> GetAllAsync()
    {
        return await _dbSet
            .Include(r => r.Bikes).ThenInclude(b => b.Bicycle)
            .Include(r => r.Customer)
            .OrderByDescending(r => r.StartDatum)
            .ToListAsync();
    }

    public async Task<IEnumerable<Rental>> GetOverlappingRangeWithBikesAsync(DateTime from, DateTime to)
    {
        // Belegungs-/Kalenderansicht: alle nicht-stornierten Mietverträge, die den Zeitraum berühren.
        return await _dbSet
            .Include(r => r.Bikes).ThenInclude(b => b.Bicycle)
            .Include(r => r.Customer)
            .Where(r => r.Status != RentalStatus.Cancelled
                && r.StartDatum.Date <= to.Date
                && r.EndDatum.Date >= from.Date)
            .OrderBy(r => r.StartDatum)
            .ToListAsync();
    }

    public async Task<IEnumerable<int>> GetBusyBicycleIdsForPeriodAsync(DateOnly start, DateOnly end)
    {
        var startDt = start.ToDateTime(TimeOnly.MinValue);
        var endDt = end.ToDateTime(TimeOnly.MaxValue);
        return await _context.Set<RentalBike>()
            .Where(rb => rb.Rental.Status == RentalStatus.Active
                && rb.StartDatum <= endDt
                && rb.EndDatum >= startDt)
            .Select(rb => rb.BicycleId)
            .Distinct()
            .ToListAsync();
    }

    public async Task<(IEnumerable<Rental> Items, int TotalCount)> GetPaginatedAsync(
        int page, int pageSize,
        Expression<Func<Rental, bool>>? predicate = null)
    {
        var query = _dbSet
            .Include(r => r.Bikes).ThenInclude(b => b.Bicycle)
            .Include(r => r.Customer)
            // Fully completed rentals — returned AND every bike's deposit refunded —
            // are considered done and are hidden from the Mietvertrag list.
            .Where(r => !(r.Status == RentalStatus.Returned && r.Bikes.All(b => b.KautionZurueckgegeben)))
            .AsQueryable();

        if (predicate != null)
            query = query.Where(predicate);

        var totalCount = await query.CountAsync();

        var items = await query
            // Aktive (laufende) Mietverträge immer oben; innerhalb jeder Gruppe die
            // aktuellsten zuerst (nach Startdatum absteigend). Bei gleichem Startdatum
            // die höchste Mietvertrag-Nr zuerst — erst nach Länge, dann lexikografisch,
            // damit die (nullgefüllten) Nummern numerisch korrekt absteigend sortieren.
            .OrderBy(r => r.Status == RentalStatus.Active ? 0 : 1)
            .ThenByDescending(r => r.StartDatum)
            .ThenByDescending(r => r.MietvertragNummer.Length)
            .ThenByDescending(r => r.MietvertragNummer)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return (items, totalCount);
    }
}
