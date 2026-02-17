namespace BikeHaus.Application.DTOs;

// ── Statistics DTOs ──
public record StatisticsDto(
    DateTime StartDate,
    DateTime EndDate,
    int PurchaseCount,
    int SaleCount,
    decimal TotalPurchaseAmount,
    decimal TotalSaleAmount,
    decimal Profit,
    decimal AveragePurchasePrice,
    decimal AverageSalePrice,
    decimal AverageProfit,
    IEnumerable<DailyStatsDto> DailyBreakdown,
    IEnumerable<TopBrandDto> TopBrands
);

public record DailyStatsDto(
    DateTime Date,
    int PurchaseCount,
    int SaleCount,
    decimal PurchaseAmount,
    decimal SaleAmount,
    decimal DailyProfit
);

public record TopBrandDto(
    string Brand,
    int Count,
    decimal TotalRevenue
);
