using System.Linq.Expressions;
using BikeHaus.Domain.Entities;
using BikeHaus.Domain.Enums;
using BikeHaus.Domain.Interfaces;
using BikeHaus.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace BikeHaus.Infrastructure.Repositories;

public class BicycleRepository : Repository<Bicycle>, IBicycleRepository
{
    public BicycleRepository(BikeHausDbContext context) : base(context) { }

    public async Task<IEnumerable<Bicycle>> GetAvailableBicyclesAsync()
    {
        return await _dbSet
            .Where(b => b.Status == BikeStatus.Available)
            .OrderByDescending(b => b.CreatedAt)
            .ToListAsync();
    }

    public async Task<Bicycle?> GetByRahmennummerAsync(string rahmennummer)
    {
        return await _dbSet.FirstOrDefaultAsync(b => b.Rahmennummer == rahmennummer);
    }

    public async Task<List<string>> GetDuplicateRahmennummernAsync()
    {
        // Project the non-empty frame numbers, then group in memory (trim +
        // case-insensitive) so quirks like trailing spaces or mixed case still
        // count as the same number. Returns the normalised duplicate values.
        var all = await _dbSet
            .Where(b => b.Rahmennummer != null && b.Rahmennummer != "")
            .Select(b => b.Rahmennummer!)
            .ToListAsync();

        return all
            .GroupBy(r => r.Trim().ToUpperInvariant())
            .Where(g => g.Count() > 1)
            .Select(g => g.Key)
            .ToList();
    }

    public async Task<Bicycle?> GetWithDetailsAsync(int id)
    {
        return await _dbSet
            .Include(b => b.Purchase).ThenInclude(p => p!.Seller)
            .Include(b => b.Sales).ThenInclude(s => s!.Buyer)
            .Include(b => b.Documents)
            .Include(b => b.Images)
            .FirstOrDefaultAsync(b => b.Id == id);
    }

    public async Task<(IEnumerable<Bicycle> Items, int TotalCount)> GetPaginatedAsync(
        int page, int pageSize,
        Expression<Func<Bicycle, bool>>? predicate = null)
    {
        var query = _dbSet.Include(b => b.Images).AsQueryable();

        if (predicate != null)
            query = query.Where(predicate);

        var totalCount = await query.CountAsync();

        var items = await query
            .OrderByDescending(b => b.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return (items, totalCount);
    }

    public override async Task<IEnumerable<Bicycle>> GetAllAsync()
    {
        return await _dbSet
            .OrderByDescending(b => b.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<string>> GetUniqueBrandsAsync()
    {
        return await _dbSet
            .Select(b => b.Marke)
            .Where(m => !string.IsNullOrEmpty(m))
            .Distinct()
            .OrderBy(m => m)
            .ToListAsync();
    }

    public async Task<IEnumerable<string>> GetUniqueModelsAsync(string? brand = null)
    {
        var query = _dbSet.AsQueryable();

        if (!string.IsNullOrEmpty(brand))
            query = query.Where(b => b.Marke == brand);

        return await query
            .Select(b => b.Modell)
            .Where(m => !string.IsNullOrEmpty(m))
            .Distinct()
            .OrderBy(m => m)
            .ToListAsync();
    }

    public async Task<IEnumerable<Bicycle>> GetPublishedOnWebsiteAsync()
    {
        return await _dbSet
            .Include(b => b.Images)
            .Where(b => b.IsPublishedOnWebsite && b.Status == BikeStatus.Available)
            .OrderByDescending(b => b.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<Bicycle>> GetRentableBicyclesAsync()
    {
        return await _dbSet
            .Include(b => b.Images)
            .Where(b => b.IsRentable)
            .OrderByDescending(b => b.CreatedAt)
            .ToListAsync();
    }

    public async Task<Bicycle?> GetRentableBicycleByIdAsync(int id)
    {
        return await _dbSet
            .Include(b => b.Images)
            .FirstOrDefaultAsync(b => b.Id == id && b.IsRentable);
    }

    public async Task<Bicycle?> GetWithImagesAsync(int id)
    {
        return await _dbSet
            .Include(b => b.Images)
            .FirstOrDefaultAsync(b => b.Id == id);
    }

    public async Task<int?> GetMaxLagernummerAsync()
    {
        return await _dbSet.MaxAsync(b => b.Lagernummer);
    }
}
