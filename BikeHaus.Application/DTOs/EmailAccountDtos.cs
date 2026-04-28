namespace BikeHaus.Application.DTOs;

public record EmailAccountDto(
    int Id,
    string Name,
    string Host,
    int Port,
    string Username,
    string FromEmail,
    string FromName,
    bool UseSsl,
    bool IsDefault,
    bool IsActive,
    DateTime CreatedAt
);

public record CreateEmailAccountDto(
    string Name,
    string Host,
    int Port,
    string Username,
    string Password,
    string FromEmail,
    string FromName,
    bool UseSsl,
    bool IsDefault,
    bool IsActive
);

public record UpdateEmailAccountDto(
    string Name,
    string Host,
    int Port,
    string Username,
    string? Password,
    string FromEmail,
    string FromName,
    bool UseSsl,
    bool IsDefault,
    bool IsActive
);

public record EmailLogDto(
    int Id,
    string ToEmail,
    string ToName,
    string Subject,
    string Status,
    string? ErrorMessage,
    string EmailType,
    string? AccountName,
    DateTime CreatedAt
);
