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
    Task<BicycleDto?> GetByStokNoAsync(string stokNo);
    Task<string> GetNextStokNoAsync();
    Task<IEnumerable<string>> GetUniqueBrandsAsync();
    Task<IEnumerable<string>> GetUniqueModelsAsync(string? brand = null);
}
