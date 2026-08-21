using BikeHaus.Application.DTOs;
using BikeHaus.Application.Interfaces;
using BikeHaus.Domain;
using BikeHaus.Domain.Entities;
using BikeHaus.Domain.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Globalization;
using System.Net;

namespace BikeHaus.API.Controllers;

[ApiController]
[Route("api/public/rentals")]
public class PublicRentalsController : ControllerBase
{
    private readonly IBicycleService _bicycleService;
    private readonly IRentalAccessoryService _rentalAccessoryService;
    private readonly IRentalBookingService _rentalBookingService;
    private readonly IRentalReviewService _rentalReviewService;
    private readonly IRepository<RentalFunnelEvent> _funnelEventRepository;
    private readonly ILogger<PublicRentalsController> _logger;

    public PublicRentalsController(
        IBicycleService bicycleService,
        IRentalAccessoryService rentalAccessoryService,
        IRentalBookingService rentalBookingService,
        IRentalReviewService rentalReviewService,
        IRepository<RentalFunnelEvent> funnelEventRepository,
        ILogger<PublicRentalsController> logger)
    {
        _bicycleService = bicycleService;
        _rentalAccessoryService = rentalAccessoryService;
        _rentalBookingService = rentalBookingService;
        _rentalReviewService = rentalReviewService;
        _funnelEventRepository = funnelEventRepository;
        _logger = logger;
    }

    [HttpGet("bikes")]
    public async Task<ActionResult<IEnumerable<PublicRentalBicycleDto>>> GetRentableBikes()
    {
        var bikes = await _bicycleService.GetRentableBicyclesAsync();
        return Ok(bikes);
    }

    [HttpGet("bikes/{id}")]
    public async Task<ActionResult<PublicRentalBicycleDto>> GetRentableBike(int id)
    {
        var bike = await _bicycleService.GetRentableBicycleByIdAsync(id);
        if (bike == null) return NotFound();
        return Ok(bike);
    }

    [HttpGet("bikes/{id}/bookings")]
    public async Task<ActionResult<IEnumerable<RentalBookingRangeDto>>> GetApprovedBookings(int id)
    {
        var ranges = await _rentalBookingService.GetApprovedRangesAsync(id);
        return Ok(ranges);
    }

    [HttpGet("bikes/{id}/busy-periods")]
    public async Task<ActionResult<IEnumerable<BusyPeriodDto>>> GetBusyPeriods(int id)
    {
        var periods = await _bicycleService.GetBusyPeriodsAsync(id);
        return Ok(periods);
    }

    [HttpGet("bikes/available")]
    public async Task<ActionResult<IEnumerable<PublicRentalBicycleDto>>> GetAvailableBikes([FromQuery] DateTime startDate, [FromQuery] DateTime endDate)
    {
        // Validate date range
        if (startDate.Date > endDate.Date)
            return BadRequest(new { error = "Start date must be before or equal to end date." });

        var allBikes = (await _bicycleService.GetRentableBicyclesAsync()).ToList();

        // Busy-Perioden für alle Nicht-Kinderräder in EINEM Batch laden (feste
        // Anzahl Queries) statt pro Fahrrad einzeln — behebt das frühere N+1.
        var nonChildrenIds = allBikes
            .Where(b => !BicycleCategory.IsChildrens(b.Art, b.Fahrradtyp))
            .Select(b => b.Id);
        var busyByBike = await _bicycleService.GetBusyPeriodsForBikesAsync(nonChildrenIds);

        var availableBikes = new List<PublicRentalBicycleDto>();

        foreach (var bike in allBikes)
        {
            // Children's bikes are generic/pooled listings (e.g. "20 Zoll Fahrrad")
            // that stand in for several interchangeable bikes, so they stay bookable
            // regardless of overlapping bookings — the concrete bike is assigned in
            // the shop. They skip the busy-period check.
            if (BicycleCategory.IsChildrens(bike.Art, bike.Fahrradtyp))
            {
                availableBikes.Add(bike);
                continue;
            }

            var busyPeriods = busyByBike.TryGetValue(bike.Id, out var periods)
                ? periods
                : new List<BusyPeriodDto>();

            // Check if bike is available for the entire date range (inclusive bounds)
            bool isAvailable = !busyPeriods.Any(p =>
                p.Start.Date <= endDate.Date && p.End.Date >= startDate.Date);

            if (isAvailable)
            {
                availableBikes.Add(bike);
            }
        }

        return Ok(availableBikes);
    }

