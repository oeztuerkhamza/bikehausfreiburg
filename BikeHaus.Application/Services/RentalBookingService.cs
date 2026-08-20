using System.Linq.Expressions;
using BikeHaus.Application.DTOs;
using BikeHaus.Application.Interfaces;
using BikeHaus.Application.Mappings;
using BikeHaus.Domain;
using BikeHaus.Domain.Entities;
using BikeHaus.Domain.Enums;
using BikeHaus.Domain.Interfaces;
using Microsoft.Extensions.Logging;

namespace BikeHaus.Application.Services;

public class RentalBookingService : IRentalBookingService
{
    private const string DefaultShopName = "Bike Haus Freiburg";
    private const string DefaultShopStreet = "Heckerstrasse 27";
    private const string DefaultShopCity = "79114 Freiburg";
    private const string DefaultShopPhone = "+49 155 6630 0011";
    private const string DefaultShopEmail = "info.bikehausfreiburg@gmail.com";
    private const string DefaultHomepageBaseUrl = "https://bikehausfreiburg.com";

    private readonly IRentalBookingRepository _bookingRepository;
    private readonly IBicycleRepository _bicycleRepository;
    private readonly IRentalAccessoryRepository _accessoryRepository;
    private readonly IShopSettingsRepository _shopSettingsRepository;
    private readonly IEmailService _emailService;
    private readonly ILogger<RentalBookingService> _logger;

    public RentalBookingService(
        IRentalBookingRepository bookingRepository,
        IBicycleRepository bicycleRepository,
        IRentalAccessoryRepository accessoryRepository,
        IShopSettingsRepository shopSettingsRepository,
        IEmailService emailService,
        ILogger<RentalBookingService> logger)
    {
        _bookingRepository = bookingRepository;
        _bicycleRepository = bicycleRepository;
        _accessoryRepository = accessoryRepository;
        _shopSettingsRepository = shopSettingsRepository;
        _emailService = emailService;
        _logger = logger;
    }

    public async Task<PaginatedResult<RentalBookingListDto>> GetPaginatedAsync(PaginationParams paginationParams, bool includeCompleted = false)
    {
        Expression<Func<RentalBooking, bool>>? predicate = null;

        if (!string.IsNullOrEmpty(paginationParams.Status) &&
            Enum.TryParse<RentalBookingStatus>(paginationParams.Status, out var status))
        {
            predicate = b => b.Status == status;
        }

        if (!string.IsNullOrEmpty(paginationParams.SearchTerm))
        {
            var term = paginationParams.SearchTerm.ToLower();
            if (predicate != null)
            {
                var prevPredicate = predicate;
                predicate = b => prevPredicate.Compile()(b) &&
                    (b.BuchungsNummer.ToLower().Contains(term) ||
                     b.Vorname.ToLower().Contains(term) ||
                     b.Nachname.ToLower().Contains(term) ||
                     b.Bicycle.Marke.ToLower().Contains(term) ||
                     b.Bicycle.Modell.ToLower().Contains(term));
            }
            else
            {
                predicate = b =>
                    b.BuchungsNummer.ToLower().Contains(term) ||
                    b.Vorname.ToLower().Contains(term) ||
                    b.Nachname.ToLower().Contains(term) ||
                    b.Bicycle.Marke.ToLower().Contains(term) ||
                    b.Bicycle.Modell.ToLower().Contains(term);
            }
        }

        var (items, totalCount) = await _bookingRepository.GetPaginatedAsync(
            paginationParams.Page,
            paginationParams.PageSize,
            predicate,
            includeCompleted);

        return new PaginatedResult<RentalBookingListDto>
        {
            Items = items.Select(b => b.ToListDto()),
            TotalCount = totalCount,
            Page = paginationParams.Page,
            PageSize = paginationParams.PageSize
        };
    }

    public async Task<RentalBookingDto?> GetByIdAsync(int id)
    {
        var booking = await _bookingRepository.GetWithDetailsAsync(id);
        return booking?.ToDto();
    }

