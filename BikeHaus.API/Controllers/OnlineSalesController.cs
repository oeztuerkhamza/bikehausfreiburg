using BikeHaus.Application.Interfaces;
using BikeHaus.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BikeHaus.API.Controllers;

[Authorize]
[ApiController]
[Route("api/online-sales")]
public class OnlineSalesController : ControllerBase
{
    private readonly BikeHausDbContext _db;
    private readonly IPdfService _pdfService;
    private readonly IMolliePaymentClient _molliePaymentClient;
    private readonly IConfiguration _config;
    private readonly ILogger<OnlineSalesController> _logger;

    public OnlineSalesController(
        BikeHausDbContext db,
        IPdfService pdfService,
        IMolliePaymentClient molliePaymentClient,
        IConfiguration config,
        ILogger<OnlineSalesController> logger)
    {
        _db = db;
        _pdfService = pdfService;
        _molliePaymentClient = molliePaymentClient;
        _config = config;
        _logger = logger;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] bool? verarbeitet = null)
    {
        var query = _db.OnlineSales.AsQueryable();

        if (verarbeitet.HasValue)
            query = query.Where(x => x.IsVerarbeitet == verarbeitet.Value);

        var total = await query.CountAsync();
        var frontendBaseUrl = (_config["App:FrontendBaseUrl"] ?? "https://bikehausfreiburg.com").TrimEnd('/');

        var items = await query
            .OrderByDescending(x => x.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(x => new
            {
                x.Id,
                x.BikeId,
                x.BikeTitle,
                x.Preis,
                x.Vorname,
                x.Nachname,
                x.Email,
                x.Adresse,
                x.Abholtag,
                x.MolliePaymentId,
                x.IsVerarbeitet,
                x.CreatedAt,
                BikeUrl = x.BikeId > 0 ? $"{frontendBaseUrl}/de/showroom/{x.BikeId}" : null,
            })
            .ToListAsync();

        return Ok(new { total, items });
    }

    [HttpGet("pending-count")]
    public async Task<IActionResult> GetPendingCount()
    {
        var count = await _db.OnlineSales.CountAsync(x => !x.IsVerarbeitet);
        return Ok(new { count });
    }

    [HttpPatch("{id}/mark-processed")]
    public async Task<IActionResult> MarkProcessed(int id)
    {
        var sale = await _db.OnlineSales.FindAsync(id);
        if (sale == null) return NotFound();
        sale.IsVerarbeitet = true;
        sale.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] OnlineSaleUpdateDto dto)
    {
        var sale = await _db.OnlineSales.FindAsync(id);
        if (sale == null) return NotFound();
        sale.Vorname = dto.Vorname ?? sale.Vorname;
        sale.Nachname = dto.Nachname ?? sale.Nachname;
        sale.Email = dto.Email ?? sale.Email;
        sale.Adresse = dto.Adresse ?? sale.Adresse;
        sale.Abholtag = dto.Abholtag ?? sale.Abholtag;
        sale.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpPost("{id}/refund")]
    public async Task<IActionResult> Refund(int id)
    {
        var sale = await _db.OnlineSales.FindAsync(id);
        if (sale == null) return NotFound();
        if (string.IsNullOrWhiteSpace(sale.MolliePaymentId))
            return BadRequest(new { error = "MolliePaymentId fehlt" });

        try
        {
            var refundId = await _molliePaymentClient.RefundPaymentAsync(sale.MolliePaymentId, sale.Preis);
            sale.IsVerarbeitet = true;
            sale.UpdatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();

            return Ok(new
            {
                refundId,
                status = "iade",
                isVerarbeitet = sale.IsVerarbeitet,
            });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }

    [HttpGet("{id}/beleg")]
    public async Task<IActionResult> DownloadBeleg(int id)
    {
        var sale = await _db.OnlineSales.FindAsync(id);
        if (sale == null) return NotFound();

        try
        {
            var pdfBytes = await _pdfService.GenerateOnlineBelegAsync(id);
            return File(pdfBytes, "application/pdf", $"Online-Bestellung_{id}.pdf");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Online-Beleg konnte nicht erstellt werden. OnlineSaleId={OnlineSaleId}", id);
            return StatusCode(500, new { error = "Online-Beleg konnte nicht erstellt werden." });
        }
    }
}

public record OnlineSaleUpdateDto(
    string? Vorname,
    string? Nachname,
    string? Email,
    string? Adresse,
    string? Abholtag);
