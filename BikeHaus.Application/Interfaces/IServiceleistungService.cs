using BikeHaus.Application.DTOs;

namespace BikeHaus.Application.Interfaces;

public interface IServiceleistungService
{
    Task<IEnumerable<ServiceleistungDto>> GetAllAsync();
    Task<ServiceleistungDto?> GetByIdAsync(int id);
    Task<ServiceleistungDto> CreateAsync(ServiceleistungCreateDto dto);
    Task<ServiceleistungDto?> UpdateAsync(int id, ServiceleistungUpdateDto dto);
    Task<bool> DeleteAsync(int id);
    Task<string> GetNextBelegNummerAsync();
}
