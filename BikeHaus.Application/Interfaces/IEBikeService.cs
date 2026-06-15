using BikeHaus.Application.DTOs;

namespace BikeHaus.Application.Interfaces;

public interface IEBikeService
{
    Task<IEnumerable<EBikeDto>> GetAllAsync();
    Task<IEnumerable<EBikeDto>> GetAllActiveAsync();
    Task<IEnumerable<EBikeDto>> GetByCategoryAsync(string category);
    Task<EBikeDto?> GetByIdAsync(int id);
    Task<EBikeDto> CreateAsync(EBikeCreateDto dto);
    Task<EBikeDto?> UpdateAsync(int id, EBikeUpdateDto dto);
    Task<bool> DeleteAsync(int id);
    Task<EBikeImageDto> AddImageAsync(int eBikeId, string filePath, int sortOrder);
    Task<bool> DeleteImageAsync(int imageId);
    Task<IEnumerable<EBikeCategoryDto>> GetCategoriesAsync();
}