    public async Task<RentalBookingDto> CreateAsync(RentalBookingCreateDto dto, bool requireEmail = true)
    {
        if (dto.Bikes == null || dto.Bikes.Count == 0)
            throw new InvalidOperationException("Mindestens ein Fahrrad muss ausgewaehlt werden.");

        foreach (var bikeDto in dto.Bikes)
        {
            if (bikeDto.EndDatum.Date < bikeDto.StartDatum.Date)
                throw new InvalidOperationException("Das Enddatum muss nach dem Startdatum liegen.");
        }

        var bicycles = new List<Bicycle>();
        foreach (var bikeDto in dto.Bikes)
        {
            var bicycle = await _bicycleRepository.GetByIdAsync(bikeDto.BicycleId)
                ?? throw new KeyNotFoundException($"Fahrrad mit ID {bikeDto.BicycleId} nicht gefunden.");

            if (!bicycle.IsRentable)
                throw new InvalidOperationException($"Das Fahrrad '{bicycle.Marke} {bicycle.Modell}' ist nicht fuer den Verleih aktiviert.");

            bicycles.Add(bicycle);
        }

        // Children's bikes are generic/pooled listings and stay bookable regardless
        // of overlaps (the physical bike is assigned in the shop), so they are
        // excluded from the overlap check.
        var childrensIds = bicycles
            .Where(b => BicycleCategory.IsChildrens(b.Art, b.Fahrradtyp))
            .Select(b => b.Id)
            .ToHashSet();
        var bikeChecks = dto.Bikes
            .Where(b => !childrensIds.Contains(b.BicycleId))
            .Select(b => (b.BicycleId, b.StartDatum.Date, b.EndDatum.Date))
            .ToList();

        var language = NormalizeLanguage(dto.Sprache);
        var minStart = dto.Bikes.Min(b => b.StartDatum.Date);
        var maxEnd = dto.Bikes.Max(b => b.EndDatum.Date);

        var booking = new RentalBooking
        {
            BicycleId = dto.Bikes[0].BicycleId,
            StartDatum = minStart,
            EndDatum = maxEnd,
            Abholzeit = string.IsNullOrWhiteSpace(dto.Abholzeit) ? null : dto.Abholzeit.Trim(),
            Vorname = dto.Vorname.Trim(),
            Nachname = dto.Nachname.Trim(),
            Email = dto.Email?.Trim(),
            Telefon = dto.Telefon?.Trim(),
            Strasse = dto.Strasse?.Trim(),
            HausNr = dto.HausNr?.Trim(),
            PLZ = dto.PLZ?.Trim(),
            Ort = dto.Ort?.Trim(),
            Sprache = language,
            Notizen = dto.Notizen,
            // Mietbuchungen werden nicht mehr zur Freigabe vorgelegt, sondern
            // direkt bestaetigt. Die Ueberschneidungspruefung unter der Sperre
            // (siehe RunExclusiveAsync unten) beruecksichtigt bereits bestaetigte
            // UND offene Buchungen, es kann also keine Doppelbelegung entstehen.
            Status = RentalBookingStatus.Approved,
            ApprovedAt = DateTime.UtcNow
        };

        for (int i = 0; i < dto.Bikes.Count; i++)
        {
            var bikeDto = dto.Bikes[i];
            var bicycle = bicycles[i];
            var days = CalculateDaysInclusive(bikeDto.StartDatum.Date, bikeDto.EndDatum.Date);
            var bikePrice = RentalPricingCalculator.CalculateBikePrice(bicycle, days);

            booking.Bikes.Add(new RentalBookingBike
            {
                BicycleId = bikeDto.BicycleId,
                Rahmennummer = string.IsNullOrWhiteSpace(bikeDto.Rahmennummer)
                    ? bicycle.Rahmennummer
                    : bikeDto.Rahmennummer.Trim(),
                Farbe = string.IsNullOrWhiteSpace(bikeDto.Farbe)
                    ? bicycle.Farbe
                    : bikeDto.Farbe.Trim(),
                Kaution = bikeDto.Kaution ?? bicycle.Kaution,
                StartDatum = bikeDto.StartDatum.Date,
                EndDatum = bikeDto.EndDatum.Date,
                Gesamtpreis = bikePrice
            });
        }

        if (dto.Accessories != null && dto.Accessories.Count > 0)
        {
            foreach (var acc in dto.Accessories)
            {
                var accessory = await _accessoryRepository.GetByIdAsync(acc.RentalAccessoryId)
                    ?? throw new KeyNotFoundException($"Rental accessory with ID {acc.RentalAccessoryId} not found.");

                if (!accessory.Aktiv)
                    throw new InvalidOperationException("Dieses Zubehoer ist nicht aktiv.");

                booking.Accessories.Add(new RentalBookingAccessory
                {
                    RentalAccessoryId = accessory.Id,
                    Bezeichnung = accessory.Bezeichnung,
                    Tagespreis = accessory.Tagespreis,
                    Menge = Math.Max(1, acc.Menge),
                    // Einmalig kommt aus dem Katalog: der Kunde wählt nur die Menge.
                    Einmalig = accessory.Einmalig
                });
            }
        }

        // Zubehör wird zum Gesamtpreis addiert: Tagespreis × Menge × Tage, bei
        // einmaligen Positionen ohne die Tage. Miettage = gesamter
        // Buchungszeitraum (inklusive).
        var bookingDays = CalculateDaysInclusive(minStart, maxEnd);
        var accessoryTotal = booking.Accessories.Sum(a => a.LineTotal(bookingDays));
        booking.Gesamtpreis = booking.Bikes.Sum(bk => bk.Gesamtpreis ?? 0m) + accessoryTotal;
        if (booking.Gesamtpreis == 0m) booking.Gesamtpreis = null;

        // Öffentliche Buchungen brauchen eine E-Mail; Admin-seitig angelegte
        // Anfragen (z.B. Telefon/Laufkundschaft) dürfen ohne E-Mail angelegt werden.
        if (requireEmail && string.IsNullOrWhiteSpace(booking.Email))
            throw new InvalidOperationException("Bitte geben Sie eine gueltige E-Mail-Adresse an.");

        // Buchungsnummer atomar vergeben (erzeugen + speichern unter Sperre).
        // Auch die Ueberschneidungspruefung muss unter der Sperre laufen:
        // ausserhalb koennten zwei gleichzeitige Submits fuer dasselbe Rad beide
        // die Pruefung passieren und beide gespeichert werden (Doppelbelegung
        // statt 409).
        var created = await SequenceNumberGuard.RunExclusiveAsync(SequenceKeys.Buchung, async () =>
        {
            if (bikeChecks.Count > 0)
            {
                var hasOverlap = await _bookingRepository.ExistsActiveOverlapForBikesAsync(bikeChecks);
                if (hasOverlap)
                    throw new InvalidOperationException("Eines der ausgewaehlten Fahrraeder ist im gewaehlten Zeitraum bereits gebucht.");
            }

            booking.BuchungsNummer = await _bookingRepository.GenerateBuchungsNummerAsync();
            return await _bookingRepository.AddAsync(booking);
        });
        var withDetails = await _bookingRepository.GetWithDetailsAsync(created.Id);
        if (withDetails == null)
            throw new InvalidOperationException("Buchung konnte nach dem Speichern nicht geladen werden.");

        // E-Mails sind "best effort": Die Buchung ist bereits persistiert und darf
        // nicht verloren gehen, nur weil der Mailserver gerade nicht erreichbar ist
        // (Mailcow/DKIM/DMARC-Aussetzer). Fehler werden protokolliert; die Buchung
        // bleibt bestehen und ist im Admin-Portal sichtbar.
        try
        {
            var emailModel = await BuildEmailModelAsync(withDetails, bicycles);

            // Ohne E-Mail-Adresse (Admin-Anlage) gibt es keine Kundenbestaetigung.
            // Da die Buchung sofort bestaetigt ist, geht direkt die Bestaetigung
            // raus — die alte "Anfrage geht in Pruefung"-Mail kuendigte eine
            // zweite Mail an, die es jetzt nicht mehr gibt.
            if (!string.IsNullOrWhiteSpace(withDetails.Email))
            {
                try
                {
                    await _emailService.SendRentalBookingApprovedAsync(emailModel);
                }
                catch (Exception ex)
                {
                    _logger.LogError(
                        ex,
                        "Failed to send booking confirmation email to customer for booking {BookingNumber}.",
                        withDetails.BuchungsNummer);
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "Failed to build email model for booking {BookingNumber}.",
                withDetails.BuchungsNummer);
        }

        return withDetails.ToDto();
    }

    public async Task<RentalBookingDto> ApproveAsync(int id, RentalBookingApproveDto dto)
    {
        var booking = await _bookingRepository.GetWithDetailsAsync(id)
            ?? throw new KeyNotFoundException($"Booking with ID {id} not found.");

        // A cancelled request can be approved again (e.g. to undo a wrongful
        // storno). We remember it was cancelled so the customer gets the
        // "reactivated" mail instead of the normal confirmation, and so the
        // cancellation timestamp is cleared below.
        var wasCancelled = booking.Status == RentalBookingStatus.Cancelled;

        // Children's bikes are generic/pooled listings and never block on overlaps
        // (the physical bike is assigned in the shop), so they are exempt here too.
        bool hasOverlap;
        if (booking.Bikes.Any())
        {
            var bikeChecks = booking.Bikes
                .Where(bk => !BicycleCategory.IsChildrens(bk.Bicycle?.Art, bk.Bicycle?.Fahrradtyp))
                .Select(bk => (bk.BicycleId, bk.StartDatum, bk.EndDatum))
                .ToList();
            hasOverlap = bikeChecks.Count > 0 &&
                await _bookingRepository.ExistsApprovedOverlapForBikesAsync(bikeChecks, booking.Id);
        }
        else if (BicycleCategory.IsChildrens(booking.Bicycle?.Art, booking.Bicycle?.Fahrradtyp))
        {
            hasOverlap = false;
        }
        else
        {
            hasOverlap = await _bookingRepository.ExistsApprovedOverlapAsync(
                booking.BicycleId, booking.StartDatum.Date, booking.EndDatum.Date, booking.Id);
        }
        if (hasOverlap)
            throw new InvalidOperationException("Diese Buchung kann nicht bestaetigt werden, da der Zeitraum bereits durch eine andere bestaetigte Buchung belegt ist.");

        if (booking.Status != RentalBookingStatus.Approved)
        {
            booking.Status = RentalBookingStatus.Approved;
            booking.ApprovedAt = DateTime.UtcNow;
        }

        // Reactivation: drop the cancellation so the booking counts as active again.
        if (wasCancelled)
            booking.CancelledAt = null;

        if (!string.IsNullOrWhiteSpace(dto.AdminNotizen))
            booking.AdminNotizen = dto.AdminNotizen;

        var bicycles = new List<Bicycle>();
        if (booking.Bikes.Any())
        {
            foreach (var bk in booking.Bikes)
            {
                var bicycle = await _bicycleRepository.GetByIdAsync(bk.BicycleId);
                if (bicycle != null) bicycles.Add(bicycle);
            }
        }
        else
        {
            var bicycle = await _bicycleRepository.GetByIdAsync(booking.BicycleId);
            if (bicycle != null)
            {
                bicycles.Add(bicycle);
                booking.Gesamtpreis ??= CalculateTotalPrice(bicycle, booking);
            }
        }

        booking.UpdatedAt = DateTime.UtcNow;
        await _bookingRepository.UpdateAsync(booking);

        if (!string.IsNullOrWhiteSpace(booking.Email))
        {
            try
            {
                var emailModel = await BuildEmailModelAsync(booking, bicycles);
                if (wasCancelled)
                    await _emailService.SendRentalBookingReactivatedAsync(emailModel);
                else
                    await _emailService.SendRentalBookingApprovedAsync(emailModel);
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "Failed to send booking approved email for booking {BookingNumber}",
                    booking.BuchungsNummer);
            }
        }

        return booking.ToDto();
    }

