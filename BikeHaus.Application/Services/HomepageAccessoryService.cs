using BikeHaus.Application.DTOs;
using BikeHaus.Application.Interfaces;
using BikeHaus.Domain.Entities;
using BikeHaus.Domain.Interfaces;

namespace BikeHaus.Application.Services;

public class HomepageAccessoryService : IHomepageAccessoryService
{
    private readonly IHomepageAccessoryRepository _repository;

    public HomepageAccessoryService(IHomepageAccessoryRepository repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<HomepageAccessoryDto>> GetAllAsync()
    {
        var items = await _repository.GetAllWithImagesAsync();
        return items.Select(MapToDto);
    }

    public async Task<IEnumerable<HomepageAccessoryDto>> GetAllActiveAsync()
    {
        var items = await _repository.GetAllActiveAsync();
        return items.Select(MapToDto);
    }

    public async Task<IEnumerable<HomepageAccessoryDto>> GetByCategoryAsync(string category)
    {
        var items = await _repository.GetByCategoryAsync(category);
        return items.Select(MapToDto);
    }

    public async Task<HomepageAccessoryDto?> GetByIdAsync(int id)
    {
        var item = await _repository.GetWithImagesAsync(id);
        return item == null ? null : MapToDto(item);
    }

    public async Task<HomepageAccessoryDto> CreateAsync(HomepageAccessoryCreateDto dto)
    {
        var entity = new HomepageAccessory
        {
            Titel = dto.Titel,
            Beschreibung = dto.Beschreibung,
            Preis = dto.Preis,
            PreisText = dto.PreisText,
            Kategorie = dto.Kategorie,
            Marke = dto.Marke,
            IsActive = true,
        };

        var created = await _repository.AddAsync(entity);
        return MapToDto(created);
    }

    public async Task<HomepageAccessoryDto?> UpdateAsync(int id, HomepageAccessoryUpdateDto dto)
    {
        var entity = await _repository.GetWithImagesAsync(id);
        if (entity == null) return null;

        entity.Titel = dto.Titel;
        entity.Beschreibung = dto.Beschreibung;
        entity.Preis = dto.Preis;
        entity.PreisText = dto.PreisText;
        entity.Kategorie = dto.Kategorie;
        entity.Marke = dto.Marke;
        entity.IsActive = dto.IsActive;
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

    public async Task<HomepageAccessoryImageDto> AddImageAsync(int accessoryId, string filePath, int sortOrder)
    {
        var accessory = await _repository.GetWithImagesAsync(accessoryId);
        if (accessory == null) throw new ArgumentException("Accessory not found");

        var image = new HomepageAccessoryImage
        {
            HomepageAccessoryId = accessoryId,
            FilePath = filePath,
            SortOrder = sortOrder,
        };

        accessory.Images.Add(image);
        accessory.UpdatedAt = DateTime.UtcNow;
        await _repository.UpdateAsync(accessory);

        return new HomepageAccessoryImageDto
        {
            Id = image.Id,
            FilePath = image.FilePath,
            SortOrder = image.SortOrder,
        };
    }

    public async Task<bool> DeleteImageAsync(int imageId)
    {
        var allActive = await _repository.GetAllActiveAsync();
        foreach (var accessory in allActive)
        {
            var image = accessory.Images.FirstOrDefault(i => i.Id == imageId);
            if (image != null)
            {
                accessory.Images.Remove(image);
                await _repository.UpdateAsync(accessory);
                return true;
            }
        }
        return false;
    }

    public async Task<IEnumerable<HomepageAccessoryCategoryDto>> GetCategoriesAsync()
    {
        var items = await _repository.GetAllActiveAsync();
        return items
            .Where(i => !string.IsNullOrEmpty(i.Kategorie))
            .GroupBy(i => i.Kategorie!)
            .Select(g => new HomepageAccessoryCategoryDto { Name = g.Key, Count = g.Count() })
            .OrderBy(c => c.Name);
    }

    private static HomepageAccessoryDto MapToDto(HomepageAccessory entity)
    {
        return new HomepageAccessoryDto
        {
            Id = entity.Id,
            Titel = entity.Titel,
            Beschreibung = entity.Beschreibung,
            Preis = entity.Preis,
            PreisText = entity.PreisText,
            Kategorie = entity.Kategorie,
            Marke = entity.Marke,
            IsActive = entity.IsActive,
            CreatedAt = entity.CreatedAt,
            Images = entity.Images
                .OrderBy(i => i.SortOrder)
                .Select(i => new HomepageAccessoryImageDto
                {
                    Id = i.Id,
                    FilePath = i.FilePath,
                    SortOrder = i.SortOrder,
                })
                .ToList(),
        };
    }
}
