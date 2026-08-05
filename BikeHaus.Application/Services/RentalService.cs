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

    public async Task<IEnumerable<RentalCalendarItemDto>> GetCalendarAsync(DateTime from, DateTime to)
    {
        var rentals = await _rentalRepository.GetOverlappingRangeWithBikesAsync(from, to);
        return rentals.Select(r => r.ToCalendarItemDto());
    }

    public async Task<PaginatedResult<RentalListDto>> GetPaginatedAsync(PaginationParams paginationParams, bool includeCompleted = false)
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
            predicate,
            includeCompleted);

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

        // Mietpreis pro Fahrrad: den vom Formular gesendeten Wert bevorzugen, damit
        // ein manuell angepasster Endpreis erhalten bleibt. Schickt das Formular
        // keinen Preis (0), auf den serverseitig aus der Preistabelle berechneten
        // Wert zurückfallen, damit nie versehentlich 0 gespeichert wird.
        var bikePrices = new List<decimal>(dto.Bikes.Count);
        for (int i = 0; i < dto.Bikes.Count; i++)
        {
            var bikeDto = dto.Bikes[i];
            var days = RentalPricingCalculator.CalculateDaysInclusive(bikeDto.StartDatum, bikeDto.EndDatum);
            var calculated = RentalPricingCalculator.CalculateBikePrice(bicycles[i], days);
            bikePrices.Add(bikeDto.Mietpreis > 0 ? bikeDto.Mietpreis : (calculated ?? 0m));
        }

        // Aggregate dates/totals across bikes
        var startDatum = dto.Bikes.Min(b => b.StartDatum);
        var endDatum = dto.Bikes.Max(b => b.EndDatum);
        var gesamtmiete = bikePrices.Sum();
        var kautionTotal = dto.Bikes.Sum(b => b.Kaution);

        var rental = new Rental
        {
            CustomerId = customer.Id,
            StartDatum = startDatum,
            EndDatum = endDatum,
            Gesamtmiete = gesamtmiete,
            Rabatt = dto.Rabatt,
            Kaution = kautionTotal,
            Zahlungsart = dto.Zahlungsart,
            KautionZahlungsart = dto.KautionZahlungsart ?? dto.Zahlungsart,
            Notizen = dto.Notizen,
            Status = RentalStatus.Active,
            MieterUnterschrift = dto.MieterUnterschrift,
            AgbAkzeptiert = dto.AgbAkzeptiert,
            UnterschriftOrt = dto.UnterschriftOrt,
            AusweisPhotoPath = dto.AusweisPhotoPath
        };

        // Attach bikes (mit serverseitig berechnetem Mietpreis)
        for (int i = 0; i < dto.Bikes.Count; i++)
        {
            var bikeDto = dto.Bikes[i];
            rental.Bikes.Add(new RentalBike
            {
                BicycleId = bikeDto.BicycleId,
                Rahmennummer = bikeDto.Rahmennummer,
                Farbe = bikeDto.Farbe,
                StartDatum = bikeDto.StartDatum,
                EndDatum = bikeDto.EndDatum,
                Mietpreis = bikePrices[i],
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

        // Zubehör pro Miettag berechnen (Tagespreis × Menge × Tage) und zur
        // Gesamtmiete addieren. Miettage = gesamter Vertragszeitraum (inklusive).
        var rentalDays = RentalPricingCalculator.CalculateDaysInclusive(startDatum, endDatum);
        rental.Gesamtmiete = gesamtmiete
            + rental.Accessories.Sum(a => a.Tagespreis * a.Menge * rentalDays);

        // Mietvertragsnummer atomar vergeben (erzeugen + speichern unter Sperre);
        // teilt sich den Nummernkreis mit dem Verkauf.
        var created = await SequenceNumberGuard.RunExclusiveAsync(SequenceKeys.VerkaufMiete, async () =>
        {
            rental.MietvertragNummer = await _rentalRepository.GenerateMietvertragNummerAsync();
            return await _rentalRepository.AddAsync(rental);
        });

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

        // Beleg-Nr (Mietvertragsnummer) manuell änderbar — Eindeutigkeit prüfen
        // (gemeinsamer Nummernkreis mit Verkäufen). Leer = unverändert lassen.
        if (!string.IsNullOrWhiteSpace(dto.MietvertragNummer)
            && dto.MietvertragNummer.Trim() != rental.MietvertragNummer)
        {
            var neueNummer = dto.MietvertragNummer.Trim();
            if (await _rentalRepository.MietvertragNummerExistsAsync(neueNummer, rental.Id))
                throw new InvalidOperationException($"Die Beleg-Nr {neueNummer} ist bereits vergeben.");
            rental.MietvertragNummer = neueNummer;
        }

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
                // Rückgabezeitpunkt einmalig festhalten; wird die Rückgabe
                // zurückgenommen, verschwindet auch das Datum wieder.
                if (!dto.KautionZurueckgegeben.Value)
                    bike.KautionRueckgabeDatum = null;
                else
                    bike.KautionRueckgabeDatum ??= DateTime.UtcNow;
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

        // Sync accessories when provided: update matching items in place (keeping their
        // id and their already-returned status), add new ones, and remove the rest —
        // but never silently drop an accessory that was already returned.
        if (dto.Accessories != null)
        {
            var incoming = dto.Accessories;

            var toRemove = rental.Accessories
                .Where(existing => !existing.Zurueckgegeben
                    && !incoming.Any(inc => AccessoryMatches(existing, inc)))
                .ToList();
            foreach (var rem in toRemove)
                rental.Accessories.Remove(rem);

            foreach (var inc in incoming)
            {
                var existing = rental.Accessories.FirstOrDefault(e => AccessoryMatches(e, inc));
                if (existing != null)
                {
                    existing.RentalAccessoryId = inc.RentalAccessoryId;
                    existing.Bezeichnung = inc.Bezeichnung;
                    existing.Tagespreis = inc.Tagespreis;
                    existing.Verlustgebuehr = inc.Verlustgebuehr;
                    existing.Menge = inc.Menge;
                    existing.UpdatedAt = DateTime.UtcNow;
                }
                else
                {
                    rental.Accessories.Add(new RentalAccessoryItem
                    {
                        RentalAccessoryId = inc.RentalAccessoryId,
                        Bezeichnung = inc.Bezeichnung,
                        Tagespreis = inc.Tagespreis,
                        Verlustgebuehr = inc.Verlustgebuehr,
                        Menge = inc.Menge,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow,
                    });
                }
            }
        }

        if (dto.Bikes != null || dto.NewBikes != null || dto.RemoveBikeIds != null || dto.Accessories != null)
        {
            // Zubehör pro Miettag (Tagespreis × Menge × Tage) zur Gesamtmiete addieren.
            var rentalDays = RentalPricingCalculator.CalculateDaysInclusive(rental.StartDatum, rental.EndDatum);
            var accessoryTotal = rental.Accessories.Sum(a => a.Tagespreis * a.Menge * rentalDays);
            // Kein Rabattabzug mehr: die vom Formular gelieferten Mietpreise
            // sind bereits die vereinbarten Endpreise (der Mietvertrag hat kein
            // Rabattfeld mehr). Der frühere Abzug zog den Rabatt ein zweites Mal
            // ab — jedes erneute Speichern eines Altvertrags senkte die Summe.
            rental.Gesamtmiete = rental.Bikes.Sum(b => b.Mietpreis) + accessoryTotal;
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

            var abzuege = rental.Bikes.Sum(b => b.SchadenAbzug + b.VerspaetungsAbzug);
            var erstattet = Math.Max(0m, rental.Kaution - abzuege);
            var rueckgabeDatum = rental.Bikes
                .Where(b => b.KautionRueckgabeDatum.HasValue)
                .Select(b => b.KautionRueckgabeDatum!.Value)
                .DefaultIfEmpty(DateTime.UtcNow)
                .Max();

            // Der unterschriebene Beleg gehört zur Bestätigung. Scheitert die
            // PDF-Erzeugung, geht die Mail ohne Anhang raus statt gar nicht.
            byte[] belegPdf;
            try
            {
                belegPdf = await _pdfService.GenerateKautionsrueckgabebelegAsync(rental.Id);
            }
            catch (Exception pdfEx)
            {
                _logger.LogError(
                    pdfEx,
                    "Failed to generate deposit refund receipt for rental {RentalId} ({MietvertragNummer}) — sending confirmation without attachment",
                    rental.Id,
                    rental.MietvertragNummer);
                belegPdf = Array.Empty<byte>();
            }

            await _emailService.SendDepositRefundConfirmationAsync(new DepositRefundEmailModel(
                rental.Customer.Email,
                string.IsNullOrWhiteSpace(toName) ? "Kunde" : toName,
                rental.MietvertragNummer,
                rental.Kaution,
                erstattet,
                abzuege,
                ZahlungsartText(rental.KautionZahlungsart),
                rueckgabeDatum,
                belegPdf));
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

    // Gleiche Schreibweise wie auf dem Beleg, damit Mail und PDF dieselbe
    // Auszahlungsart nennen.
    private static string ZahlungsartText(PaymentMethod zahlungsart) => zahlungsart switch
    {
        PaymentMethod.Bar => "Bar",
        PaymentMethod.PayPal => "PayPal",
        PaymentMethod.Karte => "Karte",
        PaymentMethod.Überweisung => "Überweisung",
        _ => zahlungsart.ToString()
    };

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
        rental.RueckgabeAt = DateTime.UtcNow;
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

    private static bool AccessoryMatches(RentalAccessoryItem existing, RentalAccessoryItemCreateDto inc)
    {
        if (inc.RentalAccessoryId.HasValue && existing.RentalAccessoryId.HasValue)
            return existing.RentalAccessoryId == inc.RentalAccessoryId;
        return string.Equals(
            existing.Bezeichnung?.Trim(),
            inc.Bezeichnung?.Trim(),
            StringComparison.OrdinalIgnoreCase);
    }
}
