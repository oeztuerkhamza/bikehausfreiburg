using BikeHaus.Application.DTOs;

namespace BikeHaus.Application.Interfaces;

public interface IBicycleService
{
    Task<IEnumerable<BicycleDto>> GetAllAsync();
    Task<PaginatedResult<BicycleDto>> GetPaginatedAsync(PaginationParams paginationParams);
    Task<BicycleDto?> GetByIdAsync(int id);
    Task<IEnumerable<BicycleDto>> GetAvailableAsync();
    Task<BicycleDto> CreateAsync(BicycleCreateDto dto);
    Task<BicycleDto> UpdateAsync(int id, BicycleUpdateDto dto);
    Task DeleteAsync(int id);
    Task<IEnumerable<BicycleDto>> SearchAsync(string searchTerm);
    Task<IEnumerable<string>> GetUniqueBrandsAsync();
    Task<IEnumerable<string>> GetUniqueModelsAsync(string? brand = null);
    Task<BicycleDto> TogglePublishOnWebsiteAsync(int id);
    Task<BicycleDto> TogglePublishOnKleinanzeigenAsync(int id);
    Task<BicycleDto> SetKleinanzeigenAnzeigeNrAsync(int id, string anzeigeNr);
    Task<IEnumerable<PublicBicycleDto>> GetPublishedOnWebsiteAsync();
    Task<PublicBicycleDto?> GetPublishedBicycleByIdAsync(int id);
    Task<BicycleImageDto> AddImageAsync(int bicycleId, string filePath, int sortOrder);
    Task DeleteImageAsync(int bicycleId, int imageId);
    Task<IEnumerable<BicycleImageDto>> GetImagesAsync(int bicycleId);
}
