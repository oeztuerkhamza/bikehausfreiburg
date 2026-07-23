namespace BikeHaus.Application.DTOs;

// ── Erinnerung (Anı Köşesi) DTOs ──

public record ErinnerungFotoDto(int Id, string FilePath, int SortOrder);

/// <summary>Öffentliche Sicht — niemals AdminNotiz/Onaylandi nach außen.</summary>
public record ErinnerungPublicDto(
    int Id,
    string Ad,
    string Ort,
    string Geschichte,
    DateTime CreatedAt,
    List<ErinnerungFotoDto> Fotos);

/// <summary>Admin-Sicht — inkl. Freigabe-Status und interner Notiz.</summary>
public record ErinnerungDto(
    int Id,
    string Ad,
    string Ort,
    string Geschichte,
    bool Onaylandi,
    string? AdminNotiz,
    DateTime CreatedAt,
    List<ErinnerungFotoDto> Fotos);

public record ErinnerungApproveDto(bool Onaylandi, string? AdminNotiz);
