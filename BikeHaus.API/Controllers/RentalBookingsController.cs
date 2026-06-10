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
        [FromQuery] string? search = null)
    {
        var paginationParams = new PaginationParams
        {
            Page = page,
            PageSize = pageSize,
            Status = status,
            SearchTerm = search
        };

        var result = await _service.GetPaginatedAsync(paginationParams);
        return Ok(result);
    }

    [HttpGet("pending-count")]
    public async Task<ActionResult> GetPendingCount()
    {
        var count = await _service.GetPendingCountAsync();
        return Ok(new { count });
    }

    /// <summary>All non-cancelled bookings overlapping the given month (calendar view).</summary>
    [HttpGet("calendar")]
    public async Task<ActionResult<IEnumerable<RentalBookingListDto>>> GetCalendar(
        [FromQuery] int year,
        [FromQuery] int month)
    {
        if (year < 2020 || year > 2100 || month < 1 || month > 12)
            return BadRequest(new { error = "Ungültiger Zeitraum" });

        var items = await _service.GetCalendarAsync(year, month);
        return Ok(items);
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

    [HttpPost("{id}/ausweis")]
    public async Task<IActionResult> UploadAusweis(int id, IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest(new { error = "No file uploaded" });

        try
        {
            using var stream = file.OpenReadStream();
            var relativePath = await _fileStorage.SaveFileAsync(stream, file.FileName, $"ausweis/{id}");
            await _service.SaveAusweisPhotoPathAsync(id, relativePath);
            return Ok(new { path = relativePath });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
    }

    [HttpGet("{id}/ausweis")]
    public async Task<IActionResult> DownloadAusweis(int id)
    {
        try
        {
            var path = await _service.GetAusweisPhotoPathAsync(id);
            if (string.IsNullOrEmpty(path))
                return NotFound(new { error = "Kein Ausweis-Foto vorhanden" });

            var stream = await _fileStorage.GetFileAsync(path);
            var ext = Path.GetExtension(path).ToLower();
            var contentType = ext == ".pdf" ? "application/pdf" : "image/jpeg";
            return File(stream, contentType, $"Ausweis-Buchung-{id}{ext}");
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
