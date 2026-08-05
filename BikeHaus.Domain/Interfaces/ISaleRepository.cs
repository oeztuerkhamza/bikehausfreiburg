using System.Linq.Expressions;
using BikeHaus.Domain.Entities;

namespace BikeHaus.Domain.Interfaces;

public interface ISaleRepository : IRepository<Sale>
{
    Task<Sale?> GetWithDetailsAsync(int id);
    Task<Sale?> GetByBicycleIdAsync(int bicycleId);
    Task<IEnumerable<Sale>> GetRecentSalesAsync(int count = 10);
    Task<string> GenerateBelegNummerAsync();
    Task<bool> BelegNummerExistsAsync(string belegNummer);
    Task<(IEnumerable<Sale> Items, int TotalCount)> GetPaginatedAsync(int page, int pageSize, Expression<Func<Sale, bool>>? predicate = null);
    /// <summary>Verkäufe eines Zeitraums samt Rad und Käufer — für die Belegübersicht.</summary>
    Task<IEnumerable<Sale>> GetByDateRangeWithDetailsAsync(DateTime from, DateTime to);
    Task<IEnumerable<Sale>> GetSalesWithoutPurchaseAsync();
    Task<int> GetSalesWithoutPurchaseCountAsync();
}
