using BikeHaus.Application.DTOs;
using BikeHaus.Application.Interfaces;
using BikeHaus.Domain.Entities;
using BikeHaus.Domain.Interfaces;

namespace BikeHaus.Application.Services;

public class ArchiveService : IArchiveService
{
    private readonly IBicycleRepository _bicycleRepository;
    private readonly IPurchaseRepository _purchaseRepository;
    private readonly ISaleRepository _saleRepository;
    private readonly IReturnRepository _returnRepository;
    private readonly IReservationRepository _reservationRepository;

    public ArchiveService(
        IBicycleRepository bicycleRepository,
        IPurchaseRepository purchaseRepository,
        ISaleRepository saleRepository,
        IReturnRepository returnRepository,
        IReservationRepository reservationRepository)
    {
        _bicycleRepository = bicycleRepository;
        _purchaseRepository = purchaseRepository;
        _saleRepository = saleRepository;
        _returnRepository = returnRepository;
        _reservationRepository = reservationRepository;
    }

    public async Task<IEnumerable<ArchiveSearchResultDto>> SearchAsync(string query)
    {
        if (string.IsNullOrWhiteSpace(query) || query.Length < 2)
            return Enumerable.Empty<ArchiveSearchResultDto>();

        var results = new List<ArchiveSearchResultDto>();
        var searchTerm = query.Trim().ToLower();

        // Load all data once
        var allBicycles = (await _bicycleRepository.GetAllAsync()).ToList();
        var allPurchases = (await _purchaseRepository.GetAllAsync()).ToList();
        var allSales = (await _saleRepository.GetAllAsync()).ToList();
        var allReturns = (await _returnRepository.GetAllAsync()).ToList();

        var addedBikeIds = new HashSet<int>();

        void TryAdd(Bicycle bike, string matchType)
        {
            if (!addedBikeIds.Add(bike.Id)) return;
            var purchase = allPurchases.FirstOrDefault(p => p.BicycleId == bike.Id);
            var sale = allSales.FirstOrDefault(s => s.BicycleId == bike.Id);
            results.Add(new ArchiveSearchResultDto(
                bike.Id,
                bike.StokNo ?? "",
                $"{bike.Marke} {bike.Modell}",
                purchase?.BelegNummer,
                sale?.BelegNummer,
                purchase?.Kaufdatum,
                sale?.Verkaufsdatum,
                matchType
            ));
        }

        // Search by StokNo
        foreach (var bike in allBicycles.Where(b => b.StokNo != null && b.StokNo.ToLower().Contains(searchTerm)))
            TryAdd(bike, "StokNo");

        // Search by Purchase BelegNummer
        foreach (var p in allPurchases.Where(p => p.BelegNummer != null && p.BelegNummer.ToLower().Contains(searchTerm)))
        {
            var bike = allBicycles.FirstOrDefault(b => b.Id == p.BicycleId);
            if (bike != null) TryAdd(bike, "PurchaseBeleg");
        }

        // Search by Sale BelegNummer
        foreach (var s in allSales.Where(s => s.BelegNummer.ToLower().Contains(searchTerm)))
        {
            var bike = allBicycles.FirstOrDefault(b => b.Id == s.BicycleId);
            if (bike != null) TryAdd(bike, "SaleBeleg");
        }

        // Search by Return BelegNummer
        foreach (var r in allReturns.Where(r => r.BelegNummer.ToLower().Contains(searchTerm)))
        {
            var bike = allBicycles.FirstOrDefault(b => b.Id == r.BicycleId);
            if (bike != null) TryAdd(bike, "ReturnBeleg");
        }

        // Search by brand/model/rahmennummer
        foreach (var bike in allBicycles.Where(b =>
            b.Marke.ToLower().Contains(searchTerm) ||
            b.Modell.ToLower().Contains(searchTerm) ||
            (b.Rahmennummer != null && b.Rahmennummer.ToLower().Contains(searchTerm))))
        {
            TryAdd(bike, "BikeInfo");
        }

        return results.Take(20);
    }