    // Verfügbarkeitskalender für die Buchungsseite: liefert pro Tag die Anzahl
    // freier Mieträder (ohne Kinderräder — die sind gepoolte Anzeigen und immer
    // buchbar), damit das Frontend Kalendertage einfärben kann. Bewusst nur
    // aggregierte Zahlen, keine Fahrrad-IDs oder Namen. Feste Query-Anzahl
    // dank Batch-Busy-Periods.
    [HttpGet("availability-calendar")]
    [AllowAnonymous]
    public async Task<ActionResult<PublicAvailabilityCalendarDto>> GetAvailabilityCalendar(
        [FromQuery] string? from, [FromQuery] string? to)
    {
        if (!DateTime.TryParse(from, CultureInfo.InvariantCulture, DateTimeStyles.None, out var fromDate) ||
            !DateTime.TryParse(to, CultureInfo.InvariantCulture, DateTimeStyles.None, out var toDate))
            return BadRequest(new { error = "Invalid dates. Use from=YYYY-MM-DD&to=YYYY-MM-DD." });

        var start = fromDate.Date;
        var end = toDate.Date;

        if (start > end)
            return BadRequest(new { error = "'from' must be before or equal to 'to'." });

        var dayCount = (end - start).Days + 1;
        if (dayCount > 92)
            return BadRequest(new { error = "Date range too large (max 92 days)." });

        var allBikes = await _bicycleService.GetRentableBicyclesAsync();
        var nonChildren = allBikes
            .Where(b => !BicycleCategory.IsChildrens(b.Art, b.Fahrradtyp))
            .ToList();

        var busyByBike = await _bicycleService.GetBusyPeriodsForBikesAsync(nonChildren.Select(b => b.Id));

        // Pro Tag zählen, wie viele Räder mindestens eine Busy-Periode haben,
        // die den Tag abdeckt (Mehrfach-Perioden desselben Rads zählen einmal).
        var busyPerDay = new int[dayCount];
        foreach (var bike in nonChildren)
        {
            if (!busyByBike.TryGetValue(bike.Id, out var periods) || periods.Count == 0)
                continue;

            var covered = new bool[dayCount];
            foreach (var p in periods)
            {
                var firstIdx = Math.Max(0, (p.Start.Date - start).Days);
                var lastIdx = Math.Min(dayCount - 1, (p.End.Date - start).Days);
                for (var i = firstIdx; i <= lastIdx; i++)
                    covered[i] = true;
            }

            for (var i = 0; i < dayCount; i++)
                if (covered[i]) busyPerDay[i]++;
        }

        var days = new List<PublicAvailabilityCalendarDayDto>(dayCount);
        for (var i = 0; i < dayCount; i++)
        {
            days.Add(new PublicAvailabilityCalendarDayDto(
                start.AddDays(i).ToString("yyyy-MM-dd", CultureInfo.InvariantCulture),
                nonChildren.Count - busyPerDay[i]));
        }

        return Ok(new PublicAvailabilityCalendarDto(nonChildren.Count, days));
    }

    private static readonly HashSet<string> AllowedFunnelSteps = new(StringComparer.Ordinal)
    {
        "date-selection",
        "bike-selection",
        "bike-details",
        "choose-next",
        "accessory-selection",
        "customer-info",
        "review",
        "success",
        "submit-success",
        "submit-conflict",
        "submit-error"
    };

