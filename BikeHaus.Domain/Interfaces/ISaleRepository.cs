using BikeHaus.Domain.Entities;

namespace BikeHaus.Domain.Interfaces;

public interface ISaleRepository : IRepository<Sale>
{
    Task<Sale?> GetWithDetailsAsync(int id);
    Task<IEnumerable<Sale>> GetRecentSalesAsync(int count = 10);
    Task<string> GenerateBelegNummerAsync();
}
