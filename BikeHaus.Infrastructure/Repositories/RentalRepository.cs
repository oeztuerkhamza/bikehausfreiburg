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
            .Include(r => r.Bicycle)
            .Include(r => r.Customer)
            .Include(r => r.Accessories)
            .FirstOrDefaultAsync(r => r.Id == id);
    }

    public async Task<Rental?> GetActiveByBicycleIdAsync(int bicycleId)
    {
        return await _dbSet
            .Include(r => r.Bicycle)
            .Include(r => r.Customer)
            .Include(r => r.Accessories)
            .FirstOrDefaultAsync(r => r.BicycleId == bicycleId && r.Status == RentalStatus.Active);
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

    public override async Task<IEnumerable<Rental>> GetAllAsync()
    {
        return await _dbSet
            .Include(r => r.Bicycle)
            .Include(r => r.Customer)
            .OrderByDescending(r => r.StartDatum)
            .ToListAsync();
    }

    public async Task<(IEnumerable<Rental> Items, int TotalCount)> GetPaginatedAsync(
        int page, int pageSize,
        Expression<Func<Rental, bool>>? predicate = null)
    {
        var query = _dbSet
            .Include(r => r.Bicycle)
            .Include(r => r.Customer)
            .AsQueryable();

        if (predicate != null)
            query = query.Where(predicate);

        var totalCount = await query.CountAsync();

        var items = await query
            .OrderByDescending(r => r.StartDatum)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return (items, totalCount);
    }
}
