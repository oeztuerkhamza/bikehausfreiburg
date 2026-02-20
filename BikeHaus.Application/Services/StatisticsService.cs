using BikeHaus.Application.DTOs;
using BikeHaus.Application.Interfaces;
using BikeHaus.Domain.Interfaces;

namespace BikeHaus.Application.Services;

public class StatisticsService : IStatisticsService
{
    private readonly IPurchaseRepository _purchaseRepository;
    private readonly ISaleRepository _saleRepository;
    private readonly IExpenseRepository _expenseRepository;

    public StatisticsService(
        IPurchaseRepository purchaseRepository,
        ISaleRepository saleRepository,
        IExpenseRepository expenseRepository)
    {
        _purchaseRepository = purchaseRepository;
        _saleRepository = saleRepository;
        _expenseRepository = expenseRepository;
    }

    public async Task<StatisticsDto> GetStatisticsAsync(DateTime startDate, DateTime endDate)
    {
        // Ensure end date includes the whole day
        var endDateInclusive = endDate.Date.AddDays(1).AddTicks(-1);

        var allPurchases = await _purchaseRepository.GetAllAsync();
        var allSales = await _saleRepository.GetAllAsync();
        var allExpenses = await _expenseRepository.GetAllAsync();

        // Filter by date range
        var purchases = allPurchases
            .Where(p => p.Kaufdatum >= startDate.Date && p.Kaufdatum <= endDateInclusive)
            .ToList();

        var sales = allSales
            .Where(s => s.Verkaufsdatum >= startDate.Date && s.Verkaufsdatum <= endDateInclusive)
            .ToList();

        var expenses = allExpenses
            .Where(e => e.Datum >= startDate.Date && e.Datum <= endDateInclusive)
            .ToList();

        var totalPurchaseAmount = purchases.Sum(p => p.Preis);
        var totalSaleAmount = sales.Sum(s => s.Preis);
        var totalExpenseAmount = expenses.Sum(e => e.Betrag);
        var profit = totalSaleAmount - totalPurchaseAmount;
        var netProfit = profit - totalExpenseAmount;

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
                var dayExpenses = expenses.Where(e => e.Datum.Date == date).ToList();
                var dayPurchaseAmount = dayPurchases.Sum(p => p.Preis);
                var daySaleAmount = daySales.Sum(s => s.Preis);
                var dayExpenseAmount = dayExpenses.Sum(e => e.Betrag);
                var dayProfit = daySaleAmount - dayPurchaseAmount;

                return new DailyStatsDto(
                    Date: date,
                    PurchaseCount: dayPurchases.Count,
                    SaleCount: daySales.Count,
                    ExpenseCount: dayExpenses.Count,
                    PurchaseAmount: dayPurchaseAmount,
                    SaleAmount: daySaleAmount,
                    ExpenseAmount: dayExpenseAmount,
                    DailyProfit: dayProfit,
                    DailyNetProfit: dayProfit - dayExpenseAmount
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

        // Expenses by category
        var expensesByCategory = expenses
            .GroupBy(e => e.Kategorie ?? "Sonstige")
            .Select(g => new ExpenseByCategoryDto(
                Category: g.Key,
                Count: g.Count(),
                TotalAmount: g.Sum(e => e.Betrag)
            ))
            .OrderByDescending(c => c.TotalAmount)
            .ToList();

        return new StatisticsDto(
            StartDate: startDate,
            EndDate: endDate,
            PurchaseCount: purchases.Count,
            SaleCount: sales.Count,
            ExpenseCount: expenses.Count,
            TotalPurchaseAmount: totalPurchaseAmount,
            TotalSaleAmount: totalSaleAmount,
            TotalExpenseAmount: totalExpenseAmount,
            Profit: profit,
            NetProfit: netProfit,
            AveragePurchasePrice: avgPurchase,
            AverageSalePrice: avgSale,
            AverageProfit: avgProfit,
            DailyBreakdown: dailyBreakdown,
            TopBrands: topBrands,
            ExpensesByCategory: expensesByCategory
        );
    }
}
