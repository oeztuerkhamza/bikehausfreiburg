using BikeHaus.Application.DTOs;
using BikeHaus.Application.Interfaces;
using BikeHaus.Application.Mappings;
using BikeHaus.Domain.Entities;
using BikeHaus.Domain.Interfaces;

namespace BikeHaus.Application.Services;

public class RentalAccessoryService : IRentalAccessoryService
{
    private readonly IRentalAccessoryRepository _repository;

    public RentalAccessoryService(IRentalAccessoryRepository repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<RentalAccessoryListDto>> GetAllAsync()
    {
        var items = await _repository.GetAllAsync();
        return items
            .Select(a => a.ToListDto())
            .OrderByDescending(a => a.CreatedAt);
    }

    public async Task<IEnumerable<RentalAccessoryListDto>> GetActiveAsync()
    {
        var items = await _repository.GetActiveAsync();
        return items.Select(a => a.ToListDto());
    }

    public async Task<RentalAccessoryDto?> GetByIdAsync(int id)
    {
        var item = await _repository.GetByIdAsync(id);
        return item?.ToDto();
    }

    public async Task<RentalAccessoryDto> CreateAsync(RentalAccessoryCreateDto dto)
    {
        var entity = new RentalAccessory
        {
            Bezeichnung = dto.Bezeichnung,
            Tagespreis = dto.Tagespreis,
            Verlustgebuehr = dto.Verlustgebuehr,
            Beschreibung = dto.Beschreibung,
            Aktiv = true
        };

        var created = await _repository.AddAsync(entity);
        return created.ToDto();
    }

    public async Task<RentalAccessoryDto> UpdateAsync(int id, RentalAccessoryUpdateDto dto)
    {
        var entity = await _repository.GetByIdAsync(id)
            ?? throw new KeyNotFoundException($"Rental accessory with ID {id} not found.");

        entity.Bezeichnung = dto.Bezeichnung;
        entity.Tagespreis = dto.Tagespreis;
        entity.Verlustgebuehr = dto.Verlustgebuehr;
        entity.Beschreibung = dto.Beschreibung;
        entity.Aktiv = dto.Aktiv;
        entity.UpdatedAt = DateTime.UtcNow;

        await _repository.UpdateAsync(entity);
        return entity.ToDto();
    }

    public async Task DeleteAsync(int id)
    {
        await _repository.DeleteAsync(id);
    }
}
