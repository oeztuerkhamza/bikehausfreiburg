using BikeHaus.Application.DTOs;

namespace BikeHaus.Application.Interfaces;

public interface IDashboardService
{
    Task<DashboardDto> GetDashboardAsync();
}
