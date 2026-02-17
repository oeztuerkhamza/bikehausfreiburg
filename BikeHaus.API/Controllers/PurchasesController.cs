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

    [HttpGet("{id}")]
    public async Task<ActionResult<PurchaseDto>> GetById(int id)
    {
        var purchase = await _purchaseService.GetByIdAsync(id);
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
