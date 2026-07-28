using System.Linq.Expressions;
using BikeHaus.Domain.Entities;
using BikeHaus.Domain.Enums;
using BikeHaus.Domain.Interfaces;
using BikeHaus.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace BikeHaus.Infrastructure.Repositories;

public class ReservationRepository : Repository<Reservation>, IReservationRepository
{
    public ReservationRepository(BikeHausDbContext context) : base(context) { }

    public async Task<Reservation?> GetWithDetailsAsync(int id)
    {
        return await _dbSet
            .Include(r => r.Bicycle)
            .Include(r => r.Customer)
            .Include(r => r.Sale)
            .FirstOrDefaultAsync(r => r.Id == id);
    }

    public async Task<Reservation?> GetActiveByBicycleIdAsync(int bicycleId)
    {
        return await _dbSet
            .Include(r => r.Bicycle)
            .Include(r => r.Customer)
            .FirstOrDefaultAsync(r => r.BicycleId == bicycleId && r.Status == ReservationStatus.Active);
    }

    public async Task<IEnumerable<Reservation>> GetExpiredReservationsAsync()
    {
        var now = DateTime.UtcNow;
        return await _dbSet
            .Include(r => r.Bicycle)
            .Where(r => r.Status == ReservationStatus.Active && r.AblaufDatum < now)
            .ToListAsync();
    }

    /// <summary>
    /// Fortlaufende Nummer ab 1 (001, 002, …) — dieselbe Systematik wie die
    /// Belegnummer beim Ankauf (PurchaseRepository.GenerateBelegNummerAsync).
    /// Vorher war es RES-yyyyMMdd-NNN, was täglich wieder bei 001 begann.
    /// Nur rein numerische Nummern zählen mit, deshalb kollidiert die neue
    /// Zählung nicht mit eventuell vorhandenen alten RES-… Nummern; sie
    /// startet daneben sauber bei 001.
    /// </summary>
    public async Task<string> GenerateReservierungsNummerAsync()
    {
        var alle = await _dbSet
            .Select(r => r.ReservierungsNummer)
            .ToListAsync();

        var maxNumber = alle
            .Where(n => !string.IsNullOrWhiteSpace(n) && int.TryParse(n, out _))
            .Select(n => int.Parse(n))
            .DefaultIfEmpty(0)
            .Max();

        return $"{maxNumber + 1:D3}";
    }

    public override async Task<IEnumerable<Reservation>> GetAllAsync()
    {
        return await _dbSet
            .Include(r => r.Bicycle)
            .Include(r => r.Customer)
            .OrderByDescending(r => r.ReservierungsDatum)
            .ToListAsync();
    }

    public async Task<(IEnumerable<Reservation> Items, int TotalCount)> GetPaginatedAsync(
        int page, int pageSize,
        Expression<Func<Reservation, bool>>? predicate = null)
    {
        var query = _dbSet
            .Include(r => r.Bicycle)
            .Include(r => r.Customer)
            .AsQueryable();

        if (predicate != null)
            query = query.Where(predicate);

        var totalCount = await query.CountAsync();

        var items = await query
            .OrderByDescending(r => r.ReservierungsDatum)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return (items, totalCount);
    }
}
