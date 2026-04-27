using System.Linq.Expressions;
using BikeHaus.Domain.Entities;

namespace BikeHaus.Domain.Interfaces;

public interface IRentalBookingRepository : IRepository<RentalBooking>
{
    Task<RentalBooking?> GetWithDetailsAsync(int id);
    Task<string> GenerateBuchungsNummerAsync();
    Task<(IEnumerable<RentalBooking> Items, int TotalCount)> GetPaginatedAsync(
        int page,
        int pageSize,
        Expression<Func<RentalBooking, bool>>? predicate = null);
    Task<IEnumerable<RentalBooking>> GetApprovedByBicycleIdAsync(int bicycleId);
    Task<bool> ExistsApprovedOverlapAsync(int bicycleId, DateTime start, DateTime end, int? excludeBookingId = null);
}
