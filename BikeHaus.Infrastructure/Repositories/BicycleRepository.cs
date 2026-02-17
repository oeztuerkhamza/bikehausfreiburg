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

    public async Task<Bicycle?> GetWithDetailsAsync(int id)
    {
        return await _dbSet
            .Include(b => b.Purchase).ThenInclude(p => p!.Seller)
            .Include(b => b.Sale).ThenInclude(s => s!.Buyer)
            .Include(b => b.Documents)
            .FirstOrDefaultAsync(b => b.Id == id);
    }

    public override async Task<IEnumerable<Bicycle>> GetAllAsync()
    {
        return await _dbSet
            .OrderByDescending(b => b.CreatedAt)
            .ToListAsync();
    }
}
