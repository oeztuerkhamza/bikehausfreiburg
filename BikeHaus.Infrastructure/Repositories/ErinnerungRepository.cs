using BikeHaus.Domain.Entities;
using BikeHaus.Domain.Interfaces;
using BikeHaus.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace BikeHaus.Infrastructure.Repositories;

public class ErinnerungRepository : Repository<Erinnerung>, IErinnerungRepository
{
    public ErinnerungRepository(BikeHausDbContext context) : base(context) { }

    public async Task<IEnumerable<Erinnerung>> GetAllWithFotosAsync()
    {
        return await _dbSet
            .Include(e => e.Fotos.OrderBy(f => f.SortOrder))
            .OrderByDescending(e => e.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<Erinnerung>> GetPendingAsync()
    {
        return await _dbSet
            .Where(e => !e.Onaylandi)
            .Include(e => e.Fotos.OrderBy(f => f.SortOrder))
            .OrderByDescending(e => e.CreatedAt)
            .ToListAsync();
    }

    public async Task<(IEnumerable<Erinnerung> Items, int TotalCount)> GetApprovedAsync(int page, int pageSize)
    {
        var query = _dbSet.Where(e => e.Onaylandi);
        var total = await query.CountAsync();
        var items = await query
            .Include(e => e.Fotos.OrderBy(f => f.SortOrder))
            .OrderByDescending(e => e.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
        return (items, total);
    }

    public async Task<IEnumerable<Erinnerung>> GetLatestApprovedAsync(int count)
    {
        return await _dbSet
            .Where(e => e.Onaylandi)
            .Include(e => e.Fotos.OrderBy(f => f.SortOrder))
            .OrderByDescending(e => e.CreatedAt)
            .Take(count)
            .ToListAsync();
    }

    public async Task<Erinnerung?> GetWithFotosAsync(int id)
    {
        return await _dbSet
            .Include(e => e.Fotos.OrderBy(f => f.SortOrder))
            .FirstOrDefaultAsync(e => e.Id == id);
    }

    public async Task<int?> IncrementViewAsync(int id)
    {
        var entity = await _dbSet.FirstOrDefaultAsync(e => e.Id == id && e.Onaylandi);
        if (entity == null) return null;
        entity.Aufrufe++;
        await _context.SaveChangesAsync();
        return entity.Aufrufe;
    }

    // ── E-Mail-Verifizierung ──
    public async Task AddVerificationAsync(ErinnerungVerification verification)
    {
        _context.Set<ErinnerungVerification>().Add(verification);
        await _context.SaveChangesAsync();
    }

    public async Task<ErinnerungVerification?> GetActiveVerificationAsync(string email, string code)
    {
        var normalized = email.Trim().ToLower();
        return await _context.Set<ErinnerungVerification>()
            .Where(v => v.Email == normalized && v.Code == code && !v.Used && v.ExpiresAt > DateTime.UtcNow)
            .OrderByDescending(v => v.CreatedAt)
            .FirstOrDefaultAsync();
    }

    public async Task MarkVerificationUsedAsync(ErinnerungVerification verification)
    {
        verification.Used = true;
        await _context.SaveChangesAsync();
    }

    public async Task<bool> HasValidVerificationAsync(string email, string code)
    {
        return await GetActiveVerificationAsync(email, code) != null;
    }
}
