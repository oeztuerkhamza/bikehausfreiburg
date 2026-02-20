using BikeHaus.Application.DTOs;
using BikeHaus.Application.Interfaces;
using BikeHaus.Application.Mappings;
using BikeHaus.Domain.Entities;
using BikeHaus.Domain.Enums;
using BikeHaus.Domain.Interfaces;

namespace BikeHaus.Application.Services;

public class PurchaseService : IPurchaseService
{
    private readonly IPurchaseRepository _purchaseRepository;
    private readonly IBicycleRepository _bicycleRepository;
    private readonly ICustomerRepository _customerRepository;
    private readonly IShopSettingsRepository _settingsRepository;
    private readonly IPdfService _pdfService;

    public PurchaseService(
        IPurchaseRepository purchaseRepository,
        IBicycleRepository bicycleRepository,
        ICustomerRepository customerRepository,
        IShopSettingsRepository settingsRepository,
        IPdfService pdfService)
    {
        _purchaseRepository = purchaseRepository;
        _bicycleRepository = bicycleRepository;
        _customerRepository = customerRepository;
        _settingsRepository = settingsRepository;
        _pdfService = pdfService;
    }

    public async Task<IEnumerable<PurchaseListDto>> GetAllAsync()
    {
        var purchases = await _purchaseRepository.GetAllAsync();
        return purchases.Select(p => p.ToListDto());
    }

    public async Task<PaginatedResult<PurchaseListDto>> GetPaginatedAsync(PaginationParams paginationParams)
    {
        var paymentMethod = !string.IsNullOrEmpty(paginationParams.Status) &&
            Enum.TryParse<Domain.Enums.PaymentMethod>(paginationParams.Status, out var pm) ? pm : (Domain.Enums.PaymentMethod?)null;
        var term = paginationParams.SearchTerm?.ToLower();
        var marke = paginationParams.Marke?.ToLower();
        var fahrradtyp = paginationParams.Fahrradtyp?.ToLower();
        var farbe = paginationParams.Farbe?.ToLower();

        System.Linq.Expressions.Expression<Func<Purchase, bool>> predicate = p =>
            // Payment method filter
            (!paymentMethod.HasValue || p.Zahlungsart == paymentMethod.Value) &&
            // Search filter
            (string.IsNullOrEmpty(term) ||
                (p.BelegNummer != null && p.BelegNummer.ToLower().Contains(term)) ||
                p.Bicycle.Marke.ToLower().Contains(term) ||
                p.Bicycle.Modell.ToLower().Contains(term) ||
                (p.Bicycle.StokNo != null && p.Bicycle.StokNo.ToLower().Contains(term)) ||
                p.Seller.Vorname.ToLower().Contains(term) ||
                p.Seller.Nachname.ToLower().Contains(term)) &&
            // Bicycle property filters
            (string.IsNullOrEmpty(marke) || p.Bicycle.Marke.ToLower().Contains(marke)) &&
            (string.IsNullOrEmpty(fahrradtyp) || (p.Bicycle.Fahrradtyp != null && p.Bicycle.Fahrradtyp.ToLower().Contains(fahrradtyp))) &&
            (string.IsNullOrEmpty(farbe) || (p.Bicycle.Farbe != null && p.Bicycle.Farbe.ToLower().Contains(farbe)));

        var (items, totalCount) = await _purchaseRepository.GetPaginatedAsync(
            paginationParams.Page,
            paginationParams.PageSize,
            predicate);

        return new PaginatedResult<PurchaseListDto>
        {
            Items = items.Select(p => p.ToListDto()),
            TotalCount = totalCount,
            Page = paginationParams.Page,
            PageSize = paginationParams.PageSize
        };
    }

    public async Task<PurchaseDto?> GetByIdAsync(int id)
    {
        var purchase = await _purchaseRepository.GetWithDetailsAsync(id);
        return purchase?.ToDto();
    }

    public async Task<PurchaseDto?> GetByBicycleIdAsync(int bicycleId)
    {
        var purchase = await _purchaseRepository.GetByBicycleIdAsync(bicycleId);
        return purchase?.ToDto();
    }

    public async Task<PurchaseDto> CreateAsync(PurchaseCreateDto dto)
    {
        // Create Bicycle
        var bicycle = dto.Bicycle.ToEntity();
        bicycle = await _bicycleRepository.AddAsync(bicycle);

        // Create or find Seller
        var seller = dto.Seller.ToEntity();
        seller = await _customerRepository.AddAsync(seller);

        // Create Purchase
        var purchase = new Purchase
        {
            BicycleId = bicycle.Id,
            SellerId = seller.Id,
            Preis = dto.Preis,
            VerkaufspreisVorschlag = dto.VerkaufspreisVorschlag,
            Zahlungsart = dto.Zahlungsart,
            Kaufdatum = dto.Kaufdatum ?? DateTime.UtcNow,
            Notizen = dto.Notizen,
            BelegNummer = !string.IsNullOrWhiteSpace(dto.BelegNummer)
                ? dto.BelegNummer
                : null
        };

        // Add signature if provided
        if (dto.Signature != null)
        {
            purchase.Signature = dto.Signature.ToEntity();
        }

        var created = await _purchaseRepository.AddAsync(purchase);
        var result = await _purchaseRepository.GetWithDetailsAsync(created.Id);
        return result!.ToDto();
    }

