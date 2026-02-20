using BikeHaus.Application.DTOs;
using BikeHaus.Application.Interfaces;
using BikeHaus.Application.Mappings;
using BikeHaus.Domain.Interfaces;

namespace BikeHaus.Application.Services;

public class CustomerService : ICustomerService
{
    private readonly ICustomerRepository _repository;

    public CustomerService(ICustomerRepository repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<CustomerDto>> GetAllAsync()
    {
        var customers = await _repository.GetAllAsync();
        return customers.Select(c => c.ToDto());
    }

    public async Task<CustomerDto?> GetByIdAsync(int id)
    {
        var customer = await _repository.GetWithDetailsAsync(id);
        return customer?.ToDto();
    }

    public async Task<IEnumerable<CustomerDto>> SearchAsync(string searchTerm)
    {
        var customers = await _repository.SearchAsync(searchTerm);
        return customers.Select(c => c.ToDto());
    }

    public async Task<CustomerDto> CreateAsync(CustomerCreateDto dto)
    {
        var entity = dto.ToEntity();
        var created = await _repository.AddAsync(entity);
        return created.ToDto();
    }

    public async Task<CustomerDto> UpdateAsync(int id, CustomerUpdateDto dto)
    {
        var entity = await _repository.GetByIdAsync(id)
            ?? throw new KeyNotFoundException($"Customer with ID {id} not found.");

        entity.Vorname = dto.Vorname;
        entity.Nachname = dto.Nachname;
        entity.Strasse = dto.Strasse;
        entity.Hausnummer = dto.Hausnummer;
        entity.PLZ = dto.PLZ;
        entity.Stadt = dto.Stadt;
        entity.Telefon = dto.Telefon;
        entity.Email = dto.Email;
        entity.UpdatedAt = DateTime.UtcNow;

        await _repository.UpdateAsync(entity);
        return entity.ToDto();
    }

    public async Task DeleteAsync(int id)
    {
        var customer = await _repository.GetWithDetailsAsync(id)
            ?? throw new KeyNotFoundException($"Kunde mit ID {id} wurde nicht gefunden.");

        // Check for related records
        var relatedRecords = new List<string>();
        if (customer.Purchases?.Any() == true)
            relatedRecords.Add("Ankäufe");
        if (customer.Sales?.Any() == true)
            relatedRecords.Add("Verkäufe");
        if (customer.Returns?.Any() == true)
            relatedRecords.Add("Rückgaben");

        if (relatedRecords.Any())
        {
            throw new InvalidOperationException(
                $"Kunde kann nicht gelöscht werden. Es gibt verknüpfte Datensätze: {string.Join(", ", relatedRecords)}.");
        }

        await _repository.DeleteAsync(id);
    }

    public async Task<IEnumerable<string>> GetUniqueFirstNamesAsync()
    {
        return await _repository.GetUniqueFirstNamesAsync();
    }

    public async Task<IEnumerable<string>> GetUniqueLastNamesAsync()
    {
        return await _repository.GetUniqueLastNamesAsync();
    }
}
