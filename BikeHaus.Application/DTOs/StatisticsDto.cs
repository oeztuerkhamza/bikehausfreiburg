namespace BikeHaus.Application.DTOs;

// ── Statistics DTOs ──
public record StatisticsDto(
    DateTime StartDate,
    DateTime EndDate,
    int PurchaseCount,
    int SaleCount,
    int ExpenseCount,
    decimal TotalPurchaseAmount,
    decimal TotalSaleAmount,
    decimal TotalExpenseAmount,
    decimal Profit,
    decimal NetProfit,
    decimal AveragePurchasePrice,
    decimal AverageSalePrice,
    decimal AverageProfit,
    IEnumerable<DailyStatsDto> DailyBreakdown,
    IEnumerable<TopBrandDto> TopBrands,
    IEnumerable<ExpenseByCategoryDto> ExpensesByCategory
);

public record DailyStatsDto(
    DateTime Date,
    int PurchaseCount,
    int SaleCount,
    int ExpenseCount,
    decimal PurchaseAmount,
    decimal SaleAmount,
    decimal ExpenseAmount,
    decimal DailyProfit,
    decimal DailyNetProfit
);

public record TopBrandDto(
    string Brand,
    int Count,
    decimal TotalRevenue
);

public record ExpenseByCategoryDto(
    string Category,
    int Count,
    decimal TotalAmount
);
