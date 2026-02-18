using System.Linq.Expressions;
using BikeHaus.Domain.Entities;

namespace BikeHaus.Domain.Interfaces;

public interface ISaleRepository : IRepository<Sale>
{
    Task<Sale?> GetWithDetailsAsync(int id);
    Task<IEnumerable<Sale>> GetRecentSalesAsync(int count = 10);
    Task<string> GenerateBelegNummerAsync();
    Task<(IEnumerable<Sale> Items, int TotalCount)> GetPaginatedAsync(int page, int pageSize, Expression<Func<Sale, bool>>? predicate = null);
}
