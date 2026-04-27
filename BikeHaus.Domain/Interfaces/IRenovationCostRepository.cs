using BikeHaus.Domain.Entities;

namespace BikeHaus.Domain.Interfaces;

public interface IRenovationCostRepository : IRepository<RenovationCost>
{
    Task<IEnumerable<RenovationCost>> GetByDateRangeAsync(DateTime startDate, DateTime endDate);
}
