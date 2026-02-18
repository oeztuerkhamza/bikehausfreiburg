using System.Linq.Expressions;
using BikeHaus.Domain.Entities;

namespace BikeHaus.Domain.Interfaces;

public interface IPurchaseRepository : IRepository<Purchase>
{
    Task<Purchase?> GetWithDetailsAsync(int id);
    Task<Purchase?> GetByBicycleIdAsync(int bicycleId);
    Task<IEnumerable<Purchase>> GetRecentPurchasesAsync(int count = 10);
    Task<string> GenerateBelegNummerAsync();
    Task<(IEnumerable<Purchase> Items, int TotalCount)> GetPaginatedAsync(int page, int pageSize, Expression<Func<Purchase, bool>>? predicate = null);
}
