using System.Linq.Expressions;
using BikeHaus.Domain.Entities;

namespace BikeHaus.Domain.Interfaces;

public interface IReservationRepository : IRepository<Reservation>
{
    Task<Reservation?> GetWithDetailsAsync(int id);
    Task<Reservation?> GetActiveByBicycleIdAsync(int bicycleId);
    Task<IEnumerable<Reservation>> GetExpiredReservationsAsync();
    Task<string> GenerateReservierungsNummerAsync();
    Task<(IEnumerable<Reservation> Items, int TotalCount)> GetPaginatedAsync(int page, int pageSize, Expression<Func<Reservation, bool>>? predicate = null);
}
