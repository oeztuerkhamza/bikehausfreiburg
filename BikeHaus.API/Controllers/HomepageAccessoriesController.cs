using BikeHaus.Application.DTOs;
using BikeHaus.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BikeHaus.API.Controllers;

[ApiController]
[Route("api/homepage-accessories")]
[Authorize]
public class HomepageAccessoriesController : ControllerBase
{
    private readonly IHomepageAccessoryService _service;
    private readonly IWebHostEnvironment _env;
    private readonly IConfiguration _config;

    public HomepageAccessoriesController(IHomepageAccessoryService service, IWebHostEnvironment env, IConfiguration config)
    {
        _service = service;
        _env = env;
        _config = config;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var items = await _service.GetAllAsync();
        return Ok(items);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var item = await _service.GetByIdAsync(id);
        if (item == null) return NotFound();
        return Ok(item);
    }

    [HttpGet("categories")]
    public async Task<IActionResult> GetCategories()
    {
        var categories = await _service.GetCategoriesAsync();
        return Ok(categories);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] HomepageAccessoryCreateDto dto)
    {
        var created = await _service.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] HomepageAccessoryUpdateDto dto)
    {
        var updated = await _service.UpdateAsync(id, dto);
        if (updated == null) return NotFound();
        return Ok(updated);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted = await _service.DeleteAsync(id);
        if (!deleted) return NotFound();
        return NoContent();
    }

    [HttpPost("{id}/images")]
    public async Task<IActionResult> UploadImages(int id, [FromForm] List<IFormFile> files)
    {
        var item = await _service.GetByIdAsync(id);
        if (item == null) return NotFound();

        var basePath = _env.IsDevelopment()
            ? Path.Combine(_env.ContentRootPath, "uploads")
            : (_config["FileStorage:BasePath"] ?? "/app/data/uploads");
        var uploadsDir = Path.Combine(basePath, "homepage-accessories", id.ToString());
        Directory.CreateDirectory(uploadsDir);

        var results = new List<HomepageAccessoryImageDto>();
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

            var relativePath = $"/uploads/homepage-accessories/{id}/{fileName}";
            var imageDto = await _service.AddImageAsync(id, relativePath, sortOrder++);
            results.Add(imageDto);
        }

        return Ok(results);
    }

    [HttpDelete("images/{imageId}")]
    public async Task<IActionResult> DeleteImage(int imageId)
    {
        var deleted = await _service.DeleteImageAsync(imageId);
        if (!deleted) return NotFound();
        return NoContent();
    }
}
