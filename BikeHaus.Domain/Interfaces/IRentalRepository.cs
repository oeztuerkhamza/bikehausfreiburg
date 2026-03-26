using System.Linq.Expressions;
using BikeHaus.Domain.Entities;

namespace BikeHaus.Domain.Interfaces;

public interface IRentalRepository : IRepository<Rental>
{
    Task<Rental?> GetWithDetailsAsync(int id);
    Task<Rental?> GetActiveByBicycleIdAsync(int bicycleId);
    Task<string> GenerateMietvertragNummerAsync();
    Task<(IEnumerable<Rental> Items, int TotalCount)> GetPaginatedAsync(int page, int pageSize, Expression<Func<Rental, bool>>? predicate = null);
}
