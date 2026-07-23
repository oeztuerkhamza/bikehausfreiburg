using BikeHaus.Application.DTOs;

namespace BikeHaus.Application.Interfaces;

public interface IErinnerungService
{
    Task<IEnumerable<ErinnerungDto>> GetAllAsync();
    Task<IEnumerable<ErinnerungDto>> GetPendingAsync();
    Task<PaginatedResult<ErinnerungPublicDto>> GetApprovedAsync(int page, int pageSize);
    Task<IEnumerable<ErinnerungPublicDto>> GetLatestApprovedAsync(int count);
    Task<ErinnerungDto?> GetByIdAsync(int id);

    /// <summary>Legt eine neue (unbestätigte) Erinnerung ohne Fotos an.</summary>
    Task<ErinnerungDto> CreateAsync(string ad, string ort, string geschichte);

    /// <summary>Fügt ein Foto (bereits gespeicherter Web-Pfad) zu einer Erinnerung hinzu.</summary>
    Task AddFotoAsync(int erinnerungId, string filePath, int sortOrder);

    Task<ErinnerungDto?> ApproveAsync(int id, ErinnerungApproveDto dto);
    Task<bool> DeleteAsync(int id);
}
