using BikeHaus.Domain.Entities;

namespace BikeHaus.Domain.Interfaces;

public interface IExpenseRepository : IRepository<Expense>
{
    Task<IEnumerable<Expense>> GetByDateRangeAsync(DateTime startDate, DateTime endDate);
    Task<IEnumerable<Expense>> SearchAsync(string query);
}
