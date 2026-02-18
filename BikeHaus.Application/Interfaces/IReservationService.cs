using BikeHaus.Application.DTOs;

namespace BikeHaus.Application.Interfaces;

public interface IReservationService
{
    Task<IEnumerable<ReservationListDto>> GetAllAsync();
    Task<PaginatedResult<ReservationListDto>> GetPaginatedAsync(PaginationParams paginationParams);
    Task<ReservationDto?> GetByIdAsync(int id);
    Task<ReservationDto> CreateAsync(ReservationCreateDto dto);
    Task<ReservationDto> UpdateAsync(int id, ReservationUpdateDto dto);
    Task DeleteAsync(int id);
    Task CancelAsync(int id);
    Task<SaleDto> ConvertToSaleAsync(int id, ReservationConvertToSaleDto dto);
    Task ExpireOldReservationsAsync();
}
