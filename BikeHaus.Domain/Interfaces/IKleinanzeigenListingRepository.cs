using BikeHaus.Domain.Entities;

namespace BikeHaus.Domain.Interfaces;

public interface IKleinanzeigenListingRepository : IRepository<KleinanzeigenListing>
{
    Task<IEnumerable<KleinanzeigenListing>> GetAllActiveAsync();
    Task<IEnumerable<KleinanzeigenListing>> GetByCategoryAsync(string category);
    Task<KleinanzeigenListing?> GetByExternalIdAsync(string externalId);
    Task<KleinanzeigenListing?> GetWithImagesAsync(int id);
    Task<IEnumerable<string>> GetCategoriesAsync();
    Task DeactivateRemovedAsync(List<string> activeExternalIds);
    Task<DateTime?> GetLastScrapeTimeAsync();
}
