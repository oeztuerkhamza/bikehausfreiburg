using BikeHaus.Domain.Entities;
using BikeHaus.Domain.Interfaces;
using BikeHaus.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace BikeHaus.Infrastructure.Repositories;

public class CustomerRepository : Repository<Customer>, ICustomerRepository
{
    public CustomerRepository(BikeHausDbContext context) : base(context) { }

    public async Task<IEnumerable<Customer>> SearchAsync(string searchTerm)
    {
        var term = searchTerm.ToLower();
        return await _dbSet
            .Where(c => c.Vorname.ToLower().Contains(term) ||
                        c.Nachname.ToLower().Contains(term) ||
                        (c.Email != null && c.Email.ToLower().Contains(term)) ||
                        (c.Telefon != null && c.Telefon.Contains(term)))
            .OrderBy(c => c.Nachname)
            .Take(10)
            .ToListAsync();
    }

    public async Task<Customer?> GetWithDetailsAsync(int id)
    {
        return await _dbSet
            .Include(c => c.Purchases).ThenInclude(p => p.Bicycle)
            .Include(c => c.Sales).ThenInclude(s => s.Bicycle)
            .FirstOrDefaultAsync(c => c.Id == id);
    }

    public async Task<IEnumerable<string>> GetUniqueFirstNamesAsync()
    {
        return await _dbSet
            .Where(c => !string.IsNullOrEmpty(c.Vorname))
            .Select(c => c.Vorname)
            .Distinct()
            .OrderBy(n => n)
            .ToListAsync();
    }

    public async Task<IEnumerable<string>> GetUniqueLastNamesAsync()
    {
        return await _dbSet
            .Where(c => !string.IsNullOrEmpty(c.Nachname))
            .Select(c => c.Nachname)
            .Distinct()
            .OrderBy(n => n)
            .ToListAsync();
    }
}
