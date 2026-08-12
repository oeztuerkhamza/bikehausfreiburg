using System.Linq.Expressions;
using BikeHaus.Domain.Entities;

namespace BikeHaus.Domain.Interfaces;

public interface IRentalRepository : IRepository<Rental>
{
    Task<Rental?> GetWithDetailsAsync(int id);
    Task<Rental?> GetActiveByBicycleIdAsync(int bicycleId);
    Task<string> GenerateMietvertragNummerAsync();
    Task<bool> MietvertragNummerExistsAsync(string mietvertragNummer, int excludeRentalId);
    Task<(IEnumerable<Rental> Items, int TotalCount)> GetPaginatedAsync(int page, int pageSize, Expression<Func<Rental, bool>>? predicate = null, bool includeCompleted = false);
    Task<IEnumerable<int>> GetBusyBicycleIdsForPeriodAsync(DateOnly start, DateOnly end);
    Task<IEnumerable<Rental>> GetOverlappingRangeWithBikesAsync(DateTime from, DateTime to);

    /// <summary>Mietverträge, deren Startdatum im Zeitraum liegt — für die Belegübersicht.</summary>
    Task<IEnumerable<Rental>> GetByVertragsdatumRangeWithDetailsAsync(DateTime from, DateTime to);
}
