using BikeHaus.Application.DTOs;

namespace BikeHaus.Application.Interfaces;

public interface IRepairShowcaseService
{
    Task<IEnumerable<RepairShowcaseDto>> GetAllAsync();
    Task<IEnumerable<RepairShowcaseDto>> GetAllActiveAsync();
    Task<RepairShowcaseDto?> GetByIdAsync(int id);
    Task<RepairShowcaseDto> CreateAsync(RepairShowcaseCreateDto dto);
    Task<RepairShowcaseDto?> UpdateAsync(int id, RepairShowcaseUpdateDto dto);
    Task<bool> DeleteAsync(int id);
    Task<RepairShowcaseImageDto> AddImageAsync(int showcaseId, string filePath, int sortOrder);
    Task<bool> DeleteImageAsync(int imageId);
}
