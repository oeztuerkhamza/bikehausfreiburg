using System.Linq.Expressions;
using BikeHaus.Application.DTOs;
using BikeHaus.Application.Interfaces;
using BikeHaus.Application.Mappings;
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
    private const string DefaultAdminRentalBookingsUrl = "https://admin.bikehausfreiburg.com/rental-bookings";
    private const string DefaultPublicApiBaseUrl = "https://api.bikehausfreiburg.com/api/public";

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

    public async Task<PaginatedResult<RentalBookingListDto>> GetPaginatedAsync(PaginationParams paginationParams)
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
            predicate);

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

    public async Task<RentalBookingDto> CreateAsync(RentalBookingCreateDto dto)
    {
        if (dto.Bikes == null || dto.Bikes.Count == 0)
            throw new InvalidOperationException("Mindestens ein Fahrrad muss ausgewaehlt werden.");

        foreach (var bikeDto in dto.Bikes)
        {
            if (bikeDto.EndDatum.Date < bikeDto.StartDatum.Date)
                throw new InvalidOperationException("Das Enddatum muss nach dem Startdatum liegen.");
        }

        var bikeChecks = dto.Bikes.Select(b => (b.BicycleId, b.StartDatum.Date, b.EndDatum.Date));
        var hasOverlap = await _bookingRepository.ExistsApprovedOverlapForBikesAsync(bikeChecks);
        if (hasOverlap)
            throw new InvalidOperationException("Eines der ausgewaehlten Fahrraeder ist im gewaehlten Zeitraum bereits bestaetigt gebucht.");

        var bicycles = new List<Bicycle>();
        foreach (var bikeDto in dto.Bikes)
        {
            var bicycle = await _bicycleRepository.GetByIdAsync(bikeDto.BicycleId)
                ?? throw new KeyNotFoundException($"Fahrrad mit ID {bikeDto.BicycleId} nicht gefunden.");

            if (!bicycle.IsRentable)
                throw new InvalidOperationException($"Das Fahrrad '{bicycle.Marke} {bicycle.Modell}' ist nicht fuer den Verleih aktiviert.");

            bicycles.Add(bicycle);
        }

        var language = NormalizeLanguage(dto.Sprache);
        var minStart = dto.Bikes.Min(b => b.StartDatum.Date);
        var maxEnd = dto.Bikes.Max(b => b.EndDatum.Date);

        var booking = new RentalBooking
        {
            BicycleId = dto.Bikes[0].BicycleId,
            BuchungsNummer = await _bookingRepository.GenerateBuchungsNummerAsync(),
            StartDatum = minStart,
            EndDatum = maxEnd,
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
            Status = RentalBookingStatus.Pending
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
                    Menge = Math.Max(1, acc.Menge)
                });
            }
        }

        booking.Gesamtpreis = booking.Bikes.Sum(bk => bk.Gesamtpreis ?? 0m);
        if (booking.Gesamtpreis == 0m) booking.Gesamtpreis = null;

        if (string.IsNullOrWhiteSpace(booking.Email))
            throw new InvalidOperationException("Bitte geben Sie eine gueltige E-Mail-Adresse an.");

        var created = await _bookingRepository.AddAsync(booking);
        var withDetails = await _bookingRepository.GetWithDetailsAsync(created.Id);
        if (withDetails == null)
            throw new InvalidOperationException("Buchung konnte nach dem Speichern nicht geladen werden.");

        try
        {
            var emailModel = await BuildEmailModelAsync(withDetails, bicycles);
            await _emailService.SendRentalBookingReceivedAsync(emailModel);
            await _emailService.SendRentalBookingAdminPendingNotificationAsync(
                emailModel,
                DefaultAdminRentalBookingsUrl);
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "Failed to send booking received email for booking {BookingNumber}. Rolling back booking creation.",
                withDetails?.BuchungsNummer ?? booking.BuchungsNummer);

            await _bookingRepository.DeleteAsync(created.Id);
            throw new InvalidOperationException("Buchung konnte nicht abgeschlossen werden, da die Bestaetigungs-E-Mail nicht gesendet werden konnte. Bitte erneut versuchen.");
        }

        return withDetails.ToDto();
    }

    public async Task<RentalBookingDto> ApproveAsync(int id, RentalBookingApproveDto dto)
    {
        var booking = await _bookingRepository.GetWithDetailsAsync(id)
            ?? throw new KeyNotFoundException($"Booking with ID {id} not found.");

        if (booking.Status == RentalBookingStatus.Cancelled)
            throw new InvalidOperationException("Stornierte Buchungen koennen nicht bestaetigt werden.");

        bool hasOverlap;
        if (booking.Bikes.Any())
        {
            var bikeChecks = booking.Bikes.Select(bk => (bk.BicycleId, bk.StartDatum, bk.EndDatum));
            hasOverlap = await _bookingRepository.ExistsApprovedOverlapForBikesAsync(bikeChecks, booking.Id);
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

    public async Task<RentalBookingDto> CancelByCustomerAsync(string bookingNumber, string email)
    {
        var normalizedBookingNumber = bookingNumber?.Trim() ?? string.Empty;
        var normalizedEmail = email?.Trim() ?? string.Empty;

        if (string.IsNullOrWhiteSpace(normalizedBookingNumber) || string.IsNullOrWhiteSpace(normalizedEmail))
            throw new InvalidOperationException("Buchungsnummer und E-Mail sind erforderlich.");

        var booking = await _bookingRepository.GetByBookingNumberWithDetailsAsync(normalizedBookingNumber)
            ?? throw new KeyNotFoundException("Buchung nicht gefunden.");

        if (!string.Equals(booking.Email?.Trim(), normalizedEmail, StringComparison.OrdinalIgnoreCase))
            throw new InvalidOperationException("Die E-Mail-Adresse passt nicht zur Buchung.");

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

    private static string NormalizeLanguage(string lang)
    {
        if (string.IsNullOrWhiteSpace(lang)) return "de";
        var normalized = lang.Trim().ToLower();
        return normalized == "en" ? "en" : "de";
    }

    private static int CalculateDaysInclusive(DateTime start, DateTime end)
    {
        var days = (end.Date - start.Date).Days + 1;
        return Math.Max(1, days);
    }

    private static decimal? CalculateTotalPrice(Bicycle bicycle, RentalBooking booking)
    {
        var days = CalculateDaysInclusive(booking.StartDatum, booking.EndDatum);
        var bikeTotal = RentalPricingCalculator.CalculateBikePrice(bicycle, days);
        var accessoryTotal = booking.Accessories.Sum(a => a.Tagespreis * a.Menge) * days;

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
        var accessoriesText = BuildAccessoriesText(booking, booking.Sprache);

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
            days,
            booking.Gesamtpreis,
            null,
            accessoriesText,
            shop.PickupLocation,
            shop.Phone,
            shop.Email,
            NormalizeLanguage(booking.Sprache ?? "de"),
            BuildSelfCancelUrl(booking)
        );
    }

    private static string BuildSelfCancelUrl(RentalBooking booking)
    {
        var bookingNumber = Uri.EscapeDataString(booking.BuchungsNummer ?? string.Empty);
        var email = Uri.EscapeDataString(booking.Email ?? string.Empty);
        return $"{DefaultPublicApiBaseUrl}/rentals/bookings/cancel?bookingNumber={bookingNumber}&email={email}";
    }

    private static string BuildAccessoriesText(RentalBooking booking, string? language)
    {
        if (booking.Accessories.Count == 0)
            return NormalizeLanguage(language ?? "de") == "en" ? "None" : "Keine";

        return string.Join(
            "\n",
            booking.Accessories.Select(a => $"- {a.Bezeichnung} x{a.Menge} ({a.Tagespreis:0.00} EUR/Tag)"));
    }

    private async Task<(string PickupLocation, string Phone, string Email)> GetShopInfoAsync()
    {
        var settings = await _shopSettingsRepository.GetSettingsAsync();
        if (settings == null)
        {
            return (
                $"{DefaultShopStreet}, {DefaultShopCity}",
                DefaultShopPhone,
                DefaultShopEmail
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
            !string.IsNullOrWhiteSpace(settings.Email) ? settings.Email : DefaultShopEmail
        );
    }
}
