using BikeHaus.Application.DTOs;
using BikeHaus.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BikeHaus.API.Controllers;

[ApiController]
[Route("api/email-accounts")]
[Authorize]
public class EmailAccountsController : ControllerBase
{
    private readonly IEmailAccountService _service;

    public EmailAccountsController(IEmailAccountService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<EmailAccountDto>>> GetAll()
    {
        return Ok(await _service.GetAllAsync());
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<EmailAccountDto>> GetById(int id)
    {
        var account = await _service.GetByIdAsync(id);
        if (account is null) return NotFound();
        return Ok(account);
    }

    [HttpPost]
    public async Task<ActionResult<EmailAccountDto>> Create([FromBody] CreateEmailAccountDto dto)
    {
        var account = await _service.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = account.Id }, account);
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<EmailAccountDto>> Update(int id, [FromBody] UpdateEmailAccountDto dto)
    {
        try
        {
            return Ok(await _service.UpdateAsync(id, dto));
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            await _service.DeleteAsync(id);
            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }

    [HttpGet("logs")]
    public async Task<ActionResult<IEnumerable<EmailLogDto>>> GetLogs([FromQuery] int page = 1, [FromQuery] int pageSize = 100)
    {
        return Ok(await _service.GetLogsAsync(page, pageSize));
    }
}
