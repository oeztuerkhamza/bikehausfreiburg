using BikeHaus.Application.DTOs;

namespace BikeHaus.Application.Interfaces;

public interface IDocumentService
{
    Task<IEnumerable<DocumentDto>> GetAllAsync();
    Task<DocumentDto?> GetByIdAsync(int id);
    Task<IEnumerable<DocumentDto>> GetByBicycleIdAsync(int bicycleId);
    Task<IEnumerable<DocumentDto>> GetByPurchaseIdAsync(int purchaseId);
    Task<IEnumerable<DocumentDto>> GetBySaleIdAsync(int saleId);
    Task<DocumentDto> UploadAsync(Stream fileStream, string fileName, string contentType, DocumentUploadDto dto);
    Task<(Stream FileStream, string ContentType, string FileName)> DownloadAsync(int id);
    Task DeleteAsync(int id);
}
