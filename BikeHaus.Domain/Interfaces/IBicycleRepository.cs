using System.Linq.Expressions;
using BikeHaus.Domain.Entities;

namespace BikeHaus.Domain.Interfaces;

public interface IBicycleRepository : IRepository<Bicycle>
{
    Task<IEnumerable<Bicycle>> GetAvailableBicyclesAsync();
    Task<Bicycle?> GetByRahmennummerAsync(string rahmennummer);
    // Normalised (trimmed, upper-case) Rahmennummer values shared by more than one bicycle.
    Task<List<string>> GetDuplicateRahmennummernAsync();
    // Maps normalised (trimmed, upper-case) Rahmennummer -> Lagernummer for bikes that have a stock number.
    // Lets records without their own stock number (e.g. sales) inherit it via frame-number match.
    Task<Dictionary<string, int>> GetLagernummernByRahmennummerAsync();
    Task<Bicycle?> GetWithDetailsAsync(int id);
    Task<(IEnumerable<Bicycle> Items, int TotalCount)> GetPaginatedAsync(
        int page, int pageSize,
        Expression<Func<Bicycle, bool>>? predicate = null);
    Task<IEnumerable<string>> GetUniqueBrandsAsync();
    Task<IEnumerable<string>> GetUniqueModelsAsync(string? brand = null);
    Task<IEnumerable<Bicycle>> GetPublishedOnWebsiteAsync();
    Task<IEnumerable<Bicycle>> GetRentableBicyclesAsync();
    Task<Bicycle?> GetRentableBicycleByIdAsync(int id);
    Task<Bicycle?> GetWithImagesAsync(int id);
    Task<int?> GetMaxLagernummerAsync();
}
