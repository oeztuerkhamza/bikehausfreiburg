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
    private readonly IRentalRepository _rentalRepository;
    private readonly IRentalBookingRepository _bookingRepository;

    public DashboardService(
        IBicycleRepository bicycleRepository,
        IPurchaseRepository purchaseRepository,
        ISaleRepository saleRepository,
        IRentalRepository rentalRepository,
        IRentalBookingRepository bookingRepository)
    {
        _bicycleRepository = bicycleRepository;
        _purchaseRepository = purchaseRepository;
        _saleRepository = saleRepository;
        _rentalRepository = rentalRepository;
        _bookingRepository = bookingRepository;
    }

    public async Task<DashboardDto> GetDashboardAsync()
    {
        var now = DateTime.UtcNow;

        var totalBicycles = await _bicycleRepository.CountAsync();
        var availableBicycles = await _bicycleRepository.CountAsync(b => b.Status == BikeStatus.Available);
        var soldBicycles = await _bicycleRepository.CountAsync(b => b.Status == BikeStatus.Sold);

        var purchases = await _purchaseRepository.GetAllAsync();
        var sales = await _saleRepository.GetAllAsync();

        var purchaseList = purchases.ToList();
        var saleList = sales.ToList();

        var recentPurchases = await _purchaseRepository.GetRecentPurchasesAsync(5);
        var recentSales = await _saleRepository.GetRecentSalesAsync(5);
        var totalSaleAmount = saleList.Sum(s => s.Gesamtbetrag);
        var totalPurchaseAmount = purchaseList.Sum(p => p.Preis);

        var activeRentals = await _rentalRepository.CountAsync(r => r.Status == RentalStatus.Active);
        var overdueRentals = await _rentalRepository.CountAsync(r => r.Status == RentalStatus.Active && r.EndDatum < now);
        var pendingBookings = await _bookingRepository.CountAsync(b => b.Status == RentalBookingStatus.Pending);
        var offeneBarKaution = await _rentalRepository.GetOffeneBarKautionSumAsync();

        var (recentRentalItems, _) = await _rentalRepository.GetPaginatedAsync(1, 5, r => r.Status == RentalStatus.Active);
        var (recentPendingItems, _) = await _bookingRepository.GetPaginatedAsync(1, 5, b => b.Status == RentalBookingStatus.Pending);

        // Heute startende Anfragen: Abholungen für heute, die noch nicht per
        // Mietvertrag übergeben wurden (bereits übergebene blendet das Repository
        // standardmäßig aus). StartDatum ist ein reines Datum, daher DateTime.Today.
        // Als Bereich statt .Date == today: das übersetzt ohne SQL-Datumsfunktion
        // und vermeidet Formatunterschiede beim Vergleich in SQLite.
        var today = DateTime.Today;
        var tomorrow = today.AddDays(1);
        var (startingTodayItems, _) = await _bookingRepository.GetPaginatedAsync(
            1, 10,
            b => b.Status != RentalBookingStatus.Cancelled
                 && b.StartDatum >= today && b.StartDatum < tomorrow);

        // Rückgabetermin erreicht, Fahrrad aber noch nicht zurück. Gleiche
        // Bedingung wie der OverdueRentals-Zähler; am längsten überfällig zuerst
        // (das Repository sortiert nach Startdatum, nicht nach Fälligkeit).
        var (overdueItems, _) = await _rentalRepository.GetPaginatedAsync(
            1, 100, r => r.Status == RentalStatus.Active && r.EndDatum < now);

        return new DashboardDto(
            TotalBicycles: totalBicycles,
            AvailableBicycles: availableBicycles,
            SoldBicycles: soldBicycles,
            TotalPurchases: purchaseList.Count,
            TotalSales: saleList.Count,
            TotalPurchaseAmount: totalPurchaseAmount,
            TotalSaleAmount: totalSaleAmount,
            Profit: totalSaleAmount - totalPurchaseAmount,
            ActiveRentals: activeRentals,
            OverdueRentals: overdueRentals,
            PendingBookings: pendingBookings,
            OffeneBarKaution: offeneBarKaution,
            RecentPurchases: recentPurchases.Select(p => p.ToListDto()),
            RecentSales: recentSales.Select(s => s.ToListDto()),
            RecentRentals: recentRentalItems.Select(r => r.ToListDto()),
            RecentPendingBookings: recentPendingItems.Select(b => b.ToListDto()),
            BookingsStartingToday: startingTodayItems.Select(b => b.ToListDto()),
            OverdueRentalItems: overdueItems.OrderBy(r => r.EndDatum).Take(10).Select(r => r.ToListDto())
        );
    }
}
