using BikeHaus.Application.DTOs;
using BikeHaus.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BikeHaus.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class SalesController : ControllerBase
{
    private readonly ISaleService _saleService;
    private readonly IPdfService _pdfService;
    private readonly IEmailService _emailService;

    public SalesController(ISaleService saleService, IPdfService pdfService, IEmailService emailService)
    {
        _saleService = saleService;
        _pdfService = pdfService;
        _emailService = emailService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<SaleListDto>>> GetAll()
    {
        var sales = await _saleService.GetAllAsync();
        return Ok(sales);
    }

    [HttpGet("paginated")]
    public async Task<ActionResult<PaginatedResult<SaleListDto>>> GetPaginated(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? status = null,
        [FromQuery] string? search = null,
        [FromQuery] string? marke = null,
        [FromQuery] string? fahrradtyp = null,
        [FromQuery] string? farbe = null)
    {
        var paginationParams = new PaginationParams
        {
            Page = page,
            PageSize = pageSize,
            Status = status,
            SearchTerm = search,
            Marke = marke,
            Fahrradtyp = fahrradtyp,
            Farbe = farbe
        };
        var result = await _saleService.GetPaginatedAsync(paginationParams);
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<SaleDto>> GetById(int id)
    {
        var sale = await _saleService.GetByIdAsync(id);
        if (sale == null)
            return NotFound();
        return Ok(sale);
    }

    [HttpGet("bicycle/{bicycleId}")]
    public async Task<ActionResult<SaleDto>> GetByBicycleId(int bicycleId)
    {
        var sale = await _saleService.GetByBicycleIdAsync(bicycleId);
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

    [HttpGet("next-belegnummer")]
    public async Task<ActionResult<object>> GetNextBelegNummer()
    {
        var nummer = await _saleService.GetNextBelegNummerAsync();
        return Ok(new { belegNummer = nummer });
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<SaleDto>> Update(int id, [FromBody] SaleUpdateDto dto)
    {
        try
        {
            var sale = await _saleService.UpdateAsync(id, dto);
            return Ok(sale);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
    }

    [HttpGet("{id}/verkaufsbeleg")]
    public async Task<IActionResult> DownloadVerkaufsbeleg(int id)
    {
        var pdfBytes = await _pdfService.GenerateVerkaufsbelegAsync(id);
        return File(pdfBytes, "application/pdf", $"Verkaufsbeleg_{id}.pdf");
    }

    [HttpPost("{id}/send-receipt")]
    public async Task<IActionResult> SendReceipt(int id, [FromQuery] string? overrideEmail = null)
    {
        var sale = await _saleService.GetByIdAsync(id);
        if (sale == null)
            return NotFound(new { error = "Verkauf nicht gefunden." });

        var toEmail = overrideEmail ?? sale.Buyer.Email;
        if (string.IsNullOrWhiteSpace(toEmail))
            return BadRequest(new { error = "Keine E-Mail-Adresse für diesen Käufer hinterlegt." });

        var pdfBytes = await _pdfService.GenerateVerkaufsbelegAsync(id);
        await _emailService.SendSaleReceiptAsync(toEmail, sale.Buyer.FullName, sale.BelegNummer, pdfBytes);
        return Ok(new { message = $"Rechnung {sale.BelegNummer} wurde an {toEmail} gesendet." });
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
