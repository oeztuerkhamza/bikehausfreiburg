using BikeHaus.Application.DTOs;
using BikeHaus.Application.Interfaces;
using BikeHaus.Domain.Entities;
using BikeHaus.Domain.Interfaces;

namespace BikeHaus.Application.Services;

public class RentalReviewService : IRentalReviewService
{
    private readonly IRentalReviewRepository _repository;

    public RentalReviewService(IRentalReviewRepository repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<RentalReviewDto>> GetAllAsync()
    {
        var items = await _repository.GetAllAsync();
        return items.OrderByDescending(r => r.CreatedAt).Select(MapToDto);
    }

    public async Task<IEnumerable<RentalReviewPublicDto>> GetApprovedAsync()
    {
        var items = await _repository.GetApprovedAsync();
        return items.OrderByDescending(r => r.CreatedAt).Select(MapToPublicDto);
    }

    public async Task<IEnumerable<RentalReviewDto>> GetPendingAsync()
    {
        var items = await _repository.GetPendingAsync();
        return items.OrderByDescending(r => r.CreatedAt).Select(MapToDto);
    }

    public async Task<RentalReviewDto?> GetByIdAsync(int id)
    {
        var item = await _repository.GetByIdAsync(id);
        return item == null ? null : MapToDto(item);
    }

    public async Task<RentalReviewDto> CreateAsync(RentalReviewCreateDto dto)
    {
        var sterne = Math.Clamp(dto.Sterne, 1, 5);
        var entity = new RentalReview
        {
            Ad = dto.Ad.Trim(),
            Email = string.IsNullOrWhiteSpace(dto.Email) ? null : dto.Email.Trim(),
            Sterne = sterne,
            Yorum = dto.Yorum.Trim(),
            Onaylandi = false,
        };
        var created = await _repository.AddAsync(entity);
        return MapToDto(created);
    }

    public async Task<RentalReviewDto?> ApproveAsync(int id, RentalReviewApproveDto dto)
    {
        var entity = await _repository.GetByIdAsync(id);
        if (entity == null) return null;

        entity.Onaylandi = dto.Onaylandi;
        entity.AdminNotiz = dto.AdminNotiz;
        entity.UpdatedAt = DateTime.UtcNow;

        await _repository.UpdateAsync(entity);
        return MapToDto(entity);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var entity = await _repository.GetByIdAsync(id);
        if (entity == null) return false;
        await _repository.DeleteAsync(id);
        return true;
    }

    private static RentalReviewDto MapToDto(RentalReview r) =>
        new(r.Id, r.Ad, r.Email, r.Sterne, r.Yorum, r.Onaylandi, r.AdminNotiz, r.CreatedAt);

    private static RentalReviewPublicDto MapToPublicDto(RentalReview r) =>
        new(r.Id, r.Ad, r.Sterne, r.Yorum, r.CreatedAt);
}
