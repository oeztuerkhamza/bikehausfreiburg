using BikeHaus.Application.DTOs;

namespace BikeHaus.Application.Interfaces;

/// <summary>Diktierte Notizen: speichern, aufbereiten, abhaken.</summary>
public interface ISprachnotizService
{
    /// <summary>Alle Notizen: offene zuerst, innerhalb dessen die neuesten oben.</summary>
    Task<IEnumerable<SprachnotizDto>> GetAllAsync();

    Task<SprachnotizDto?> GetByIdAsync(int id);

    /// <summary>
    /// Legt eine Notiz an. Ohne mitgeschickten Titel/Text wird der Rohtext von
    /// Claude aufbereitet; scheitert das, wird der Rohtext unverändert gespeichert.
    /// </summary>
    Task<SprachnotizDto> CreateAsync(SprachnotizCreateDto dto, CancellationToken ct = default);

    Task<SprachnotizDto?> UpdateAsync(int id, SprachnotizUpdateDto dto);

    Task<bool> DeleteAsync(int id);

    /// <summary>Nur aufbereiten (Titel, Satzzeichen, Termin) — ohne zu speichern.</summary>
    Task<SprachnotizAufbereitetDto> AufbereitenAsync(string rohText, string? sprache, CancellationToken ct = default);
}
