using BikeHaus.Domain.Entities;

namespace BikeHaus.Domain.Interfaces;

public interface IPurchaseRepository : IRepository<Purchase>
{
    Task<Purchase?> GetWithDetailsAsync(int id);
    Task<IEnumerable<Purchase>> GetRecentPurchasesAsync(int count = 10);
    Task<string> GenerateBelegNummerAsync();
}
