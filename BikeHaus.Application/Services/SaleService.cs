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
    private readonly IPdfService _pdfService;

    public SaleService(
        ISaleRepository saleRepository,
        IBicycleRepository bicycleRepository,
        ICustomerRepository customerRepository,
        IPdfService pdfService)
    {
        _saleRepository = saleRepository;
        _bicycleRepository = bicycleRepository;
        _customerRepository = customerRepository;
        _pdfService = pdfService;
    }

    public async Task<IEnumerable<SaleListDto>> GetAllAsync()
    {
        var sales = await _saleRepository.GetAllAsync();
        return sales.Select(s => s.ToListDto());
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
        return result!.ToDto();
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
