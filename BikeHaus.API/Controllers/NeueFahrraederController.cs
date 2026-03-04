using BikeHaus.Application.DTOs;
using BikeHaus.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BikeHaus.API.Controllers;

[ApiController]
[Route("api/neue-fahrraeder")]
[Authorize]
public class NeueFahrraederController : ControllerBase
{
    private readonly INeueFahrradService _service;
    private readonly IWebHostEnvironment _env;

    public NeueFahrraederController(INeueFahrradService service, IWebHostEnvironment env)
    {
        _service = service;
        _env = env;
    }

    /// <summary>
    /// Get all new bicycles (admin)
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var items = await _service.GetAllAsync();
        return Ok(items);
    }

    /// <summary>
    /// Get a single new bicycle by ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var item = await _service.GetByIdAsync(id);
        if (item == null) return NotFound();
        return Ok(item);
    }

    /// <summary>
    /// Get categories with counts
    /// </summary>
    [HttpGet("categories")]
    public async Task<IActionResult> GetCategories()
    {
        var categories = await _service.GetCategoriesAsync();
        return Ok(categories);
    }

    /// <summary>
    /// Create a new bicycle listing
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] NeueFahrradCreateDto dto)
    {
        var created = await _service.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    /// <summary>
    /// Update a new bicycle listing
    /// </summary>
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] NeueFahrradUpdateDto dto)
    {
        var updated = await _service.UpdateAsync(id, dto);
        if (updated == null) return NotFound();
        return Ok(updated);
    }

    /// <summary>
    /// Delete a new bicycle listing
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted = await _service.DeleteAsync(id);
        if (!deleted) return NotFound();
        return NoContent();
    }

    /// <summary>
    /// Upload images for a bicycle
    /// </summary>
    [HttpPost("{id}/images")]
    public async Task<IActionResult> UploadImages(int id, [FromForm] List<IFormFile> files)
    {
        var item = await _service.GetByIdAsync(id);
        if (item == null) return NotFound();

        var uploadsDir = Path.Combine(Directory.GetCurrentDirectory(), "uploads", "neue-fahrraeder", id.ToString());
        Directory.CreateDirectory(uploadsDir);

        var results = new List<NeueFahrradImageDto>();
        var sortOrder = item.Images.Count;

        foreach (var file in files)
        {
            if (file.Length == 0) continue;

            var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
            var fileName = $"{Guid.NewGuid()}{ext}";
            var filePath = Path.Combine(uploadsDir, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            var relativePath = $"/uploads/neue-fahrraeder/{id}/{fileName}";
            var imageDto = await _service.AddImageAsync(id, relativePath, sortOrder++);
            results.Add(imageDto);
        }

        return Ok(results);
    }

    /// <summary>
    /// Delete a single image
    /// </summary>
    [HttpDelete("images/{imageId}")]
    public async Task<IActionResult> DeleteImage(int imageId)
    {
        var deleted = await _service.DeleteImageAsync(imageId);
        if (!deleted) return NotFound();
        return NoContent();
    }
}
