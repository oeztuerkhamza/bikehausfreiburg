using BikeHaus.Domain.Enums;

namespace BikeHaus.Application.DTOs;

// ── Return DTOs ──
public record ReturnDto(
    int Id,
    string BelegNummer,
    SaleDto Sale,
    BicycleDto Bicycle,
    CustomerDto Customer,
    DateTime Rueckgabedatum,
    ReturnReason Grund,
    string? GrundDetails,
    decimal Erstattungsbetrag,
    PaymentMethod Zahlungsart,
    string? Notizen,
    SignatureDto? CustomerSignature,
    SignatureDto? ShopSignature,
    DateTime CreatedAt
);

public record ReturnCreateDto(
    int SaleId,
    DateTime? Rueckgabedatum,
    ReturnReason Grund,
    string? GrundDetails,
    decimal Erstattungsbetrag,
    PaymentMethod Zahlungsart,
    string? Notizen,
    SignatureCreateDto? CustomerSignature,
    SignatureCreateDto? ShopSignature
);

public record ReturnListDto(
    int Id,
    string BelegNummer,
    string BikeInfo,
    string CustomerName,
    string OriginalSaleBelegNummer,
    DateTime Rueckgabedatum,
    ReturnReason Grund,
    decimal Erstattungsbetrag
);
