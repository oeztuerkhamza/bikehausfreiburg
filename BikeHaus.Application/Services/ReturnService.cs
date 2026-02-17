using BikeHaus.Application.DTOs;
using BikeHaus.Application.Interfaces;
using BikeHaus.Application.Mappings;
using BikeHaus.Domain.Entities;
using BikeHaus.Domain.Enums;
using BikeHaus.Domain.Interfaces;

namespace BikeHaus.Application.Services;

public class ReturnService : IReturnService
{
    private readonly IReturnRepository _returnRepository;
    private readonly ISaleRepository _saleRepository;
    private readonly IBicycleRepository _bicycleRepository;
    private readonly IPdfService _pdfService;

    public ReturnService(
        IReturnRepository returnRepository,
        ISaleRepository saleRepository,
        IBicycleRepository bicycleRepository,
        IPdfService pdfService)
    {
        _returnRepository = returnRepository;
        _saleRepository = saleRepository;
        _bicycleRepository = bicycleRepository;
        _pdfService = pdfService;
    }

    public async Task<IEnumerable<ReturnListDto>> GetAllAsync()
    {
        var returns = await _returnRepository.GetAllAsync();
        return returns.Select(r => r.ToListDto());
    }

    public async Task<ReturnDto?> GetByIdAsync(int id)
    {
        var returnEntity = await _returnRepository.GetWithDetailsAsync(id);
        return returnEntity?.ToDto();
    }

    public async Task<ReturnDto> CreateAsync(ReturnCreateDto dto)
    {
        // Get original sale with details
        var sale = await _saleRepository.GetWithDetailsAsync(dto.SaleId)
            ?? throw new KeyNotFoundException($"Sale with ID {dto.SaleId} not found.");

        // Verify bicycle is currently sold (can only return sold bikes)
        var bicycle = await _bicycleRepository.GetByIdAsync(sale.BicycleId)
            ?? throw new KeyNotFoundException($"Bicycle with ID {sale.BicycleId} not found.");

        if (bicycle.Status != BikeStatus.Sold)
            throw new InvalidOperationException("This bicycle is not currently sold and cannot be returned.");

        // Create Return
        var returnEntity = new Return
        {
            SaleId = dto.SaleId,
            BicycleId = sale.BicycleId,
            CustomerId = sale.BuyerId,
            Rueckgabedatum = dto.Rueckgabedatum ?? DateTime.UtcNow,
            Grund = dto.Grund,
            GrundDetails = dto.GrundDetails,
            Erstattungsbetrag = dto.Erstattungsbetrag,
            Zahlungsart = dto.Zahlungsart,
            Notizen = dto.Notizen,
            BelegNummer = await _returnRepository.GenerateBelegNummerAsync()
        };

        // Add signatures if provided
        if (dto.CustomerSignature != null)
        {
            returnEntity.CustomerSignature = dto.CustomerSignature.ToEntity();
        }
        if (dto.ShopSignature != null)
        {
            returnEntity.ShopSignature = dto.ShopSignature.ToEntity();
        }

        var created = await _returnRepository.AddAsync(returnEntity);

        // Update bicycle status back to Available
        bicycle.Status = BikeStatus.Available;
        bicycle.UpdatedAt = DateTime.UtcNow;
        await _bicycleRepository.UpdateAsync(bicycle);

        var result = await _returnRepository.GetWithDetailsAsync(created.Id);
        return result!.ToDto();
    }

    public async Task DeleteAsync(int id)
    {
        var returnEntity = await _returnRepository.GetWithDetailsAsync(id)
            ?? throw new KeyNotFoundException($"Rückgabe mit ID {id} wurde nicht gefunden.");

        // When deleting a return, set the bicycle status back to Sold
        if (returnEntity.Bicycle != null)
        {
            returnEntity.Bicycle.Status = BikeStatus.Sold;
            returnEntity.Bicycle.UpdatedAt = DateTime.UtcNow;
            await _bicycleRepository.UpdateAsync(returnEntity.Bicycle);
        }

        await _returnRepository.DeleteAsync(id);
    }

    public async Task<byte[]> GeneratePdfAsync(int id)
    {
        return await _pdfService.GenerateRueckgabebelegAsync(id);
    }
}
