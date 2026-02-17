using BikeHaus.Application.DTOs;
using BikeHaus.Application.Interfaces;
using BikeHaus.Application.Mappings;
using BikeHaus.Domain.Enums;
using BikeHaus.Domain.Interfaces;

namespace BikeHaus.Application.Services;

public class DashboardService : IDashboardService
{
    private readonly IBicycleRepository _bicycleRepository;
    private readonly IPurchaseRepository _purchaseRepository;
    private readonly ISaleRepository _saleRepository;

    public DashboardService(
        IBicycleRepository bicycleRepository,
        IPurchaseRepository purchaseRepository,
        ISaleRepository saleRepository)
    {
        _bicycleRepository = bicycleRepository;
        _purchaseRepository = purchaseRepository;
        _saleRepository = saleRepository;
    }

    public async Task<DashboardDto> GetDashboardAsync()
    {
        var totalBicycles = await _bicycleRepository.CountAsync();
        var availableBicycles = await _bicycleRepository.CountAsync(b => b.Status == BikeStatus.Available);
        var soldBicycles = await _bicycleRepository.CountAsync(b => b.Status == BikeStatus.Sold);

        var purchases = await _purchaseRepository.GetAllAsync();
        var sales = await _saleRepository.GetAllAsync();

        var purchaseList = purchases.ToList();
        var saleList = sales.ToList();

        var recentPurchases = await _purchaseRepository.GetRecentPurchasesAsync(5);
        var recentSales = await _saleRepository.GetRecentSalesAsync(5);

        return new DashboardDto(
            TotalBicycles: totalBicycles,
            AvailableBicycles: availableBicycles,
            SoldBicycles: soldBicycles,
            TotalPurchases: purchaseList.Count,
            TotalSales: saleList.Count,
            TotalPurchaseAmount: purchaseList.Sum(p => p.Preis),
            TotalSaleAmount: saleList.Sum(s => s.Preis),
            Profit: saleList.Sum(s => s.Preis) - purchaseList.Sum(p => p.Preis),
            RecentPurchases: recentPurchases.Select(p => p.ToListDto()),
            RecentSales: recentSales.Select(s => s.ToListDto())
        );
    }
}
