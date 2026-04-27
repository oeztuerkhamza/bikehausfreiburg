using BikeHaus.Application.DTOs;
using BikeHaus.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

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
}
