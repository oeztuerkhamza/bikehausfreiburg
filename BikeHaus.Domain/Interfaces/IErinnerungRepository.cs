using BikeHaus.Domain.Entities;

namespace BikeHaus.Domain.Interfaces;

public interface IErinnerungRepository : IRepository<Erinnerung>
{
    Task<IEnumerable<Erinnerung>> GetAllWithFotosAsync();
    Task<IEnumerable<Erinnerung>> GetPendingAsync();
    Task<(IEnumerable<Erinnerung> Items, int TotalCount)> GetApprovedAsync(int page, int pageSize);
    Task<IEnumerable<Erinnerung>> GetLatestApprovedAsync(int count);
    Task<Erinnerung?> GetWithFotosAsync(int id);
}
