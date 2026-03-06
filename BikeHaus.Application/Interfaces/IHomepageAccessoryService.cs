using BikeHaus.Application.DTOs;

namespace BikeHaus.Application.Interfaces;

public interface IHomepageAccessoryService
{
    Task<IEnumerable<HomepageAccessoryDto>> GetAllAsync();
    Task<IEnumerable<HomepageAccessoryDto>> GetAllActiveAsync();
    Task<IEnumerable<HomepageAccessoryDto>> GetByCategoryAsync(string category);
    Task<HomepageAccessoryDto?> GetByIdAsync(int id);
    Task<HomepageAccessoryDto> CreateAsync(HomepageAccessoryCreateDto dto);
    Task<HomepageAccessoryDto?> UpdateAsync(int id, HomepageAccessoryUpdateDto dto);
    Task<bool> DeleteAsync(int id);
    Task<HomepageAccessoryImageDto> AddImageAsync(int accessoryId, string filePath, int sortOrder);
    Task<bool> DeleteImageAsync(int imageId);
    Task<IEnumerable<HomepageAccessoryCategoryDto>> GetCategoriesAsync();
}
