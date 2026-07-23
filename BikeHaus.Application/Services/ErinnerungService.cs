using BikeHaus.Application.DTOs;
using BikeHaus.Application.Interfaces;
using BikeHaus.Domain.Entities;
using BikeHaus.Domain.Interfaces;

namespace BikeHaus.Application.Services;

public class ErinnerungService : IErinnerungService
{
    private readonly IErinnerungRepository _repository;
    private readonly IFileStorageService _fileStorage;

    public ErinnerungService(IErinnerungRepository repository, IFileStorageService fileStorage)
    {
        _repository = repository;
        _fileStorage = fileStorage;
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

    public async Task<ErinnerungDto> CreateAsync(string ad, string ort, string geschichte)
    {
        var entity = new Erinnerung
        {
            Ad = ad.Trim(),
            Ort = ort.Trim(),
            Geschichte = geschichte.Trim(),
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
        new(e.Id, e.Ad, e.Ort, e.Geschichte, e.Onaylandi, e.AdminNotiz, e.CreatedAt,
            e.Fotos.OrderBy(f => f.SortOrder).Select(MapFoto).ToList());

    private static ErinnerungPublicDto MapToPublicDto(Erinnerung e) =>
        new(e.Id, e.Ad, e.Ort, e.Geschichte, e.CreatedAt,
            e.Fotos.OrderBy(f => f.SortOrder).Select(MapFoto).ToList());

    private static ErinnerungFotoDto MapFoto(ErinnerungFoto f) =>
        new(f.Id, f.FilePath, f.SortOrder);
}
