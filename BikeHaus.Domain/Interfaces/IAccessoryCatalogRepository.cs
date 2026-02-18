using BikeHaus.Domain.Entities;

namespace BikeHaus.Domain.Interfaces;

public interface IAccessoryCatalogRepository : IRepository<AccessoryCatalog>
{
    Task<IEnumerable<AccessoryCatalog>> GetActiveAsync();
    Task<IEnumerable<AccessoryCatalog>> SearchAsync(string query);
}
