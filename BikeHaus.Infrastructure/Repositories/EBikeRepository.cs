using BikeHaus.Domain.Entities;
using BikeHaus.Domain.Interfaces;
using BikeHaus.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace BikeHaus.Infrastructure.Repositories;

public class EBikeRepository : Repository<EBike>, IEBikeRepository
{
    public EBikeRepository(BikeHausDbContext context) : base(context) { }

    public async Task<IEnumerable<EBike>> GetAllWithImagesAsync()
    {
        return await _dbSet
            .Include(f => f.Images.OrderBy(i => i.SortOrder))
            .OrderByDescending(f => f.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<EBike>> GetAllActiveAsync()
    {
        return await _dbSet
            .Where(f => f.IsActive)
            .Include(f => f.Images.OrderBy(i => i.SortOrder))
            .OrderByDescending(f => f.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<EBike>> GetByCategoryAsync(string category)
    {
        return await _dbSet
            .Where(f => f.IsActive && f.Kategorie == category)
            .Include(f => f.Images.OrderBy(i => i.SortOrder))
            .OrderByDescending(f => f.CreatedAt)
            .ToListAsync();
    }

    public async Task<EBike?> GetWithImagesAsync(int id)
    {
        return await _dbSet
            .Include(f => f.Images.OrderBy(i => i.SortOrder))
            .FirstOrDefaultAsync(f => f.Id == id);
    }

    public async Task<IEnumerable<string>> GetCategoriesAsync()
    {
        return await _dbSet
            .Where(f => f.IsActive && f.Kategorie != null)
            .Select(f => f.Kategorie!)
            .Distinct()
            .OrderBy(c => c)
            .ToListAsync();
    }
}