    public async Task<ArchiveBicycleHistoryDto?> GetBicycleHistoryAsync(int bicycleId)
    {
        var bicycle = await _bicycleRepository.GetByIdAsync(bicycleId);
        if (bicycle == null) return null;

        var timeline = new List<ArchiveTimelineEventDto>();

        // Get Purchase
        var purchases = await _purchaseRepository.GetAllAsync();
        var purchase = purchases.FirstOrDefault(p => p.BicycleId == bicycleId);

        if (purchase != null)
        {
            var purchaseWithDetails = await _purchaseRepository.GetWithDetailsAsync(purchase.Id);
            timeline.Add(new ArchiveTimelineEventDto(
                "Purchase",
                purchase.Kaufdatum,
                purchase.BelegNummer,
                "Ankauf",
                $"Gekauft von {purchaseWithDetails?.Seller?.FullName ?? "Unbekannt"}",
                purchase.Preis,
                purchaseWithDetails?.Seller?.FullName,
                purchase.Zahlungsart.ToString(),
                purchase.Id,
                "Kaufbeleg"
            ));
        }

        // Get Reservations
        var reservations = (await _reservationRepository.GetAllAsync())
            .Where(r => r.BicycleId == bicycleId)
            .OrderBy(r => r.ReservierungsDatum);

        foreach (var reservation in reservations)
        {
            var resWithDetails = await _reservationRepository.GetWithDetailsAsync(reservation.Id);

            timeline.Add(new ArchiveTimelineEventDto(
                "Reservation",
                reservation.ReservierungsDatum,
                reservation.ReservierungsNummer,
                "Reservierung",
                $"Reserviert für {resWithDetails?.Customer?.FullName ?? "Unbekannt"} bis {reservation.AblaufDatum:dd.MM.yyyy}",
                reservation.Anzahlung,
                resWithDetails?.Customer?.FullName,
                null,
                null,
                null
            ));

            if (reservation.Status == Domain.Enums.ReservationStatus.Cancelled)
            {
                timeline.Add(new ArchiveTimelineEventDto(
                    "ReservationCancelled",
                    reservation.AblaufDatum,
                    reservation.ReservierungsNummer,
                    "Reservierung storniert",
                    $"Reservierung für {resWithDetails?.Customer?.FullName ?? "Unbekannt"} wurde storniert",
                    null,
                    resWithDetails?.Customer?.FullName,
                    null,
                    null,
                    null
                ));
            }
        }

        // Get Sale
        var sales = await _saleRepository.GetAllAsync();
        var sale = sales.FirstOrDefault(s => s.BicycleId == bicycleId);

        if (sale != null)
        {
            var saleWithDetails = await _saleRepository.GetWithDetailsAsync(sale.Id);
            timeline.Add(new ArchiveTimelineEventDto(
                "Sale",
                sale.Verkaufsdatum,
                sale.BelegNummer,
                "Verkauf",
                $"Verkauft an {saleWithDetails?.Buyer?.FullName ?? "Unbekannt"}",
                sale.Preis,
                saleWithDetails?.Buyer?.FullName,
                sale.Zahlungsart.ToString(),
                sale.Id,
                "Verkaufsbeleg"
            ));

            // Get Returns for this sale
            var returns = (await _returnRepository.GetAllAsync())
                .Where(r => r.SaleId == sale.Id)
                .OrderBy(r => r.Rueckgabedatum);

            foreach (var ret in returns)
            {
                var retWithDetails = await _returnRepository.GetWithDetailsAsync(ret.Id);
                timeline.Add(new ArchiveTimelineEventDto(
                    "Return",
                    ret.Rueckgabedatum,
                    ret.BelegNummer,
                    "Rückgabe",
                    $"Zurückgegeben von {saleWithDetails?.Buyer?.FullName ?? "Unbekannt"} - Grund: {ret.Grund}",
                    ret.Erstattungsbetrag,
                    saleWithDetails?.Buyer?.FullName,
                    null,
                    ret.Id,
                    "Rueckgabebeleg"
                ));
            }
        }

        // Sort timeline by date
        var sortedTimeline = timeline.OrderBy(t => t.EventDate).ToList();

        return new ArchiveBicycleHistoryDto(
            bicycle.Id,
            bicycle.StokNo ?? "",
            bicycle.Marke,
            bicycle.Modell,
            bicycle.Rahmennummer,
            bicycle.Farbe,
            bicycle.Reifengroesse,
            bicycle.Fahrradtyp,
            bicycle.Status.ToString(),
            bicycle.Zustand.ToString(),
            bicycle.CreatedAt,
            sortedTimeline
        );
    }
}
