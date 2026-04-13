using System.Linq.Expressions;
using System.Text.RegularExpressions;
using BikeHaus.Domain.Entities;
using BikeHaus.Domain.Enums;
using BikeHaus.Domain.Interfaces;
using BikeHaus.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace BikeHaus.Infrastructure.Repositories;

public class SaleRepository : Repository<Sale>, ISaleRepository
{
    private readonly BikeHausDbContext _dbContext;

    public SaleRepository(BikeHausDbContext context) : base(context)
    {
        _dbContext = context;
    }

    private static int ExtractBelegNumber(string? belegNummer)
    {
        if (string.IsNullOrWhiteSpace(belegNummer))
        {
            return 0;
        }

        var match = Regex.Match(belegNummer, @"(\d+)$");
        return match.Success && int.TryParse(match.Groups[1].Value, out var parsed)
            ? parsed
            : 0;
    }

    public async Task<Sale?> GetWithDetailsAsync(int id)
    {
        return await _dbSet
            .Include(s => s.Bicycle)
            .Include(s => s.Buyer)
            .Include(s => s.Purchase)
            .Include(s => s.BuyerSignature)
            .Include(s => s.SellerSignature)
            .Include(s => s.Documents)
            .Include(s => s.Accessories)
            .Include(s => s.Zahlungen)
            .FirstOrDefaultAsync(s => s.Id == id);
    }

    public async Task<Sale?> GetByBicycleIdAsync(int bicycleId)
    {
        return await _dbSet
            .Include(s => s.Bicycle)
            .Include(s => s.Buyer)
            .Include(s => s.Documents)
            .FirstOrDefaultAsync(s => s.BicycleId == bicycleId);
    }

    public async Task<IEnumerable<Sale>> GetRecentSalesAsync(int count = 10)
    {
        return await _dbSet
            .Include(s => s.Bicycle)
            .Include(s => s.Buyer)
            .Include(s => s.Accessories)
            .OrderByDescending(s => s.BelegNummer)
            .Take(count)
            .ToListAsync();
    }

    public async Task<string> GenerateBelegNummerAsync()
    {
        var allBelegNummern = await _dbSet
            .Select(s => s.BelegNummer)
            .Where(b => !string.IsNullOrWhiteSpace(b))
            .ToListAsync();

        var maxNumber = 0;
        foreach (var beleg in allBelegNummern)
        {
            var match = Regex.Match(beleg, @"(\d+)$");
            if (!match.Success) continue;

            if (int.TryParse(match.Groups[1].Value, out var parsed) && parsed > maxNumber)
            {
                maxNumber = parsed;
            }
        }

        // Also check rental MietvertragNummern (shared sequence)
        var rentalNummern = await _dbContext.Rentals
            .Select(r => r.MietvertragNummer)
            .Where(n => !string.IsNullOrWhiteSpace(n))
            .ToListAsync();

        foreach (var nummer in rentalNummern)
        {
            var match = Regex.Match(nummer, @"(\d+)$");
            if (match.Success && int.TryParse(match.Groups[1].Value, out var parsed) && parsed > maxNumber)
                maxNumber = parsed;
        }

        return $"{maxNumber + 1:D3}";
    }

    public override async Task<IEnumerable<Sale>> GetAllAsync()
    {
        return await _dbSet
            .Include(s => s.Bicycle)
            .Include(s => s.Buyer)
            .Include(s => s.Accessories)
            .Include(s => s.Zahlungen)
            .OrderByDescending(s => s.BelegNummer)
            .ToListAsync();
    }

    public async Task<(IEnumerable<Sale> Items, int TotalCount)> GetPaginatedAsync(
        int page, int pageSize,
        Expression<Func<Sale, bool>>? predicate = null)
    {
        var query = _dbSet
            .Include(s => s.Bicycle)
            .Include(s => s.Buyer)
            .Include(s => s.Accessories)
            .Include(s => s.Zahlungen)
            .AsQueryable();

        if (predicate != null)
            query = query.Where(predicate);

        var totalCount = await query.CountAsync();

        var items = await query
            .OrderByDescending(s => s.BelegNummer)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return (items, totalCount);
    }

    public async Task<IEnumerable<Sale>> GetSalesWithoutPurchaseAsync()
    {
        var sales = await _dbSet
            .Include(s => s.Bicycle)
            .Include(s => s.Buyer)
            .Where(s => s.Bicycle.Purchase == null)
            .Where(s => !string.IsNullOrEmpty(s.Bicycle.Rahmennummer))
            .Where(s => !s.Bicycle.Rahmennummer!.StartsWith("ACC-"))
            .Where(s => s.Bicycle.Zustand == BikeCondition.Gebraucht)
            .ToListAsync();

        return sales
            .OrderByDescending(s => ExtractBelegNumber(s.BelegNummer))
            .ThenByDescending(s => s.Verkaufsdatum);
    }

    public async Task<int> GetSalesWithoutPurchaseCountAsync()
    {
        return await _dbSet
            .Where(s => s.Bicycle.Purchase == null)
            .Where(s => !string.IsNullOrEmpty(s.Bicycle.Rahmennummer))
            .Where(s => !s.Bicycle.Rahmennummer!.StartsWith("ACC-"))
            .Where(s => s.Bicycle.Zustand == BikeCondition.Gebraucht)
            .CountAsync();
    }
}