    // Funnel-Telemetrie der öffentlichen Buchungsseite: anonymes Ereignis je
    // Schritt und Besucher-Session. Darf den Buchungs-Flow niemals stören —
    // Persistenzfehler werden nur geloggt, die Antwort bleibt 204.
    [HttpPost("funnel-event")]
    [AllowAnonymous]
    public async Task<IActionResult> TrackFunnelEvent([FromBody] PublicRentalFunnelEventDto dto)
    {
        if (dto is null)
            return BadRequest(new { error = "Body is required." });

        var step = dto.Step?.Trim() ?? string.Empty;
        if (!AllowedFunnelSteps.Contains(step))
            return BadRequest(new { error = "Unknown funnel step." });

        var sessionKey = dto.SessionKey?.Trim() ?? string.Empty;
        if (sessionKey.Length == 0)
            return BadRequest(new { error = "sessionKey is required." });
        if (sessionKey.Length > 64)
            sessionKey = sessionKey[..64];

        var language = string.IsNullOrWhiteSpace(dto.Language) ? null : dto.Language.Trim();
        if (language is { Length: > 8 })
            language = language[..8];

        var info = string.IsNullOrWhiteSpace(dto.Info) ? null : dto.Info.Trim();
        if (info is { Length: > 200 })
            info = info[..200];

        try
        {
            await _funnelEventRepository.AddAsync(new RentalFunnelEvent
            {
                Step = step,
                SessionKey = sessionKey,
                Sprache = language,
                Info = info
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex,
                "RentalFunnel Ereignis konnte nicht gespeichert werden (step={Step})", step);
        }

        return NoContent();
    }

    [HttpGet("accessories")]
    public async Task<ActionResult<IEnumerable<RentalAccessoryListDto>>> GetAccessories()
    {
        var items = await _rentalAccessoryService.GetActiveAsync();
        return Ok(items);
    }

    [HttpPost("bookings")]
    public async Task<ActionResult<RentalBookingDto>> CreateBooking([FromBody] RentalBookingCreateDto dto)
    {
        try
        {
            var created = await _rentalBookingService.CreateAsync(dto);
            return CreatedAtAction(nameof(CreateBooking), new { id = created.Id }, created);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { error = ex.Message });
        }
    }

    // WICHTIG: Dieser GET storniert NICHT. E-Mail-Clients und Sicherheits-Scanner
    // (Link-Vorschau, Viren-/Spam-Filter) rufen Links in E-Mails automatisch per
    // GET auf. Wuerde der GET direkt stornieren, erhielten Kunden ohne eigenes
    // Zutun eine Stornobestaetigung ("sebepsiz iptal"). Deshalb zeigt der GET nur
    // eine Bestaetigungsseite; storniert wird ausschliesslich per POST auf
    // "bookings/cancel/confirm" nach einem echten Button-Klick.
    [HttpGet("bookings/cancel")]
    public IActionResult CancelBookingByCustomerConfirmPage([FromQuery] string bookingNumber, [FromQuery] string email)
    {
        var safeBookingNumber = WebUtility.HtmlEncode(bookingNumber ?? string.Empty);
        var safeEmail = WebUtility.HtmlEncode(email ?? string.Empty);
        var html = $@"<!doctype html>
<html lang='de'>
<head><meta charset='utf-8'/><meta name='viewport' content='width=device-width,initial-scale=1'/><title>Stornierung bestaetigen</title></head>
<body style='font-family:Segoe UI,Arial,sans-serif;background:#f8fafc;color:#0f172a;padding:24px;'>
  <div style='max-width:620px;margin:0 auto;background:#fff;border:1px solid #e2e8f0;border-radius:14px;padding:24px;'>
    <h1 style='margin:0 0 12px 0;font-size:24px;'>Stornierung bestaetigen</h1>
    <p style='margin:0 0 10px 0;'>Moechtest du deine Buchung wirklich stornieren? Diese Aktion kann nicht rueckgaengig gemacht werden.</p>
    <p style='margin:0 0 4px 0;'><strong>Buchungsnummer:</strong> {safeBookingNumber}</p>
    <p style='margin:0 0 16px 0;'><strong>E-Mail:</strong> {safeEmail}</p>
    <form method='post' action='/api/public/rentals/bookings/cancel/confirm' style='margin:0;'>
      <input type='hidden' name='bookingNumber' value=""{safeBookingNumber}""/>
      <input type='hidden' name='email' value=""{safeEmail}""/>
      <button type='submit' style='background:#dc2626;color:#fff;border:none;border-radius:10px;padding:12px 20px;font-size:16px;cursor:pointer;'>Buchung stornieren</button>
    </form>
    <hr style='margin:24px 0;border:none;border-top:1px solid #e2e8f0;'/>
    <h2 style='margin:0 0 8px 0;font-size:18px;'>English</h2>
    <p style='margin:0;'>Do you really want to cancel your booking? Click the red button above to confirm. This action cannot be undone.</p>
  </div>
</body>
</html>";
        return Content(html, "text/html");
    }

