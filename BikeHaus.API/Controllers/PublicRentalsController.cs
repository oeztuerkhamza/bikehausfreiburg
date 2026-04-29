using BikeHaus.Application.DTOs;
using BikeHaus.Application.Interfaces;
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

    public PublicRentalsController(
        IBicycleService bicycleService,
        IRentalAccessoryService rentalAccessoryService,
        IRentalBookingService rentalBookingService)
    {
        _bicycleService = bicycleService;
        _rentalAccessoryService = rentalAccessoryService;
        _rentalBookingService = rentalBookingService;
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

    [HttpGet("bookings/cancel")]
    public async Task<IActionResult> CancelBookingByCustomer([FromQuery] string bookingNumber, [FromQuery] string email)
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
    <p style='margin:0;'>Wenn du eine neue Anfrage stellen moechtest, besuche bitte unsere Website.</p>
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
}

public class PublicBookingCancelDto
{
    public string BookingNumber { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
}
