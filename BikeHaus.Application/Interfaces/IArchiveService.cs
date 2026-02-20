using BikeHaus.Application.DTOs;

namespace BikeHaus.Application.Interfaces;

public interface IArchiveService
{
    Task<IEnumerable<ArchiveSearchResultDto>> SearchAsync(string query);
    Task<ArchiveBicycleHistoryDto?> GetBicycleHistoryAsync(int bicycleId);
}
