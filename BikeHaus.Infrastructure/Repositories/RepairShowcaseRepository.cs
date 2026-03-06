using BikeHaus.Domain.Entities;
using BikeHaus.Domain.Interfaces;
using BikeHaus.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace BikeHaus.Infrastructure.Repositories;

public class RepairShowcaseRepository : Repository<RepairShowcase>, IRepairShowcaseRepository
{
    public RepairShowcaseRepository(BikeHausDbContext context) : base(context) { }

    public async Task<IEnumerable<RepairShowcase>> GetAllWithImagesAsync()
    {
        return await _dbSet
            .Include(r => r.Images.OrderBy(i => i.SortOrder))
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<RepairShowcase>> GetAllActiveAsync()
    {
        return await _dbSet
            .Where(r => r.IsActive)
            .Include(r => r.Images.OrderBy(i => i.SortOrder))
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();
    }

    public async Task<RepairShowcase?> GetWithImagesAsync(int id)
    {
        return await _dbSet
            .Include(r => r.Images.OrderBy(i => i.SortOrder))
            .FirstOrDefaultAsync(r => r.Id == id);
    }
}
