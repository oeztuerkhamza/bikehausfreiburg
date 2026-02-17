using BikeHaus.Application.DTOs;
using BikeHaus.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace BikeHaus.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SalesController : ControllerBase
{
    private readonly ISaleService _saleService;
    private readonly IPdfService _pdfService;

    public SalesController(ISaleService saleService, IPdfService pdfService)
    {
        _saleService = saleService;
        _pdfService = pdfService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<SaleListDto>>> GetAll()
    {
        var sales = await _saleService.GetAllAsync();
        return Ok(sales);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<SaleDto>> GetById(int id)
    {
        var sale = await _saleService.GetByIdAsync(id);
        if (sale == null)
            return NotFound();
        return Ok(sale);
    }

    [HttpPost]
    public async Task<ActionResult<SaleDto>> Create([FromBody] SaleCreateDto dto)
    {
        var sale = await _saleService.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = sale.Id }, sale);
    }

    [HttpGet("{id}/verkaufsbeleg")]
    public async Task<IActionResult> DownloadVerkaufsbeleg(int id)
    {
        var pdfBytes = await _pdfService.GenerateVerkaufsbelegAsync(id);
        return File(pdfBytes, "application/pdf", $"Verkaufsbeleg_{id}.pdf");
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            await _saleService.DeleteAsync(id);
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
}
