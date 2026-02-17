using BikeHaus.Application.DTOs;

namespace BikeHaus.Application.Interfaces;

public interface ICustomerService
{
    Task<IEnumerable<CustomerDto>> GetAllAsync();
    Task<CustomerDto?> GetByIdAsync(int id);
    Task<IEnumerable<CustomerDto>> SearchAsync(string searchTerm);
    Task<CustomerDto> CreateAsync(CustomerCreateDto dto);
    Task<CustomerDto> UpdateAsync(int id, CustomerUpdateDto dto);
    Task DeleteAsync(int id);
}
