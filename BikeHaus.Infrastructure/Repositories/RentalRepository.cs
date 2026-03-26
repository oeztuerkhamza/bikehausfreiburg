using System.Linq.Expressions;
using BikeHaus.Domain.Entities;
using BikeHaus.Domain.Enums;
using BikeHaus.Domain.Interfaces;
using BikeHaus.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace BikeHaus.Infrastructure.Repositories;

public class RentalRepository : Repository<Rental>, IRentalRepository
{
    public RentalRepository(BikeHausDbContext context) : base(context) { }

    public async Task<Rental?> GetWithDetailsAsync(int id)
    {
        return await _dbSet
            .Include(r => r.Bicycle)
            .Include(r => r.Customer)
            .FirstOrDefaultAsync(r => r.Id == id);
    }

    public async Task<Rental?> GetActiveByBicycleIdAsync(int bicycleId)
    {
        return await _dbSet
            .Include(r => r.Bicycle)
            .Include(r => r.Customer)
            .FirstOrDefaultAsync(r => r.BicycleId == bicycleId && r.Status == RentalStatus.Active);
    }

    public async Task<string> GenerateMietvertragNummerAsync()
    {
        var today = DateTime.UtcNow;
        var prefix = $"MV-{today:yyyyMMdd}";
        var count = await _dbSet.CountAsync(r => r.MietvertragNummer.StartsWith(prefix));
        return $"{prefix}-{(count + 1):D3}";
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
