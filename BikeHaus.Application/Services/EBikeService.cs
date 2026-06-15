using BikeHaus.Application.DTOs;
using BikeHaus.Application.Interfaces;
using BikeHaus.Application.Mappings;
using BikeHaus.Domain.Entities;
using BikeHaus.Domain.Interfaces;

namespace BikeHaus.Application.Services;

public class EBikeService : IEBikeService
{
    private readonly IEBikeRepository _repository;

    public EBikeService(IEBikeRepository repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<EBikeDto>> GetAllAsync()
    {
        var items = await _repository.GetAllWithImagesAsync();
        return items.Select(i => i.ToDto());
    }

    public async Task<IEnumerable<EBikeDto>> GetAllActiveAsync()
    {
        var items = await _repository.GetAllActiveAsync();
        return items.Select(i => i.ToDto());
    }

    public async Task<IEnumerable<EBikeDto>> GetByCategoryAsync(string category)
    {
        var items = await _repository.GetByCategoryAsync(category);
        return items.Select(i => i.ToDto());
    }

    public async Task<EBikeDto?> GetByIdAsync(int id)
    {
        var item = await _repository.GetWithImagesAsync(id);
        return item?.ToDto();
    }

    public async Task<EBikeDto> CreateAsync(EBikeCreateDto dto)
    {
        var entity = new EBike
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
            Angebot = dto.Angebot,
            MotorMarke = dto.MotorMarke,
            MotorPosition = dto.MotorPosition,
            AkkuKapazitaetWh = dto.AkkuKapazitaetWh,
            ReichweiteKm = dto.ReichweiteKm,
            MotorLeistungNm = dto.MotorLeistungNm,
            IsActive = true,
        };

        var created = await _repository.AddAsync(entity);
        return created.ToDto();
    }

    public async Task<EBikeDto?> UpdateAsync(int id, EBikeUpdateDto dto)
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
        entity.Angebot = dto.Angebot;
        entity.MotorMarke = dto.MotorMarke;
        entity.MotorPosition = dto.MotorPosition;
        entity.AkkuKapazitaetWh = dto.AkkuKapazitaetWh;
        entity.ReichweiteKm = dto.ReichweiteKm;
        entity.MotorLeistungNm = dto.MotorLeistungNm;
        entity.IsActive = dto.IsActive;
        entity.UpdatedAt = DateTime.UtcNow;

        await _repository.UpdateAsync(entity);
        return entity.ToDto();
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var entity = await _repository.GetByIdAsync(id);
        if (entity == null) return false;

        await _repository.DeleteAsync(id);
        return true;
    }

    public async Task<EBikeImageDto> AddImageAsync(int eBikeId, string filePath, int sortOrder)
    {
        var eBike = await _repository.GetWithImagesAsync(eBikeId);
        if (eBike == null) throw new ArgumentException("EBike not found");

        var image = new EBikeImage
        {
            EBikeId = eBikeId,
            FilePath = filePath,
            SortOrder = sortOrder,
        };

        eBike.Images.Add(image);
        eBike.UpdatedAt = DateTime.UtcNow;
        await _repository.UpdateAsync(eBike);

        return image.ToDto();
    }

    public async Task<bool> DeleteImageAsync(int imageId)
    {
        // Image deletion is handled at repository/context level
        // We find the parent, remove the image, and save
        var all = await _repository.GetAllWithImagesAsync();
        foreach (var eBike in all)
        {
            var image = eBike.Images.FirstOrDefault(i => i.Id == imageId);
            if (image != null)
            {
                eBike.Images.Remove(image);
                await _repository.UpdateAsync(eBike);
                return true;
            }
        }
        return false;
    }

    public async Task<IEnumerable<EBikeCategoryDto>> GetCategoriesAsync()
    {
        var items = await _repository.GetAllActiveAsync();
        return items
            .Where(i => !string.IsNullOrEmpty(i.Kategorie))
            .GroupBy(i => i.Kategorie!)
            .Select(g => new EBikeCategoryDto(g.Key, g.Count()))
            .OrderBy(c => c.Name);
    }
}
