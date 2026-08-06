using BikeHaus.Application.DTOs;

namespace BikeHaus.Application.Interfaces;

public interface IRentalService
{
    Task<IEnumerable<RentalListDto>> GetAllAsync();
    Task<PaginatedResult<RentalListDto>> GetPaginatedAsync(PaginationParams paginationParams, bool includeCompleted = false);
    Task<IEnumerable<RentalCalendarItemDto>> GetCalendarAsync(DateTime from, DateTime to);
    Task<RentalDto?> GetByIdAsync(int id);
    Task<RentalDto> CreateAsync(RentalCreateDto dto);
    Task<RentalDto> UpdateAsync(int id, RentalUpdateDto dto);
    Task DeleteAsync(int id);
    Task<RentalDto> ReturnBicycleAsync(int id, RentalReturnDto dto);
    Task<RentalDto> CancelAsync(int id);
    Task SaveAusweisPhotoPathAsync(int id, string ausweisPhotoPath, bool istRueckseite = false);
    Task<string?> GetAusweisPhotoPathAsync(int id, bool istRueckseite = false);
}
