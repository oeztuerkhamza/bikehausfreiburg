using System.Linq.Expressions;
using BikeHaus.Domain.Entities;

namespace BikeHaus.Domain.Interfaces;

public interface IReturnRepository : IRepository<Return>
{
    Task<Return?> GetWithDetailsAsync(int id);
    Task<IEnumerable<Return>> GetBySaleIdAsync(int saleId);
    Task<bool> ExistsByBicycleIdAsync(int bicycleId);
    Task<IEnumerable<Return>> GetRecentReturnsAsync(int count = 10);
    Task<string> GenerateBelegNummerAsync();
    Task<(IEnumerable<Return> Items, int TotalCount)> GetPaginatedAsync(int page, int pageSize, Expression<Func<Return, bool>>? predicate = null);
}
