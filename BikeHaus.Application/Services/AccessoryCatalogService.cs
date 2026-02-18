using BikeHaus.Application.DTOs;
using BikeHaus.Application.Interfaces;
using BikeHaus.Domain.Entities;
using BikeHaus.Domain.Interfaces;

namespace BikeHaus.Application.Services;

public class AccessoryCatalogService : IAccessoryCatalogService
{
    private readonly IAccessoryCatalogRepository _repository;

    public AccessoryCatalogService(IAccessoryCatalogRepository repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<AccessoryCatalogListDto>> GetAllAsync()
    {
        var items = await _repository.GetAllAsync();
        return items.Select(ToListDto).OrderBy(x => x.Bezeichnung);
    }

    public async Task<IEnumerable<AccessoryCatalogListDto>> GetActiveAsync()
    {
        var items = await _repository.GetActiveAsync();
        return items.Select(ToListDto);
    }

    public async Task<IEnumerable<AccessoryCatalogListDto>> SearchAsync(string query)
    {
        var items = await _repository.SearchAsync(query);
        return items.Select(ToListDto);
    }

    public async Task<AccessoryCatalogDto?> GetByIdAsync(int id)
    {
        var item = await _repository.GetByIdAsync(id);
        return item != null ? ToDto(item) : null;
    }

    public async Task<AccessoryCatalogDto> CreateAsync(AccessoryCatalogCreateDto dto)
    {
        var entity = new AccessoryCatalog
        {
            Bezeichnung = dto.Bezeichnung,
            Standardpreis = dto.Standardpreis,
            Kategorie = dto.Kategorie,
            Aktiv = true
        };

        var created = await _repository.AddAsync(entity);
        return ToDto(created);
    }

    public async Task<AccessoryCatalogDto> UpdateAsync(int id, AccessoryCatalogUpdateDto dto)
    {
        var entity = await _repository.GetByIdAsync(id)
            ?? throw new KeyNotFoundException($"AccessoryCatalog with ID {id} not found.");

        entity.Bezeichnung = dto.Bezeichnung;
        entity.Standardpreis = dto.Standardpreis;
        entity.Kategorie = dto.Kategorie;
        entity.Aktiv = dto.Aktiv;
        entity.UpdatedAt = DateTime.UtcNow;

        await _repository.UpdateAsync(entity);
        return ToDto(entity);
    }

    public async Task DeleteAsync(int id)
    {
        await _repository.DeleteAsync(id);
    }

    private static AccessoryCatalogDto ToDto(AccessoryCatalog entity) => new(
        entity.Id,
        entity.Bezeichnung,
        entity.Standardpreis,
        entity.Kategorie,
        entity.Aktiv,
        entity.CreatedAt
    );

    private static AccessoryCatalogListDto ToListDto(AccessoryCatalog entity) => new(
        entity.Id,
        entity.Bezeichnung,
        entity.Standardpreis,
        entity.Kategorie,
        entity.Aktiv
    );
}
