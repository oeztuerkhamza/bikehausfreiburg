using BikeHaus.Application.DTOs;
using BikeHaus.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace BikeHaus.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReturnsController : ControllerBase
{
    private readonly IReturnService _returnService;
    private readonly IPdfService _pdfService;

    public ReturnsController(IReturnService returnService, IPdfService pdfService)
    {
        _returnService = returnService;
        _pdfService = pdfService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ReturnListDto>>> GetAll()
    {
        var returns = await _returnService.GetAllAsync();
        return Ok(returns);
    }

    [HttpGet("paginated")]
    public async Task<ActionResult<PaginatedResult<ReturnListDto>>> GetPaginated(
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
        var result = await _returnService.GetPaginatedAsync(paginationParams);
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ReturnDto>> GetById(int id)
    {
        var returnDto = await _returnService.GetByIdAsync(id);
        if (returnDto == null)
            return NotFound();
        return Ok(returnDto);
    }

    [HttpPost]
    public async Task<ActionResult<ReturnDto>> Create([FromBody] ReturnCreateDto dto)
    {
        var returnDto = await _returnService.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = returnDto.Id }, returnDto);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            await _returnService.DeleteAsync(id);
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

    [HttpGet("{id}/rueckgabebeleg")]
    public async Task<IActionResult> DownloadRueckgabebeleg(int id)
    {
        var pdfBytes = await _pdfService.GenerateRueckgabebelegAsync(id);
        return File(pdfBytes, "application/pdf", $"Rueckgabebeleg_{id}.pdf");
    }
}
