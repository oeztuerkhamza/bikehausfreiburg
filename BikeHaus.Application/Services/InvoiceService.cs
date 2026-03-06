using BikeHaus.Application.DTOs;
using BikeHaus.Application.Interfaces;
using BikeHaus.Domain.Entities;
using BikeHaus.Domain.Interfaces;

namespace BikeHaus.Application.Services;

public class InvoiceService : IInvoiceService
{
    private readonly IInvoiceRepository _repository;

    public InvoiceService(IInvoiceRepository repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<InvoiceListDto>> GetAllAsync()
    {
        var invoices = await _repository.GetAllAsync();
        return invoices
            .OrderByDescending(i => i.Datum)
            .ThenByDescending(i => i.RechnungsNummer)
            .Select(MapToListDto);
    }

    public async Task<InvoiceDto?> GetByIdAsync(int id)
    {
        var invoice = await _repository.GetByIdAsync(id);
        return invoice == null ? null : MapToDto(invoice);
    }

    public async Task<IEnumerable<InvoiceListDto>> SearchAsync(string query)
    {
        var invoices = await _repository.SearchAsync(query);
        return invoices.Select(MapToListDto);
    }

    public async Task<string> GetNextRechnungsNummerAsync()
    {
        return await _repository.GetNextRechnungsNummerAsync();
    }

    public async Task<InvoiceDto> CreateAsync(InvoiceCreateDto dto)
    {
        var rechnungsNummer = dto.RechnungsNummer;
        if (string.IsNullOrWhiteSpace(rechnungsNummer))
            rechnungsNummer = await _repository.GetNextRechnungsNummerAsync();

        var invoice = new Invoice
        {
            RechnungsNummer = rechnungsNummer,
            Datum = dto.Datum,
            Betrag = dto.Betrag,
            Bezeichnung = dto.Bezeichnung,
            Kategorie = dto.Kategorie,
            KundenName = dto.KundenName,
            KundenAdresse = dto.KundenAdresse,
            Notizen = dto.Notizen
        };

        var created = await _repository.AddAsync(invoice);
        return MapToDto(created);
    }

    public async Task<InvoiceDto?> UpdateAsync(int id, InvoiceUpdateDto dto)
    {
        var invoice = await _repository.GetByIdAsync(id);
        if (invoice == null) return null;

        invoice.RechnungsNummer = dto.RechnungsNummer;
        invoice.Datum = dto.Datum;
        invoice.Betrag = dto.Betrag;
        invoice.Bezeichnung = dto.Bezeichnung;
        invoice.Kategorie = dto.Kategorie;
        invoice.KundenName = dto.KundenName;
        invoice.KundenAdresse = dto.KundenAdresse;
        invoice.Notizen = dto.Notizen;
        invoice.UpdatedAt = DateTime.UtcNow;

        await _repository.UpdateAsync(invoice);
        return MapToDto(invoice);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var invoice = await _repository.GetByIdAsync(id);
        if (invoice == null) return false;
        await _repository.DeleteAsync(id);
        return true;
    }

    private static InvoiceListDto MapToListDto(Invoice i) => new(
        i.Id, i.RechnungsNummer, i.Datum, i.Betrag,
        i.Bezeichnung, i.Kategorie, i.KundenName, i.KundenAdresse, i.Notizen
    );

    private static InvoiceDto MapToDto(Invoice i) => new(
        i.Id, i.RechnungsNummer, i.Datum, i.Betrag,
        i.Bezeichnung, i.Kategorie, i.KundenName, i.KundenAdresse, i.Notizen, i.CreatedAt
    );
}
