using BikeHaus.Application.DTOs;
using BikeHaus.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BikeHaus.API.Controllers;

[Authorize]
[ApiController]
[Route("api/rental-bookings")]
public class RentalBookingsController : ControllerBase
{
    private readonly IRentalBookingService _service;
    private readonly IPdfService _pdfService;
    private readonly IFileStorageService _fileStorage;

    public RentalBookingsController(IRentalBookingService service, IPdfService pdfService, IFileStorageService fileStorage)
    {
        _service = service;
        _pdfService = pdfService;
        _fileStorage = fileStorage;
    }

    [HttpGet("paginated")]
    public async Task<ActionResult<PaginatedResult<RentalBookingListDto>>> GetPaginated(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? status = null,
        [FromQuery] string? search = null,
        [FromQuery] bool includeCompleted = false)
    {
        var paginationParams = new PaginationParams
        {
            Page = page,
            PageSize = pageSize,
            Status = status,
            SearchTerm = search
        };

        var result = await _service.GetPaginatedAsync(paginationParams, includeCompleted);
        return Ok(result);
    }

    [HttpGet("pending-count")]
    public async Task<ActionResult> GetPendingCount()
    {
        var count = await _service.GetPendingCountAsync();
        return Ok(new { count });
    }

    // One-off repair for bookings wrongly cancelled by the self-cancel email
    // link. Dry-run by default: POST without ?apply=true only lists candidates.
    // Pass ?apply=true to restore them and notify the customers. Optionally pass
    // ?cancelledBefore=2026-07-18T00:00:00Z to exclude genuine cancellations
    // made after the fix was deployed.
    [HttpPost("revert-erroneous-stornos")]
    public async Task<ActionResult<RevertStornoResultDto>> RevertErroneousStornos(
        [FromQuery] bool apply = false,
        [FromQuery] DateTime? cancelledBefore = null)
    {
        var result = await _service.RevertErroneousStornosAsync(apply, cancelledBefore);
        return Ok(result);
    }

    /// <summary>All non-cancelled bookings overlapping the given range (calendar view).</summary>
    [HttpGet("calendar")]
    public async Task<ActionResult<IEnumerable<RentalBookingListDto>>> GetCalendar(
        [FromQuery] DateTime from,
        [FromQuery] DateTime to)
    {
        if (to < from || (to - from).TotalDays > 62)
            return BadRequest(new { error = "Ungültiger Zeitraum" });

        var items = await _service.GetCalendarAsync(from, to);
        return Ok(items);
    }

