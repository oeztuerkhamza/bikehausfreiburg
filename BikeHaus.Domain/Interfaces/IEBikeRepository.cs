using BikeHaus.Domain.Entities;

namespace BikeHaus.Domain.Interfaces;

public interface IEBikeRepository : IRepository<EBike>
{
    Task<IEnumerable<EBike>> GetAllWithImagesAsync();
    Task<IEnumerable<EBike>> GetAllActiveAsync();
    Task<IEnumerable<EBike>> GetByCategoryAsync(string category);
    Task<EBike?> GetWithImagesAsync(int id);
    Task<IEnumerable<string>> GetCategoriesAsync();
}
