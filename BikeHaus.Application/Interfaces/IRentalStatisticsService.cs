using BikeHaus.Application.DTOs;

namespace BikeHaus.Application.Interfaces;

public interface IRentalStatisticsService
{
    Task<RentalStatisticsDto> GetRentalStatisticsAsync(DateTime startDate, DateTime endDate);
}