    /// <summary>Admin-seitige Anlage einer Mietanfrage (E-Mail optional, z.B. Telefon/Laufkundschaft).</summary>
    [HttpPost]
    public async Task<ActionResult<RentalBookingDto>> Create([FromBody] RentalBookingCreateDto dto)
    {
        try
        {
            var created = await _service.CreateAsync(dto, requireEmail: false);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
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

    [HttpGet("{id}")]
    public async Task<ActionResult<RentalBookingDto>> GetById(int id)
    {
        var booking = await _service.GetByIdAsync(id);
        if (booking == null) return NotFound();
        return Ok(booking);
    }

    [HttpPost("{id}/approve")]
    public async Task<ActionResult<RentalBookingDto>> Approve(int id, [FromBody] RentalBookingApproveDto dto)
    {
        try
        {
            var updated = await _service.ApproveAsync(id, dto);
            return Ok(updated);
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

    [HttpPatch("{id}/signature")]
    public async Task<IActionResult> SaveSignature(int id, [FromBody] RentalBookingSignatureDto dto)
    {
        try
        {
            await _service.SaveSignatureAsync(id, dto.MieterUnterschrift);
            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var success = await _service.DeleteAsync(id);
        if (!success) return NotFound();
        return NoContent();
    }

    [HttpPost("{id}/cancel")]
    public async Task<ActionResult<RentalBookingDto>> Cancel(int id, [FromBody] RentalBookingCancelDto dto)
    {
        try
        {
            var updated = await _service.CancelAsync(id, dto);
            return Ok(updated);
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

    [HttpPatch("{id}/dates")]
    public async Task<ActionResult<RentalBookingDto>> UpdateDates(int id, [FromBody] RentalBookingUpdateDatesDto dto)
    {
        try
        {
            var updated = await _service.UpdateDatesAsync(id, dto);
            return Ok(updated);
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

    [HttpPatch("{bookingId}/bikes/{bikeId}")]
    public async Task<ActionResult<RentalBookingDto>> UpdateBike(int bookingId, int bikeId, [FromBody] RentalBookingUpdateBikeDto dto)
    {
        try
        {
            var updated = await _service.UpdateBookingBikeAsync(bookingId, bikeId, dto.NewBicycleId);
            return Ok(updated);
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

    [HttpDelete("{bookingId}/bikes/{bikeId}")]
    public async Task<ActionResult<RentalBookingDto>> RemoveBike(int bookingId, int bikeId)
    {
        try
        {
            var updated = await _service.RemoveBookingBikeAsync(bookingId, bikeId);
            return Ok(updated);
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

    [HttpGet("{id}/rechnung-pdf")]
    public async Task<IActionResult> DownloadBookingRechnung(int id)
    {
        try
        {
            var pdf = await _pdfService.GenerateBookingRechnungAsync(id);
            return File(pdf, "application/pdf", $"Mietrechnung-{id}.pdf");
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
    }

    [HttpGet("{id}/kaution-pdf")]
    public async Task<IActionResult> DownloadBookingKaution(int id)
    {
        try
        {
            var pdf = await _pdfService.GenerateBookingKautionsquittungAsync(id);
            return File(pdf, "application/pdf", $"Kautionsquittung-{id}.pdf");
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
    }

    // seite steuert Vorder-/Rückseite des Ausweisfotos. Default "vorderseite"
    // hält bestehende Aufrufe (ohne den Parameter) rückwärtskompatibel — sie
    // landen weiterhin im alten AusweisPhotoPath-Feld.
    [HttpPost("{id}/ausweis")]
    public async Task<IActionResult> UploadAusweis(int id, IFormFile file, [FromQuery] string seite = "vorderseite")
    {
        if (file == null || file.Length == 0)
            return BadRequest(new { error = "No file uploaded" });

        var istRueckseite = string.Equals(seite, "rueckseite", StringComparison.OrdinalIgnoreCase);

        try
        {
            using var stream = file.OpenReadStream();
            var relativePath = await _fileStorage.SaveFileAsync(stream, file.FileName, $"ausweis/{id}");
            await _service.SaveAusweisPhotoPathAsync(id, relativePath, istRueckseite);
            return Ok(new { path = relativePath, seite = istRueckseite ? "rueckseite" : "vorderseite" });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
    }

    [HttpGet("{id}/ausweis")]
    public async Task<IActionResult> DownloadAusweis(int id, [FromQuery] string seite = "vorderseite")
    {
        var istRueckseite = string.Equals(seite, "rueckseite", StringComparison.OrdinalIgnoreCase);
        try
        {
            var path = await _service.GetAusweisPhotoPathAsync(id, istRueckseite);
            if (string.IsNullOrEmpty(path))
                return NotFound(new { error = "Kein Ausweis-Foto vorhanden" });

            var stream = await _fileStorage.GetFileAsync(path);
            var ext = Path.GetExtension(path).ToLower();
            var contentType = ext == ".pdf" ? "application/pdf" : "image/jpeg";
            var suffix = istRueckseite ? "-Rueckseite" : "";
            return File(stream, contentType, $"Ausweis-Buchung-{id}{suffix}{ext}");
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
        catch (FileNotFoundException)
        {
            return NotFound(new { error = "Ausweis-Datei nicht gefunden" });
        }
    }
}
