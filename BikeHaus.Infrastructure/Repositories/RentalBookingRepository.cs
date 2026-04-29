using System.Linq.Expressions;
using BikeHaus.Domain.Entities;
using BikeHaus.Domain.Enums;
using BikeHaus.Domain.Interfaces;
using BikeHaus.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace BikeHaus.Infrastructure.Repositories;

public class RentalBookingRepository : Repository<RentalBooking>, IRentalBookingRepository
{
    public RentalBookingRepository(BikeHausDbContext context) : base(context) { }

    public async Task<RentalBooking?> GetWithDetailsAsync(int id)
    {
        return await _dbSet
            .Include(b => b.Bicycle)
            .Include(b => b.Accessories)
            .FirstOrDefaultAsync(b => b.Id == id);
    }

    public async Task<RentalBooking?> GetByBookingNumberWithDetailsAsync(string bookingNumber)
    {
        return await _dbSet
            .Include(b => b.Bicycle)
            .Include(b => b.Accessories)
            .FirstOrDefaultAsync(b => b.BuchungsNummer == bookingNumber);
    }

    public async Task<string> GenerateBuchungsNummerAsync()
    {
        var today = DateTime.UtcNow;
        var prefix = $"BKG-{today:yyyyMMdd}";
        var count = await _dbSet.CountAsync(b => b.BuchungsNummer.StartsWith(prefix));
        return $"{prefix}-{(count + 1):D3}";
    }

    public async Task<(IEnumerable<RentalBooking> Items, int TotalCount)> GetPaginatedAsync(
        int page,
        int pageSize,
        Expression<Func<RentalBooking, bool>>? predicate = null)
    {
        var query = _dbSet
            .Include(b => b.Bicycle)
            .Include(b => b.Accessories)
            .AsQueryable();

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

    public async Task<IEnumerable<RentalBooking>> GetApprovedByBicycleIdAsync(int bicycleId)
    {
        return await _dbSet
            .Where(b => b.BicycleId == bicycleId && b.Status == RentalBookingStatus.Approved)
            .OrderBy(b => b.StartDatum)
            .ToListAsync();
    }

    public async Task<IEnumerable<RentalBooking>> GetPendingByBicycleIdAsync(int bicycleId)
    {
        return await _dbSet
            .Where(b => b.BicycleId == bicycleId && b.Status == RentalBookingStatus.Pending)
            .OrderBy(b => b.StartDatum)
            .ToListAsync();
    }

    public async Task<bool> ExistsApprovedOverlapAsync(int bicycleId, DateTime start, DateTime end, int? excludeBookingId = null)
    {
        var query = _dbSet.Where(b =>
            b.BicycleId == bicycleId &&
            b.Status == RentalBookingStatus.Approved &&
            b.StartDatum.Date <= end.Date &&
            b.EndDatum.Date >= start.Date);

        if (excludeBookingId.HasValue)
            query = query.Where(b => b.Id != excludeBookingId.Value);

        return await query.AnyAsync();
    }
}
