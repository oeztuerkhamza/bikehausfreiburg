using BikeHaus.Application.DTOs;

namespace BikeHaus.Application.Interfaces;

public interface IPurchaseService
{
    Task<IEnumerable<PurchaseListDto>> GetAllAsync();
    Task<PaginatedResult<PurchaseListDto>> GetPaginatedAsync(PaginationParams paginationParams);
    Task<PurchaseDto?> GetByIdAsync(int id);
    Task<PurchaseDto?> GetByBicycleIdAsync(int bicycleId);
    Task<PurchaseDto> CreateAsync(PurchaseCreateDto dto);
    Task<PurchaseDto> UpdateAsync(int id, PurchaseUpdateDto dto);
    Task DeleteAsync(int id);
    Task<byte[]> GeneratePdfAsync(int id);
}
