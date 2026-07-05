using System.Linq.Expressions;
using BikeHaus.Domain.Entities;

namespace BikeHaus.Domain.Interfaces;

public interface IPurchaseRepository : IRepository<Purchase>
{
    Task<Purchase?> GetWithDetailsAsync(int id);
    Task<Purchase?> GetByBicycleIdAsync(int bicycleId);
    // Normalised (trimmed, upper-case) frame numbers that appear on any Ankauf receipt.
    // Lets the Verkäufe list flag second-hand sales whose bike matches a purchase.
    Task<HashSet<string>> GetPurchaseRahmennummernAsync();
    Task<IEnumerable<Purchase>> GetRecentPurchasesAsync(int count = 10);
    Task<string> GenerateBelegNummerAsync();
    Task<bool> BelegNummerExistsAsync(string belegNummer);
    Task<(IEnumerable<Purchase> Items, int TotalCount)> GetPaginatedAsync(int page, int pageSize, Expression<Func<Purchase, bool>>? predicate = null);
}
