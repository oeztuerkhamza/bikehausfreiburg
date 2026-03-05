using BikeHaus.Application.DTOs;
using BikeHaus.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BikeHaus.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BicyclesController : ControllerBase
{
    private readonly IBicycleService _bicycleService;
    private readonly IWebHostEnvironment _env;
    private readonly IConfiguration _config;

    public BicyclesController(IBicycleService bicycleService, IWebHostEnvironment env, IConfiguration config)
    {
        _bicycleService = bicycleService;
        _env = env;
        _config = config;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<BicycleDto>>> GetAll()
    {
        var bicycles = await _bicycleService.GetAllAsync();
        return Ok(bicycles);
    }

    [HttpGet("paginated")]
    public async Task<ActionResult<PaginatedResult<BicycleDto>>> GetPaginated(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? status = null,
        [FromQuery] string? search = null,
        [FromQuery] string? zustand = null,
        [FromQuery] string? fahrradtyp = null,
        [FromQuery] string? reifengroesse = null,
        [FromQuery] string? marke = null)
    {
        var paginationParams = new PaginationParams
        {
            Page = page,
            PageSize = pageSize,
            Status = status,
            SearchTerm = search,
            Zustand = zustand,
            Fahrradtyp = fahrradtyp,
            Reifengroesse = reifengroesse,
            Marke = marke
        };
        var result = await _bicycleService.GetPaginatedAsync(paginationParams);
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<BicycleDto>> GetById(int id)
    {
        var bicycle = await _bicycleService.GetByIdAsync(id);
        if (bicycle == null)
            return NotFound();
        return Ok(bicycle);
    }

    [HttpGet("available")]
    public async Task<ActionResult<IEnumerable<BicycleDto>>> GetAvailable()
    {
        var bicycles = await _bicycleService.GetAvailableAsync();
        return Ok(bicycles);
    }

    [HttpGet("search")]
    public async Task<ActionResult<IEnumerable<BicycleDto>>> Search([FromQuery] string term)
    {
        var bicycles = await _bicycleService.SearchAsync(term);
        return Ok(bicycles);
    }

    [HttpGet("by-stokno/{stokNo}")]
    public async Task<ActionResult<BicycleDto>> GetByStokNo(string stokNo)
    {
        var bicycle = await _bicycleService.GetByStokNoAsync(stokNo);
        if (bicycle == null)
            return NotFound();
        return Ok(bicycle);
    }

    [HttpGet("next-stokno")]
    public async Task<ActionResult<object>> GetNextStokNo()
    {
        var nextStokNo = await _bicycleService.GetNextStokNoAsync();
        return Ok(new { stokNo = nextStokNo });
    }

    [Authorize]
    [HttpPost]
    public async Task<ActionResult<BicycleDto>> Create([FromBody] BicycleCreateDto dto)
    {
        var bicycle = await _bicycleService.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = bicycle.Id }, bicycle);
    }

    [Authorize]
    [HttpPut("{id}")]
    public async Task<ActionResult<BicycleDto>> Update(int id, [FromBody] BicycleUpdateDto dto)
    {
        var bicycle = await _bicycleService.UpdateAsync(id, dto);
        return Ok(bicycle);
    }

    [Authorize]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            await _bicycleService.DeleteAsync(id);
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

    [HttpGet("brands")]
    public async Task<ActionResult<IEnumerable<string>>> GetBrands()
    {
        var brands = await _bicycleService.GetUniqueBrandsAsync();
        return Ok(brands);
    }

    [HttpGet("models")]
    public async Task<ActionResult<IEnumerable<string>>> GetModels([FromQuery] string? brand = null)
    {
        var models = await _bicycleService.GetUniqueModelsAsync(brand);
        return Ok(models);
    }

    // ═══ Publishing ═══

    [Authorize]
    [HttpPost("{id}/toggle-publish-website")]
    public async Task<ActionResult<BicycleDto>> TogglePublishWebsite(int id)
    {
        try
        {
            var bicycle = await _bicycleService.TogglePublishOnWebsiteAsync(id);
            return Ok(bicycle);
        }
        catch (KeyNotFoundException ex) { return NotFound(new { error = ex.Message }); }
    }

    [Authorize]
    [HttpPost("{id}/toggle-publish-kleinanzeigen")]
    public async Task<ActionResult<BicycleDto>> TogglePublishKleinanzeigen(int id)
    {
        try
        {
            var bicycle = await _bicycleService.TogglePublishOnKleinanzeigenAsync(id);
            return Ok(bicycle);
        }
        catch (KeyNotFoundException ex) { return NotFound(new { error = ex.Message }); }
    }

    [Authorize]
    [HttpPut("{id}/kleinanzeigen-anzeige-nr")]
    public async Task<ActionResult<BicycleDto>> SetKleinanzeigenAnzeigeNr(int id, [FromBody] SetAnzeigeNrRequest request)
    {
        try
        {
            var bicycle = await _bicycleService.SetKleinanzeigenAnzeigeNrAsync(id, request.AnzeigeNr);
            return Ok(bicycle);
        }
        catch (KeyNotFoundException ex) { return NotFound(new { error = ex.Message }); }
    }

    // ═══ Gallery Images ═══

    [HttpGet("{id}/gallery")]
    public async Task<ActionResult<IEnumerable<BicycleImageDto>>> GetGallery(int id)
    {
        try
        {
            var images = await _bicycleService.GetImagesAsync(id);
            return Ok(images);
        }
        catch (KeyNotFoundException ex) { return NotFound(new { error = ex.Message }); }
    }

    [Authorize]
    [HttpPost("{id}/gallery")]
    public async Task<ActionResult<BicycleImageDto>> UploadGalleryImage(int id, IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest(new { error = "No file uploaded" });

        try
        {
            // Use configured upload path (persistent volume in production)
            var basePath = _env.IsDevelopment()
                ? Path.Combine(_env.ContentRootPath, "uploads")
                : (_config["FileStorage:BasePath"] ?? "/app/data/uploads");
            var uploadsDir = Path.Combine(basePath, "gallery", id.ToString());
            Directory.CreateDirectory(uploadsDir);

            var fileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
            var absolutePath = Path.Combine(uploadsDir, fileName);

            using (var stream = new FileStream(absolutePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            // Store relative path for URL construction
            var relativePath = $"uploads/gallery/{id}/{fileName}";

            // Get current count for sort order
            var existingImages = await _bicycleService.GetImagesAsync(id);
            var sortOrder = existingImages.Count();

            var image = await _bicycleService.AddImageAsync(id, relativePath, sortOrder);
            return Ok(image);
        }
        catch (KeyNotFoundException ex) { return NotFound(new { error = ex.Message }); }
    }

    [Authorize]
    [HttpDelete("{id}/gallery/{imageId}")]
    public async Task<IActionResult> DeleteGalleryImage(int id, int imageId)
    {
        try
        {
            // Get image info before deleting
            var images = await _bicycleService.GetImagesAsync(id);
            var image = images.FirstOrDefault(i => i.Id == imageId);
            if (image != null)
            {
                // Resolve the actual file path
                var basePath = _env.IsDevelopment()
                    ? Directory.GetCurrentDirectory()
                    : Path.GetDirectoryName(_config["FileStorage:BasePath"]?.TrimEnd('/')) ?? "/app/data";
                var fullPath = Path.Combine(basePath, image.FilePath);
                if (System.IO.File.Exists(fullPath))
                {
                    System.IO.File.Delete(fullPath);
                }
            }

            await _bicycleService.DeleteImageAsync(id, imageId);
            return NoContent();
        }
        catch (KeyNotFoundException ex) { return NotFound(new { error = ex.Message }); }
    }
}
