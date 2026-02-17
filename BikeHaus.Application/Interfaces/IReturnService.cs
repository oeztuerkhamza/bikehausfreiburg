using BikeHaus.Application.DTOs;

namespace BikeHaus.Application.Interfaces;

public interface IReturnService
{
    Task<IEnumerable<ReturnListDto>> GetAllAsync();
    Task<ReturnDto?> GetByIdAsync(int id);
    Task<ReturnDto> CreateAsync(ReturnCreateDto dto);
    Task DeleteAsync(int id);
    Task<byte[]> GeneratePdfAsync(int id);
}
