using System.Linq.Expressions;
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
            .OrderByDescending(r => r.Rueckgabedatum)
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
            .OrderByDescending(r => r.Rueckgabedatum)
            .Take(count)
            .ToListAsync();
    }

    public async Task<string> GenerateBelegNummerAsync()
    {
        var today = DateTime.UtcNow;
        var prefix = $"RB-{today:yyyyMMdd}";
        var count = await _dbSet.CountAsync(r => r.BelegNummer.StartsWith(prefix));
        return $"{prefix}-{(count + 1):D3}";
    }

    public override async Task<IEnumerable<Return>> GetAllAsync()
    {
        return await _dbSet
            .Include(r => r.Bicycle)
            .Include(r => r.Customer)
            .Include(r => r.Sale)
            .OrderByDescending(r => r.Rueckgabedatum)
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
            .OrderByDescending(r => r.Rueckgabedatum)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return (items, totalCount);
    }
}
