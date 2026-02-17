using BikeHaus.Application.DTOs;

namespace BikeHaus.Application.Interfaces;

public interface ISaleService
{
    Task<IEnumerable<SaleListDto>> GetAllAsync();
    Task<SaleDto?> GetByIdAsync(int id);
    Task<SaleDto> CreateAsync(SaleCreateDto dto);
    Task DeleteAsync(int id);
    Task<byte[]> GeneratePdfAsync(int id);
}
