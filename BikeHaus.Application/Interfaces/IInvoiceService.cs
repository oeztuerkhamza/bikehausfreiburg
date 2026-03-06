using BikeHaus.Application.DTOs;

namespace BikeHaus.Application.Interfaces;

public interface IInvoiceService
{
    Task<IEnumerable<InvoiceListDto>> GetAllAsync();
    Task<InvoiceDto?> GetByIdAsync(int id);
    Task<IEnumerable<InvoiceListDto>> SearchAsync(string query);
    Task<InvoiceDto> CreateAsync(InvoiceCreateDto dto);
    Task<InvoiceDto?> UpdateAsync(int id, InvoiceUpdateDto dto);
    Task<bool> DeleteAsync(int id);
}
