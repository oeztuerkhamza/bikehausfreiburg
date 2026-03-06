using BikeHaus.Domain.Entities;

namespace BikeHaus.Domain.Interfaces;

public interface IInvoiceRepository : IRepository<Invoice>
{
    Task<IEnumerable<Invoice>> SearchAsync(string query);
    Task<string> GetNextRechnungsNummerAsync();
}
