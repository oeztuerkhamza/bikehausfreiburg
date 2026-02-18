using BikeHaus.Application.DTOs;
using BikeHaus.Application.Interfaces;
using BikeHaus.Application.Mappings;
using BikeHaus.Domain.Entities;
using BikeHaus.Domain.Enums;
using BikeHaus.Domain.Interfaces;

namespace BikeHaus.Application.Services;

public class ReservationService : IReservationService
{
    private readonly IReservationRepository _reservationRepository;
    private readonly IBicycleRepository _bicycleRepository;
    private readonly ICustomerRepository _customerRepository;
    private readonly ISaleRepository _saleRepository;

    public ReservationService(
        IReservationRepository reservationRepository,
        IBicycleRepository bicycleRepository,
        ICustomerRepository customerRepository,
        ISaleRepository saleRepository)
    {
        _reservationRepository = reservationRepository;
        _bicycleRepository = bicycleRepository;
        _customerRepository = customerRepository;
        _saleRepository = saleRepository;
    }

    public async Task<IEnumerable<ReservationListDto>> GetAllAsync()
    {
        var reservations = await _reservationRepository.GetAllAsync();
        return reservations.Select(r => r.ToListDto());
    }

    public async Task<PaginatedResult<ReservationListDto>> GetPaginatedAsync(PaginationParams paginationParams)
    {
        System.Linq.Expressions.Expression<Func<Reservation, bool>>? predicate = null;

        // Apply status filter
        if (!string.IsNullOrEmpty(paginationParams.Status))
        {
            if (Enum.TryParse<ReservationStatus>(paginationParams.Status, out var status))
            {
                predicate = r => r.Status == status;
            }
        }

        // Apply search filter
        if (!string.IsNullOrEmpty(paginationParams.SearchTerm))
        {
            var term = paginationParams.SearchTerm.ToLower();
            if (predicate != null)
            {
                var prevPredicate = predicate;
                predicate = r => prevPredicate.Compile()(r) &&
                    (r.ReservierungsNummer.ToLower().Contains(term) ||
                     r.Bicycle.Marke.ToLower().Contains(term) ||
                     r.Bicycle.Modell.ToLower().Contains(term) ||
                     (r.Bicycle.StokNo != null && r.Bicycle.StokNo.ToLower().Contains(term)) ||
                     r.Customer.Vorname.ToLower().Contains(term) ||
                     r.Customer.Nachname.ToLower().Contains(term));
            }
            else
            {
                predicate = r =>
                    r.ReservierungsNummer.ToLower().Contains(term) ||
                    r.Bicycle.Marke.ToLower().Contains(term) ||
                    r.Bicycle.Modell.ToLower().Contains(term) ||
                    (r.Bicycle.StokNo != null && r.Bicycle.StokNo.ToLower().Contains(term)) ||
                    r.Customer.Vorname.ToLower().Contains(term) ||
                    r.Customer.Nachname.ToLower().Contains(term);
            }
        }

        var (items, totalCount) = await _reservationRepository.GetPaginatedAsync(
            paginationParams.Page,
            paginationParams.PageSize,
            predicate);

        return new PaginatedResult<ReservationListDto>
        {
            Items = items.Select(r => r.ToListDto()),
            TotalCount = totalCount,
            Page = paginationParams.Page,
            PageSize = paginationParams.PageSize
        };
    }

    public async Task<ReservationDto?> GetByIdAsync(int id)
    {
        var reservation = await _reservationRepository.GetWithDetailsAsync(id);
        return reservation?.ToDto();
    }

    public async Task<ReservationDto> CreateAsync(ReservationCreateDto dto)
    {
        // Verify bicycle exists and is available
        var bicycle = await _bicycleRepository.GetByIdAsync(dto.BicycleId)
            ?? throw new KeyNotFoundException($"Fahrrad mit ID {dto.BicycleId} nicht gefunden.");

        if (bicycle.Status != BikeStatus.Available)
            throw new InvalidOperationException("Dieses Fahrrad ist nicht verfügbar für Reservierung.");

        // Check if there's already an active reservation for this bicycle
        var existingReservation = await _reservationRepository.GetActiveByBicycleIdAsync(dto.BicycleId);
        if (existingReservation != null)
            throw new InvalidOperationException("Dieses Fahrrad ist bereits reserviert.");

        // Create customer
        var customer = dto.Customer.ToEntity();
        customer = await _customerRepository.AddAsync(customer);

        // Create reservation
        var reservationDate = dto.ReservierungsDatum ?? DateTime.UtcNow;
        var reservation = new Reservation
        {
            BicycleId = dto.BicycleId,
            CustomerId = customer.Id,
            ReservierungsDatum = reservationDate,
            AblaufDatum = reservationDate.AddDays(dto.ReservierungsTage),
            Anzahlung = dto.Anzahlung,
            Notizen = dto.Notizen,
            Status = ReservationStatus.Active,
            ReservierungsNummer = await _reservationRepository.GenerateReservierungsNummerAsync()
        };

        var created = await _reservationRepository.AddAsync(reservation);

        // Update bicycle status to Reserved
        bicycle.Status = BikeStatus.Reserved;
        bicycle.UpdatedAt = DateTime.UtcNow;
        await _bicycleRepository.UpdateAsync(bicycle);

        var result = await _reservationRepository.GetWithDetailsAsync(created.Id);
        return result!.ToDto();
    }

