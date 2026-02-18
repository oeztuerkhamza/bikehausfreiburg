using BikeHaus.Application.DTOs;

namespace BikeHaus.Application.Interfaces;

public interface IAccessoryCatalogService
{
    Task<IEnumerable<AccessoryCatalogListDto>> GetAllAsync();
    Task<IEnumerable<AccessoryCatalogListDto>> GetActiveAsync();
    Task<IEnumerable<AccessoryCatalogListDto>> SearchAsync(string query);
    Task<AccessoryCatalogDto?> GetByIdAsync(int id);
    Task<AccessoryCatalogDto> CreateAsync(AccessoryCatalogCreateDto dto);
    Task<AccessoryCatalogDto> UpdateAsync(int id, AccessoryCatalogUpdateDto dto);
    Task DeleteAsync(int id);
}
