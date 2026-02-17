using BikeHaus.Application.DTOs;
using BikeHaus.Application.Interfaces;
using BikeHaus.Application.Mappings;
using BikeHaus.Domain.Interfaces;

namespace BikeHaus.Application.Services;

public class BicycleService : IBicycleService
{
    private readonly IBicycleRepository _repository;
    private readonly IPurchaseRepository _purchaseRepository;

    public BicycleService(IBicycleRepository repository, IPurchaseRepository purchaseRepository)
    {
        _repository = repository;
        _purchaseRepository = purchaseRepository;
    }

    public async Task<IEnumerable<BicycleDto>> GetAllAsync()
    {
        var bicycles = await _repository.GetAllAsync();
        return bicycles.Select(b => b.ToDto());
    }

    public async Task<BicycleDto?> GetByIdAsync(int id)
    {
        var bicycle = await _repository.GetWithDetailsAsync(id);
        return bicycle?.ToDto();
    }

    public async Task<IEnumerable<BicycleDto>> GetAvailableAsync()
    {
        var bicycles = await _repository.GetAvailableBicyclesAsync();
        return bicycles.Select(b => b.ToDto());
    }

    public async Task<BicycleDto> CreateAsync(BicycleCreateDto dto)
    {
        var entity = dto.ToEntity();
        var created = await _repository.AddAsync(entity);
        return created.ToDto();
    }

    public async Task<BicycleDto> UpdateAsync(int id, BicycleUpdateDto dto)
    {
        var entity = await _repository.GetByIdAsync(id)
            ?? throw new KeyNotFoundException($"Bicycle with ID {id} not found.");

        entity.Marke = dto.Marke;
        entity.Modell = dto.Modell;
        entity.Rahmennummer = dto.Rahmennummer;
        entity.Farbe = dto.Farbe;
        entity.Reifengroesse = dto.Reifengroesse;
        entity.Fahrradtyp = dto.Fahrradtyp;
        entity.Beschreibung = dto.Beschreibung;
        entity.Status = dto.Status;
        entity.Zustand = dto.Zustand;
        entity.UpdatedAt = DateTime.UtcNow;

        await _repository.UpdateAsync(entity);
        return entity.ToDto();
    }

    public async Task DeleteAsync(int id)
    {
        var bicycle = await _repository.GetWithDetailsAsync(id)
            ?? throw new KeyNotFoundException($"Fahrrad mit ID {id} nicht gefunden.");

        // If bicycle has a sale, it cannot be deleted
        if (bicycle.Sale != null)
        {
            throw new InvalidOperationException(
                "Fahrrad kann nicht gelöscht werden. Es gibt einen verknüpften Verkauf. " +
                "Bitte löschen Sie zuerst den Verkauf.");
        }

        // If bicycle has a purchase but no sale, delete the purchase first
        if (bicycle.Purchase != null)
        {
            await _purchaseRepository.DeleteAsync(bicycle.Purchase.Id);
        }

        await _repository.DeleteAsync(id);
    }

    public async Task<IEnumerable<BicycleDto>> SearchAsync(string searchTerm)
    {
        var bicycles = await _repository.FindAsync(b =>
            b.Marke.Contains(searchTerm) ||
            b.Modell.Contains(searchTerm) ||
            b.Rahmennummer.Contains(searchTerm) ||
            b.Farbe.Contains(searchTerm));
        return bicycles.Select(b => b.ToDto());
    }
}
