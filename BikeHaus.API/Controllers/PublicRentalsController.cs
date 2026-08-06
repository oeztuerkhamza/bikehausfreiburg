using BikeHaus.Application.DTOs;
using BikeHaus.Application.Interfaces;
using BikeHaus.Domain;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
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

    public PublicRentalsController(
        IBicycleService bicycleService,
        IRentalAccessoryService rentalAccessoryService,
        IRentalBookingService rentalBookingService,
        IRentalReviewService rentalReviewService)
    {
        _bicycleService = bicycleService;
        _rentalAccessoryService = rentalAccessoryService;
        _rentalBookingService = rentalBookingService;
        _rentalReviewService = rentalReviewService;
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

        var allBikes = await _bicycleService.GetRentableBicyclesAsync();
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

            var busyPeriods = await _bicycleService.GetBusyPeriodsAsync(bike.Id);

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
