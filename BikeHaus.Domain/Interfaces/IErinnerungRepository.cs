using BikeHaus.Domain.Entities;

namespace BikeHaus.Domain.Interfaces;

public interface IErinnerungRepository : IRepository<Erinnerung>
{
    Task<IEnumerable<Erinnerung>> GetAllWithFotosAsync();
    Task<IEnumerable<Erinnerung>> GetPendingAsync();
    Task<(IEnumerable<Erinnerung> Items, int TotalCount)> GetApprovedAsync(int page, int pageSize);
    Task<IEnumerable<Erinnerung>> GetLatestApprovedAsync(int count);
    Task<Erinnerung?> GetWithFotosAsync(int id);

    /// <summary>Zählt einen Aufruf hoch (nur für freigegebene). Gibt den neuen Stand zurück oder null.</summary>
    Task<int?> IncrementViewAsync(int id);

    // E-Mail-Verifizierung
    Task AddVerificationAsync(ErinnerungVerification verification);
    Task<ErinnerungVerification?> GetActiveVerificationAsync(string email, string code);
    Task MarkVerificationUsedAsync(ErinnerungVerification verification);
    Task<bool> HasValidVerificationAsync(string email, string code);
}
