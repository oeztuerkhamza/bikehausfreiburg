using BikeHaus.Application.DTOs;

namespace BikeHaus.Application.Interfaces;

public interface IEmailAccountService
{
    Task<IEnumerable<EmailAccountDto>> GetAllAsync();
    Task<EmailAccountDto?> GetByIdAsync(int id);
    Task<EmailAccountDto> CreateAsync(CreateEmailAccountDto dto);
    Task<EmailAccountDto> UpdateAsync(int id, UpdateEmailAccountDto dto);
    Task DeleteAsync(int id);
    Task<IEnumerable<EmailLogDto>> GetLogsAsync(int page = 1, int pageSize = 100);
}
