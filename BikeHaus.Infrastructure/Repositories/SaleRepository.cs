using System.Linq.Expressions;
using BikeHaus.Domain.Entities;
using BikeHaus.Domain.Interfaces;
using BikeHaus.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace BikeHaus.Infrastructure.Repositories;

public class SaleRepository : Repository<Sale>, ISaleRepository
{
    public SaleRepository(BikeHausDbContext context) : base(context) { }

    public async Task<Sale?> GetWithDetailsAsync(int id)
    {
        return await _dbSet
            .Include(s => s.Bicycle)
            .Include(s => s.Buyer)
            .Include(s => s.Purchase)
            .Include(s => s.BuyerSignature)
            .Include(s => s.SellerSignature)
            .Include(s => s.Documents)
            .Include(s => s.Accessories)
            .FirstOrDefaultAsync(s => s.Id == id);
    }

    public async Task<IEnumerable<Sale>> GetRecentSalesAsync(int count = 10)
    {
        return await _dbSet
            .Include(s => s.Bicycle)
            .Include(s => s.Buyer)
            .OrderByDescending(s => s.BelegNummer)
            .Take(count)
            .ToListAsync();
    }

    public async Task<string> GenerateBelegNummerAsync()
    {
        var count = await _dbSet.CountAsync();
        return $"{(count + 1):D3}";
    }

    public override async Task<IEnumerable<Sale>> GetAllAsync()
    {
        return await _dbSet
            .Include(s => s.Bicycle)
            .Include(s => s.Buyer)
            .OrderByDescending(s => s.BelegNummer)
            .ToListAsync();
    }

    public async Task<(IEnumerable<Sale> Items, int TotalCount)> GetPaginatedAsync(
        int page, int pageSize,
        Expression<Func<Sale, bool>>? predicate = null)
    {
        var query = _dbSet
            .Include(s => s.Bicycle)
            .Include(s => s.Buyer)
            .AsQueryable();

        if (predicate != null)
            query = query.Where(predicate);

        var totalCount = await query.CountAsync();

        var items = await query
            .OrderByDescending(s => s.BelegNummer)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return (items, totalCount);
    }
}
