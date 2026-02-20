using BikeHaus.Application.DTOs;
using BikeHaus.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace BikeHaus.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ExpensesController : ControllerBase
{
    private readonly IExpenseService _service;

    public ExpensesController(IExpenseService service)
    {
        _service = service;
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
}
