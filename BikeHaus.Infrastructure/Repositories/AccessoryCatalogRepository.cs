using BikeHaus.Domain.Entities;
using BikeHaus.Domain.Interfaces;
using BikeHaus.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace BikeHaus.Infrastructure.Repositories;

public class AccessoryCatalogRepository : Repository<AccessoryCatalog>, IAccessoryCatalogRepository
{
    public AccessoryCatalogRepository(BikeHausDbContext context) : base(context) { }

    public async Task<IEnumerable<AccessoryCatalog>> GetActiveAsync()
    {
        return await _dbSet
            .Where(a => a.Aktiv)
            .OrderBy(a => a.Bezeichnung)
            .ToListAsync();
    }

    public async Task<IEnumerable<AccessoryCatalog>> SearchAsync(string query)
    {
        var term = query.ToLower();
        return await _dbSet
            .Where(a => a.Aktiv && (
                a.Bezeichnung.ToLower().Contains(term) ||
                (a.Kategorie != null && a.Kategorie.ToLower().Contains(term))))
            .OrderBy(a => a.Bezeichnung)
            .Take(10)
            .ToListAsync();
    }
}
