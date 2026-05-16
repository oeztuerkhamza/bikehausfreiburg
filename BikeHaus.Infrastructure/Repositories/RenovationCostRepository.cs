using BikeHaus.Domain.Entities;
using BikeHaus.Domain.Interfaces;
using BikeHaus.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace BikeHaus.Infrastructure.Repositories;

public class RenovationCostRepository : Repository<RenovationCost>, IRenovationCostRepository
{
    public RenovationCostRepository(BikeHausDbContext context) : base(context)
    {
    }

    public async Task<IEnumerable<RenovationCost>> GetByDateRangeAsync(DateTime startDate, DateTime endDate)
    {
        return await _context.RenovationCosts
            .Where(r => r.Datum >= startDate && r.Datum <= endDate)
            .OrderByDescending(r => r.Datum)
            .ToListAsync();
    }
}