    public async Task<RentalBookingDto> CancelAsync(int id, RentalBookingCancelDto dto)
    {
        var booking = await _bookingRepository.GetWithDetailsAsync(id)
            ?? throw new KeyNotFoundException($"Booking with ID {id} not found.");

        if (booking.Status != RentalBookingStatus.Cancelled)
        {
            booking.Status = RentalBookingStatus.Cancelled;
            booking.CancelledAt = DateTime.UtcNow;
        }

        if (!string.IsNullOrWhiteSpace(dto.AdminNotizen))
            booking.AdminNotizen = dto.AdminNotizen;

        booking.UpdatedAt = DateTime.UtcNow;
        await _bookingRepository.UpdateAsync(booking);

        if (!string.IsNullOrWhiteSpace(booking.Email))
        {
            try
            {
                var bicycles = await GetBicyclesForBookingAsync(booking);
                var emailModel = await BuildEmailModelAsync(booking, bicycles);
                await _emailService.SendRentalBookingCancelledAsync(emailModel);
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "Failed to send booking cancelled email for booking {BookingNumber}",
                    booking.BuchungsNummer);
            }
        }

        return booking.ToDto();
    }

    // Gemeinsame Fehlermeldung fuer "Buchung existiert nicht" UND "E-Mail passt
    // nicht" — bewusst nicht unterscheidbar. Wuerden beide Faelle verschiedene
    // Exceptions/HTTP-Codes ergeben (frueher: 404 vs. 409), koennte man durch
    // Ausprobieren von Buchungsnummern herausfinden, welche existieren, ohne
    // die zugehoerige E-Mail zu kennen. Gilt gleichermassen fuer
    // LookupByCustomerAsync (dort als null statt Exception).
    private const string BookingLookupFailedMessage = "Buchung nicht gefunden oder E-Mail passt nicht.";

    public async Task<RentalBookingDto> CancelByCustomerAsync(string bookingNumber, string email)
    {
        var normalizedBookingNumber = bookingNumber?.Trim() ?? string.Empty;
        var normalizedEmail = email?.Trim() ?? string.Empty;

        if (string.IsNullOrWhiteSpace(normalizedBookingNumber) || string.IsNullOrWhiteSpace(normalizedEmail))
            throw new KeyNotFoundException(BookingLookupFailedMessage);

        var booking = await _bookingRepository.GetByBookingNumberWithDetailsAsync(normalizedBookingNumber);

        if (booking == null ||
            !string.Equals(booking.Email?.Trim(), normalizedEmail, StringComparison.OrdinalIgnoreCase))
            throw new KeyNotFoundException(BookingLookupFailedMessage);

        if (booking.Status != RentalBookingStatus.Cancelled)
        {
            booking.Status = RentalBookingStatus.Cancelled;
            booking.CancelledAt = DateTime.UtcNow;
            booking.AdminNotizen = string.IsNullOrWhiteSpace(booking.AdminNotizen)
                ? "Vom Kunden per Self-Storno storniert."
                : $"{booking.AdminNotizen}\nVom Kunden per Self-Storno storniert.";
            booking.UpdatedAt = DateTime.UtcNow;
            await _bookingRepository.UpdateAsync(booking);
        }

        if (!string.IsNullOrWhiteSpace(booking.Email))
        {
            try
            {
                var bicycles = await GetBicyclesForBookingAsync(booking);
                var emailModel = await BuildEmailModelAsync(booking, bicycles);
                await _emailService.SendRentalBookingCancelledAsync(emailModel);
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "Failed to send booking cancelled email for customer self-cancel {BookingNumber}",
                    booking.BuchungsNummer);
            }
        }

        return booking.ToDto();
    }

    public async Task<PublicRentalBookingLookupDto?> LookupByCustomerAsync(string bookingNumber, string email)
    {
        var normalizedBookingNumber = bookingNumber?.Trim() ?? string.Empty;
        var normalizedEmail = email?.Trim() ?? string.Empty;

        // Nebenwirkungsfrei: hier wird NIE geschrieben, nur gelesen. Wie bei
        // CancelByCustomerAsync ergibt eine falsche Buchungsnummer und eine
        // nicht passende E-Mail dasselbe Ergebnis (null) — kein Auskunfts-Orakel,
        // das verraet, welche Buchungsnummern existieren.
        if (string.IsNullOrWhiteSpace(normalizedBookingNumber) || string.IsNullOrWhiteSpace(normalizedEmail))
            return null;

        var booking = await _bookingRepository.GetByBookingNumberWithDetailsAsync(normalizedBookingNumber);

        if (booking == null ||
            !string.Equals(booking.Email?.Trim(), normalizedEmail, StringComparison.OrdinalIgnoreCase))
            return null;

        // Multi-Bike-Buchungen tragen ihre Raeder in Bikes; aeltere
        // Ein-Fahrrad-Buchungen nur ueber die direkte Bicycle-Navigation
        // (gleiche Unterscheidung wie GetBicyclesForBookingAsync).
        var bikeSummaries = booking.Bikes.Count > 0
            ? booking.Bikes
                .Select(bk => new PublicRentalBookingBikeSummaryDto(
                    bk.Bicycle?.Marke ?? string.Empty,
                    bk.Bicycle?.Modell ?? string.Empty))
                .ToList()
            : new List<PublicRentalBookingBikeSummaryDto>
            {
                new(booking.Bicycle?.Marke ?? string.Empty, booking.Bicycle?.Modell ?? string.Empty)
            };

        var deposit = CalculateDeposit(booking, booking.Bicycle);

        return new PublicRentalBookingLookupDto(
            booking.BuchungsNummer,
            booking.StartDatum,
            booking.EndDatum,
            booking.Abholzeit,
            bikeSummaries,
            booking.Gesamtpreis,
            deposit,
            booking.Status);
    }

    public async Task<IEnumerable<RentalBookingRangeDto>> GetApprovedRangesAsync(int bicycleId)
    {
        var bookings = await _bookingRepository.GetApprovedByBicycleIdAsync(bicycleId);
        return bookings.Select(b =>
        {
            var bike = b.Bikes.FirstOrDefault(bk => bk.BicycleId == bicycleId);
            var start = bike?.StartDatum ?? b.StartDatum;
            var end = bike?.EndDatum ?? b.EndDatum;
            return new RentalBookingRangeDto(start, end);
        });
    }

    public Task<int> GetPendingCountAsync()
    {
        return _bookingRepository.CountAsync(b => b.Status == RentalBookingStatus.Pending);
    }

    public async Task<IEnumerable<RentalBookingListDto>> GetCalendarAsync(DateTime from, DateTime to)
    {
        if (to < from)
            throw new ArgumentOutOfRangeException(nameof(to));

        var bookings = await _bookingRepository.GetOverlappingRangeWithBikesAsync(from, to);
        return bookings.Select(b => b.ToListDto());
    }

    public async Task<RentalBookingDto> UpdateBookingBikeAsync(int bookingId, int bookingBikeId, int newBicycleId)
    {
        var booking = await _bookingRepository.GetWithDetailsAsync(bookingId)
            ?? throw new KeyNotFoundException($"Booking with ID {bookingId} not found.");

        var bookingBike = booking.Bikes.FirstOrDefault(bk => bk.Id == bookingBikeId)
            ?? throw new KeyNotFoundException($"Bike entry with ID {bookingBikeId} not found in booking.");

        var newBicycle = await _bicycleRepository.GetByIdAsync(newBicycleId)
            ?? throw new KeyNotFoundException($"Bicycle with ID {newBicycleId} not found.");

        if (!newBicycle.IsRentable)
            throw new InvalidOperationException($"Das Fahrrad '{newBicycle.Marke} {newBicycle.Modell}' ist nicht fuer den Verleih aktiviert.");

        var days = CalculateDaysInclusive(bookingBike.StartDatum, bookingBike.EndDatum);

        bookingBike.BicycleId = newBicycleId;
        bookingBike.Rahmennummer = newBicycle.Rahmennummer;
        bookingBike.Farbe = newBicycle.Farbe;
        bookingBike.Kaution = newBicycle.Kaution;
        bookingBike.Gesamtpreis = RentalPricingCalculator.CalculateBikePrice(newBicycle, days);
        bookingBike.UpdatedAt = DateTime.UtcNow;

        var bookingDays = CalculateDaysInclusive(booking.StartDatum, booking.EndDatum);
        var accessoryTotal = booking.Accessories.Sum(a => a.LineTotal(bookingDays));
        booking.Gesamtpreis = booking.Bikes.Sum(bk => bk.Gesamtpreis ?? 0m) + accessoryTotal;
        if (booking.Gesamtpreis == 0m) booking.Gesamtpreis = null;
        booking.UpdatedAt = DateTime.UtcNow;

        await _bookingRepository.UpdateAsync(booking);

        var withDetails = await _bookingRepository.GetWithDetailsAsync(bookingId);
        return withDetails!.ToDto();
    }

    public async Task<RentalBookingDto> UpdateDatesAsync(int id, RentalBookingUpdateDatesDto dto)
    {
        var booking = await _bookingRepository.GetWithDetailsAsync(id)
            ?? throw new KeyNotFoundException($"Booking with ID {id} not found.");

        if (booking.Status == RentalBookingStatus.Cancelled)
            throw new InvalidOperationException("Eine stornierte Buchung kann nicht bearbeitet werden. Bitte zuerst reaktivieren.");

        var start = dto.StartDatum.Date;
        var end = dto.EndDatum.Date;
        if (end < start)
            throw new InvalidOperationException("Das Enddatum darf nicht vor dem Startdatum liegen.");

        // Verfuegbarkeit im neuen Zeitraum pruefen — gleiche Regeln wie beim
        // Bestaetigen (Kinderraeder sind gepoolte Angebote und blocken nie).
        if (booking.Bikes.Any())
        {
            var bikeChecks = booking.Bikes
                .Where(bk => !BicycleCategory.IsChildrens(bk.Bicycle?.Art, bk.Bicycle?.Fahrradtyp))
                .Select(bk => (bk.BicycleId, Start: start, End: end))
                .ToList();
            if (bikeChecks.Count > 0 &&
                await _bookingRepository.ExistsApprovedOverlapForBikesAsync(bikeChecks, booking.Id))
                throw new InvalidOperationException("Der neue Zeitraum ueberschneidet sich mit einer anderen bestaetigten Buchung.");
        }
        else if (!BicycleCategory.IsChildrens(booking.Bicycle?.Art, booking.Bicycle?.Fahrradtyp))
        {
            if (await _bookingRepository.ExistsApprovedOverlapAsync(booking.BicycleId, start, end, booking.Id))
                throw new InvalidOperationException("Der neue Zeitraum ueberschneidet sich mit einer anderen bestaetigten Buchung.");
        }

        booking.StartDatum = start;
        booking.EndDatum = end;
        booking.Abholzeit = string.IsNullOrWhiteSpace(dto.Abholzeit) ? null : dto.Abholzeit.Trim();

        // Preise fuer den neuen Zeitraum neu berechnen (gleiches Muster wie
        // UpdateBookingBikeAsync: je Fahrrad Staffelpreis, Zubehoer pro Miettag).
        var days = CalculateDaysInclusive(start, end);
        var bicycles = new List<Bicycle>();

        if (booking.Bikes.Any())
        {
            foreach (var bk in booking.Bikes)
            {
                bk.StartDatum = start;
                bk.EndDatum = end;
                var bicycle = await _bicycleRepository.GetByIdAsync(bk.BicycleId);
                if (bicycle != null)
                {
                    bicycles.Add(bicycle);
                    bk.Gesamtpreis = RentalPricingCalculator.CalculateBikePrice(bicycle, days);
                }
                bk.UpdatedAt = DateTime.UtcNow;
            }

            var accessoryTotal = booking.Accessories.Sum(a => a.LineTotal(days));
            booking.Gesamtpreis = booking.Bikes.Sum(bk => bk.Gesamtpreis ?? 0m) + accessoryTotal;
            if (booking.Gesamtpreis == 0m) booking.Gesamtpreis = null;
        }
        else
        {
            var bicycle = await _bicycleRepository.GetByIdAsync(booking.BicycleId);
            if (bicycle != null)
            {
                bicycles.Add(bicycle);
                booking.Gesamtpreis = CalculateTotalPrice(bicycle, booking);
            }
        }

        booking.UpdatedAt = DateTime.UtcNow;
        await _bookingRepository.UpdateAsync(booking);

        // Kunde per E-Mail informieren — best effort wie bei allen Buchungsmails.
        if (!string.IsNullOrWhiteSpace(booking.Email))
        {
            try
            {
                var emailModel = await BuildEmailModelAsync(booking, bicycles);
                await _emailService.SendRentalBookingUpdatedAsync(emailModel);
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "Failed to send booking updated email for booking {BookingNumber}",
                    booking.BuchungsNummer);
            }
        }

        var withDetails = await _bookingRepository.GetWithDetailsAsync(id);
        return withDetails!.ToDto();
    }

    private const string StornoRevertNote =
        "Storno (Fehler im Self-Storno-Link) automatisch zurueckgenommen.";

    public async Task<RevertStornoResultDto> RevertErroneousStornosAsync(bool apply, DateTime? cancelledBefore = null)
    {
        var cancelled = await _bookingRepository.GetByStatusesWithBikesAsync(
            new[] { RentalBookingStatus.Cancelled });

        // The self-cancel path (customer link) is the only one that stamps
        // "Self-Storno" onto AdminNotizen, so it isolates the bug-caused
        // cancellations from admin cancellations (which carry a free-text note).
        var candidates = cancelled
            .Where(b => !string.IsNullOrWhiteSpace(b.AdminNotizen) &&
                        b.AdminNotizen.Contains("Self-Storno", StringComparison.OrdinalIgnoreCase))
            .Where(b => cancelledBefore == null ||
                        (b.CancelledAt.HasValue && b.CancelledAt.Value < cancelledBefore.Value))
            .OrderBy(b => b.CancelledAt)
            .ToList();

        var items = new List<RevertStornoItemDto>();
        int reverted = 0, emailsSent = 0, emailsFailed = 0;

        foreach (var candidate in candidates)
        {
            var newStatus = candidate.ApprovedAt.HasValue
                ? RentalBookingStatus.Approved
                : RentalBookingStatus.Pending;

            items.Add(new RevertStornoItemDto(
                candidate.BuchungsNummer,
                $"{candidate.Vorname} {candidate.Nachname}".Trim(),
                candidate.Email,
                candidate.StartDatum,
                candidate.EndDatum,
                newStatus.ToString(),
                candidate.CancelledAt));

            if (!apply)
                continue;

            var booking = await _bookingRepository.GetWithDetailsAsync(candidate.Id) ?? candidate;
            booking.Status = newStatus;
            booking.CancelledAt = null;
            booking.AdminNotizen = string.IsNullOrWhiteSpace(booking.AdminNotizen)
                ? StornoRevertNote
                : $"{booking.AdminNotizen}\n{StornoRevertNote}";
            booking.UpdatedAt = DateTime.UtcNow;
            await _bookingRepository.UpdateAsync(booking);
            reverted++;

            if (!string.IsNullOrWhiteSpace(booking.Email))
            {
                try
                {
                    var bicycles = await GetBicyclesForBookingAsync(booking);
                    var emailModel = await BuildEmailModelAsync(booking, bicycles);
                    await _emailService.SendRentalBookingReactivatedAsync(emailModel);
                    emailsSent++;
                }
                catch (Exception ex)
                {
                    emailsFailed++;
                    _logger.LogError(
                        ex,
                        "Failed to send reactivation email for booking {BookingNumber}",
                        booking.BuchungsNummer);
                }
            }
        }

        return new RevertStornoResultDto(candidates.Count, reverted, emailsSent, emailsFailed, apply, items);
    }

    public async Task<int> SendPickupRemindersAsync(CancellationToken cancellationToken = default)
    {
        // Zeitfenster: nur Buchungen, deren StartDatum genau "morgen" ist. Das
        // schliesst automatisch die komplette Alt-Historie aus (deren StartDatum
        // laengst in der Vergangenheit liegt) — es braucht kein zusaetzliches
        // "NotBefore"-Gate wie bei der Google-Bewertungskampagne.
        //
        // StartDatum/EndDatum sind reine Kalendertage aus Kunden-/Ladensicht
        // (Ortszeit Freiburg), der Container laeuft aber in UTC. "Morgen" wird
        // daher ueber ShopClock.Now (Europe/Berlin) bestimmt statt ueber
        // DateTime.UtcNow.Date — sonst kippt der erste Treffer eines Tages kurz
        // nach Mitternacht UTC, also mitten in der Nacht Ortszeit.
        var tomorrow = ShopClock.Now.Date.AddDays(1);
        var bookings = await _bookingRepository.GetBookingsForPickupReminderAsync(tomorrow);

        var sent = 0;
        foreach (var booking in bookings)
        {
            if (cancellationToken.IsCancellationRequested) break;
            if (string.IsNullOrWhiteSpace(booking.Email)) continue;

            try
            {
                var bicycles = await GetBicyclesForBookingAsync(booking);
                var emailModel = await BuildEmailModelAsync(booking, bicycles);
                await _emailService.SendRentalBookingPickupReminderAsync(emailModel);

                booking.ErinnerungGesendetAm = DateTime.UtcNow;
                await _bookingRepository.UpdateAsync(booking);
                sent++;
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "Failed to send pickup reminder email for booking {BookingNumber}",
                    booking.BuchungsNummer);
            }
        }

        return sent;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var booking = await _bookingRepository.GetByIdAsync(id);
        if (booking == null) return false;
        await _bookingRepository.DeleteAsync(id);
        return true;
    }

    public async Task SaveSignatureAsync(int id, string mieterUnterschrift)
    {
        var booking = await _bookingRepository.GetByIdAsync(id)
            ?? throw new KeyNotFoundException($"Booking {id} not found.");
        booking.MieterUnterschrift = mieterUnterschrift;
        await _bookingRepository.UpdateAsync(booking);
    }

    public async Task SaveAusweisPhotoPathAsync(int id, string ausweisPhotoPath, bool istRueckseite = false)
    {
        var booking = await _bookingRepository.GetByIdAsync(id)
            ?? throw new KeyNotFoundException($"Booking {id} not found.");
        if (istRueckseite)
            booking.AusweisPhotoRueckseitePath = ausweisPhotoPath;
        else
            booking.AusweisPhotoPath = ausweisPhotoPath;
        await _bookingRepository.UpdateAsync(booking);
    }

    public async Task<string?> GetAusweisPhotoPathAsync(int id, bool istRueckseite = false)
    {
        var booking = await _bookingRepository.GetByIdAsync(id)
            ?? throw new KeyNotFoundException($"Booking {id} not found.");
        return istRueckseite ? booking.AusweisPhotoRueckseitePath : booking.AusweisPhotoPath;
    }

    // Alle Sprachen, die die Homepage tatsächlich führt (siehe
    // BikeHaus.Homepage/src/app/services/language-config.ts,
    // SUPPORTED_LANGUAGES). Eine fehlende oder nicht geführte Sprache fällt
    // auf Englisch zurück, NICHT auf Deutsch — wer eine Sprache schickt, die
    // wir nicht haben, versteht Englisch mit höherer Wahrscheinlichkeit als
    // Deutsch. Bestehende Buchungen mit "de"/"en" bleiben unverändert gültig,
    // da beide Codes in dieser Liste stehen.
    private static readonly HashSet<string> SupportedLanguages = new(StringComparer.OrdinalIgnoreCase)
    {
        "de", "en", "fr", "tr", "es", "it", "ar", "ru", "no", "da", "nl", "pl"
    };

    private static string NormalizeLanguage(string? lang)
    {
        if (string.IsNullOrWhiteSpace(lang)) return "en";
        var normalized = lang.Trim().ToLowerInvariant();
        return SupportedLanguages.Contains(normalized) ? normalized : "en";
    }

    private static int CalculateDaysInclusive(DateTime start, DateTime end)
    {
        var days = (end.Date - start.Date).Days + 1;
        return Math.Max(1, days);
    }

    // Gesamtkaution der Buchung. Bevorzugt die bei der Buchung erfassten
    // Kautionswerte je Fahrrad (RentalBookingBike.Kaution); faellt fuer aeltere
    // Ein-Fahrrad-Buchungen ohne Bikes-Zeilen auf die aktuelle Kaution des
    // Fahrrads zurueck. So zeigt die Bestaetigungs-E-Mail denselben Betrag wie
    // die Buchungsseite, statt eines fest verdrahteten Standardwerts.
    private static decimal? CalculateDeposit(RentalBooking booking, Bicycle? primaryBicycle)
    {
        decimal? deposit = booking.Bikes.Any()
            ? booking.Bikes.Sum(bk => bk.Kaution ?? 0m)
            : primaryBicycle?.Kaution;

        return deposit == 0m ? null : deposit;
    }

    private static decimal? CalculateTotalPrice(Bicycle bicycle, RentalBooking booking)
    {
        var days = CalculateDaysInclusive(booking.StartDatum, booking.EndDatum);
        var bikeTotal = RentalPricingCalculator.CalculateBikePrice(bicycle, days);
        var accessoryTotal = booking.Accessories.Sum(a => a.LineTotal(days));

        if (!bikeTotal.HasValue && accessoryTotal <= 0)
            return null;

        return (bikeTotal ?? 0m) + accessoryTotal;
    }

    private async Task<List<Bicycle>> GetBicyclesForBookingAsync(RentalBooking booking)
    {
        var result = new List<Bicycle>();
        if (booking.Bikes.Any())
        {
            foreach (var bk in booking.Bikes)
            {
                var bicycle = await _bicycleRepository.GetByIdAsync(bk.BicycleId);
                if (bicycle != null) result.Add(bicycle);
            }
        }
        else
        {
            var bicycle = await _bicycleRepository.GetByIdAsync(booking.BicycleId);
            if (bicycle != null) result.Add(bicycle);
        }
        return result;
    }

    private async Task<RentalBookingEmailModel> BuildEmailModelAsync(RentalBooking booking, List<Bicycle> bicycles)
    {
        var shop = await GetShopInfoAsync();
        var primaryBicycle = bicycles.FirstOrDefault();
        var days = CalculateDaysInclusive(booking.StartDatum, booking.EndDatum);
        var accessoriesText = BuildAccessoriesText(booking);
        var deposit = CalculateDeposit(booking, primaryBicycle);

        string bikeBrand, bikeModel;
        if (bicycles.Count == 1)
        {
            bikeBrand = primaryBicycle?.Marke ?? string.Empty;
            bikeModel = primaryBicycle?.Modell ?? string.Empty;
        }
        else
        {
            bikeBrand = string.Join(" + ", bicycles.Select(b => $"{b.Marke} {b.Modell}".Trim()));
            bikeModel = string.Empty;
        }

        return new RentalBookingEmailModel(
            booking.Email ?? string.Empty,
            $"{booking.Vorname} {booking.Nachname}".Trim(),
            booking.BuchungsNummer,
            bikeBrand,
            bikeModel,
            bicycles.Count == 1 ? primaryBicycle?.Rahmennummer : null,
            bicycles.Count == 1 ? primaryBicycle?.Rahmengroesse : null,
            bicycles.Count == 1 ? primaryBicycle?.Farbe : null,
            booking.StartDatum,
            booking.EndDatum,
            booking.Abholzeit,
            days,
            booking.Gesamtpreis,
            deposit,
            accessoriesText,
            shop.PickupLocation,
            shop.Phone,
            shop.Email,
            NormalizeLanguage(booking.Sprache),
            BuildManageBookingUrl(booking),
            shop.OpeningHours
        );
    }

    // Slugs der "Buchung verwalten"-Seite der Homepage je Sprache — Kopie von
    // BOOKING_MANAGE_SLUG_BY_LANGUAGE in
    // BikeHaus.Homepage/src/app/services/language-config.ts. Bei Änderungen
    // dort hier nachziehen.
    private static readonly Dictionary<string, string> BookingManageSlugByLanguage = new(StringComparer.OrdinalIgnoreCase)
    {
        ["de"] = "buchung",
        ["en"] = "manage-booking",
        ["fr"] = "gerer-reservation",
        ["tr"] = "rezervasyonu-yonet",
        ["es"] = "gestionar-reserva",
        ["it"] = "gestisci-prenotazione",
        ["ar"] = "idarat-alhajz",
        ["ru"] = "upravlenie-bronirovaniem",
        ["no"] = "administrer-bestilling",
        ["da"] = "administrer-booking",
        ["nl"] = "boeking-beheren",
        ["pl"] = "zarzadzaj-rezerwacja",
    };

    /// <summary>
    /// Self-Service-Link der Buchungs-Mails: zeigt auf die lokalisierte
    /// "Buchung verwalten"-Seite der Homepage (ansehen + stornieren) statt auf
    /// die rohe, nur deutsche API-Storno-Seite. Bewusst NUR die Buchungsnummer
    /// als Query-Parameter — die E-Mail-Adresse gehört nicht in die URL
    /// (Browserverlauf, geteilte Links); der Gast tippt sie auf der Seite als
    /// Eigentumsnachweis selbst ein. Die alte API-Storno-Seite
    /// (PublicRentalsController, bookings/cancel) bleibt als Legacy-Fallback
    /// bestehen.
    /// </summary>
    private static string BuildManageBookingUrl(RentalBooking booking)
    {
        var lang = NormalizeLanguage(booking.Sprache);
        if (!BookingManageSlugByLanguage.TryGetValue(lang, out var slug))
        {
            lang = "de";
            slug = "buchung";
        }

        var bookingNumber = Uri.EscapeDataString(booking.BuchungsNummer ?? string.Empty);
        return $"{DefaultHomepageBaseUrl}/{lang}/{slug}?bookingNumber={bookingNumber}";
    }

    // Liefert die rohe, mehrzeilige Zubehör-Liste ohne "Keine"/"None" — die
    // sprachabhängige Formulierung für "kein Zubehör" gehört in die Mail-Ebene
    // (SmtpEmailService, RentalBookingMailTexts), nicht hierher. Leerer String
    // bei keinem Zubehör.
    private static string BuildAccessoriesText(RentalBooking booking)
    {
        if (booking.Accessories.Count == 0)
            return string.Empty;

        return string.Join(
            "\n",
            booking.Accessories.Select(a => $"- {a.Bezeichnung} x{a.Menge} ({a.Tagespreis:0.00} EUR/Tag)"));
    }

    private async Task<(string PickupLocation, string Phone, string Email, string? OpeningHours)> GetShopInfoAsync()
    {
        var settings = await _shopSettingsRepository.GetSettingsAsync();
        if (settings == null)
        {
            return (
                $"{DefaultShopStreet}, {DefaultShopCity}",
                DefaultShopPhone,
                DefaultShopEmail,
                null
            );
        }

        var street = !string.IsNullOrWhiteSpace(settings.Strasse)
            ? $"{settings.Strasse} {settings.Hausnummer}".Trim()
            : DefaultShopStreet;
        var city = !string.IsNullOrWhiteSpace(settings.PLZ) || !string.IsNullOrWhiteSpace(settings.Stadt)
            ? $"{settings.PLZ} {settings.Stadt}".Trim()
            : DefaultShopCity;

        return (
            $"{street}, {city}".Trim().Trim(','),
            !string.IsNullOrWhiteSpace(settings.Telefon) ? settings.Telefon : DefaultShopPhone,
            !string.IsNullOrWhiteSpace(settings.Email) ? settings.Email : DefaultShopEmail,
            string.IsNullOrWhiteSpace(settings.Oeffnungszeiten) ? null : settings.Oeffnungszeiten
        );
    }
}
