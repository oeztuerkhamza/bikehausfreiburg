using BikeHaus.Application.DTOs;
using BikeHaus.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace BikeHaus.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DocumentsController : ControllerBase
{
    private readonly IDocumentService _documentService;

    public DocumentsController(IDocumentService documentService)
    {
        _documentService = documentService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<DocumentDto>>> GetAll()
    {
        var documents = await _documentService.GetAllAsync();
        return Ok(documents);
    }

    [HttpGet("bicycle/{bicycleId}")]
    public async Task<ActionResult<IEnumerable<DocumentDto>>> GetByBicycle(int bicycleId)
    {
        var documents = await _documentService.GetByBicycleIdAsync(bicycleId);
        return Ok(documents);
    }

    [HttpPost]
    public async Task<ActionResult<DocumentDto>> Upload([FromForm] IFormFile file, [FromForm] DocumentUploadDto dto)
    {
        using var stream = file.OpenReadStream();
        var document = await _documentService.UploadAsync(stream, file.FileName, file.ContentType, dto);
        return Ok(document);
    }

    [HttpGet("{id}/download")]
    public async Task<IActionResult> Download(int id)
    {
        var (fileStream, contentType, fileName) = await _documentService.DownloadAsync(id);
        return File(fileStream, contentType, fileName);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        await _documentService.DeleteAsync(id);
        return NoContent();
    }
}
