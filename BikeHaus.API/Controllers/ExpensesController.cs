using BikeHaus.Application.DTOs;
using BikeHaus.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BikeHaus.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class ExpensesController : ControllerBase
{
    private readonly IExpenseService _service;
    private readonly IWebHostEnvironment _env;
    private readonly IConfiguration _config;

    public ExpensesController(IExpenseService service, IWebHostEnvironment env, IConfiguration config)
    {
        _service = service;
        _env = env;
        _config = config;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ExpenseListDto>>> GetAll()
    {
        var expenses = await _service.GetAllAsync();
        return Ok(expenses);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ExpenseDto>> GetById(int id)
    {
        var expense = await _service.GetByIdAsync(id);
        if (expense == null) return NotFound();
        return Ok(expense);
    }

    [HttpGet("search")]
    public async Task<ActionResult<IEnumerable<ExpenseListDto>>> Search([FromQuery] string q)
    {
        if (string.IsNullOrWhiteSpace(q))
            return Ok(Enumerable.Empty<ExpenseListDto>());
        var expenses = await _service.SearchAsync(q);
        return Ok(expenses);
    }

    [HttpGet("range")]
    public async Task<ActionResult<IEnumerable<ExpenseListDto>>> GetByDateRange(
        [FromQuery] DateTime startDate,
        [FromQuery] DateTime endDate)
    {
        var expenses = await _service.GetByDateRangeAsync(startDate, endDate);
        return Ok(expenses);
    }

    [HttpPost]
    public async Task<ActionResult<ExpenseDto>> Create(ExpenseCreateDto dto)
    {
        var created = await _service.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ExpenseDto>> Update(int id, ExpenseUpdateDto dto)
    {
        var updated = await _service.UpdateAsync(id, dto);
        if (updated == null) return NotFound();
        return Ok(updated);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var success = await _service.DeleteAsync(id);
        if (!success) return NotFound();
        return NoContent();
    }

    [HttpPost("{id}/document")]
    public async Task<ActionResult<ExpenseDto>> UploadDocument(int id, [FromForm] IFormFile file)
    {
        var expense = await _service.GetByIdAsync(id);
        if (expense == null) return NotFound();
        if (file == null || file.Length == 0) return BadRequest("No file provided");

        var basePath = _env.IsDevelopment()
            ? Path.Combine(_env.ContentRootPath, "uploads")
            : (_config["FileStorage:BasePath"] ?? "/app/data/uploads");
        var uploadsDir = Path.Combine(basePath, "expenses", id.ToString());
        Directory.CreateDirectory(uploadsDir);

        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        var fileName = $"{Guid.NewGuid()}{ext}";
        var filePath = Path.Combine(uploadsDir, fileName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        var relativePath = $"/uploads/expenses/{id}/{fileName}";
        var updated = await _service.UpdateDocumentPathAsync(id, relativePath);
        return Ok(updated);
    }

    [HttpDelete("{id}/document")]
    public async Task<IActionResult> DeleteDocument(int id)
    {
        var expense = await _service.GetByIdAsync(id);
        if (expense == null) return NotFound();
        if (string.IsNullOrEmpty(expense.BelegDatei)) return NoContent();

        var basePath = _env.IsDevelopment()
            ? Path.Combine(_env.ContentRootPath, "uploads")
            : (_config["FileStorage:BasePath"] ?? "/app/data/uploads");
        var fullPath = Path.Combine(basePath, expense.BelegDatei.TrimStart('/').Replace("/uploads/", ""));
        if (System.IO.File.Exists(fullPath))
            System.IO.File.Delete(fullPath);

        await _service.UpdateDocumentPathAsync(id, null);
        return NoContent();
    }
}
