using BikeHaus.Application.DTOs;
using BikeHaus.Application.Interfaces;
using BikeHaus.Domain.Entities;
using BikeHaus.Domain.Interfaces;

namespace BikeHaus.Application.Services;

public class RepairShowcaseService : IRepairShowcaseService
{
    private readonly IRepairShowcaseRepository _repository;

    public RepairShowcaseService(IRepairShowcaseRepository repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<RepairShowcaseDto>> GetAllAsync()
    {
        var items = await _repository.GetAllWithImagesAsync();
        return items.Select(MapToDto);
    }

    public async Task<IEnumerable<RepairShowcaseDto>> GetAllActiveAsync()
    {
        var items = await _repository.GetAllActiveAsync();
        return items.Select(MapToDto);
    }

    public async Task<RepairShowcaseDto?> GetByIdAsync(int id)
    {
        var item = await _repository.GetWithImagesAsync(id);
        return item == null ? null : MapToDto(item);
    }

    public async Task<RepairShowcaseDto> CreateAsync(RepairShowcaseCreateDto dto)
    {
        var entity = new RepairShowcase
        {
            Titel = dto.Titel,
            Beschreibung = dto.Beschreibung,
            IsActive = true,
        };

        var created = await _repository.AddAsync(entity);
        return MapToDto(created);
    }

    public async Task<RepairShowcaseDto?> UpdateAsync(int id, RepairShowcaseUpdateDto dto)
    {
        var entity = await _repository.GetWithImagesAsync(id);
        if (entity == null) return null;

        entity.Titel = dto.Titel;
        entity.Beschreibung = dto.Beschreibung;
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

    public async Task<RepairShowcaseImageDto> AddImageAsync(int showcaseId, string filePath, int sortOrder)
    {
        var showcase = await _repository.GetWithImagesAsync(showcaseId);
        if (showcase == null) throw new ArgumentException("Repair showcase not found");

        var image = new RepairShowcaseImage
        {
            RepairShowcaseId = showcaseId,
            FilePath = filePath,
            SortOrder = sortOrder,
        };

        showcase.Images.Add(image);
        showcase.UpdatedAt = DateTime.UtcNow;
        await _repository.UpdateAsync(showcase);

        return new RepairShowcaseImageDto
        {
            Id = image.Id,
            FilePath = image.FilePath,
            SortOrder = image.SortOrder,
        };
    }

    public async Task<bool> DeleteImageAsync(int imageId)
    {
        var allItems = await _repository.GetAllWithImagesAsync();
        foreach (var showcase in allItems)
        {
            var image = showcase.Images.FirstOrDefault(i => i.Id == imageId);
            if (image != null)
            {
                showcase.Images.Remove(image);
                await _repository.UpdateAsync(showcase);
                return true;
            }
        }
        return false;
    }

    private static RepairShowcaseDto MapToDto(RepairShowcase entity)
    {
        return new RepairShowcaseDto
        {
            Id = entity.Id,
            Titel = entity.Titel,
            Beschreibung = entity.Beschreibung,
            IsActive = entity.IsActive,
            CreatedAt = entity.CreatedAt,
            Images = entity.Images
                .OrderBy(i => i.SortOrder)
                .Select(i => new RepairShowcaseImageDto
                {
                    Id = i.Id,
                    FilePath = i.FilePath,
                    SortOrder = i.SortOrder,
                })
                .ToList(),
        };
    }
}
