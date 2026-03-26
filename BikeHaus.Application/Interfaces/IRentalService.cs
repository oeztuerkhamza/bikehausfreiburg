using BikeHaus.Application.DTOs;

namespace BikeHaus.Application.Interfaces;

public interface IRentalService
{
    Task<IEnumerable<RentalListDto>> GetAllAsync();
    Task<PaginatedResult<RentalListDto>> GetPaginatedAsync(PaginationParams paginationParams);
    Task<RentalDto?> GetByIdAsync(int id);
    Task<RentalDto> CreateAsync(RentalCreateDto dto);
    Task<RentalDto> UpdateAsync(int id, RentalUpdateDto dto);
    Task DeleteAsync(int id);
    Task<RentalDto> ReturnBicycleAsync(int id);
    Task<RentalDto> CancelAsync(int id);
}
