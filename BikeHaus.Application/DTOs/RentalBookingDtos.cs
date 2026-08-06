using BikeHaus.Application.Validation;
using BikeHaus.Domain.Enums;

namespace BikeHaus.Application.DTOs;

public record RentalBookingAccessoryCreateDto(
    int RentalAccessoryId,
    int Menge
);

public record RentalBookingAccessoryDto(
    int Id,
    string Bezeichnung,
    decimal Tagespreis,
    int Menge,
    decimal Gesamtpreis,
    int? RentalAccessoryId,
    // true = Preis gilt einmal pro Buchung, nicht je Miettag.
    bool Einmalig
);

public record RentalBookingBikeCreateDto(
    int BicycleId,
    DateTime StartDatum,
    DateTime EndDatum,
    string? Rahmennummer,
    string? Farbe,
    decimal? Kaution
);

public record RentalBookingBikeDto(
    int Id,
    int BicycleId,
    string Marke,
    string Modell,
    string? Rahmennummer,
    string? Farbe,
    string? Rahmengroesse,
    string? Art,
    decimal? Kaution,
    DateTime StartDatum,
    DateTime EndDatum,
    decimal? Gesamtpreis
);

public record RentalBookingCreateDto(
    List<RentalBookingBikeCreateDto> Bikes,
    string Vorname,
    string Nachname,
    [OptionalEmailAddress] string? Email,
    string? Telefon,
    string? Strasse,
    string? HausNr,
    string? PLZ,
    string? Ort,
    string Sprache,
    string? Notizen,
    List<RentalBookingAccessoryCreateDto>? Accessories,
    string? Abholzeit = null
);

public record RentalBookingDto(
    int Id,
    string BuchungsNummer,
    BicycleDto? Bicycle,
    List<RentalBookingBikeDto> Bikes,
    DateTime StartDatum,
    DateTime EndDatum,
    string? Abholzeit,
    string Vorname,
    string Nachname,
    string? Email,
    string? Telefon,
    string? Strasse,
    string? HausNr,
    string? PLZ,
    string? Ort,
    string? Sprache,
    string? Notizen,
    string? AdminNotizen,
    decimal? Gesamtpreis,
    RentalBookingStatus Status,
    DateTime CreatedAt,
    DateTime? ApprovedAt,
    DateTime? CancelledAt,
    List<RentalBookingAccessoryDto> Accessories,
    string? AusweisPhotoPath,          // Vorderseite
    string? AusweisPhotoRueckseitePath // Rückseite
);

public record RentalBookingListDto(
    int Id,
    string BuchungsNummer,
    string BikeInfo,
    string CustomerName,
    DateTime StartDatum,
    DateTime EndDatum,
    decimal? Gesamtpreis,
    RentalBookingStatus Status,
    DateTime CreatedAt,
    bool HasEBike
);

public record RentalBookingApproveDto(string? AdminNotizen);

public record RentalBookingCancelDto(string? AdminNotizen);

public record RentalBookingSignatureDto(string MieterUnterschrift);

public record RentalBookingRangeDto(DateTime StartDatum, DateTime EndDatum);

public record RentalBookingUpdateBikeDto(int NewBicycleId);

public record RentalBookingUpdateDatesDto(DateTime StartDatum, DateTime EndDatum, string? Abholzeit);

// Report for the one-off repair that undoes bookings wrongly cancelled by the
// self-cancel email link (see RevertErroneousStornosAsync). Runs as a dry-run
// by default so the candidates can be reviewed before anything is changed.
public record RevertStornoItemDto(
    string BuchungsNummer,
    string CustomerName,
    string? Email,
    DateTime StartDatum,
    DateTime EndDatum,
    string NewStatus,
    DateTime? CancelledAt);

public record RevertStornoResultDto(
    int Candidates,
    int Reverted,
    int EmailsSent,
    int EmailsFailed,
    bool Applied,
    IReadOnlyList<RevertStornoItemDto> Items);

// ── Public, side-effect-free "manage my booking" lookup ──────────────────
// Only what the customer needs to see; no internal IDs, notes or admin
// fields (see CLAUDE.md convention 9). Distinct from RentalBookingDto, which
// is the full admin-facing shape.

public record PublicRentalBookingBikeSummaryDto(string Marke, string Modell);

public record PublicRentalBookingLookupDto(
    string BuchungsNummer,
    DateTime StartDatum,
    DateTime EndDatum,
    string? Abholzeit,
    IReadOnlyList<PublicRentalBookingBikeSummaryDto> Bikes,
    decimal? Gesamtpreis,
    decimal? Kaution,
    RentalBookingStatus Status);
