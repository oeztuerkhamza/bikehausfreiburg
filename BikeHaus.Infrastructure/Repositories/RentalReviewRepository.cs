using BikeHaus.Domain.Entities;
using BikeHaus.Domain.Interfaces;
using BikeHaus.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace BikeHaus.Infrastructure.Repositories;

public class RentalReviewRepository : Repository<RentalReview>, IRentalReviewRepository
{
    private readonly BikeHausDbContext _context;

    public RentalReviewRepository(BikeHausDbContext context) : base(context)
    {
        _context = context;
    }

    public async Task<IEnumerable<RentalReview>> GetApprovedAsync()
    {
        return await _context.RentalReviews
            .Where(r => r.Onaylandi)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<RentalReview>> GetPendingAsync()
    {
        return await _context.RentalReviews
            .Where(r => !r.Onaylandi)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();
    }
}
