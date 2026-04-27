using BikeHaus.Application.DTOs;

namespace BikeHaus.Application.Interfaces;

public interface IRentalAccessoryService
{
    Task<IEnumerable<RentalAccessoryListDto>> GetAllAsync();
    Task<IEnumerable<RentalAccessoryListDto>> GetActiveAsync();
    Task<RentalAccessoryDto?> GetByIdAsync(int id);
    Task<RentalAccessoryDto> CreateAsync(RentalAccessoryCreateDto dto);
    Task<RentalAccessoryDto> UpdateAsync(int id, RentalAccessoryUpdateDto dto);
    Task DeleteAsync(int id);
}
