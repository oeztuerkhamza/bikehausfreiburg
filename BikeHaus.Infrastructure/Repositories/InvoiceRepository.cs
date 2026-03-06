using BikeHaus.Domain.Entities;
using BikeHaus.Domain.Interfaces;
using BikeHaus.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace BikeHaus.Infrastructure.Repositories;

public class InvoiceRepository : Repository<Invoice>, IInvoiceRepository
{
    private readonly BikeHausDbContext _context;

    public InvoiceRepository(BikeHausDbContext context) : base(context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Invoice>> SearchAsync(string query)
    {
        var q = query.ToLower();
        return await _context.Invoices
            .Where(i =>
                i.RechnungsNummer.ToLower().Contains(q) ||
                i.Bezeichnung.ToLower().Contains(q) ||
                (i.Kategorie != null && i.Kategorie.ToLower().Contains(q)) ||
                (i.KundenName != null && i.KundenName.ToLower().Contains(q)))
            .OrderByDescending(i => i.Datum)
            .ToListAsync();
    }

    public async Task<string> GetNextRechnungsNummerAsync()
    {
        var year = DateTime.UtcNow.Year;
        var prefix = $"RE-{year}-";

        var lastInvoice = await _context.Invoices
            .Where(i => i.RechnungsNummer.StartsWith(prefix))
            .OrderByDescending(i => i.RechnungsNummer)
            .FirstOrDefaultAsync();

        if (lastInvoice == null)
            return $"{prefix}001";

        var lastNum = lastInvoice.RechnungsNummer.Replace(prefix, "");
        if (int.TryParse(lastNum, out var num))
            return $"{prefix}{(num + 1):D3}";

        return $"{prefix}001";
    }
}
