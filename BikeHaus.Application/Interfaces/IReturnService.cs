using BikeHaus.Application.DTOs;

namespace BikeHaus.Application.Interfaces;

public interface IReturnService
{
    Task<IEnumerable<ReturnListDto>> GetAllAsync();
    Task<PaginatedResult<ReturnListDto>> GetPaginatedAsync(PaginationParams paginationParams);
    Task<ReturnDto?> GetByIdAsync(int id);
    Task<ReturnDto> CreateAsync(ReturnCreateDto dto);
    Task DeleteAsync(int id);
    Task<string> GetNextBelegNummerAsync();
    Task<byte[]> GeneratePdfAsync(int id);
}
