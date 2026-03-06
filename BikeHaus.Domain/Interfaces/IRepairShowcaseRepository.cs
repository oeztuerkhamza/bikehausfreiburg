using BikeHaus.Domain.Entities;

namespace BikeHaus.Domain.Interfaces;

public interface IRepairShowcaseRepository : IRepository<RepairShowcase>
{
    Task<IEnumerable<RepairShowcase>> GetAllWithImagesAsync();
    Task<IEnumerable<RepairShowcase>> GetAllActiveAsync();
    Task<RepairShowcase?> GetWithImagesAsync(int id);
}
