using BikeHaus.Application.DTOs;
using BikeHaus.Application.Interfaces;
using BikeHaus.Application.Mappings;
using BikeHaus.Domain.Entities;
using BikeHaus.Domain.Enums;
using BikeHaus.Domain.Interfaces;

namespace BikeHaus.Application.Services;

public class RentalService : IRentalService
{
    private readonly IRentalRepository _rentalRepository;
    private readonly IBicycleRepository _bicycleRepository;
    private readonly ICustomerRepository _customerRepository;

    public RentalService(
        IRentalRepository rentalRepository,
        IBicycleRepository bicycleRepository,
        ICustomerRepository customerRepository)
    {
        _rentalRepository = rentalRepository;
        _bicycleRepository = bicycleRepository;
        _customerRepository = customerRepository;
    }

    public async Task<IEnumerable<RentalListDto>> GetAllAsync()
    {
        var rentals = await _rentalRepository.GetAllAsync();
        return rentals.Select(r => r.ToListDto());
    }

    public async Task<PaginatedResult<RentalListDto>> GetPaginatedAsync(PaginationParams paginationParams)
    {
        System.Linq.Expressions.Expression<Func<Rental, bool>>? predicate = null;

        if (!string.IsNullOrEmpty(paginationParams.Status))
        {
            if (Enum.TryParse<RentalStatus>(paginationParams.Status, out var status))
            {
                predicate = r => r.Status == status;
            }
        }

        if (!string.IsNullOrEmpty(paginationParams.SearchTerm))
        {
            var term = paginationParams.SearchTerm.ToLower();
            if (predicate != null)
            {
                var prevPredicate = predicate;
                predicate = r => prevPredicate.Compile()(r) &&
                    (r.MietvertragNummer.ToLower().Contains(term) ||
                     r.Bicycle.Marke.ToLower().Contains(term) ||
                     r.Bicycle.Modell.ToLower().Contains(term) ||
                     r.Customer.Vorname.ToLower().Contains(term) ||
                     r.Customer.Nachname.ToLower().Contains(term));
            }
            else
            {
                predicate = r =>
                    r.MietvertragNummer.ToLower().Contains(term) ||
                    r.Bicycle.Marke.ToLower().Contains(term) ||
                    r.Bicycle.Modell.ToLower().Contains(term) ||
                    r.Customer.Vorname.ToLower().Contains(term) ||
                    r.Customer.Nachname.ToLower().Contains(term);
            }
        }

        var (items, totalCount) = await _rentalRepository.GetPaginatedAsync(
            paginationParams.Page,
            paginationParams.PageSize,
            predicate);

        return new PaginatedResult<RentalListDto>
        {
            Items = items.Select(r => r.ToListDto()),
            TotalCount = totalCount,
            Page = paginationParams.Page,
            PageSize = paginationParams.PageSize
        };
    }

    public async Task<RentalDto?> GetByIdAsync(int id)
    {
        var rental = await _rentalRepository.GetWithDetailsAsync(id);
        return rental?.ToDto();
    }

    public async Task<RentalDto> CreateAsync(RentalCreateDto dto)
    {
        var bicycle = await _bicycleRepository.GetByIdAsync(dto.BicycleId)
            ?? throw new KeyNotFoundException($"Fahrrad mit ID {dto.BicycleId} nicht gefunden.");

        if (bicycle.Status != BikeStatus.Available)
            throw new InvalidOperationException("Dieses Fahrrad ist nicht verfügbar für Vermietung.");

        // Check if there's already an active rental for this bicycle
        var existingRental = await _rentalRepository.GetActiveByBicycleIdAsync(dto.BicycleId);
        if (existingRental != null)
            throw new InvalidOperationException("Dieses Fahrrad ist bereits vermietet.");

        // Create customer
        var customer = dto.Customer.ToEntity();
        customer = await _customerRepository.AddAsync(customer);

        var rental = new Rental
        {
            BicycleId = dto.BicycleId,
            CustomerId = customer.Id,
            AusweisnNr = dto.AusweisnNr,
            StartDatum = dto.StartDatum,
            EndDatum = dto.EndDatum,
            Gesamtmiete = dto.Gesamtmiete,
            Rabatt = dto.Rabatt,
            Kaution = dto.Kaution,
            Zahlungsart = dto.Zahlungsart,
            ZustandBeiUebergabe = dto.ZustandBeiUebergabe,
            Notizen = dto.Notizen,
            Status = RentalStatus.Active,
            MietvertragNummer = await _rentalRepository.GenerateMietvertragNummerAsync()
        };

        var created = await _rentalRepository.AddAsync(rental);

        // Update bicycle status to Rented
        bicycle.Status = BikeStatus.Rented;
        bicycle.UpdatedAt = DateTime.UtcNow;
        await _bicycleRepository.UpdateAsync(bicycle);

        var result = await _rentalRepository.GetWithDetailsAsync(created.Id);
        return result!.ToDto();
    }

