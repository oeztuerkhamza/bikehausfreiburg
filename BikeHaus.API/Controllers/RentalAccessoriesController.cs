using BikeHaus.Application.DTOs;
using BikeHaus.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BikeHaus.API.Controllers;

[Authorize]
[ApiController]
[Route("api/rental-accessories")]
public class RentalAccessoriesController : ControllerBase
{
    private readonly IRentalAccessoryService _service;
    private readonly IWebHostEnvironment _env;
    private readonly IConfiguration _config;

    public RentalAccessoriesController(IRentalAccessoryService service, IWebHostEnvironment env, IConfiguration config)
    {
        _service = service;
        _env = env;
        _config = config;
    }

    private string ResolveUploadsBasePath() => _env.IsDevelopment()
        ? Path.Combine(_env.ContentRootPath, "uploads")
        : (_config["FileStorage:BasePath"] ?? "/app/data/uploads");

    [HttpGet]
    public async Task<ActionResult<IEnumerable<RentalAccessoryListDto>>> GetAll()
    {
        var items = await _service.GetAllAsync();
        return Ok(items);
    }

    [HttpGet("active")]
    public async Task<ActionResult<IEnumerable<RentalAccessoryListDto>>> GetActive()
    {
        var items = await _service.GetActiveAsync();
        return Ok(items);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<RentalAccessoryDto>> GetById(int id)
    {
        var item = await _service.GetByIdAsync(id);
        if (item == null) return NotFound();
        return Ok(item);
    }

    [HttpPost]
    public async Task<ActionResult<RentalAccessoryDto>> Create(RentalAccessoryCreateDto dto)
    {
        var created = await _service.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<RentalAccessoryDto>> Update(int id, RentalAccessoryUpdateDto dto)
    {
        try
        {
            var updated = await _service.UpdateAsync(id, dto);
            return Ok(updated);
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }

    [HttpPost("{id}/foto")]
    public async Task<ActionResult<RentalAccessoryDto>> UploadFoto(int id, IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest(new { error = "No file uploaded" });

        try
        {
            var basePath = ResolveUploadsBasePath();
            var uploadsDir = Path.Combine(basePath, "rental-accessories", id.ToString());
            Directory.CreateDirectory(uploadsDir);

            // Replace an existing photo (best effort delete of the old file).
            var oldPath = await _service.GetBildPfadAsync(id);
            DeletePhysicalUpload(basePath, oldPath);

            var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
            var fileName = $"{Guid.NewGuid()}{ext}";
            var filePath = Path.Combine(uploadsDir, fileName);
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            var relativePath = $"/uploads/rental-accessories/{id}/{fileName}";
            var updated = await _service.SetBildPfadAsync(id, relativePath);
            return Ok(updated);
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }

    [HttpDelete("{id}/foto")]
    public async Task<IActionResult> DeleteFoto(int id)
    {
        try
        {
            var oldPath = await _service.GetBildPfadAsync(id);
            DeletePhysicalUpload(ResolveUploadsBasePath(), oldPath);
            await _service.SetBildPfadAsync(id, null);
            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }

    private static void DeletePhysicalUpload(string basePath, string? storedPath)
    {
        if (string.IsNullOrWhiteSpace(storedPath)) return;
        // storedPath looks like "/uploads/rental-accessories/5/guid.jpg"
        var relative = storedPath.TrimStart('/');
        if (relative.StartsWith("uploads/", StringComparison.OrdinalIgnoreCase))
            relative = relative.Substring("uploads/".Length);
        var fullPath = Path.Combine(basePath, relative.Replace('/', Path.DirectorySeparatorChar));
        try { if (System.IO.File.Exists(fullPath)) System.IO.File.Delete(fullPath); }
        catch { /* best effort */ }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        await _service.DeleteAsync(id);
        return NoContent();
    }
}
