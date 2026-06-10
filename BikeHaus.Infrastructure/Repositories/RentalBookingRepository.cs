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
            .Include(b => b.Bikes).ThenInclude(bk => bk.Bicycle)
            .Include(b => b.Accessories)
            .FirstOrDefaultAsync(b => b.Id == id);
    }

    public async Task<RentalBooking?> GetByBookingNumberWithDetailsAsync(string bookingNumber)
    {
        return await _dbSet
            .Include(b => b.Bicycle)
            .Include(b => b.Bikes).ThenInclude(bk => bk.Bicycle)
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
            .Include(b => b.Bikes).ThenInclude(bk => bk.Bicycle)
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
        // Legacy single-bike bookings (no Bikes entries)
        var legacy = await _dbSet
            .Include(b => b.Bikes)
            .Where(b => b.BicycleId == bicycleId
                && !b.Bikes.Any()
                && b.Status == RentalBookingStatus.Approved)
            .OrderBy(b => b.StartDatum)
            .ToListAsync();

        // New multi-bike bookings via RentalBookingBike
        var multiBookingIds = await _context.Set<RentalBookingBike>()
            .Where(bk => bk.BicycleId == bicycleId
                && bk.RentalBooking.Status == RentalBookingStatus.Approved)
            .Select(bk => bk.RentalBookingId)
            .Distinct()
            .ToListAsync();

        var multi = await _dbSet
            .Include(b => b.Bikes).ThenInclude(bk => bk.Bicycle)
            .Where(b => multiBookingIds.Contains(b.Id))
            .ToListAsync();

        return legacy.Concat(multi);
    }

    public async Task<IEnumerable<RentalBooking>> GetPendingByBicycleIdAsync(int bicycleId)
    {
        // Legacy single-bike bookings (no Bikes entries)
        var legacy = await _dbSet
            .Include(b => b.Bikes)
            .Where(b => b.BicycleId == bicycleId
                && !b.Bikes.Any()
                && b.Status == RentalBookingStatus.Pending)
            .OrderBy(b => b.StartDatum)
            .ToListAsync();

        // New multi-bike bookings via RentalBookingBike
        var multiBookingIds = await _context.Set<RentalBookingBike>()
            .Where(bk => bk.BicycleId == bicycleId
                && bk.RentalBooking.Status == RentalBookingStatus.Pending)
            .Select(bk => bk.RentalBookingId)
            .Distinct()
            .ToListAsync();

        var multi = await _dbSet
            .Include(b => b.Bikes).ThenInclude(bk => bk.Bicycle)
            .Where(b => multiBookingIds.Contains(b.Id))
            .ToListAsync();

        return legacy.Concat(multi);
    }

    public async Task<IEnumerable<RentalBooking>> GetByStatusesWithBikesAsync(IEnumerable<RentalBookingStatus> statuses)
    {
        var statusList = statuses.ToList();
        return await _dbSet
            .Include(b => b.Bikes)
            .Where(b => statusList.Contains(b.Status))
            .ToListAsync();
    }

    public async Task<IEnumerable<RentalBooking>> GetOverlappingRangeWithBikesAsync(DateTime from, DateTime to)
    {
        // Calendar view: all non-cancelled bookings touching the range.
        return await _dbSet
            .Include(b => b.Bicycle)
            .Include(b => b.Bikes).ThenInclude(bk => bk.Bicycle)
            .Where(b => b.Status != RentalBookingStatus.Cancelled
                && b.StartDatum.Date <= to.Date
                && b.EndDatum.Date >= from.Date)
            .OrderBy(b => b.StartDatum)
            .ToListAsync();
    }

    public async Task<bool> ExistsApprovedOverlapAsync(int bicycleId, DateTime start, DateTime end, int? excludeBookingId = null)
    {
        // Legacy single-bike bookings
        var legacyQuery = _dbSet.Where(b =>
            b.BicycleId == bicycleId &&
            !b.Bikes.Any() &&
            b.Status == RentalBookingStatus.Approved &&
            b.StartDatum.Date <= end.Date &&
            b.EndDatum.Date >= start.Date);

        if (excludeBookingId.HasValue)
            legacyQuery = legacyQuery.Where(b => b.Id != excludeBookingId.Value);

        if (await legacyQuery.AnyAsync()) return true;

        // New multi-bike bookings via RentalBookingBike
        var bikeQuery = _context.Set<RentalBookingBike>().Where(bk =>
            bk.BicycleId == bicycleId &&
            bk.RentalBooking.Status == RentalBookingStatus.Approved &&
            bk.StartDatum.Date <= end.Date &&
            bk.EndDatum.Date >= start.Date);

        if (excludeBookingId.HasValue)
            bikeQuery = bikeQuery.Where(bk => bk.RentalBookingId != excludeBookingId.Value);

        return await bikeQuery.AnyAsync();
    }

    public async Task<bool> ExistsApprovedOverlapForBikesAsync(
        IEnumerable<(int BicycleId, DateTime Start, DateTime End)> bikes,
        int? excludeBookingId = null)
    {
        foreach (var bike in bikes)
        {
            if (await ExistsApprovedOverlapAsync(bike.BicycleId, bike.Start, bike.End, excludeBookingId))
                return true;
        }
        return false;
    }

    public async Task<bool> ExistsActiveOverlapAsync(int bicycleId, DateTime start, DateTime end, int? excludeBookingId = null)
    {
        var activeStatuses = new[] { RentalBookingStatus.Approved, RentalBookingStatus.Pending };

        var legacyQuery = _dbSet.Where(b =>
            b.BicycleId == bicycleId &&
            !b.Bikes.Any() &&
            activeStatuses.Contains(b.Status) &&
            b.StartDatum.Date <= end.Date &&
            b.EndDatum.Date >= start.Date);

        if (excludeBookingId.HasValue)
            legacyQuery = legacyQuery.Where(b => b.Id != excludeBookingId.Value);

        if (await legacyQuery.AnyAsync()) return true;

        var bikeQuery = _context.Set<RentalBookingBike>().Where(bk =>
            bk.BicycleId == bicycleId &&
            activeStatuses.Contains(bk.RentalBooking.Status) &&
            bk.StartDatum.Date <= end.Date &&
            bk.EndDatum.Date >= start.Date);

        if (excludeBookingId.HasValue)
            bikeQuery = bikeQuery.Where(bk => bk.RentalBookingId != excludeBookingId.Value);

        return await bikeQuery.AnyAsync();
    }

    public async Task<bool> ExistsActiveOverlapForBikesAsync(
        IEnumerable<(int BicycleId, DateTime Start, DateTime End)> bikes,
        int? excludeBookingId = null)
    {
        foreach (var bike in bikes)
        {
            if (await ExistsActiveOverlapAsync(bike.BicycleId, bike.Start, bike.End, excludeBookingId))
                return true;
        }
        return false;
    }

    public async Task<IEnumerable<int>> GetBusyBicycleIdsForPeriodAsync(DateOnly start, DateOnly end)
    {
        var startDt = start.ToDateTime(TimeOnly.MinValue);
        var endDt = end.ToDateTime(TimeOnly.MaxValue);

        var legacyIds = await _dbSet
            .Where(b => !b.Bikes.Any()
                && (b.Status == RentalBookingStatus.Approved || b.Status == RentalBookingStatus.Pending)
                && b.StartDatum <= endDt
                && b.EndDatum >= startDt)
            .Select(b => b.BicycleId)
            .ToListAsync();

        var multiIds = await _context.Set<RentalBookingBike>()
            .Where(bk => (bk.RentalBooking.Status == RentalBookingStatus.Approved
                         || bk.RentalBooking.Status == RentalBookingStatus.Pending)
                && bk.StartDatum <= endDt
                && bk.EndDatum >= startDt)
            .Select(bk => bk.BicycleId)
            .Distinct()
            .ToListAsync();

        return legacyIds.Union(multiIds);
    }
}
