using BikeHaus.Application.DTOs;

namespace BikeHaus.Application.Interfaces;

public interface IRenovationCostService
{
    Task<IEnumerable<RenovationCostListDto>> GetAllAsync();
    Task<RenovationCostDto?> GetByIdAsync(int id);
    Task<RenovationCostDto> CreateAsync(RenovationCostCreateDto dto);
    Task<RenovationCostDto?> UpdateAsync(int id, RenovationCostUpdateDto dto);
    Task<bool> DeleteAsync(int id);
}
