using System.Linq.Expressions;
using BikeHaus.Domain.Entities;

namespace BikeHaus.Domain.Interfaces;

public interface IRentalBookingRepository : IRepository<RentalBooking>
{
    Task<RentalBooking?> GetWithDetailsAsync(int id);
    Task<RentalBooking?> GetByBookingNumberWithDetailsAsync(string bookingNumber);
    Task<string> GenerateBuchungsNummerAsync();
    Task<(IEnumerable<RentalBooking> Items, int TotalCount)> GetPaginatedAsync(
        int page,
        int pageSize,
        Expression<Func<RentalBooking, bool>>? predicate = null);
    Task<IEnumerable<RentalBooking>> GetApprovedByBicycleIdAsync(int bicycleId);
    Task<IEnumerable<RentalBooking>> GetPendingByBicycleIdAsync(int bicycleId);
    Task<IEnumerable<RentalBooking>> GetByStatusesWithBikesAsync(IEnumerable<Enums.RentalBookingStatus> statuses);
    Task<IEnumerable<RentalBooking>> GetOverlappingRangeWithBikesAsync(DateTime from, DateTime to);
    Task<bool> ExistsApprovedOverlapAsync(int bicycleId, DateTime start, DateTime end, int? excludeBookingId = null);
    Task<bool> ExistsApprovedOverlapForBikesAsync(IEnumerable<(int BicycleId, DateTime Start, DateTime End)> bikes, int? excludeBookingId = null);
    Task<bool> ExistsActiveOverlapAsync(int bicycleId, DateTime start, DateTime end, int? excludeBookingId = null);
    Task<bool> ExistsActiveOverlapForBikesAsync(IEnumerable<(int BicycleId, DateTime Start, DateTime End)> bikes, int? excludeBookingId = null);
    Task<IEnumerable<int>> GetBusyBicycleIdsForPeriodAsync(DateOnly start, DateOnly end);
}
