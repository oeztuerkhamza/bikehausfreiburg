using BikeHaus.Application.DTOs;

namespace BikeHaus.Application.Interfaces;

public interface IRentalAccessoryService
{
    Task<IEnumerable<RentalAccessoryListDto>> GetAllAsync();
    Task<IEnumerable<RentalAccessoryListDto>> GetActiveAsync();
    Task<RentalAccessoryDto?> GetByIdAsync(int id);
    Task<RentalAccessoryDto> CreateAsync(RentalAccessoryCreateDto dto);
    Task<RentalAccessoryDto> UpdateAsync(int id, RentalAccessoryUpdateDto dto);
    Task<RentalAccessoryDto> SetBildPfadAsync(int id, string? bildPfad);
    Task<string?> GetBildPfadAsync(int id);
    Task DeleteAsync(int id);
}
