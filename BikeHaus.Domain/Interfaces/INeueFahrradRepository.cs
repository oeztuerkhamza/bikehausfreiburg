using BikeHaus.Domain.Entities;

namespace BikeHaus.Domain.Interfaces;

public interface INeueFahrradRepository : IRepository<NeueFahrrad>
{
    Task<IEnumerable<NeueFahrrad>> GetAllActiveAsync();
    Task<IEnumerable<NeueFahrrad>> GetByCategoryAsync(string category);
    Task<NeueFahrrad?> GetWithImagesAsync(int id);
    Task<IEnumerable<string>> GetCategoriesAsync();
}
