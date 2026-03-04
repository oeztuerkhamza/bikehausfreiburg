using BikeHaus.Application.DTOs;

namespace BikeHaus.Application.Interfaces;

public interface INeueFahrradService
{
    Task<IEnumerable<NeueFahrradDto>> GetAllAsync();
    Task<IEnumerable<NeueFahrradDto>> GetAllActiveAsync();
    Task<IEnumerable<NeueFahrradDto>> GetByCategoryAsync(string category);
    Task<NeueFahrradDto?> GetByIdAsync(int id);
    Task<NeueFahrradDto> CreateAsync(NeueFahrradCreateDto dto);
    Task<NeueFahrradDto?> UpdateAsync(int id, NeueFahrradUpdateDto dto);
    Task<bool> DeleteAsync(int id);
    Task<NeueFahrradImageDto> AddImageAsync(int fahrradId, string filePath, int sortOrder);
    Task<bool> DeleteImageAsync(int imageId);
    Task<IEnumerable<NeueFahrradCategoryDto>> GetCategoriesAsync();
}
