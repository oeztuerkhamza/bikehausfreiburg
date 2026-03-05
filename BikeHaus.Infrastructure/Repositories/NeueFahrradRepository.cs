using BikeHaus.Domain.Entities;
using BikeHaus.Domain.Interfaces;
using BikeHaus.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace BikeHaus.Infrastructure.Repositories;

public class NeueFahrradRepository : Repository<NeueFahrrad>, INeueFahrradRepository
{
    public NeueFahrradRepository(BikeHausDbContext context) : base(context) { }

    public async Task<IEnumerable<NeueFahrrad>> GetAllActiveAsync()
    {
        return await _dbSet
            .Where(f => f.IsActive)
            .Include(f => f.Images.OrderBy(i => i.SortOrder))
            .OrderByDescending(f => f.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<NeueFahrrad>> GetByCategoryAsync(string category)
    {
        return await _dbSet
            .Where(f => f.IsActive && f.Kategorie == category)
            .Include(f => f.Images.OrderBy(i => i.SortOrder))
            .OrderByDescending(f => f.CreatedAt)
            .ToListAsync();
    }

    public async Task<NeueFahrrad?> GetWithImagesAsync(int id)
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
