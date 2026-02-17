using BikeHaus.Application.DTOs;

namespace BikeHaus.Application.Interfaces;

public interface IDocumentService
{
    Task<IEnumerable<DocumentDto>> GetAllAsync();
    Task<DocumentDto?> GetByIdAsync(int id);
    Task<IEnumerable<DocumentDto>> GetByBicycleIdAsync(int bicycleId);
    Task<DocumentDto> UploadAsync(Stream fileStream, string fileName, string contentType, DocumentUploadDto dto);
    Task<(Stream FileStream, string ContentType, string FileName)> DownloadAsync(int id);
    Task DeleteAsync(int id);
}
