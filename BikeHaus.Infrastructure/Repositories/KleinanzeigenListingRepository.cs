using BikeHaus.Domain.Entities;
using BikeHaus.Domain.Interfaces;
using BikeHaus.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace BikeHaus.Infrastructure.Repositories;

public class KleinanzeigenListingRepository : Repository<KleinanzeigenListing>, IKleinanzeigenListingRepository
{
    public KleinanzeigenListingRepository(BikeHausDbContext context) : base(context) { }

    public async Task<IEnumerable<KleinanzeigenListing>> GetAllActiveAsync()
    {
        return await _dbSet
            .Where(l => l.IsActive)
            .Include(l => l.Images.OrderBy(i => i.SortOrder))
            .OrderByDescending(l => l.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<KleinanzeigenListing>> GetByCategoryAsync(string category)
    {
        return await _dbSet
            .Where(l => l.IsActive && l.Category == category)
            .Include(l => l.Images.OrderBy(i => i.SortOrder))
            .OrderByDescending(l => l.CreatedAt)
            .ToListAsync();
    }

    public async Task<KleinanzeigenListing?> GetByExternalIdAsync(string externalId)
    {
        return await _dbSet
            .Include(l => l.Images)
            .FirstOrDefaultAsync(l => l.ExternalId == externalId);
    }

    public async Task<KleinanzeigenListing?> GetWithImagesAsync(int id)
    {
        return await _dbSet
            .Include(l => l.Images.OrderBy(i => i.SortOrder))
            .FirstOrDefaultAsync(l => l.Id == id);
    }

    public async Task<IEnumerable<string>> GetCategoriesAsync()
    {
        return await _dbSet
            .Where(l => l.IsActive && l.Category != null)
            .Select(l => l.Category!)
            .Distinct()
            .OrderBy(c => c)
            .ToListAsync();
    }

    public async Task DeactivateRemovedAsync(List<string> activeExternalIds)
    {
        var toDeactivate = await _dbSet
            .Where(l => l.IsActive && !activeExternalIds.Contains(l.ExternalId))
            .ToListAsync();

        foreach (var listing in toDeactivate)
        {
            listing.IsActive = false;
            listing.UpdatedAt = DateTime.UtcNow;
        }

        if (toDeactivate.Any())
            await _context.SaveChangesAsync();
    }

    public async Task<DateTime?> GetLastScrapeTimeAsync()
    {
        return await _dbSet
            .Where(l => l.LastScrapedAt != null)
            .MaxAsync(l => (DateTime?)l.LastScrapedAt);
    }
}
