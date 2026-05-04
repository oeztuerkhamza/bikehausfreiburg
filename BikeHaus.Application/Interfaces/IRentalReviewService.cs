using BikeHaus.Application.DTOs;

namespace BikeHaus.Application.Interfaces;

public interface IRentalReviewService
{
    Task<IEnumerable<RentalReviewDto>> GetAllAsync();
    Task<IEnumerable<RentalReviewPublicDto>> GetApprovedAsync();
    Task<IEnumerable<RentalReviewDto>> GetPendingAsync();
    Task<RentalReviewDto?> GetByIdAsync(int id);
    Task<RentalReviewDto> CreateAsync(RentalReviewCreateDto dto);
    Task<RentalReviewDto?> ApproveAsync(int id, RentalReviewApproveDto dto);
    Task<bool> DeleteAsync(int id);
}
