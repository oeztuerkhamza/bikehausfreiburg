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
    Task<ErinnerungDto> CreateAsync(string ad, int? alter, string land, string geschichte, string email);

    /// <summary>Fügt ein Foto (bereits gespeicherter Web-Pfad) zu einer Erinnerung hinzu.</summary>
    Task AddFotoAsync(int erinnerungId, string filePath, int sortOrder);

    Task<ErinnerungDto?> ApproveAsync(int id, ErinnerungApproveDto dto);
    Task<bool> DeleteAsync(int id);

    /// <summary>Zählt einen öffentlichen Aufruf hoch. Gibt den neuen Stand zurück oder null.</summary>
    Task<int?> IncrementViewAsync(int id);

    // E-Mail-Verifizierung
    Task RequestCodeAsync(string email);
    Task<bool> VerifyCodeAsync(string email, string code);
    Task<bool> IsCodeValidAsync(string email, string code);
    /// <summary>Markiert den Code als benutzt (Einmalverwendung).</summary>
    Task ConsumeCodeAsync(string email, string code);
}
