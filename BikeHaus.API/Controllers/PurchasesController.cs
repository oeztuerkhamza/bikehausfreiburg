using BikeHaus.Application.DTOs;
using BikeHaus.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace BikeHaus.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PurchasesController : ControllerBase
{
    private readonly IPurchaseService _purchaseService;
    private readonly IPdfService _pdfService;

    public PurchasesController(IPurchaseService purchaseService, IPdfService pdfService)
    {
        _purchaseService = purchaseService;
        _pdfService = pdfService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<PurchaseListDto>>> GetAll()
    {
        var purchases = await _purchaseService.GetAllAsync();
        return Ok(purchases);
    }

    [HttpGet("paginated")]
    public async Task<ActionResult<PaginatedResult<PurchaseListDto>>> GetPaginated(
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
        var result = await _purchaseService.GetPaginatedAsync(paginationParams);
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<PurchaseDto>> GetById(int id)
    {
        var purchase = await _purchaseService.GetByIdAsync(id);
        if (purchase == null)
            return NotFound();
        return Ok(purchase);
    }

    [HttpGet("by-bicycle/{bicycleId}")]
    public async Task<ActionResult<PurchaseDto>> GetByBicycleId(int bicycleId)
    {
        var purchase = await _purchaseService.GetByBicycleIdAsync(bicycleId);
        if (purchase == null)
            return NotFound();
        return Ok(purchase);
    }

    [HttpPost]
    public async Task<ActionResult<PurchaseDto>> Create([FromBody] PurchaseCreateDto dto)
    {
        var purchase = await _purchaseService.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = purchase.Id }, purchase);
    }

    [HttpPost("bulk")]
    public async Task<ActionResult<BulkPurchaseResultDto>> CreateBulk([FromBody] BulkPurchaseCreateDto dto)
    {
        try
        {
            var result = await _purchaseService.CreateBulkAsync(dto);
            return Ok(result);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpGet("next-belegnummer")]
    public async Task<ActionResult<object>> GetNextBelegNummer()
    {
        var nummer = await _purchaseService.GetNextBelegNummerAsync();
        return Ok(new { belegNummer = nummer });
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<PurchaseDto>> Update(int id, [FromBody] PurchaseUpdateDto dto)
    {
        try
        {
            var purchase = await _purchaseService.UpdateAsync(id, dto);
            return Ok(purchase);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
    }

    [HttpGet("{id}/kaufbeleg")]
    public async Task<IActionResult> DownloadKaufbeleg(int id)
    {
        var pdfBytes = await _pdfService.GenerateKaufbelegAsync(id);
        return File(pdfBytes, "application/pdf", $"Kaufbeleg_{id}.pdf");
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            await _purchaseService.DeleteAsync(id);
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
