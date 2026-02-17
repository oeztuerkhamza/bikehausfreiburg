using BikeHaus.Domain.Entities;

namespace BikeHaus.Domain.Interfaces;

public interface ICustomerRepository : IRepository<Customer>
{
    Task<IEnumerable<Customer>> SearchAsync(string searchTerm);
    Task<Customer?> GetWithDetailsAsync(int id);
}
