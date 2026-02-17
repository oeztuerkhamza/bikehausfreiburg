using BikeHaus.Application.DTOs;
using BikeHaus.Application.Interfaces;
using BikeHaus.Application.Mappings;
using BikeHaus.Domain.Entities;
using BikeHaus.Domain.Interfaces;

namespace BikeHaus.Application.Services;

public class DocumentService : IDocumentService
{
    private readonly IDocumentRepository _repository;
    private readonly IFileStorageService _fileStorage;

    public DocumentService(IDocumentRepository repository, IFileStorageService fileStorage)
    {
        _repository = repository;
        _fileStorage = fileStorage;
    }

    public async Task<IEnumerable<DocumentDto>> GetAllAsync()
    {
        var documents = await _repository.GetAllAsync();
        return documents.Select(d => d.ToDto());
    }

    public async Task<DocumentDto?> GetByIdAsync(int id)
    {
        var document = await _repository.GetByIdAsync(id);
        return document?.ToDto();
    }

    public async Task<IEnumerable<DocumentDto>> GetByBicycleIdAsync(int bicycleId)
    {
        var documents = await _repository.GetByBicycleIdAsync(bicycleId);
        return documents.Select(d => d.ToDto());
    }

    public async Task<DocumentDto> UploadAsync(Stream fileStream, string fileName, string contentType, DocumentUploadDto dto)
    {
        var folder = dto.DocumentType.ToString().ToLower();
        var savedPath = await _fileStorage.SaveFileAsync(fileStream, fileName, folder);

        var document = new Document
        {
            FileName = fileName,
            FilePath = savedPath,
            ContentType = contentType,
            FileSize = fileStream.Length,
            DocumentType = dto.DocumentType,
            BicycleId = dto.BicycleId,
            PurchaseId = dto.PurchaseId,
            SaleId = dto.SaleId
        };

        var created = await _repository.AddAsync(document);
        return created.ToDto();
    }

    public async Task<(Stream FileStream, string ContentType, string FileName)> DownloadAsync(int id)
    {
        var document = await _repository.GetByIdAsync(id)
            ?? throw new KeyNotFoundException($"Document with ID {id} not found.");

        var fileStream = await _fileStorage.GetFileAsync(document.FilePath);
        return (fileStream, document.ContentType, document.FileName);
    }

    public async Task DeleteAsync(int id)
    {
        var document = await _repository.GetByIdAsync(id)
            ?? throw new KeyNotFoundException($"Document with ID {id} not found.");

        await _fileStorage.DeleteFileAsync(document.FilePath);
        await _repository.DeleteAsync(id);
    }
}
