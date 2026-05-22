using BikeHaus.Application.DTOs;
using BikeHaus.Application.Interfaces;
using BikeHaus.Application.Mappings;
using BikeHaus.Domain.Entities;
using BikeHaus.Domain.Enums;
using BikeHaus.Domain.Interfaces;
using Microsoft.Extensions.Logging;

namespace BikeHaus.Application.Services;

public class RentalService : IRentalService
{
    private readonly IRentalRepository _rentalRepository;
    private readonly IBicycleRepository _bicycleRepository;
    private readonly ICustomerRepository _customerRepository;
    private readonly IPdfService _pdfService;
    private readonly IEmailService _emailService;
    private readonly ILogger<RentalService> _logger;

    public RentalService(
        IRentalRepository rentalRepository,
        IBicycleRepository bicycleRepository,
        ICustomerRepository customerRepository,
        IPdfService pdfService,
        IEmailService emailService,
        ILogger<RentalService> logger)
    {
        _rentalRepository = rentalRepository;
        _bicycleRepository = bicycleRepository;
        _customerRepository = customerRepository;
        _pdfService = pdfService;
        _emailService = emailService;
        _logger = logger;
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
                     r.Bikes.Any(b => b.Bicycle.Marke.ToLower().Contains(term) || b.Bicycle.Modell.ToLower().Contains(term)) ||
                     r.Customer.Vorname.ToLower().Contains(term) ||
                     r.Customer.Nachname.ToLower().Contains(term));
            }
            else
            {
                predicate = r =>
                    r.MietvertragNummer.ToLower().Contains(term) ||
                    r.Bikes.Any(b => b.Bicycle.Marke.ToLower().Contains(term) || b.Bicycle.Modell.ToLower().Contains(term)) ||
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
        if (dto.Bikes == null || dto.Bikes.Count == 0)
            throw new InvalidOperationException("Mindestens ein Fahrrad ist erforderlich.");

        // Validate every bike up-front so we don't half-create
        var bicycles = new List<Bicycle>();
        foreach (var bikeDto in dto.Bikes)
        {
            var bicycle = await _bicycleRepository.GetByIdAsync(bikeDto.BicycleId)
                ?? throw new KeyNotFoundException($"Fahrrad mit ID {bikeDto.BicycleId} nicht gefunden.");
            bicycles.Add(bicycle);
        }

        // Create customer (one per rental)
        var customer = dto.Customer.ToEntity();
        customer = await _customerRepository.AddAsync(customer);

        // Aggregate dates/totals across bikes
        var startDatum = dto.Bikes.Min(b => b.StartDatum);
        var endDatum = dto.Bikes.Max(b => b.EndDatum);
        var gesamtmiete = dto.Bikes.Sum(b => b.Mietpreis);
        var kautionTotal = dto.Bikes.Sum(b => b.Kaution);

        var rental = new Rental
        {
            CustomerId = customer.Id,
            AusweisnNr = dto.AusweisnNr,
            StartDatum = startDatum,
            EndDatum = endDatum,
            Gesamtmiete = gesamtmiete,
            Rabatt = dto.Rabatt,
            Kaution = kautionTotal,
            Zahlungsart = dto.Zahlungsart,
            KautionZahlungsart = dto.KautionZahlungsart ?? dto.Zahlungsart,
            Notizen = dto.Notizen,
            Status = RentalStatus.Active,
            MietvertragNummer = await _rentalRepository.GenerateMietvertragNummerAsync(),
            MieterUnterschrift = dto.MieterUnterschrift,
            AgbAkzeptiert = dto.AgbAkzeptiert,
            UnterschriftOrt = dto.UnterschriftOrt,
            AusweisPhotoPath = dto.AusweisPhotoPath
        };

        // Attach bikes
        foreach (var bikeDto in dto.Bikes)
        {
            rental.Bikes.Add(new RentalBike
            {
                BicycleId = bikeDto.BicycleId,
                Rahmennummer = bikeDto.Rahmennummer,
                Farbe = bikeDto.Farbe,
                StartDatum = bikeDto.StartDatum,
                EndDatum = bikeDto.EndDatum,
                Mietpreis = bikeDto.Mietpreis,
                Kaution = bikeDto.Kaution,
                ZustandBeiUebergabe = bikeDto.ZustandBeiUebergabe
            });
        }

        // Accessories
        if (dto.Accessories != null && dto.Accessories.Count > 0)
        {
            foreach (var accessoryDto in dto.Accessories)
            {
                rental.Accessories.Add(new RentalAccessoryItem
                {
                    RentalAccessoryId = accessoryDto.RentalAccessoryId,
                    Bezeichnung = accessoryDto.Bezeichnung,
                    Tagespreis = accessoryDto.Tagespreis,
                    Verlustgebuehr = accessoryDto.Verlustgebuehr,
                    Menge = accessoryDto.Menge
                });
            }
        }

        var created = await _rentalRepository.AddAsync(rental);

        // Mark every bicycle Rented
        foreach (var bicycle in bicycles)
        {
            bicycle.Status = BikeStatus.Rented;
            bicycle.UpdatedAt = DateTime.UtcNow;
            await _bicycleRepository.UpdateAsync(bicycle);
        }

        var result = await _rentalRepository.GetWithDetailsAsync(created.Id);
        if (result != null)
            await TrySendRentalDocumentsAsync(result);

        return result!.ToDto();
    }

    private async Task TrySendRentalDocumentsAsync(Rental rental)
    {
        if (string.IsNullOrWhiteSpace(rental.Customer?.Email))
            return;

        try
        {
            var mietvertragPdf = await _pdfService.GenerateMietvertragAsync(rental.Id);
            var kautionsquittungPdf = await _pdfService.GenerateKautionsquittungAsync(rental.Id);
            var bedingungenpdf = await _pdfService.GenerateMietbedingungenpdfAsync(rental.Id);
            var toName = $"{rental.Customer.Vorname} {rental.Customer.Nachname}".Trim();

            await _emailService.SendRentalDocumentsAsync(
                rental.Customer.Email,
                string.IsNullOrWhiteSpace(toName) ? "Kunde" : toName,
                rental.MietvertragNummer,
                mietvertragPdf,
                kautionsquittungPdf,
                bedingungenpdf);
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "Failed to send rental documents email for rental {RentalId} ({MietvertragNummer})",
                rental.Id,
                rental.MietvertragNummer);
        }
    }

    public async Task<RentalDto> UpdateAsync(int id, RentalUpdateDto dto)
    {
        var rental = await _rentalRepository.GetWithDetailsAsync(id)
            ?? throw new KeyNotFoundException($"Mietvertrag mit ID {id} nicht gefunden.");

        var wasAllRefunded = rental.Bikes.Count > 0 && rental.Bikes.All(b => b.KautionZurueckgegeben);

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
        if (dto.Rabatt.HasValue)
            rental.Rabatt = dto.Rabatt.Value;
        if (dto.Zahlungsart.HasValue)
            rental.Zahlungsart = dto.Zahlungsart.Value;
        if (dto.KautionZahlungsart.HasValue)
            rental.KautionZahlungsart = dto.KautionZahlungsart.Value;
        if (dto.Notizen != null)
            rental.Notizen = dto.Notizen;
        if (dto.MieterUnterschrift != null)
            rental.MieterUnterschrift = dto.MieterUnterschrift;
        if (dto.AgbAkzeptiert.HasValue)
            rental.AgbAkzeptiert = dto.AgbAkzeptiert.Value;
        if (dto.UnterschriftOrt != null)
            rental.UnterschriftOrt = dto.UnterschriftOrt;

        // Deposit return cascades to every bike in this rental
        if (dto.KautionZurueckgegeben.HasValue)
        {
            if (dto.KautionZurueckgegeben.Value && string.IsNullOrWhiteSpace(dto.KautionRueckgabeUnterschrift))
                throw new InvalidOperationException("Für die Kautionsrückgabe ist eine Unterschrift erforderlich.");

            foreach (var bike in rental.Bikes)
            {
                bike.KautionZurueckgegeben = dto.KautionZurueckgegeben.Value;
                if (dto.KautionRueckgabeUnterschrift != null)
                    bike.KautionRueckgabeUnterschrift = dto.KautionRueckgabeUnterschrift;
                bike.UpdatedAt = DateTime.UtcNow;
            }
        }
        else if (dto.KautionRueckgabeUnterschrift != null)
        {
            foreach (var bike in rental.Bikes)
            {
                bike.KautionRueckgabeUnterschrift = dto.KautionRueckgabeUnterschrift;
                bike.UpdatedAt = DateTime.UtcNow;
            }
        }

        // Remove bikes
        if (dto.RemoveBikeIds != null && dto.RemoveBikeIds.Count > 0)
        {
            foreach (var removeId in dto.RemoveBikeIds)
            {
                var bikeToRemove = rental.Bikes.FirstOrDefault(b => b.Id == removeId);
                if (bikeToRemove == null) continue;
                var bicycle = await _bicycleRepository.GetByIdAsync(bikeToRemove.BicycleId);
                if (bicycle != null && bicycle.Status == BikeStatus.Rented)
                {
                    bicycle.Status = BikeStatus.Available;
                    bicycle.UpdatedAt = DateTime.UtcNow;
                    await _bicycleRepository.UpdateAsync(bicycle);
                }
                rental.Bikes.Remove(bikeToRemove);
            }
        }

        // Per-bike updates
        if (dto.Bikes != null && dto.Bikes.Count > 0)
        {
            foreach (var bikeDto in dto.Bikes)
            {
                var bike = rental.Bikes.FirstOrDefault(b => b.Id == bikeDto.Id);
                if (bike == null) continue;

                if (bikeDto.BicycleId.HasValue && bikeDto.BicycleId.Value != bike.BicycleId)
                {
                    // Release old bicycle
                    var oldBicycle = await _bicycleRepository.GetByIdAsync(bike.BicycleId);
                    if (oldBicycle != null)
                    {
                        oldBicycle.Status = BikeStatus.Available;
                        oldBicycle.UpdatedAt = DateTime.UtcNow;
                        await _bicycleRepository.UpdateAsync(oldBicycle);
                    }
                    var newBicycle = await _bicycleRepository.GetByIdAsync(bikeDto.BicycleId.Value)
                        ?? throw new KeyNotFoundException($"Fahrrad mit ID {bikeDto.BicycleId} nicht gefunden.");
                    newBicycle.Status = BikeStatus.Rented;
                    newBicycle.UpdatedAt = DateTime.UtcNow;
                    await _bicycleRepository.UpdateAsync(newBicycle);
                    bike.BicycleId = newBicycle.Id;
                }
                if (bikeDto.Rahmennummer != null) bike.Rahmennummer = bikeDto.Rahmennummer;
                if (bikeDto.Farbe != null) bike.Farbe = bikeDto.Farbe;
                if (bikeDto.Mietpreis.HasValue) bike.Mietpreis = bikeDto.Mietpreis.Value;
                if (bikeDto.Kaution.HasValue) bike.Kaution = bikeDto.Kaution.Value;
                bike.UpdatedAt = DateTime.UtcNow;
            }
        }

        // Add new bikes
        if (dto.NewBikes != null && dto.NewBikes.Count > 0)
        {
            foreach (var newBikeDto in dto.NewBikes)
            {
                var bicycle = await _bicycleRepository.GetByIdAsync(newBikeDto.BicycleId)
                    ?? throw new KeyNotFoundException($"Fahrrad mit ID {newBikeDto.BicycleId} nicht gefunden.");
                bicycle.Status = BikeStatus.Rented;
                bicycle.UpdatedAt = DateTime.UtcNow;
                await _bicycleRepository.UpdateAsync(bicycle);

                rental.Bikes.Add(new RentalBike
                {
                    BicycleId = bicycle.Id,
                    Rahmennummer = newBikeDto.Rahmennummer,
                    Farbe = newBikeDto.Farbe,
                    StartDatum = newBikeDto.StartDatum,
                    EndDatum = newBikeDto.EndDatum,
                    Mietpreis = newBikeDto.Mietpreis,
                    Kaution = newBikeDto.Kaution,
                    ZustandBeiUebergabe = newBikeDto.ZustandBeiUebergabe,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow,
                });
            }
        }

        if (dto.Bikes != null || dto.NewBikes != null || dto.RemoveBikeIds != null)
        {
            rental.Gesamtmiete = rental.Bikes.Sum(b => b.Mietpreis) - (rental.Rabatt);
            rental.Kaution = rental.Bikes.Sum(b => b.Kaution);
        }

        rental.UpdatedAt = DateTime.UtcNow;
        await _rentalRepository.UpdateAsync(rental);

        var isAllRefundedNow = rental.Bikes.Count > 0 && rental.Bikes.All(b => b.KautionZurueckgegeben);
        if (!wasAllRefunded && isAllRefundedNow)
            await TrySendDepositRefundConfirmationAsync(rental);

        var updated = await _rentalRepository.GetWithDetailsAsync(id);
        return updated!.ToDto();
    }

    private async Task TrySendDepositRefundConfirmationAsync(Rental rental)
    {
        if (string.IsNullOrWhiteSpace(rental.Customer?.Email))
            return;

        try
        {
            var toName = $"{rental.Customer.Vorname} {rental.Customer.Nachname}".Trim();
            await _emailService.SendDepositRefundConfirmationAsync(
                rental.Customer.Email,
                string.IsNullOrWhiteSpace(toName) ? "Kunde" : toName,
                rental.MietvertragNummer);
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "Failed to send deposit refund confirmation email for rental {RentalId} ({MietvertragNummer})",
                rental.Id,
                rental.MietvertragNummer);
        }
    }

    public async Task DeleteAsync(int id)
    {
        var rental = await _rentalRepository.GetWithDetailsAsync(id)
            ?? throw new KeyNotFoundException($"Mietvertrag mit ID {id} nicht gefunden.");

        if (rental.Status == RentalStatus.Active)
            await ReleaseBikesAsync(rental);

        await _rentalRepository.DeleteAsync(rental.Id);
    }

    public async Task<RentalDto> ReturnBicycleAsync(int id, RentalReturnDto dto)
    {
        var rental = await _rentalRepository.GetWithDetailsAsync(id)
            ?? throw new KeyNotFoundException($"Mietvertrag mit ID {id} nicht gefunden.");

        if (rental.Status != RentalStatus.Active)
            throw new InvalidOperationException("Nur aktive Mietverträge können zurückgegeben werden.");

        // Apply per-bike return checklist
        foreach (var bikeReturn in dto.Bikes)
        {
            var rentalBike = rental.Bikes.FirstOrDefault(b => b.Id == bikeReturn.RentalBikeId)
                ?? throw new KeyNotFoundException($"RentalBike mit ID {bikeReturn.RentalBikeId} nicht gefunden.");

            rentalBike.ZustandBeiRueckgabe = bikeReturn.ZustandBeiRueckgabe;
            rentalBike.SchadenAbzug = bikeReturn.SchadenAbzug;
            rentalBike.VerspaetungsAbzug = bikeReturn.VerspaetungsAbzug;
            rentalBike.TatsaechlichesRueckgabeDatum = bikeReturn.TatsaechlichesRueckgabeDatum;
            rentalBike.AbzugNotizen = bikeReturn.AbzugNotizen;
            rentalBike.UpdatedAt = DateTime.UtcNow;
        }

        // Apply per-accessory return status
        if (dto.Accessories != null)
        {
            foreach (var accReturn in dto.Accessories)
            {
                var acc = rental.Accessories.FirstOrDefault(a => a.Id == accReturn.RentalAccessoryItemId);
                if (acc != null)
                {
                    acc.Zurueckgegeben = accReturn.Zurueckgegeben;
                    acc.UpdatedAt = DateTime.UtcNow;
                }
            }
        }

        rental.Status = RentalStatus.Returned;
        rental.UpdatedAt = DateTime.UtcNow;
        await _rentalRepository.UpdateAsync(rental);

        await ReleaseBikesAsync(rental);

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

        await ReleaseBikesAsync(rental);

        var updated = await _rentalRepository.GetWithDetailsAsync(id);
        return updated!.ToDto();
    }

    public async Task SaveAusweisPhotoPathAsync(int id, string ausweisPhotoPath)
    {
        var rental = await _rentalRepository.GetByIdAsync(id)
            ?? throw new KeyNotFoundException($"Rental {id} not found.");
        rental.AusweisPhotoPath = ausweisPhotoPath;
        await _rentalRepository.UpdateAsync(rental);
    }

    public async Task<string?> GetAusweisPhotoPathAsync(int id)
    {
        var rental = await _rentalRepository.GetByIdAsync(id)
            ?? throw new KeyNotFoundException($"Rental {id} not found.");
        return rental.AusweisPhotoPath;
    }

    private async Task ReleaseBikesAsync(Rental rental)
    {
        foreach (var rentalBike in rental.Bikes)
        {
            var bicycle = await _bicycleRepository.GetByIdAsync(rentalBike.BicycleId);
            if (bicycle == null) continue;
            bicycle.Status = BikeStatus.Available;
            bicycle.UpdatedAt = DateTime.UtcNow;
            await _bicycleRepository.UpdateAsync(bicycle);
        }
    }
}
