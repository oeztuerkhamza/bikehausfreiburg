using BikeHaus.Application.DTOs;
using BikeHaus.Application.Interfaces;
using BikeHaus.Domain.Entities;
using BikeHaus.Domain.Interfaces;

namespace BikeHaus.Application.Services;

public class NeueFahrradService : INeueFahrradService
{
    private readonly INeueFahrradRepository _repository;

    public NeueFahrradService(INeueFahrradRepository repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<NeueFahrradDto>> GetAllAsync()
    {
        var items = await _repository.GetAllWithImagesAsync();
        return items.Select(MapToDto);
    }

    public async Task<IEnumerable<NeueFahrradDto>> GetAllActiveAsync()
    {
        var items = await _repository.GetAllActiveAsync();
        return items.Select(MapToDto);
    }

    public async Task<IEnumerable<NeueFahrradDto>> GetByCategoryAsync(string category)
    {
        var items = await _repository.GetByCategoryAsync(category);
        return items.Select(MapToDto);
    }

    public async Task<NeueFahrradDto?> GetByIdAsync(int id)
    {
        var item = await _repository.GetWithImagesAsync(id);
        return item == null ? null : MapToDto(item);
    }

    public async Task<NeueFahrradDto> CreateAsync(NeueFahrradCreateDto dto)
    {
        var entity = new NeueFahrrad
        {
            Titel = dto.Titel,
            Beschreibung = dto.Beschreibung,
            Preis = dto.Preis,
            PreisText = dto.PreisText,
            Kategorie = dto.Kategorie,
            Marke = dto.Marke,
            Modell = dto.Modell,
            Farbe = dto.Farbe,
            Rahmengroesse = dto.Rahmengroesse,
            Reifengroesse = dto.Reifengroesse,
            Gangschaltung = dto.Gangschaltung,
            Zustand = dto.Zustand,
            IsActive = true,
        };

        var created = await _repository.AddAsync(entity);
        return MapToDto(created);
    }

    public async Task<NeueFahrradDto?> UpdateAsync(int id, NeueFahrradUpdateDto dto)
    {
        var entity = await _repository.GetWithImagesAsync(id);
        if (entity == null) return null;

        entity.Titel = dto.Titel;
        entity.Beschreibung = dto.Beschreibung;
        entity.Preis = dto.Preis;
        entity.PreisText = dto.PreisText;
        entity.Kategorie = dto.Kategorie;
        entity.Marke = dto.Marke;
        entity.Modell = dto.Modell;
        entity.Farbe = dto.Farbe;
        entity.Rahmengroesse = dto.Rahmengroesse;
        entity.Reifengroesse = dto.Reifengroesse;
        entity.Gangschaltung = dto.Gangschaltung;
        entity.Zustand = dto.Zustand;
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

    public async Task<NeueFahrradImageDto> AddImageAsync(int fahrradId, string filePath, int sortOrder)
    {
        var fahrrad = await _repository.GetWithImagesAsync(fahrradId);
        if (fahrrad == null) throw new ArgumentException("Fahrrad not found");

        var image = new NeueFahrradImage
        {
            NeueFahrradId = fahrradId,
            FilePath = filePath,
            SortOrder = sortOrder,
        };

        fahrrad.Images.Add(image);
        fahrrad.UpdatedAt = DateTime.UtcNow;
        await _repository.UpdateAsync(fahrrad);

        return new NeueFahrradImageDto
        {
            Id = image.Id,
            FilePath = image.FilePath,
            SortOrder = image.SortOrder,
        };
    }

    public async Task<bool> DeleteImageAsync(int imageId)
    {
        // Image deletion is handled at repository/context level
        // We find the parent, remove the image, and save
        var allActive = await _repository.GetAllActiveAsync();
        foreach (var fahrrad in allActive)
        {
            var image = fahrrad.Images.FirstOrDefault(i => i.Id == imageId);
            if (image != null)
            {
                fahrrad.Images.Remove(image);
                await _repository.UpdateAsync(fahrrad);
                return true;
            }
        }
        return false;
    }

    public async Task<IEnumerable<NeueFahrradCategoryDto>> GetCategoriesAsync()
    {
        var items = await _repository.GetAllActiveAsync();
        return items
            .Where(i => !string.IsNullOrEmpty(i.Kategorie))
            .GroupBy(i => i.Kategorie!)
            .Select(g => new NeueFahrradCategoryDto { Name = g.Key, Count = g.Count() })
            .OrderBy(c => c.Name);
    }

    private static NeueFahrradDto MapToDto(NeueFahrrad entity)
    {
        return new NeueFahrradDto
        {
            Id = entity.Id,
            Titel = entity.Titel,
            Beschreibung = entity.Beschreibung,
            Preis = entity.Preis,
            PreisText = entity.PreisText,
            Kategorie = entity.Kategorie,
            Marke = entity.Marke,
            Modell = entity.Modell,
            Farbe = entity.Farbe,
            Rahmengroesse = entity.Rahmengroesse,
            Reifengroesse = entity.Reifengroesse,
            Gangschaltung = entity.Gangschaltung,
            Zustand = entity.Zustand,
            IsActive = entity.IsActive,
            CreatedAt = entity.CreatedAt,
            Images = entity.Images
                .OrderBy(i => i.SortOrder)
                .Select(i => new NeueFahrradImageDto
                {
                    Id = i.Id,
                    FilePath = i.FilePath,
                    SortOrder = i.SortOrder,
                })
                .ToList(),
        };
    }
}
