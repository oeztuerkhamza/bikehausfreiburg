namespace BikeHaus.Application.DTOs;

// ── Dashboard DTOs ──
public record DashboardDto(
    int TotalBicycles,
    int AvailableBicycles,
    int SoldBicycles,
    int TotalPurchases,
    int TotalSales,
    decimal TotalPurchaseAmount,
    decimal TotalSaleAmount,
    decimal Profit,
    IEnumerable<PurchaseListDto> RecentPurchases,
    IEnumerable<SaleListDto> RecentSales
);
