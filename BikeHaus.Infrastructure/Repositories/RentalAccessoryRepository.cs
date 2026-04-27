using BikeHaus.Domain.Entities;
using BikeHaus.Domain.Interfaces;
using BikeHaus.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace BikeHaus.Infrastructure.Repositories;

public class RentalAccessoryRepository : Repository<RentalAccessory>, IRentalAccessoryRepository
{
    public RentalAccessoryRepository(BikeHausDbContext context) : base(context) { }

    public async Task<IEnumerable<RentalAccessory>> GetActiveAsync()
    {
        return await _dbSet
            .Where(a => a.Aktiv)
            .OrderBy(a => a.Bezeichnung)
            .ToListAsync();
    }
}
