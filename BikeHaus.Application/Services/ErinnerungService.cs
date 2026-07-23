using BikeHaus.Application.DTOs;
using BikeHaus.Application.Interfaces;
using BikeHaus.Domain.Entities;
using BikeHaus.Domain.Interfaces;

namespace BikeHaus.Application.Services;

public class ErinnerungService : IErinnerungService
{
    private readonly IErinnerungRepository _repository;
    private readonly IFileStorageService _fileStorage;
    private readonly IEmailService _emailService;

    // Verifizierungscode: 15 Minuten gültig.
    private static readonly TimeSpan CodeLifetime = TimeSpan.FromMinutes(15);

    public ErinnerungService(
        IErinnerungRepository repository,
        IFileStorageService fileStorage,
        IEmailService emailService)
    {
        _repository = repository;
        _fileStorage = fileStorage;
        _emailService = emailService;
    }

    public async Task<IEnumerable<ErinnerungDto>> GetAllAsync()
    {
        var items = await _repository.GetAllWithFotosAsync();
        return items.Select(MapToDto);
    }

    public async Task<IEnumerable<ErinnerungDto>> GetPendingAsync()
    {
        var items = await _repository.GetPendingAsync();
        return items.Select(MapToDto);
    }

    public async Task<PaginatedResult<ErinnerungPublicDto>> GetApprovedAsync(int page, int pageSize)
    {
        var (items, total) = await _repository.GetApprovedAsync(page, pageSize);
        return new PaginatedResult<ErinnerungPublicDto>
        {
            Items = items.Select(MapToPublicDto),
            TotalCount = total,
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task<IEnumerable<ErinnerungPublicDto>> GetLatestApprovedAsync(int count)
    {
        var items = await _repository.GetLatestApprovedAsync(count);
        return items.Select(MapToPublicDto);
    }

    public async Task<ErinnerungDto?> GetByIdAsync(int id)
    {
        var item = await _repository.GetWithFotosAsync(id);
        return item == null ? null : MapToDto(item);
    }

    public async Task<ErinnerungDto> CreateAsync(string ad, int? alter, string land, string geschichte, string email)
    {
        var entity = new Erinnerung
        {
            Ad = ad.Trim(),
            Alter = alter,
            Land = land.Trim(),
            Geschichte = geschichte.Trim(),
            Email = string.IsNullOrWhiteSpace(email) ? null : email.Trim().ToLower(),
            Onaylandi = false,
        };
        var created = await _repository.AddAsync(entity);
        return MapToDto(created);
    }

    public async Task AddFotoAsync(int erinnerungId, string filePath, int sortOrder)
    {
        var entity = await _repository.GetWithFotosAsync(erinnerungId)
            ?? throw new KeyNotFoundException($"Erinnerung mit ID {erinnerungId} nicht gefunden.");

        entity.Fotos.Add(new ErinnerungFoto
        {
            ErinnerungId = erinnerungId,
            FilePath = filePath,
            SortOrder = sortOrder,
        });
        await _repository.UpdateAsync(entity);
    }

    public async Task<ErinnerungDto?> ApproveAsync(int id, ErinnerungApproveDto dto)
    {
        var entity = await _repository.GetWithFotosAsync(id);
        if (entity == null) return null;

        entity.Onaylandi = dto.Onaylandi;
        entity.AdminNotiz = dto.AdminNotiz;
        entity.UpdatedAt = DateTime.UtcNow;

        await _repository.UpdateAsync(entity);
        return MapToDto(entity);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var entity = await _repository.GetWithFotosAsync(id);
        if (entity == null) return false;

        // Fotodateien mitlöschen (DB-Zeilen entfernt der Cascade-Delete).
        foreach (var foto in entity.Fotos)
        {
            try
            {
                await _fileStorage.DeleteFileAsync(ToStorageRelativePath(foto.FilePath));
            }
            catch
            {
                // Best effort: Ein fehlendes File soll das Löschen nicht blockieren.
            }
        }

        await _repository.DeleteAsync(id);
        return true;
    }

    public Task<int?> IncrementViewAsync(int id) => _repository.IncrementViewAsync(id);

    // ── E-Mail-Verifizierung ──
    public async Task RequestCodeAsync(string email)
    {
        var normalized = email.Trim().ToLower();
        // 4-stelliger Code (1000–9999).
        var code = System.Security.Cryptography.RandomNumberGenerator.GetInt32(1000, 10000).ToString();

        await _repository.AddVerificationAsync(new ErinnerungVerification
        {
            Email = normalized,
            Code = code,
            ExpiresAt = DateTime.UtcNow.Add(CodeLifetime),
            Used = false,
        });

        await _emailService.SendErinnerungVerificationCodeAsync(normalized, code);
    }

    public async Task<bool> VerifyCodeAsync(string email, string code)
    {
        return await _repository.HasValidVerificationAsync(email.Trim().ToLower(), code.Trim());
    }

    public Task<bool> IsCodeValidAsync(string email, string code) =>
        _repository.HasValidVerificationAsync(email.Trim().ToLower(), code.Trim());

    public async Task ConsumeCodeAsync(string email, string code)
    {
        var verification = await _repository.GetActiveVerificationAsync(email.Trim().ToLower(), code.Trim());
        if (verification != null)
            await _repository.MarkVerificationUsedAsync(verification);
    }

    // Wandelt den gespeicherten Web-Pfad ("/uploads/memories/1/x.jpg") in den
    // Pfad relativ zum FileStorage-BasePath ("memories/1/x.jpg") um.
    private static string ToStorageRelativePath(string webPath)
    {
        var p = webPath.Replace('\\', '/').TrimStart('/');
        const string prefix = "uploads/";
        if (p.StartsWith(prefix, StringComparison.OrdinalIgnoreCase))
            p = p.Substring(prefix.Length);
        return p;
    }

    private static ErinnerungDto MapToDto(Erinnerung e) =>
        new(e.Id, e.Ad, e.Alter, e.Land, e.Geschichte, e.Email, e.Aufrufe, e.Onaylandi, e.AdminNotiz, e.CreatedAt,
            e.Fotos.OrderBy(f => f.SortOrder).Select(MapFoto).ToList());

    private static ErinnerungPublicDto MapToPublicDto(Erinnerung e) =>
        new(e.Id, e.Ad, e.Alter, e.Land, e.Geschichte, e.Aufrufe, e.CreatedAt,
            e.Fotos.OrderBy(f => f.SortOrder).Select(MapFoto).ToList());

    private static ErinnerungFotoDto MapFoto(ErinnerungFoto f) =>
        new(f.Id, f.FilePath, f.SortOrder);
}
