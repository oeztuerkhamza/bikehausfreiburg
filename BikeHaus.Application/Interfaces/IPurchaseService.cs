using BikeHaus.Application.DTOs;

namespace BikeHaus.Application.Interfaces;

public interface IPurchaseService
{
    Task<IEnumerable<PurchaseListDto>> GetAllAsync();
    Task<PurchaseDto?> GetByIdAsync(int id);
    Task<PurchaseDto> CreateAsync(PurchaseCreateDto dto);
    Task DeleteAsync(int id);
    Task<byte[]> GeneratePdfAsync(int id);
}
