using BikeHaus.Application.DTOs;
using BikeHaus.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BikeHaus.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class ReservationsController : ControllerBase
{
    private readonly IReservationService _reservationService;
    private readonly IPdfService _pdfService;
    private readonly IEmailService _emailService;

    public ReservationsController(
        IReservationService reservationService,
        IPdfService pdfService,
        IEmailService emailService)
    {
        _reservationService = reservationService;
        _pdfService = pdfService;
        _emailService = emailService;
    }

    /// <summary>Anzahlungsbeleg als PDF herunterladen.</summary>
    [HttpGet("{id}/anzahlungsbeleg")]
    public async Task<IActionResult> DownloadAnzahlungsbeleg(int id)
    {
        var reservation = await _reservationService.GetByIdAsync(id);
        if (reservation == null)
            return NotFound(new { error = "Reservierung nicht gefunden." });

        var pdfBytes = await _pdfService.GenerateAnzahlungsbelegAsync(id);
        return File(pdfBytes, "application/pdf", $"Anzahlungsbeleg_{reservation.ReservierungsNummer}.pdf");
    }

    /// <summary>Anzahlungsbeleg per E-Mail an den Kunden schicken.</summary>
    [HttpPost("{id}/send-anzahlungsbeleg")]
    public async Task<IActionResult> SendAnzahlungsbeleg(int id, [FromQuery] string? overrideEmail = null)
    {
        var reservation = await _reservationService.GetByIdAsync(id);
        if (reservation == null)
            return NotFound(new { error = "Reservierung nicht gefunden." });

        var toEmail = overrideEmail ?? reservation.Customer?.Email;
        if (string.IsNullOrWhiteSpace(toEmail))
            return BadRequest(new { error = "Keine E-Mail-Adresse für diesen Kunden hinterlegt." });

        var pdfBytes = await _pdfService.GenerateAnzahlungsbelegAsync(id);
        var name = reservation.Customer?.FullName ?? "Kunde";
        await _emailService.SendReservationAnzahlungAsync(
            toEmail, name, reservation.ReservierungsNummer, reservation.AblaufDatum, pdfBytes);

        return Ok(new { message = $"Anzahlungsbeleg {reservation.ReservierungsNummer} wurde an {toEmail} gesendet." });
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ReservationListDto>>> GetAll()
    {
        var reservations = await _reservationService.GetAllAsync();
        return Ok(reservations);
    }

    [HttpGet("paginated")]
    public async Task<ActionResult<PaginatedResult<ReservationListDto>>> GetPaginated(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? status = null,
        [FromQuery] string? search = null)
    {
        var paginationParams = new PaginationParams
        {
            Page = page,
            PageSize = pageSize,
            Status = status,
            SearchTerm = search
        };
        var result = await _reservationService.GetPaginatedAsync(paginationParams);
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ReservationDto>> GetById(int id)
    {
        var reservation = await _reservationService.GetByIdAsync(id);
        if (reservation == null)
            return NotFound();
        return Ok(reservation);
    }

    [HttpPost]
    public async Task<ActionResult<ReservationDto>> Create([FromBody] ReservationCreateDto dto)
    {
        try
        {
            var reservation = await _reservationService.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = reservation.Id }, reservation);
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

    [HttpPut("{id}")]
    public async Task<ActionResult<ReservationDto>> Update(int id, [FromBody] ReservationUpdateDto dto)
    {
        try
        {
            var reservation = await _reservationService.UpdateAsync(id, dto);
            return Ok(reservation);
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

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            await _reservationService.DeleteAsync(id);
            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
    }

    [HttpPost("{id}/cancel")]
    public async Task<IActionResult> Cancel(int id)
    {
        try
        {
            await _reservationService.CancelAsync(id);
            return NoContent();
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

    [HttpPost("{id}/convert-to-sale")]
    public async Task<ActionResult<SaleDto>> ConvertToSale(int id, [FromBody] ReservationConvertToSaleDto dto)
    {
        try
        {
            var sale = await _reservationService.ConvertToSaleAsync(id, dto);
            return Ok(sale);
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

    [HttpPost("expire-old")]
    public async Task<IActionResult> ExpireOld()
    {
        await _reservationService.ExpireOldReservationsAsync();
        return NoContent();
    }
}
