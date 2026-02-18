using System.Linq.Expressions;
using BikeHaus.Domain.Entities;

namespace BikeHaus.Domain.Interfaces;

public interface IBicycleRepository : IRepository<Bicycle>
{
    Task<IEnumerable<Bicycle>> GetAvailableBicyclesAsync();
    Task<Bicycle?> GetByRahmennummerAsync(string rahmennummer);
    Task<Bicycle?> GetWithDetailsAsync(int id);
    Task<(IEnumerable<Bicycle> Items, int TotalCount)> GetPaginatedAsync(
        int page, int pageSize,
        Expression<Func<Bicycle, bool>>? predicate = null);
    Task<int?> GetMaxStokNoAsync();
    Task<Bicycle?> GetByStokNoAsync(string stokNo);
}
