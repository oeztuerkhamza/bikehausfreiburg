using BikeHaus.Domain.Entities;
using BikeHaus.Domain.Interfaces;
using BikeHaus.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace BikeHaus.Infrastructure.Repositories;

public class HomepageAccessoryRepository : Repository<HomepageAccessory>, IHomepageAccessoryRepository
{
    public HomepageAccessoryRepository(BikeHausDbContext context) : base(context) { }

    public async Task<IEnumerable<HomepageAccessory>> GetAllWithImagesAsync()
    {
        return await _dbSet
            .Include(a => a.Images.OrderBy(i => i.SortOrder))
            .OrderByDescending(a => a.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<HomepageAccessory>> GetAllActiveAsync()
    {
        return await _dbSet
            .Where(a => a.IsActive)
            .Include(a => a.Images.OrderBy(i => i.SortOrder))
            .OrderByDescending(a => a.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<HomepageAccessory>> GetByCategoryAsync(string category)
    {
        return await _dbSet
            .Where(a => a.IsActive && a.Kategorie == category)
            .Include(a => a.Images.OrderBy(i => i.SortOrder))
            .OrderByDescending(a => a.CreatedAt)
            .ToListAsync();
    }

    public async Task<HomepageAccessory?> GetWithImagesAsync(int id)
    {
        return await _dbSet
            .Include(a => a.Images.OrderBy(i => i.SortOrder))
            .FirstOrDefaultAsync(a => a.Id == id);
    }

    public async Task<IEnumerable<string>> GetCategoriesAsync()
    {
        return await _dbSet
            .Where(a => a.IsActive && a.Kategorie != null)
            .Select(a => a.Kategorie!)
            .Distinct()
            .OrderBy(c => c)
            .ToListAsync();
    }
}
