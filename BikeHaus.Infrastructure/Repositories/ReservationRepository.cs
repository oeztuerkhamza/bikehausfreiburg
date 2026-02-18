using BikeHaus.Domain.Entities;
using BikeHaus.Domain.Enums;
using BikeHaus.Domain.Interfaces;
using BikeHaus.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace BikeHaus.Infrastructure.Repositories;

public class ReservationRepository : Repository<Reservation>, IReservationRepository
{
    public ReservationRepository(BikeHausDbContext context) : base(context) { }

    public async Task<Reservation?> GetWithDetailsAsync(int id)
    {
        return await _dbSet
            .Include(r => r.Bicycle)
            .Include(r => r.Customer)
            .Include(r => r.Sale)
            .FirstOrDefaultAsync(r => r.Id == id);
    }

    public async Task<Reservation?> GetActiveByBicycleIdAsync(int bicycleId)
    {
        return await _dbSet
            .Include(r => r.Bicycle)
            .Include(r => r.Customer)
            .FirstOrDefaultAsync(r => r.BicycleId == bicycleId && r.Status == ReservationStatus.Active);
    }

    public async Task<IEnumerable<Reservation>> GetExpiredReservationsAsync()
    {
        var now = DateTime.UtcNow;
        return await _dbSet
            .Include(r => r.Bicycle)
            .Where(r => r.Status == ReservationStatus.Active && r.AblaufDatum < now)
            .ToListAsync();
    }

    public async Task<string> GenerateReservierungsNummerAsync()
    {
        var today = DateTime.UtcNow;
        var prefix = $"RES-{today:yyyyMMdd}";
        var count = await _dbSet.CountAsync(r => r.ReservierungsNummer.StartsWith(prefix));
        return $"{prefix}-{(count + 1):D3}";
    }

    public override async Task<IEnumerable<Reservation>> GetAllAsync()
    {
        return await _dbSet
            .Include(r => r.Bicycle)
            .Include(r => r.Customer)
            .OrderByDescending(r => r.ReservierungsDatum)
            .ToListAsync();
    }
}
