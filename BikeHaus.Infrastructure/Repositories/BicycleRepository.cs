using System.Linq.Expressions;
using BikeHaus.Domain;
using BikeHaus.Domain.Entities;
using BikeHaus.Domain.Enums;
using BikeHaus.Domain.Interfaces;
using BikeHaus.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace BikeHaus.Infrastructure.Repositories;

public class BicycleRepository : Repository<Bicycle>, IBicycleRepository
{
    public BicycleRepository(BikeHausDbContext context) : base(context) { }

    public async Task<IEnumerable<Bicycle>> GetAvailableBicyclesAsync()
    {
        return await _dbSet
            .Where(b => b.Status == BikeStatus.Available)
            .OrderByDescending(b => b.CreatedAt)
            .ToListAsync();
    }

    public async Task<Bicycle?> GetByRahmennummerAsync(string rahmennummer)
    {
        return await _dbSet.FirstOrDefaultAsync(b => b.Rahmennummer == rahmennummer);
    }

    public async Task<List<string>> GetDuplicateRahmennummernAsync()
    {
        // Project the non-empty frame numbers, then group in memory (trim +
        // case-insensitive) so quirks like trailing spaces or mixed case still
        // count as the same number. Returns the normalised duplicate values.
        var all = await _dbSet
            .Where(b => b.Rahmennummer != null && b.Rahmennummer != "")
            .Select(b => b.Rahmennummer!)
            .ToListAsync();

        return all
            .GroupBy(r => r.Trim().ToUpperInvariant())
            .Where(g => g.Count() > 1)
            .Select(g => g.Key)
            .ToList();
    }

    public async Task<Dictionary<string, int>> GetLagernummernByRahmennummerAsync()
    {
        // Pull the bikes that actually carry a stock number, then normalise the
        // frame number in memory (trim + case-insensitive) — same reasoning as
        // GetDuplicateRahmennummernAsync, SQLite collation quirks otherwise bite.
        var rows = await _dbSet
            .Where(b => b.Lagernummer != null && b.Rahmennummer != null && b.Rahmennummer != "")
            .Select(b => new { b.Rahmennummer, b.Lagernummer })
            .ToListAsync();

        return rows
            .GroupBy(r => r.Rahmennummer!.Trim().ToUpperInvariant())
            // If a frame number is (wrongly) shared by several stock bikes, pick the lowest.
            .ToDictionary(g => g.Key, g => g.Min(r => r.Lagernummer!.Value));
    }

    public async Task<Bicycle?> GetWithDetailsAsync(int id)
    {
        return await _dbSet
            .Include(b => b.Purchase).ThenInclude(p => p!.Seller)
            .Include(b => b.Sales).ThenInclude(s => s!.Buyer)
            .Include(b => b.Documents)
            .Include(b => b.Images)
            .FirstOrDefaultAsync(b => b.Id == id);
    }

    public async Task<(IEnumerable<Bicycle> Items, int TotalCount)> GetPaginatedAsync(
        int page, int pageSize,
        Expression<Func<Bicycle, bool>>? predicate = null)
    {
        var query = _dbSet.Include(b => b.Images).AsQueryable();

        if (predicate != null)
            query = query.Where(predicate);

        var totalCount = await query.CountAsync();

        var items = await query
            .OrderByDescending(b => b.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return (items, totalCount);
    }

    public override async Task<IEnumerable<Bicycle>> GetAllAsync()
    {
        return await _dbSet
            .OrderByDescending(b => b.CreatedAt)
            .ToListAsync();
    }

    /// <summary>
    /// Wie die Basisimplementierung, aber mit geladenen Bildern.
    ///
    /// BicycleDto transportiert immer auch die Bilder; ohne Include kämen sie
    /// als leere Liste an und die Oberfläche zeigt nur Platzhalter. Alle anderen
    /// Lesepfade dieses Repositories laden die Bilder ebenfalls mit — die
    /// generische FindAsync war die einzige Lücke.
    /// </summary>
    public override async Task<IEnumerable<Bicycle>> FindAsync(
        Expression<Func<Bicycle, bool>> predicate)
    {
        return await _dbSet
            .Include(b => b.Images)
            .Where(predicate)
            .ToListAsync();
    }

    public async Task<IEnumerable<string>> GetUniqueBrandsAsync()
    {
        return await _dbSet
            .Select(b => b.Marke)
            .Where(m => !string.IsNullOrEmpty(m))
            .Distinct()
            .OrderBy(m => m)
            .ToListAsync();
    }

    public async Task<IEnumerable<string>> GetUniqueModelsAsync(string? brand = null)
    {
        var query = _dbSet.AsQueryable();

        if (!string.IsNullOrEmpty(brand))
            query = query.Where(b => b.Marke == brand);

        return await query
            .Select(b => b.Modell)
            .Where(m => !string.IsNullOrEmpty(m))
            .Distinct()
            .OrderBy(m => m)
            .ToListAsync();
    }

    public async Task<IEnumerable<Bicycle>> GetPublishedOnWebsiteAsync()
    {
        return await _dbSet
            .Include(b => b.Images)
            // IsShowroomBike ist die Grenze zum Tagesgeschaeft: ein An- oder
            // Verkaufsrad aus dem Bestand hat im Showroom nichts verloren, auch
            // wenn irgendwo einmal "auf Website" gesetzt wurde.
            .Where(b => b.IsPublishedOnWebsite && b.IsShowroomBike && b.Status == BikeStatus.Available)
            .OrderByDescending(b => b.CreatedAt)
            .ToListAsync();
    }

    // Nach Name sortiert (nicht nach Aufnahmedatum): speist sowohl die
    // Verleihliste der Homepage als auch die Verfügbarkeitsprüfung, und dort
    // sucht man das Rad über Marke/Modell, nicht über das Eingangsdatum.
    //
    // Sortiert wird in-memory: der Schlüssel schneidet die führende
    // Bestandsnummer ab (siehe BicycleNaming), was sich in SQL nicht abbilden
    // lässt. Bei der Größe des Verleihbestands ist das unkritisch.
    public async Task<IEnumerable<Bicycle>> GetRentableBicyclesAsync()
    {
        var bikes = await _dbSet
            .Include(b => b.Images)
            .Where(b => b.IsRentable)
            .ToListAsync();

        return bikes
            .OrderByDescending(b => BicycleNaming.IsEbike(b.Fahrradtyp))
            .ThenBy(b => BicycleNaming.SortKey(b.Marke), BicycleNaming.NameComparer)
            .ThenBy(b => b.Modell, BicycleNaming.NameComparer)
            .ToList();
    }

    public async Task<Bicycle?> GetRentableBicycleByIdAsync(int id)
    {
        return await _dbSet
            .Include(b => b.Images)
            .FirstOrDefaultAsync(b => b.Id == id && b.IsRentable);
    }

    public async Task<Bicycle?> GetWithImagesAsync(int id)
    {
        return await _dbSet
            .Include(b => b.Images)
            .FirstOrDefaultAsync(b => b.Id == id);
    }

    public async Task<int?> GetMaxLagernummerAsync()
    {
        return await _dbSet.MaxAsync(b => b.Lagernummer);
    }
}
