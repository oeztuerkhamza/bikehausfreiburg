using BikeHaus.Application.DTOs;
using BikeHaus.Application.Interfaces;
using BikeHaus.Domain.Interfaces;

namespace BikeHaus.Application.Services;

public class StatisticsService : IStatisticsService
{
    private readonly IPurchaseRepository _purchaseRepository;
    private readonly ISaleRepository _saleRepository;

    public StatisticsService(
        IPurchaseRepository purchaseRepository,
        ISaleRepository saleRepository)
    {
        _purchaseRepository = purchaseRepository;
        _saleRepository = saleRepository;
    }

    public async Task<StatisticsDto> GetStatisticsAsync(DateTime startDate, DateTime endDate)
    {
        // Ensure end date includes the whole day
        var endDateInclusive = endDate.Date.AddDays(1).AddTicks(-1);

        var allPurchases = await _purchaseRepository.GetAllAsync();
        var allSales = await _saleRepository.GetAllAsync();

        // Filter by date range
        var purchases = allPurchases
            .Where(p => p.Kaufdatum >= startDate.Date && p.Kaufdatum <= endDateInclusive)
            .ToList();

        var sales = allSales
            .Where(s => s.Verkaufsdatum >= startDate.Date && s.Verkaufsdatum <= endDateInclusive)
            .ToList();

        var totalPurchaseAmount = purchases.Sum(p => p.Preis);
        var totalSaleAmount = sales.Sum(s => s.Preis);
        var profit = totalSaleAmount - totalPurchaseAmount;

        // Calculate averages
        var avgPurchase = purchases.Count > 0 ? totalPurchaseAmount / purchases.Count : 0;
        var avgSale = sales.Count > 0 ? totalSaleAmount / sales.Count : 0;
        var avgProfit = sales.Count > 0 ? profit / sales.Count : 0;

        // Daily breakdown
        var days = (endDate.Date - startDate.Date).Days + 1;
        var dailyBreakdown = Enumerable.Range(0, days)
            .Select(d =>
            {
                var date = startDate.Date.AddDays(d);
                var dayPurchases = purchases.Where(p => p.Kaufdatum.Date == date).ToList();
                var daySales = sales.Where(s => s.Verkaufsdatum.Date == date).ToList();
                var dayPurchaseAmount = dayPurchases.Sum(p => p.Preis);
                var daySaleAmount = daySales.Sum(s => s.Preis);

                return new DailyStatsDto(
                    Date: date,
                    PurchaseCount: dayPurchases.Count,
                    SaleCount: daySales.Count,
                    PurchaseAmount: dayPurchaseAmount,
                    SaleAmount: daySaleAmount,
                    DailyProfit: daySaleAmount - dayPurchaseAmount
                );
            })
            .ToList();

        // Top brands by sales
        var topBrands = sales
            .Where(s => s.Bicycle != null)
            .GroupBy(s => s.Bicycle!.Marke)
            .Select(g => new TopBrandDto(
                Brand: g.Key,
                Count: g.Count(),
                TotalRevenue: g.Sum(s => s.Preis)
            ))
            .OrderByDescending(b => b.TotalRevenue)
            .Take(5)
            .ToList();

        return new StatisticsDto(
            StartDate: startDate,
            EndDate: endDate,
            PurchaseCount: purchases.Count,
            SaleCount: sales.Count,
            TotalPurchaseAmount: totalPurchaseAmount,
            TotalSaleAmount: totalSaleAmount,
            Profit: profit,
            AveragePurchasePrice: avgPurchase,
            AverageSalePrice: avgSale,
            AverageProfit: avgProfit,
            DailyBreakdown: dailyBreakdown,
            TopBrands: topBrands
        );
    }
}
