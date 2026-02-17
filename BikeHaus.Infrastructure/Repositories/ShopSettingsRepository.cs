using BikeHaus.Domain.Entities;
using BikeHaus.Domain.Interfaces;
using BikeHaus.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace BikeHaus.Infrastructure.Repositories;

public class ShopSettingsRepository : Repository<ShopSettings>, IShopSettingsRepository
{
    public ShopSettingsRepository(BikeHausDbContext context) : base(context) { }

    public async Task<ShopSettings?> GetSettingsAsync()
    {
        // Always return the first (and typically only) settings record
        return await _dbSet.FirstOrDefaultAsync();
    }
}
