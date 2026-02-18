using BikeHaus.Domain.Entities;

namespace BikeHaus.Domain.Interfaces;

public interface IReturnRepository : IRepository<Return>
{
    Task<Return?> GetWithDetailsAsync(int id);
    Task<IEnumerable<Return>> GetBySaleIdAsync(int saleId);
    Task<bool> ExistsByBicycleIdAsync(int bicycleId);
    Task<IEnumerable<Return>> GetRecentReturnsAsync(int count = 10);
    Task<string> GenerateBelegNummerAsync();
}
