namespace BikeHaus.Application.DTOs;

// ── Erinnerung (Anı Köşesi) DTOs ──

public record ErinnerungFotoDto(int Id, string FilePath, int SortOrder);

/// <summary>Öffentliche Sicht — niemals AdminNotiz/Onaylandi/Email nach außen.</summary>
public record ErinnerungPublicDto(
    int Id,
    string Ad,
    int? Alter,
    string Land,
    string Geschichte,
    int Aufrufe,
    DateTime CreatedAt,
    List<ErinnerungFotoDto> Fotos);

/// <summary>Admin-Sicht — inkl. Freigabe-Status, interner Notiz und Kontakt-E-Mail.</summary>
public record ErinnerungDto(
    int Id,
    string Ad,
    int? Alter,
    string Land,
    string Geschichte,
    string? Email,
    int Aufrufe,
    bool Onaylandi,
    string? AdminNotiz,
    DateTime CreatedAt,
    List<ErinnerungFotoDto> Fotos);

public record ErinnerungApproveDto(bool Onaylandi, string? AdminNotiz);

// E-Mail-Verifizierung
public record ErinnerungRequestCodeDto(string Email);
public record ErinnerungVerifyCodeDto(string Email, string Code);
