using System.Linq.Expressions;
using BikeHaus.Domain.Entities;
using BikeHaus.Domain.Interfaces;
using BikeHaus.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace BikeHaus.Infrastructure.Repositories;

public class PurchaseRepository : Repository<Purchase>, IPurchaseRepository
{
    public PurchaseRepository(BikeHausDbContext context) : base(context) { }

    public async Task<Purchase?> GetWithDetailsAsync(int id)
    {
        return await _dbSet
            .Include(p => p.Bicycle)
            .Include(p => p.Seller)
            .Include(p => p.Signature)
            .Include(p => p.Documents)
            .Include(p => p.Sale)
            .FirstOrDefaultAsync(p => p.Id == id);
    }

    public async Task<Purchase?> GetByBicycleIdAsync(int bicycleId)
    {
        return await _dbSet
            .Include(p => p.Bicycle)
            .Include(p => p.Seller)
            .Include(p => p.Signature)
            .Include(p => p.Sale)
            .FirstOrDefaultAsync(p => p.BicycleId == bicycleId);
    }

    public async Task<IEnumerable<Purchase>> GetRecentPurchasesAsync(int count = 10)
    {
        return await _dbSet
            .Include(p => p.Bicycle)
            .Include(p => p.Seller)
            .Include(p => p.Sale)
            .OrderByDescending(p => p.BelegNummer)
            .Take(count)
            .ToListAsync();
    }

    public async Task<string> GenerateBelegNummerAsync()
    {
        var count = await _dbSet.CountAsync();
        return $"{(count + 1):D3}";
    }

    public override async Task<IEnumerable<Purchase>> GetAllAsync()
    {
        return await _dbSet
            .Include(p => p.Bicycle)
            .Include(p => p.Seller)
            .Include(p => p.Sale)
            .OrderByDescending(p => p.BelegNummer)
            .ToListAsync();
    }

    public async Task<(IEnumerable<Purchase> Items, int TotalCount)> GetPaginatedAsync(
        int page, int pageSize,
        Expression<Func<Purchase, bool>>? predicate = null)
    {
        var query = _dbSet
            .Include(p => p.Bicycle)
            .Include(p => p.Seller)
            .Include(p => p.Sale)
            .AsQueryable();

        if (predicate != null)
            query = query.Where(predicate);

        var totalCount = await query.CountAsync();

        var items = await query
            .OrderByDescending(p => p.BelegNummer)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return (items, totalCount);
    }
}
