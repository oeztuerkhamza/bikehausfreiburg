using BikeHaus.Application.DTOs;

namespace BikeHaus.Application.Interfaces;

public interface ISaleService
{
    Task<IEnumerable<SaleListDto>> GetAllAsync();
    Task<PaginatedResult<SaleListDto>> GetPaginatedAsync(PaginationParams paginationParams);
    Task<SaleDto?> GetByIdAsync(int id);
    Task<SaleDto> CreateAsync(SaleCreateDto dto);
    Task<SaleDto> UpdateAsync(int id, SaleUpdateDto dto);
    Task DeleteAsync(int id);
    Task<byte[]> GeneratePdfAsync(int id);
}
