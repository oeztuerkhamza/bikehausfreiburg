using BikeHaus.Domain.Entities;

namespace BikeHaus.Domain.Interfaces;

public interface IShopSettingsRepository : IRepository<ShopSettings>
{
    Task<ShopSettings?> GetSettingsAsync();
}