    [HttpPost("bookings/cancel/confirm")]
    [Consumes("application/x-www-form-urlencoded")]
    public async Task<IActionResult> CancelBookingByCustomerConfirm([FromForm] string bookingNumber, [FromForm] string email)
    {
        try
        {
            var cancelled = await _rentalBookingService.CancelByCustomerAsync(bookingNumber, email);
            var safeBookingNumber = WebUtility.HtmlEncode(cancelled.BuchungsNummer);
            var safeEmail = WebUtility.HtmlEncode(cancelled.Email ?? email);
            var html = $@"<!doctype html>
<html lang='de'>
<head><meta charset='utf-8'/><meta name='viewport' content='width=device-width,initial-scale=1'/><title>Storno bestaetigt</title></head>
<body style='font-family:Segoe UI,Arial,sans-serif;background:#f8fafc;color:#0f172a;padding:24px;'>
  <div style='max-width:620px;margin:0 auto;background:#fff;border:1px solid #e2e8f0;border-radius:14px;padding:24px;'>
    <h1 style='margin:0 0 12px 0;font-size:24px;'>Storno bestaetigt</h1>
    <p style='margin:0 0 10px 0;'>Deine Buchung wurde erfolgreich storniert.</p>
    <p style='margin:0 0 4px 0;'><strong>Buchungsnummer:</strong> {safeBookingNumber}</p>
    <p style='margin:0 0 16px 0;'><strong>E-Mail:</strong> {safeEmail}</p>
    <p style='margin:0 0 16px 0;'>Wenn du eine neue Anfrage stellen moechtest, besuche bitte unsere Website.</p>
    <hr style='margin:24px 0;border:none;border-top:1px solid #e2e8f0;'/>
    <p style='margin:0;'><strong>English:</strong> Your booking has been cancelled successfully.</p>
  </div>
</body>
</html>";
            return Content(html, "text/html");
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { error = ex.Message });
        }
    }

    [HttpPost("bookings/cancel")]
    public async Task<ActionResult<RentalBookingDto>> CancelBookingByCustomerPost([FromBody] PublicBookingCancelDto dto)
    {
        try
        {
            var cancelled = await _rentalBookingService.CancelByCustomerAsync(dto.BookingNumber, dto.Email);
            return Ok(cancelled);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { error = ex.Message });
        }
    }

    // Side-effect-free counterpart to bookings/cancel: lets the "manage my
    // booking" page show what was booked WITHOUT cancelling anything. Same
    // proof-of-ownership (booking number + e-mail, both required, both must
    // match) as the cancel flow, but a wrong booking number and a wrong
    // e-mail deliberately produce the exact same 404 — no oracle for
    // guessing valid booking numbers.
    [HttpPost("bookings/lookup")]
    [AllowAnonymous]
    public async Task<ActionResult<PublicRentalBookingLookupDto>> LookupBooking([FromBody] PublicBookingLookupDto dto)
    {
        var result = await _rentalBookingService.LookupByCustomerAsync(dto.BookingNumber, dto.Email);
        if (result == null)
            return NotFound(new { error = "Buchung nicht gefunden oder E-Mail passt nicht." });

        return Ok(result);
    }

    // ═══ Rental Reviews (public) ═══

    [HttpGet("reviews")]
    public async Task<ActionResult<IEnumerable<RentalReviewPublicDto>>> GetReviews()
    {
        var reviews = await _rentalReviewService.GetApprovedAsync();
        return Ok(reviews);
    }

    [HttpPost("reviews")]
    public async Task<ActionResult<RentalReviewPublicDto>> CreateReview([FromBody] RentalReviewCreateDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Ad) || string.IsNullOrWhiteSpace(dto.Yorum))
            return BadRequest(new { error = "Name and comment are required." });

        if (dto.Sterne < 1 || dto.Sterne > 5)
            return BadRequest(new { error = "Stars must be between 1 and 5." });

        var created = await _rentalReviewService.CreateAsync(dto);
        return Ok(new RentalReviewPublicDto(created.Id, created.Ad, created.Sterne, created.Yorum, created.CreatedAt));
    }
}

public class PublicBookingCancelDto
{
    public string BookingNumber { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
}

public class PublicBookingLookupDto
{
    public string BookingNumber { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
}
