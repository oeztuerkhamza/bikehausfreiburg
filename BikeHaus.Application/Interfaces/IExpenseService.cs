using BikeHaus.Application.DTOs;

namespace BikeHaus.Application.Interfaces;

public interface IExpenseService
{
    Task<IEnumerable<ExpenseListDto>> GetAllAsync();
    Task<ExpenseDto?> GetByIdAsync(int id);
    Task<IEnumerable<ExpenseListDto>> SearchAsync(string query);
    Task<ExpenseDto> CreateAsync(ExpenseCreateDto dto);
    Task<ExpenseDto?> UpdateAsync(int id, ExpenseUpdateDto dto);
    Task<bool> DeleteAsync(int id);
    Task<IEnumerable<ExpenseListDto>> GetByDateRangeAsync(DateTime startDate, DateTime endDate);
}
