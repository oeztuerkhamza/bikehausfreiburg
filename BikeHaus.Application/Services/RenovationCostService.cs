using BikeHaus.Application.DTOs;
using BikeHaus.Application.Interfaces;
using BikeHaus.Domain.Entities;
using BikeHaus.Domain.Interfaces;

namespace BikeHaus.Application.Services;

public class RenovationCostService : IRenovationCostService
{
    private readonly IRenovationCostRepository _repository;

    public RenovationCostService(IRenovationCostRepository repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<RenovationCostListDto>> GetAllAsync()
    {
        var items = await _repository.GetAllAsync();
        return items.OrderByDescending(r => r.Datum).Select(MapToListDto);
    }

    public async Task<RenovationCostDto?> GetByIdAsync(int id)
    {
        var item = await _repository.GetByIdAsync(id);
        return item == null ? null : MapToDto(item);
    }

    public async Task<RenovationCostDto> CreateAsync(RenovationCostCreateDto dto)
    {
        var entity = new RenovationCost
        {
            Datum = dto.Datum,
            Betrag = dto.Betrag,
            GemachteArbeit = dto.GemachteArbeit,
            Notizen = dto.Notizen
        };
        var created = await _repository.AddAsync(entity);
        return MapToDto(created);
    }

    public async Task<RenovationCostDto?> UpdateAsync(int id, RenovationCostUpdateDto dto)
    {
        var entity = await _repository.GetByIdAsync(id);
        if (entity == null) return null;

        entity.Datum = dto.Datum;
        entity.Betrag = dto.Betrag;
        entity.GemachteArbeit = dto.GemachteArbeit;
        entity.Notizen = dto.Notizen;
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

    private static RenovationCostListDto MapToListDto(RenovationCost r) =>
        new(r.Id, r.Datum, r.Betrag, r.GemachteArbeit, r.Notizen);

    private static RenovationCostDto MapToDto(RenovationCost r) =>
        new(r.Id, r.Datum, r.Betrag, r.GemachteArbeit, r.Notizen, r.CreatedAt);
}
