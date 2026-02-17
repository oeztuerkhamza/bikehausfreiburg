using BikeHaus.Domain.Enums;

namespace BikeHaus.Application.DTOs;

// ── Signature DTOs ──
public record SignatureDto(
    int Id,
    string SignatureData,
    string SignerName,
    SignatureType SignatureType,
    DateTime SignedAt
);

public record SignatureCreateDto(
    string SignatureData,
    string SignerName,
    SignatureType SignatureType
);
