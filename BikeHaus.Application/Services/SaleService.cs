using BikeHaus.Application.DTOs;
using BikeHaus.Application.Interfaces;
using BikeHaus.Application.Mappings;
using BikeHaus.Domain.Entities;
using BikeHaus.Domain.Enums;
using BikeHaus.Domain.Interfaces;

namespace BikeHaus.Application.Services;

public class SaleService : ISaleService
{
    private readonly ISaleRepository _saleRepository;
    private readonly IBicycleRepository _bicycleRepository;
    private readonly ICustomerRepository _customerRepository;
    private readonly IDocumentRepository _documentRepository;
    private readonly IFileStorageService _fileStorageService;
    private readonly IPdfService _pdfService;

    public SaleService(
        ISaleRepository saleRepository,
        IBicycleRepository bicycleRepository,
        ICustomerRepository customerRepository,
        IDocumentRepository documentRepository,
        IFileStorageService fileStorageService,
        IPdfService pdfService)
    {
        _saleRepository = saleRepository;
        _bicycleRepository = bicycleRepository;
        _customerRepository = customerRepository;
        _documentRepository = documentRepository;
        _fileStorageService = fileStorageService;
        _pdfService = pdfService;
    }

    public async Task<IEnumerable<SaleListDto>> GetAllAsync()
    {
        var sales = await _saleRepository.GetAllAsync();
        return sales.Select(s => s.ToListDto());
    }

    public async Task<PaginatedResult<SaleListDto>> GetPaginatedAsync(PaginationParams paginationParams)
    {
        System.Linq.Expressions.Expression<Func<Sale, bool>>? predicate = null;

        // Apply payment method filter (using Status field)
        if (!string.IsNullOrEmpty(paginationParams.Status))
        {
            if (Enum.TryParse<Domain.Enums.PaymentMethod>(paginationParams.Status, out var paymentMethod))
            {
                predicate = s => s.Zahlungsart == paymentMethod;
            }
        }

        // Apply search filter
        if (!string.IsNullOrEmpty(paginationParams.SearchTerm))
        {
            var term = paginationParams.SearchTerm.ToLower();
            if (predicate != null)
            {
                var prevPredicate = predicate;
                predicate = s => prevPredicate.Compile()(s) &&
                    (s.BelegNummer.ToLower().Contains(term) ||
                     s.Bicycle.Marke.ToLower().Contains(term) ||
                     s.Bicycle.Modell.ToLower().Contains(term) ||
                     (s.Bicycle.StokNo != null && s.Bicycle.StokNo.ToLower().Contains(term)) ||
                     s.Buyer.Vorname.ToLower().Contains(term) ||
                     s.Buyer.Nachname.ToLower().Contains(term));
            }
            else
            {
                predicate = s =>
                    s.BelegNummer.ToLower().Contains(term) ||
                    s.Bicycle.Marke.ToLower().Contains(term) ||
                    s.Bicycle.Modell.ToLower().Contains(term) ||
                    (s.Bicycle.StokNo != null && s.Bicycle.StokNo.ToLower().Contains(term)) ||
                    s.Buyer.Vorname.ToLower().Contains(term) ||
                    s.Buyer.Nachname.ToLower().Contains(term);
            }
        }

        var (items, totalCount) = await _saleRepository.GetPaginatedAsync(
            paginationParams.Page,
            paginationParams.PageSize,
            predicate);

        return new PaginatedResult<SaleListDto>
        {
            Items = items.Select(s => s.ToListDto()),
            TotalCount = totalCount,
            Page = paginationParams.Page,
            PageSize = paginationParams.PageSize
        };
    }

    public async Task<SaleDto?> GetByIdAsync(int id)
    {
        var sale = await _saleRepository.GetWithDetailsAsync(id);
        return sale?.ToDto();
    }

