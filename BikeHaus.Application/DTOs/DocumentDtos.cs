using BikeHaus.Domain.Enums;

namespace BikeHaus.Application.DTOs;

// ── Document DTOs ──
public record DocumentDto(
    int Id,
    string FileName,
    string ContentType,
    long FileSize,
    DocumentType DocumentType,
    int? BicycleId,
    int? PurchaseId,
    int? SaleId,
    DateTime CreatedAt
);

public record DocumentUploadDto(
    DocumentType DocumentType,
    int? BicycleId,
    int? PurchaseId,
    int? SaleId
);
