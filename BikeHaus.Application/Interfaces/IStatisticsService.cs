using BikeHaus.Application.DTOs;

namespace BikeHaus.Application.Interfaces;

public interface IStatisticsService
{
    Task<StatisticsDto> GetStatisticsAsync(DateTime startDate, DateTime endDate);
}
