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
    private const string DefaultShopEmail = "bikehausfreiburg@gmail.com";
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
        if (dto.EndDatum.Date < dto.StartDatum.Date)
            throw new InvalidOperationException("End date must be after start date.");

        var hasApprovedOverlap = await _bookingRepository.ExistsApprovedOverlapAsync(
            dto.BicycleId,
            dto.StartDatum.Date,
            dto.EndDatum.Date);
        if (hasApprovedOverlap)
            throw new InvalidOperationException("Dieses Fahrrad ist im ausgewaehlten Zeitraum bereits bestaetigt gebucht.");

        var bicycle = await _bicycleRepository.GetByIdAsync(dto.BicycleId)
            ?? throw new KeyNotFoundException($"Bicycle with ID {dto.BicycleId} not found.");

        if (!bicycle.IsRentable)
            throw new InvalidOperationException("Dieses Fahrrad ist nicht fuer den Verleih aktiviert.");

        var language = NormalizeLanguage(dto.Sprache);
        var booking = new RentalBooking
        {
            BicycleId = dto.BicycleId,
            BuchungsNummer = await _bookingRepository.GenerateBuchungsNummerAsync(),
            StartDatum = dto.StartDatum.Date,
            EndDatum = dto.EndDatum.Date,
            Vorname = dto.Vorname.Trim(),
            Nachname = dto.Nachname.Trim(),
            Email = dto.Email?.Trim(),
            Telefon = dto.Telefon?.Trim(),
            Sprache = language,
            Notizen = dto.Notizen,
            Status = RentalBookingStatus.Pending
        };

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

        booking.Gesamtpreis = CalculateTotalPrice(bicycle, booking);

        if (string.IsNullOrWhiteSpace(booking.Email))
            throw new InvalidOperationException("Bitte geben Sie eine gueltige E-Mail-Adresse an.");

        var created = await _bookingRepository.AddAsync(booking);
        var withDetails = await _bookingRepository.GetWithDetailsAsync(created.Id);
        if (withDetails == null)
            throw new InvalidOperationException("Buchung konnte nach dem Speichern nicht geladen werden.");

        try
        {
            var emailModel = await BuildEmailModelAsync(withDetails, bicycle);
            await _emailService.SendRentalBookingReceivedAsync(emailModel);
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

        var hasApprovedOverlap = await _bookingRepository.ExistsApprovedOverlapAsync(
            booking.BicycleId,
            booking.StartDatum.Date,
            booking.EndDatum.Date,
            booking.Id);
        if (hasApprovedOverlap)
            throw new InvalidOperationException("Diese Buchung kann nicht bestaetigt werden, da der Zeitraum bereits durch eine andere bestaetigte Buchung belegt ist.");

        if (booking.Status == RentalBookingStatus.Cancelled)
            throw new InvalidOperationException("Stornierte Buchungen koennen nicht bestaetigt werden.");

        if (booking.Status != RentalBookingStatus.Approved)
        {
            booking.Status = RentalBookingStatus.Approved;
            booking.ApprovedAt = DateTime.UtcNow;
        }

        if (!string.IsNullOrWhiteSpace(dto.AdminNotizen))
            booking.AdminNotizen = dto.AdminNotizen;

        var bicycle = await _bicycleRepository.GetByIdAsync(booking.BicycleId)
            ?? throw new KeyNotFoundException($"Bicycle with ID {booking.BicycleId} not found.");

        booking.Gesamtpreis ??= CalculateTotalPrice(bicycle, booking);
        booking.UpdatedAt = DateTime.UtcNow;
        await _bookingRepository.UpdateAsync(booking);

        if (!string.IsNullOrWhiteSpace(booking.Email))
        {
            try
            {
                var emailModel = await BuildEmailModelAsync(booking, bicycle);
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
            var bicycle = await _bicycleRepository.GetByIdAsync(booking.BicycleId);
            if (bicycle != null)
            {
                try
                {
                    var emailModel = await BuildEmailModelAsync(booking, bicycle);
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
            var bicycle = await _bicycleRepository.GetByIdAsync(booking.BicycleId);
            if (bicycle != null)
            {
                try
                {
                    var emailModel = await BuildEmailModelAsync(booking, bicycle);
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
        }

        return booking.ToDto();
    }

    public async Task<IEnumerable<RentalBookingRangeDto>> GetApprovedRangesAsync(int bicycleId)
    {
        var bookings = await _bookingRepository.GetApprovedByBicycleIdAsync(bicycleId);
        return bookings.Select(b => new RentalBookingRangeDto(b.StartDatum, b.EndDatum));
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

    private async Task<RentalBookingEmailModel> BuildEmailModelAsync(RentalBooking booking, Bicycle bicycle)
    {
        var shop = await GetShopInfoAsync();
        var days = CalculateDaysInclusive(booking.StartDatum, booking.EndDatum);
        var accessoriesText = BuildAccessoriesText(booking, booking.Sprache);

        return new RentalBookingEmailModel(
            booking.Email ?? string.Empty,
            $"{booking.Vorname} {booking.Nachname}".Trim(),
            booking.BuchungsNummer,
            bicycle.Marke,
            bicycle.Modell,
            bicycle.Rahmennummer,
            bicycle.Rahmengroesse,
            bicycle.Farbe,
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
