namespace BikeHaus.Application.DTOs;

// ── Archive DTOs ──

public record ArchiveSearchResultDto(
    int BicycleId,
    string StokNo,
    string BikeInfo,
    string? PurchaseBelegNummer,
    string? SaleBelegNummer,
    DateTime? PurchaseDate,
    DateTime? SaleDate,
    string MatchType // "StokNo", "PurchaseBeleg", "SaleBeleg", "ReturnBeleg"
);

public record ArchiveTimelineEventDto(
    string EventType,      // "Purchase", "Sale", "Return", "Reservation", "ReservationCancelled"
    DateTime EventDate,
    string? BelegNummer,
    string Title,
    string? Description,
    decimal? Amount,
    string? CustomerName,
    string? PaymentMethod,
    int? DocumentId,       // ID for downloading PDF
    string? DocumentType   // "Kaufbeleg", "Verkaufsbeleg", "Rueckgabebeleg"
);

public record ArchiveBicycleHistoryDto(
    int BicycleId,
    string StokNo,
    string Marke,
    string? Modell,
    string? Rahmennummer,
    string? Farbe,
    string Reifengroesse,
    string? Fahrradtyp,
    string Status,
    string Zustand,
    DateTime CreatedAt,
    IEnumerable<ArchiveTimelineEventDto> Timeline
);