    public async Task<BulkPurchaseResultDto> CreateBulkAsync(BulkPurchaseCreateDto dto)
    {
        if (dto.Anzahl < 1 || dto.Anzahl > 100)
            throw new ArgumentException("Anzahl muss zwischen 1 und 100 liegen.");

        // Create or find Seller (shared for all bikes)
        var seller = dto.Seller.ToEntity();
        seller = await _customerRepository.AddAsync(seller);

        // Get next StokNo
        var maxStokNo = await _bicycleRepository.GetMaxStokNoAsync();
        var settings = await _settingsRepository.GetSettingsAsync();
        var startNum = settings?.FahrradNummerStart ?? 1;
        var nextStokNo = maxStokNo.HasValue ? Math.Max(maxStokNo.Value + 1, startNum) : startNum;

        var results = new List<PurchaseDto>();

        for (int i = 0; i < dto.Anzahl; i++)
        {
            // Create Bicycle
            var bicycle = dto.Bicycle.ToEntity();
            bicycle.StokNo = (nextStokNo + i).ToString();
            bicycle = await _bicycleRepository.AddAsync(bicycle);

            // Create Purchase
            var purchase = new Purchase
            {
                BicycleId = bicycle.Id,
                SellerId = seller.Id,
                Preis = dto.Preis,
                VerkaufspreisVorschlag = dto.VerkaufspreisVorschlag,
                Zahlungsart = dto.Zahlungsart,
                Kaufdatum = dto.Kaufdatum ?? DateTime.UtcNow,
                Notizen = dto.Notizen,
                BelegNummer = !string.IsNullOrWhiteSpace(dto.BelegNummer)
                    ? dto.BelegNummer
                    : null
            };

            var created = await _purchaseRepository.AddAsync(purchase);
            var result = await _purchaseRepository.GetWithDetailsAsync(created.Id);
            results.Add(result!.ToDto());
        }

        return new BulkPurchaseResultDto(results.Count, results);
    }

    public async Task<PurchaseDto> UpdateAsync(int id, PurchaseUpdateDto dto)
    {
        var purchase = await _purchaseRepository.GetWithDetailsAsync(id)
            ?? throw new KeyNotFoundException($"Ankauf mit ID {id} nicht gefunden.");

        // Update Bicycle
        var bicycle = purchase.Bicycle;
        bicycle.Marke = dto.Bicycle.Marke;
        bicycle.Modell = dto.Bicycle.Modell;
        bicycle.Rahmennummer = dto.Bicycle.Rahmennummer;
        bicycle.Farbe = dto.Bicycle.Farbe;
        bicycle.Reifengroesse = dto.Bicycle.Reifengroesse;
        bicycle.StokNo = dto.Bicycle.StokNo;
        bicycle.Fahrradtyp = dto.Bicycle.Fahrradtyp;
        bicycle.Beschreibung = dto.Bicycle.Beschreibung;
        bicycle.Status = dto.Bicycle.Status;
        bicycle.Zustand = dto.Bicycle.Zustand;
        bicycle.UpdatedAt = DateTime.UtcNow;
        await _bicycleRepository.UpdateAsync(bicycle);

        // Update Seller
        var seller = purchase.Seller;
        seller.Vorname = dto.Seller.Vorname;
        seller.Nachname = dto.Seller.Nachname;
        seller.Strasse = dto.Seller.Strasse;
        seller.Hausnummer = dto.Seller.Hausnummer;
        seller.PLZ = dto.Seller.PLZ;
        seller.Stadt = dto.Seller.Stadt;
        seller.Telefon = dto.Seller.Telefon;
        seller.Email = dto.Seller.Email;
        seller.UpdatedAt = DateTime.UtcNow;
        await _customerRepository.UpdateAsync(seller);

        // Update Purchase
        purchase.Preis = dto.Preis;
        purchase.VerkaufspreisVorschlag = dto.VerkaufspreisVorschlag;
        purchase.Zahlungsart = dto.Zahlungsart;
        purchase.Kaufdatum = dto.Kaufdatum;
        purchase.Notizen = dto.Notizen;
        if (!string.IsNullOrWhiteSpace(dto.BelegNummer))
            purchase.BelegNummer = dto.BelegNummer;
        purchase.UpdatedAt = DateTime.UtcNow;
        await _purchaseRepository.UpdateAsync(purchase);

        var updated = await _purchaseRepository.GetWithDetailsAsync(id);
        return updated!.ToDto();
    }

    public async Task DeleteAsync(int id)
    {
        var purchase = await _purchaseRepository.GetWithDetailsAsync(id)
            ?? throw new KeyNotFoundException($"Ankauf mit ID {id} nicht gefunden.");

        var bicycleId = purchase.BicycleId;
        var bicycle = purchase.Bicycle;

        // Check if bicycle has a sale - if yes, cannot delete purchase
        if (bicycle?.Sale != null)
        {
            throw new InvalidOperationException(
                "Ankauf kann nicht gelöscht werden. Das Fahrrad hat einen verknüpften Verkauf. " +
                "Bitte löschen Sie zuerst den Verkauf.");
        }

        // Delete purchase first (removes FK constraint)
        await _purchaseRepository.DeleteAsync(id);

        // Then delete the bicycle if it exists
        if (bicycleId > 0)
        {
            await _bicycleRepository.DeleteAsync(bicycleId);
        }
    }

    public async Task<byte[]> GeneratePdfAsync(int id)
    {
        return await _pdfService.GenerateKaufbelegAsync(id);
    }

    public async Task<string> GetNextBelegNummerAsync()
    {
        return await _purchaseRepository.GenerateBelegNummerAsync();
    }
}
