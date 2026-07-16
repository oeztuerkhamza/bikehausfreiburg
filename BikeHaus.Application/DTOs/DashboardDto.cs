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
    int ActiveRentals,
    int OverdueRentals,
    int PendingBookings,
    IEnumerable<PurchaseListDto> RecentPurchases,
    IEnumerable<SaleListDto> RecentSales,
    IEnumerable<RentalListDto> RecentRentals,
    IEnumerable<RentalBookingListDto> RecentPendingBookings,
    // Heute abzuholen bzw. heute zurückzugeben — die beiden Tagesaufgaben.
    IEnumerable<RentalBookingListDto> BookingsStartingToday,
    IEnumerable<RentalListDto> OverdueRentalItems
);