    public async Task<SaleDto> CreateAsync(SaleCreateDto dto)
    {
        // Verify bicycle exists and is available
        var bicycle = await _bicycleRepository.GetByIdAsync(dto.BicycleId)
            ?? throw new KeyNotFoundException($"Bicycle with ID {dto.BicycleId} not found.");

        if (bicycle.Status != BikeStatus.Available)
            throw new InvalidOperationException("This bicycle is not available for sale.");

        // Create or find Buyer
        var buyer = dto.Buyer.ToEntity();
        buyer = await _customerRepository.AddAsync(buyer);

        // Create Sale
        var sale = new Sale
        {
            BicycleId = dto.BicycleId,
            BuyerId = buyer.Id,
            PurchaseId = dto.PurchaseId,
            Preis = dto.Preis,
            Zahlungsart = dto.Zahlungsart,
            Verkaufsdatum = dto.Verkaufsdatum ?? DateTime.UtcNow,
            Garantie = dto.Garantie,
            GarantieBedingungen = dto.GarantieBedingungen,
            Notizen = dto.Notizen,
            BelegNummer = await _saleRepository.GenerateBelegNummerAsync()
        };

        // Add signatures if provided
        if (dto.BuyerSignature != null)
        {
            sale.BuyerSignature = dto.BuyerSignature.ToEntity();
        }
        if (dto.SellerSignature != null)
        {
            sale.SellerSignature = dto.SellerSignature.ToEntity();
        }

        // Add accessories if provided
        if (dto.Accessories != null && dto.Accessories.Count > 0)
        {
            foreach (var accessory in dto.Accessories)
            {
                sale.Accessories.Add(new SaleAccessory
                {
                    Bezeichnung = accessory.Bezeichnung,
                    Preis = accessory.Preis,
                    Menge = accessory.Menge
                });
            }
        }

        var created = await _saleRepository.AddAsync(sale);

        // Update bicycle status
        bicycle.Status = BikeStatus.Sold;
        bicycle.UpdatedAt = DateTime.UtcNow;
        await _bicycleRepository.UpdateAsync(bicycle);

        var result = await _saleRepository.GetWithDetailsAsync(created.Id);

        // Auto-save PDF to cloud storage
        try
        {
            var pdfBytes = await _pdfService.GenerateVerkaufsbelegAsync(created.Id);
            var fileName = $"Verkaufsbeleg_{result!.BelegNummer}_{DateTime.UtcNow:yyyyMMdd}.pdf";

            using var pdfStream = new MemoryStream(pdfBytes);
            var savedPath = await _fileStorageService.SaveFileAsync(pdfStream, fileName, "verkaufsbelege");

            var document = new Document
            {
                FileName = fileName,
                FilePath = savedPath,
                ContentType = "application/pdf",
                FileSize = pdfBytes.Length,
                DocumentType = DocumentType.Verkaufsbeleg,
                BicycleId = bicycle.Id,
                SaleId = created.Id
            };
            await _documentRepository.AddAsync(document);
        }
        catch
        {
            // PDF generation/storage failure should not fail the sale
        }

        return result!.ToDto();
    }

    public async Task<SaleDto> UpdateAsync(int id, SaleUpdateDto dto)
    {
        var sale = await _saleRepository.GetWithDetailsAsync(id)
            ?? throw new KeyNotFoundException($"Verkauf mit ID {id} nicht gefunden.");

        // Update Buyer
        var buyer = sale.Buyer;
        buyer.Vorname = dto.Buyer.Vorname;
        buyer.Nachname = dto.Buyer.Nachname;
        buyer.Strasse = dto.Buyer.Strasse;
        buyer.Hausnummer = dto.Buyer.Hausnummer;
        buyer.PLZ = dto.Buyer.PLZ;
        buyer.Stadt = dto.Buyer.Stadt;
        buyer.Telefon = dto.Buyer.Telefon;
        buyer.Email = dto.Buyer.Email;
        buyer.UpdatedAt = DateTime.UtcNow;
        await _customerRepository.UpdateAsync(buyer);

        // Update Sale
        sale.Preis = dto.Preis;
        sale.Zahlungsart = dto.Zahlungsart;
        sale.Verkaufsdatum = dto.Verkaufsdatum;
        sale.Garantie = dto.Garantie;
        sale.GarantieBedingungen = dto.GarantieBedingungen;
        sale.Notizen = dto.Notizen;
        sale.UpdatedAt = DateTime.UtcNow;

        // Update Accessories - clear and recreate
        sale.Accessories.Clear();
        if (dto.Accessories != null && dto.Accessories.Count > 0)
        {
            foreach (var accessory in dto.Accessories)
            {
                sale.Accessories.Add(new SaleAccessory
                {
                    SaleId = sale.Id,
                    Bezeichnung = accessory.Bezeichnung,
                    Preis = accessory.Preis,
                    Menge = accessory.Menge
                });
            }
        }

        await _saleRepository.UpdateAsync(sale);

        var updated = await _saleRepository.GetWithDetailsAsync(id);
        return updated!.ToDto();
    }

    public async Task DeleteAsync(int id)
    {
        var sale = await _saleRepository.GetByIdAsync(id)
            ?? throw new KeyNotFoundException($"Verkauf mit ID {id} nicht gefunden.");

        try
        {
            // Reset bicycle status to Available
            var bicycle = await _bicycleRepository.GetByIdAsync(sale.BicycleId);
            if (bicycle != null)
            {
                bicycle.Status = BikeStatus.Available;
                await _bicycleRepository.UpdateAsync(bicycle);
            }

            await _saleRepository.DeleteAsync(id);
        }
        catch (Exception ex) when (ex.InnerException?.Message?.Contains("FOREIGN KEY") == true)
        {
            throw new InvalidOperationException(
                "Verkauf kann nicht gelöscht werden. Es gibt verknüpfte Datensätze (z.B. Rückgaben). " +
                "Bitte löschen Sie zuerst die verknüpften Datensätze.");
        }
    }

    public async Task<byte[]> GeneratePdfAsync(int id)
    {
        return await _pdfService.GenerateVerkaufsbelegAsync(id);
    }
}
