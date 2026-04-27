using BikeHaus.Application.DTOs;

namespace BikeHaus.Application.Interfaces;

public interface IRentalBookingService
{
    Task<PaginatedResult<RentalBookingListDto>> GetPaginatedAsync(PaginationParams paginationParams);
    Task<RentalBookingDto?> GetByIdAsync(int id);
    Task<RentalBookingDto> CreateAsync(RentalBookingCreateDto dto);
    Task<RentalBookingDto> ApproveAsync(int id, RentalBookingApproveDto dto);
    Task<RentalBookingDto> CancelAsync(int id, RentalBookingCancelDto dto);
    Task<IEnumerable<RentalBookingRangeDto>> GetApprovedRangesAsync(int bicycleId);
    Task<int> GetPendingCountAsync();
}
