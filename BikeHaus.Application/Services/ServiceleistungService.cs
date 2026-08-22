using BikeHaus.Application.DTOs;
using BikeHaus.Application.Interfaces;
using BikeHaus.Domain.Entities;
using BikeHaus.Domain.Interfaces;

namespace BikeHaus.Application.Services;

public class ServiceleistungService : IServiceleistungService
{
    private readonly IRepository<Serviceleistung> _repository;

    public ServiceleistungService(IRepository<Serviceleistung> repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<ServiceleistungDto>> GetAllAsync()
    {
        var items = await _repository.GetAllAsync();
        return items
            .OrderByDescending(s => s.Datum)
            .ThenByDescending(s => s.Id)
            .Select(MapToDto);
    }

    public async Task<ServiceleistungDto?> GetByIdAsync(int id)
    {
        var item = await _repository.GetByIdAsync(id);
        return item == null ? null : MapToDto(item);
    }

    public async Task<ServiceleistungDto> CreateAsync(ServiceleistungCreateDto dto)
    {
        var item = new Serviceleistung
        {
            BelegNummer = await GetNextBelegNummerAsync(),
            Datum = dto.Datum,
            KundeName = dto.KundeName,
            KundeTelefon = dto.KundeTelefon,
            KundeEmail = dto.KundeEmail,
            KundeAdresse = dto.KundeAdresse,
            FahrradMarke = dto.FahrradMarke,
            FahrradModell = dto.FahrradModell,
            Rahmennummer = dto.Rahmennummer,
            Farbe = dto.Farbe,
            DurchgefuehrteArbeiten = dto.DurchgefuehrteArbeiten,
            VerwendeteTeile = dto.VerwendeteTeile,
            Preis = dto.Preis,
            Zahlungsart = dto.Zahlungsart,
            Notizen = dto.Notizen
        };

        var created = await _repository.AddAsync(item);
        return MapToDto(created);
    }

    public async Task<ServiceleistungDto?> UpdateAsync(int id, ServiceleistungUpdateDto dto)
    {
        var item = await _repository.GetByIdAsync(id);
        if (item == null) return null;

        item.Datum = dto.Datum;
        item.KundeName = dto.KundeName;
        item.KundeTelefon = dto.KundeTelefon;
        item.KundeEmail = dto.KundeEmail;
        item.KundeAdresse = dto.KundeAdresse;
        item.FahrradMarke = dto.FahrradMarke;
        item.FahrradModell = dto.FahrradModell;
        item.Rahmennummer = dto.Rahmennummer;
        item.Farbe = dto.Farbe;
        item.DurchgefuehrteArbeiten = dto.DurchgefuehrteArbeiten;
        item.VerwendeteTeile = dto.VerwendeteTeile;
        item.Preis = dto.Preis;
        item.Zahlungsart = dto.Zahlungsart;
        item.Notizen = dto.Notizen;
        item.UpdatedAt = DateTime.UtcNow;

        await _repository.UpdateAsync(item);
        return MapToDto(item);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var item = await _repository.GetByIdAsync(id);
        if (item == null) return false;

        await _repository.DeleteAsync(id);
        return true;
    }

    // Format: SL-2026-0001, fortlaufend pro Jahr
    public async Task<string> GetNextBelegNummerAsync()
    {
        var year = DateTime.UtcNow.Year;
        var prefix = $"SL-{year}-";
        var existing = await _repository.FindAsync(s => s.BelegNummer.StartsWith(prefix));

        var maxSeq = 0;
        foreach (var s in existing)
        {
            var tail = s.BelegNummer.Substring(prefix.Length);
            if (int.TryParse(tail, out var seq) && seq > maxSeq)
                maxSeq = seq;
        }

        return $"{prefix}{maxSeq + 1:D4}";
    }

    private static ServiceleistungDto MapToDto(Serviceleistung s) => new(
        s.Id, s.BelegNummer, s.Datum,
        s.KundeName, s.KundeTelefon, s.KundeEmail, s.KundeAdresse,
        s.FahrradMarke, s.FahrradModell, s.Rahmennummer, s.Farbe,
        s.DurchgefuehrteArbeiten, s.VerwendeteTeile,
        s.Preis, s.Zahlungsart, s.Notizen, s.CreatedAt
    );
}
