using BikeHaus.Application.DTOs;

namespace BikeHaus.Application.Interfaces;

public interface IGoogleReviewsService
{
    Task<GoogleReviewsResponse?> GetReviewsAsync();
}
