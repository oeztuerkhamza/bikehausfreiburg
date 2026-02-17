using BikeHaus.Domain.Entities;

namespace BikeHaus.Domain.Interfaces;

public interface IDocumentRepository : IRepository<Document>
{
    Task<IEnumerable<Document>> GetByBicycleIdAsync(int bicycleId);
    Task<IEnumerable<Document>> GetByPurchaseIdAsync(int purchaseId);
    Task<IEnumerable<Document>> GetBySaleIdAsync(int saleId);
}
