using BikeHaus.Application.DTOs;
using BikeHaus.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BikeHaus.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class InvoicesController : ControllerBase
{
    private readonly IInvoiceService _service;
    private readonly IPdfService _pdfService;

    public InvoicesController(IInvoiceService service, IPdfService pdfService)
    {
        _service = service;
        _pdfService = pdfService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<InvoiceListDto>>> GetAll()
    {
        var invoices = await _service.GetAllAsync();
        return Ok(invoices);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<InvoiceDto>> GetById(int id)
    {
        var invoice = await _service.GetByIdAsync(id);
        if (invoice == null) return NotFound();
        return Ok(invoice);
    }

    [HttpGet("search")]
    public async Task<ActionResult<IEnumerable<InvoiceListDto>>> Search([FromQuery] string q)
    {
        if (string.IsNullOrWhiteSpace(q))
            return Ok(Enumerable.Empty<InvoiceListDto>());
        var invoices = await _service.SearchAsync(q);
        return Ok(invoices);
    }

    [HttpGet("next-number")]
    public async Task<ActionResult<object>> GetNextNumber()
    {
        var nummer = await _service.GetNextRechnungsNummerAsync();
        return Ok(new { rechnungsNummer = nummer });
    }

    [HttpPost]
    public async Task<ActionResult<InvoiceDto>> Create(InvoiceCreateDto dto)
    {
        var created = await _service.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<InvoiceDto>> Update(int id, InvoiceUpdateDto dto)
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

    [HttpGet("{id}/pdf")]
    public async Task<IActionResult> GetPdf(int id)
    {
        var invoice = await _service.GetByIdAsync(id);
        if (invoice == null) return NotFound();

        var pdf = await _pdfService.GenerateRechnungAsync(id);
        return File(pdf, "application/pdf", $"Rechnung-{invoice.RechnungsNummer}.pdf");
    }
}
