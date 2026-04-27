using BikeHaus.Domain.Entities;

namespace BikeHaus.Domain.Interfaces;

public interface IRentalAccessoryRepository : IRepository<RentalAccessory>
{
    Task<IEnumerable<RentalAccessory>> GetActiveAsync();
}
