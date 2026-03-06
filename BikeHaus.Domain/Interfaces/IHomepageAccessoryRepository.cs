using BikeHaus.Domain.Entities;

namespace BikeHaus.Domain.Interfaces;

public interface IHomepageAccessoryRepository : IRepository<HomepageAccessory>
{
    Task<IEnumerable<HomepageAccessory>> GetAllWithImagesAsync();
    Task<IEnumerable<HomepageAccessory>> GetAllActiveAsync();
    Task<IEnumerable<HomepageAccessory>> GetByCategoryAsync(string category);
    Task<HomepageAccessory?> GetWithImagesAsync(int id);
    Task<IEnumerable<string>> GetCategoriesAsync();
}