    public async Task<ReservationDto> UpdateAsync(int id, ReservationUpdateDto dto)
    {
        var reservation = await _reservationRepository.GetWithDetailsAsync(id)
            ?? throw new KeyNotFoundException($"Reservierung mit ID {id} nicht gefunden.");

        if (reservation.Status != ReservationStatus.Active)
            throw new InvalidOperationException("Nur aktive Reservierungen können bearbeitet werden.");

        if (dto.AblaufDatum.HasValue)
            reservation.AblaufDatum = dto.AblaufDatum.Value;

        if (dto.Anzahlung.HasValue)
            reservation.Anzahlung = dto.Anzahlung.Value;

        if (dto.Notizen != null)
            reservation.Notizen = dto.Notizen;

        reservation.UpdatedAt = DateTime.UtcNow;
        await _reservationRepository.UpdateAsync(reservation);

        var result = await _reservationRepository.GetWithDetailsAsync(id);
        return result!.ToDto();
    }

    public async Task DeleteAsync(int id)
    {
        var reservation = await _reservationRepository.GetWithDetailsAsync(id)
            ?? throw new KeyNotFoundException($"Reservierung mit ID {id} nicht gefunden.");

        // Reset bicycle status if reservation is active
        if (reservation.Status == ReservationStatus.Active)
        {
            var bicycle = await _bicycleRepository.GetByIdAsync(reservation.BicycleId);
            if (bicycle != null)
            {
                bicycle.Status = BikeStatus.Available;
                bicycle.UpdatedAt = DateTime.UtcNow;
                await _bicycleRepository.UpdateAsync(bicycle);
            }
        }

        await _reservationRepository.DeleteAsync(id);
    }

    public async Task CancelAsync(int id)
    {
        var reservation = await _reservationRepository.GetWithDetailsAsync(id)
            ?? throw new KeyNotFoundException($"Reservierung mit ID {id} nicht gefunden.");

        if (reservation.Status != ReservationStatus.Active)
            throw new InvalidOperationException("Nur aktive Reservierungen können storniert werden.");

        reservation.Status = ReservationStatus.Cancelled;
        reservation.UpdatedAt = DateTime.UtcNow;
        await _reservationRepository.UpdateAsync(reservation);

        // Reset bicycle status to Available
        var bicycle = await _bicycleRepository.GetByIdAsync(reservation.BicycleId);
        if (bicycle != null)
        {
            bicycle.Status = BikeStatus.Available;
            bicycle.UpdatedAt = DateTime.UtcNow;
            await _bicycleRepository.UpdateAsync(bicycle);
        }
    }

    public async Task<SaleDto> ConvertToSaleAsync(int id, ReservationConvertToSaleDto dto)
    {
        var reservation = await _reservationRepository.GetWithDetailsAsync(id)
            ?? throw new KeyNotFoundException($"Reservierung mit ID {id} nicht gefunden.");

        if (reservation.Status != ReservationStatus.Active)
            throw new InvalidOperationException("Nur aktive Reservierungen können in einen Verkauf umgewandelt werden.");

        // Create Sale
        var sale = new Sale
        {
            BicycleId = reservation.BicycleId,
            BuyerId = reservation.CustomerId,
            Preis = dto.Preis,
            Zahlungsart = dto.Zahlungsart,
            Verkaufsdatum = DateTime.UtcNow,
            Garantie = dto.Garantie,
            GarantieBedingungen = dto.GarantieBedingungen,
            Notizen = dto.Notizen,
            BelegNummer = await _saleRepository.GenerateBelegNummerAsync()
        };

        // Add signatures if provided
        if (dto.BuyerSignature != null)
        {
            sale.BuyerSignature = dto.BuyerSignature.ToEntity();
        }
        if (dto.SellerSignature != null)
        {
            sale.SellerSignature = dto.SellerSignature.ToEntity();
        }

        // Add accessories if provided
        if (dto.Accessories != null && dto.Accessories.Count > 0)
        {
            foreach (var accessory in dto.Accessories)
            {
                sale.Accessories.Add(new SaleAccessory
                {
                    Bezeichnung = accessory.Bezeichnung,
                    Preis = accessory.Preis,
                    Menge = accessory.Menge
                });
            }
        }

        var createdSale = await _saleRepository.AddAsync(sale);

        // Update reservation status
        reservation.Status = ReservationStatus.Converted;
        reservation.SaleId = createdSale.Id;
        reservation.UpdatedAt = DateTime.UtcNow;
        await _reservationRepository.UpdateAsync(reservation);

        // Update bicycle status to Sold
        var bicycle = await _bicycleRepository.GetByIdAsync(reservation.BicycleId);
        if (bicycle != null)
        {
            bicycle.Status = BikeStatus.Sold;
            bicycle.UpdatedAt = DateTime.UtcNow;
            await _bicycleRepository.UpdateAsync(bicycle);
        }

        var result = await _saleRepository.GetWithDetailsAsync(createdSale.Id);
        return result!.ToDto();
    }

    public async Task ExpireOldReservationsAsync()
    {
        var expiredReservations = await _reservationRepository.GetExpiredReservationsAsync();

        foreach (var reservation in expiredReservations)
        {
            reservation.Status = ReservationStatus.Expired;
            reservation.UpdatedAt = DateTime.UtcNow;
            await _reservationRepository.UpdateAsync(reservation);

            // Reset bicycle status to Available
            var bicycle = await _bicycleRepository.GetByIdAsync(reservation.BicycleId);
            if (bicycle != null)
            {
                bicycle.Status = BikeStatus.Available;
                bicycle.UpdatedAt = DateTime.UtcNow;
                await _bicycleRepository.UpdateAsync(bicycle);
            }
        }
    }
}
