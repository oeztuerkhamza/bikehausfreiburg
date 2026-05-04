using BikeHaus.Domain.Entities;

namespace BikeHaus.Domain.Interfaces;

public interface IRentalReviewRepository : IRepository<RentalReview>
{
    Task<IEnumerable<RentalReview>> GetApprovedAsync();
    Task<IEnumerable<RentalReview>> GetPendingAsync();
}
