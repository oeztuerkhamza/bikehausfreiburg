using BikeHaus.Application.DTOs;
using BikeHaus.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BikeHaus.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class RentalsController : ControllerBase
{
    private readonly IRentalService _rentalService;
    private readonly IPdfService _pdfService;
    private readonly IFileStorageService _fileStorage;

    public RentalsController(IRentalService rentalService, IPdfService pdfService, IFileStorageService fileStorage)
    {
        _rentalService = rentalService;
        _pdfService = pdfService;
        _fileStorage = fileStorage;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<RentalListDto>>> GetAll()
    {
        var rentals = await _rentalService.GetAllAsync();
        return Ok(rentals);
    }

    [HttpGet("paginated")]
    public async Task<ActionResult<PaginatedResult<RentalListDto>>> GetPaginated(
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
        var result = await _rentalService.GetPaginatedAsync(paginationParams, includeCompleted);
        return Ok(result);
    }

    /// <summary>All non-cancelled rental contracts overlapping the given range (calendar view).</summary>
    [HttpGet("calendar")]
    public async Task<ActionResult<IEnumerable<RentalCalendarItemDto>>> GetCalendar(
        [FromQuery] DateTime from,
        [FromQuery] DateTime to)
    {
        if (to < from || (to - from).TotalDays > 62)
            return BadRequest(new { error = "Ungültiger Zeitraum" });

        var items = await _rentalService.GetCalendarAsync(from, to);
        return Ok(items);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<RentalDto>> GetById(int id)
    {
        var rental = await _rentalService.GetByIdAsync(id);
        if (rental == null)
            return NotFound();
        return Ok(rental);
    }

    [HttpPost]
    public async Task<ActionResult<RentalDto>> Create([FromBody] RentalCreateDto dto)
    {
        try
        {
            var rental = await _rentalService.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = rental.Id }, rental);
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
    public async Task<ActionResult<RentalDto>> Update(int id, [FromBody] RentalUpdateDto dto)
    {
        try
        {
            var rental = await _rentalService.UpdateAsync(id, dto);
            return Ok(rental);
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
            await _rentalService.DeleteAsync(id);
            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
    }

    [HttpPost("{id}/return")]
    public async Task<ActionResult<RentalDto>> ReturnBicycle(int id, [FromBody] RentalReturnDto dto)
    {
        try
        {
            var rental = await _rentalService.ReturnBicycleAsync(id, dto);
            return Ok(rental);
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

    [HttpPost("{id}/cancel")]
    public async Task<ActionResult<RentalDto>> Cancel(int id)
    {
        try
        {
            var rental = await _rentalService.CancelAsync(id);
            return Ok(rental);
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

    [HttpGet("{id}/mietvertrag-pdf")]
    public async Task<IActionResult> DownloadMietvertrag(int id)
    {
        try
        {
            var pdf = await _pdfService.GenerateMietvertragAsync(id);
            return File(pdf, "application/pdf", $"Mietvertrag-{id}.pdf");
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
    }

    [HttpGet("{id}/bedingungen-pdf")]
    public async Task<IActionResult> DownloadMietbedingungen(int id)
    {
        try
        {
            var pdf = await _pdfService.GenerateMietbedingungenpdfAsync(id);
            return File(pdf, "application/pdf", $"Mietbedingungen-{id}.pdf");
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
    }

    [HttpGet("{id}/kaution-pdf")]
    public async Task<IActionResult> DownloadKautionsquittung(int id)
    {
        try
        {
            var pdf = await _pdfService.GenerateKautionsquittungAsync(id);
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
            var relativePath = await _fileStorage.SaveFileAsync(stream, file.FileName, $"ausweis/rental/{id}");
            await _rentalService.SaveAusweisPhotoPathAsync(id, relativePath);
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
            var path = await _rentalService.GetAusweisPhotoPathAsync(id);
            if (string.IsNullOrEmpty(path))
                return NotFound(new { error = "Kein Ausweis-Foto vorhanden" });

            var stream = await _fileStorage.GetFileAsync(path);
            var ext = Path.GetExtension(path).ToLower();
            var contentType = ext == ".pdf" ? "application/pdf" : "image/jpeg";
            return File(stream, contentType, $"Ausweis-Mietvertrag-{id}{ext}");
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
