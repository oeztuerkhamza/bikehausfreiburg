using BikeHaus.Application.DTOs;

namespace BikeHaus.Application.Interfaces;

public interface IKleinanzeigenService
{
    Task<IEnumerable<KleinanzeigenListingDto>> GetAllActiveListingsAsync();
    Task<IEnumerable<KleinanzeigenListingDto>> GetListingsByCategoryAsync(string category);
    Task<KleinanzeigenListingDto?> GetListingByIdAsync(int id);
    Task<IEnumerable<KleinanzeigenCategoryDto>> GetCategoriesAsync();
    Task<DateTime?> GetLastSyncTimeAsync();
    Task<PublicShopInfoDto?> GetPublicShopInfoAsync();
    Task<KleinanzeigenSyncResultDto> TriggerSyncAsync(CancellationToken cancellationToken = default);
    Task<int> FixCategoriesAsync();
    Task<int> DeleteAllListingsAsync();
}
