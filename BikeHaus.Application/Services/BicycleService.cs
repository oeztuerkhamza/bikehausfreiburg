using BikeHaus.Application.DTOs;
using BikeHaus.Application.Interfaces;
using BikeHaus.Application.Mappings;
using BikeHaus.Domain.Enums;
using BikeHaus.Domain.Interfaces;
using System.Linq.Expressions;

namespace BikeHaus.Application.Services;

public class BicycleService : IBicycleService
{
    private readonly IBicycleRepository _repository;
    private readonly IPurchaseRepository _purchaseRepository;
    private readonly IShopSettingsRepository _settingsRepository;

    public BicycleService(IBicycleRepository repository, IPurchaseRepository purchaseRepository, IShopSettingsRepository settingsRepository)
    {
        _repository = repository;
        _purchaseRepository = purchaseRepository;
        _settingsRepository = settingsRepository;
    }

    public async Task<IEnumerable<BicycleDto>> GetAllAsync()
    {
        var bicycles = await _repository.GetAllAsync();
        return bicycles.Select(b => b.ToDto());
    }

    public async Task<PaginatedResult<BicycleDto>> GetPaginatedAsync(PaginationParams paginationParams)
    {
        Expression<Func<Domain.Entities.Bicycle, bool>>? predicate = null;

        // Status filter
        if (!string.IsNullOrEmpty(paginationParams.Status) &&
            Enum.TryParse<BikeStatus>(paginationParams.Status, out var status))
        {
            predicate = CombineAnd(predicate, b => b.Status == status);
        }

        // Zustand (condition) filter
        if (!string.IsNullOrEmpty(paginationParams.Zustand) &&
            Enum.TryParse<BikeCondition>(paginationParams.Zustand, out var zustand))
        {
            predicate = CombineAnd(predicate, b => b.Zustand == zustand);
        }

        // Fahrradtyp filter
        if (!string.IsNullOrEmpty(paginationParams.Fahrradtyp))
        {
            var typ = paginationParams.Fahrradtyp;
            predicate = CombineAnd(predicate, b => b.Fahrradtyp != null && b.Fahrradtyp == typ);
        }

        // Reifengroesse filter
        if (!string.IsNullOrEmpty(paginationParams.Reifengroesse))
        {
            var reifen = paginationParams.Reifengroesse;
            predicate = CombineAnd(predicate, b => b.Reifengroesse == reifen);
        }

        // Marke filter
        if (!string.IsNullOrEmpty(paginationParams.Marke))
        {
            var marke = paginationParams.Marke.ToLower();
            predicate = CombineAnd(predicate, b => b.Marke.ToLower() == marke);
        }

        // Search filter
        if (!string.IsNullOrEmpty(paginationParams.SearchTerm))
        {
            var term = paginationParams.SearchTerm.ToLower();
            predicate = CombineAnd(predicate, b =>
                b.Marke.ToLower().Contains(term) ||
                b.Modell.ToLower().Contains(term) ||
                (b.Rahmennummer != null && b.Rahmennummer.ToLower().Contains(term)) ||
                (b.StokNo != null && b.StokNo.ToLower().Contains(term)) ||
                (b.Farbe != null && b.Farbe.ToLower().Contains(term)));
        }

        var (items, totalCount) = await _repository.GetPaginatedAsync(
            paginationParams.Page,
            paginationParams.PageSize,
            predicate);

        return new PaginatedResult<BicycleDto>
        {
            Items = items.Select(b => b.ToDto()),
            TotalCount = totalCount,
            Page = paginationParams.Page,
            PageSize = paginationParams.PageSize
        };
    }

    /// <summary>
    /// Combines two Expression predicates with AndAlso, suitable for EF Core translation.
    /// </summary>
    private static Expression<Func<T, bool>> CombineAnd<T>(
        Expression<Func<T, bool>>? left,
        Expression<Func<T, bool>> right)
    {
        if (left == null) return right;

        var param = Expression.Parameter(typeof(T), "x");
        var body = Expression.AndAlso(
            Expression.Invoke(left, param),
            Expression.Invoke(right, param));
        return Expression.Lambda<Func<T, bool>>(body, param);
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

        // Always auto-generate StokNo: find max and add 1
        var maxStokNo = await _repository.GetMaxStokNoAsync();
        var settings = await _settingsRepository.GetSettingsAsync();
        var startNum = settings?.FahrradNummerStart ?? 1;

        var nextNum = maxStokNo.HasValue ? Math.Max(maxStokNo.Value + 1, startNum) : startNum;
        entity.StokNo = nextNum.ToString();

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
        entity.Rahmengroesse = dto.Rahmengroesse;
        entity.Farbe = dto.Farbe;
        entity.Reifengroesse = dto.Reifengroesse;
        entity.StokNo = dto.StokNo;
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
            (b.Rahmennummer != null && b.Rahmennummer.Contains(searchTerm)) ||
            (b.StokNo != null && b.StokNo.Contains(searchTerm)) ||
            (b.Farbe != null && b.Farbe.Contains(searchTerm)));
        return bicycles.Select(b => b.ToDto());
    }

    public async Task<BicycleDto?> GetByStokNoAsync(string stokNo)
    {
        var bicycle = await _repository.GetByStokNoAsync(stokNo);
        return bicycle?.ToDto();
    }

    public async Task<string> GetNextStokNoAsync()
    {
        var maxStokNo = await _repository.GetMaxStokNoAsync();
        var settings = await _settingsRepository.GetSettingsAsync();
        var startNum = settings?.FahrradNummerStart ?? 1;
        var nextNum = maxStokNo.HasValue ? Math.Max(maxStokNo.Value + 1, startNum) : startNum;
        return nextNum.ToString();
    }

    public async Task<IEnumerable<string>> GetUniqueBrandsAsync()
    {
        return await _repository.GetUniqueBrandsAsync();
    }

    public async Task<IEnumerable<string>> GetUniqueModelsAsync(string? brand = null)
    {
        return await _repository.GetUniqueModelsAsync(brand);
    }
}
