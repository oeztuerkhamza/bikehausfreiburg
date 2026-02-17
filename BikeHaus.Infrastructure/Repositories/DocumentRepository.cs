using BikeHaus.Domain.Entities;
using BikeHaus.Domain.Interfaces;
using BikeHaus.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace BikeHaus.Infrastructure.Repositories;

public class DocumentRepository : Repository<Document>, IDocumentRepository
{
    public DocumentRepository(BikeHausDbContext context) : base(context) { }

    public async Task<IEnumerable<Document>> GetByBicycleIdAsync(int bicycleId)
    {
        return await _dbSet
            .Where(d => d.BicycleId == bicycleId)
            .OrderByDescending(d => d.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<Document>> GetByPurchaseIdAsync(int purchaseId)
    {
        return await _dbSet
            .Where(d => d.PurchaseId == purchaseId)
            .OrderByDescending(d => d.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<Document>> GetBySaleIdAsync(int saleId)
    {
        return await _dbSet
            .Where(d => d.SaleId == saleId)
            .OrderByDescending(d => d.CreatedAt)
            .ToListAsync();
    }
}
