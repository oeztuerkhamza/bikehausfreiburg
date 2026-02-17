using BikeHaus.Domain.Entities;

namespace BikeHaus.Domain.Interfaces;

public interface IBicycleRepository : IRepository<Bicycle>
{
    Task<IEnumerable<Bicycle>> GetAvailableBicyclesAsync();
    Task<Bicycle?> GetByRahmennummerAsync(string rahmennummer);
    Task<Bicycle?> GetWithDetailsAsync(int id);
}