    public async Task<RentalDto> UpdateAsync(int id, RentalUpdateDto dto)
    {
        var rental = await _rentalRepository.GetWithDetailsAsync(id)
            ?? throw new KeyNotFoundException($"Mietvertrag mit ID {id} nicht gefunden.");

        // Update customer if provided
        if (dto.Customer != null)
        {
            var customer = rental.Customer;
            customer.Vorname = dto.Customer.Vorname;
            customer.Nachname = dto.Customer.Nachname;
            customer.Strasse = dto.Customer.Strasse;
            customer.Hausnummer = dto.Customer.Hausnummer;
            customer.PLZ = dto.Customer.PLZ;
            customer.Stadt = dto.Customer.Stadt;
            customer.Telefon = dto.Customer.Telefon;
            customer.Email = dto.Customer.Email;
            customer.UpdatedAt = DateTime.UtcNow;
            await _customerRepository.UpdateAsync(customer);
        }

        if (dto.AusweisnNr != null)
            rental.AusweisnNr = dto.AusweisnNr;
        if (dto.StartDatum.HasValue)
            rental.StartDatum = dto.StartDatum.Value;
        if (dto.EndDatum.HasValue)
            rental.EndDatum = dto.EndDatum.Value;
        if (dto.Gesamtmiete.HasValue)
            rental.Gesamtmiete = dto.Gesamtmiete.Value;
        if (dto.Rabatt.HasValue)
            rental.Rabatt = dto.Rabatt.Value;
        if (dto.Kaution.HasValue)
            rental.Kaution = dto.Kaution.Value;
        if (dto.KautionZurueckgegeben.HasValue)
            rental.KautionZurueckgegeben = dto.KautionZurueckgegeben.Value;
        if (dto.Zahlungsart.HasValue)
            rental.Zahlungsart = dto.Zahlungsart.Value;
        if (dto.ZustandBeiUebergabe.HasValue)
            rental.ZustandBeiUebergabe = dto.ZustandBeiUebergabe.Value;
        if (dto.Notizen != null)
            rental.Notizen = dto.Notizen;

        rental.UpdatedAt = DateTime.UtcNow;
        await _rentalRepository.UpdateAsync(rental);

        var updated = await _rentalRepository.GetWithDetailsAsync(id);
        return updated!.ToDto();
    }

    public async Task DeleteAsync(int id)
    {
        var rental = await _rentalRepository.GetWithDetailsAsync(id)
            ?? throw new KeyNotFoundException($"Mietvertrag mit ID {id} nicht gefunden.");

        // If active, release the bicycle
        if (rental.Status == RentalStatus.Active)
        {
            var bicycle = await _bicycleRepository.GetByIdAsync(rental.BicycleId);
            if (bicycle != null)
            {
                bicycle.Status = BikeStatus.Available;
                bicycle.UpdatedAt = DateTime.UtcNow;
                await _bicycleRepository.UpdateAsync(bicycle);
            }
        }

        await _rentalRepository.DeleteAsync(rental.Id);
    }

    public async Task<RentalDto> ReturnBicycleAsync(int id)
    {
        var rental = await _rentalRepository.GetWithDetailsAsync(id)
            ?? throw new KeyNotFoundException($"Mietvertrag mit ID {id} nicht gefunden.");

        if (rental.Status != RentalStatus.Active)
            throw new InvalidOperationException("Nur aktive Mietverträge können zurückgegeben werden.");

        rental.Status = RentalStatus.Returned;
        rental.UpdatedAt = DateTime.UtcNow;
        await _rentalRepository.UpdateAsync(rental);

        // Release bicycle
        var bicycle = await _bicycleRepository.GetByIdAsync(rental.BicycleId);
        if (bicycle != null)
        {
            bicycle.Status = BikeStatus.Available;
            bicycle.UpdatedAt = DateTime.UtcNow;
            await _bicycleRepository.UpdateAsync(bicycle);
        }

        var updated = await _rentalRepository.GetWithDetailsAsync(id);
        return updated!.ToDto();
    }

    public async Task<RentalDto> CancelAsync(int id)
    {
        var rental = await _rentalRepository.GetWithDetailsAsync(id)
            ?? throw new KeyNotFoundException($"Mietvertrag mit ID {id} nicht gefunden.");

        if (rental.Status != RentalStatus.Active)
            throw new InvalidOperationException("Nur aktive Mietverträge können storniert werden.");

        rental.Status = RentalStatus.Cancelled;
        rental.UpdatedAt = DateTime.UtcNow;
        await _rentalRepository.UpdateAsync(rental);

        // Release bicycle
        var bicycle = await _bicycleRepository.GetByIdAsync(rental.BicycleId);
        if (bicycle != null)
        {
            bicycle.Status = BikeStatus.Available;
            bicycle.UpdatedAt = DateTime.UtcNow;
            await _bicycleRepository.UpdateAsync(bicycle);
        }

        var updated = await _rentalRepository.GetWithDetailsAsync(id);
        return updated!.ToDto();
    }
}
