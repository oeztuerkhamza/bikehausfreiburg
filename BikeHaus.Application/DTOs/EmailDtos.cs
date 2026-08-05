namespace BikeHaus.Application.DTOs;

public record RentalBookingEmailModel(
    string ToEmail,
    string ToName,
    string BuchungsNummer,
    string BikeBrand,
    string BikeModel,
    string? FrameNumber,
    string? FrameSize,
    string? Color,
    DateTime StartDate,
    DateTime EndDate,
    string? PickupTime,
    int Days,
    decimal? TotalPrice,
    decimal? Deposit,
    string AccessoriesText,
    string PickupLocation,
    string ShopPhone,
    string ShopEmail,
    string Language,
    string? SelfCancelUrl = null
);

/// <summary>
/// Bestätigung der Kautionsrückgabe. Enthält alles, was auf dem Beleg steht —
/// Auszahlungsart, ausgezahlter Betrag, etwaige Abzüge und das Rückgabedatum —
/// damit die Mail dieselben Zahlen nennt wie das angehängte PDF.
/// </summary>
public record DepositRefundEmailModel(
    string ToEmail,
    string ToName,
    string MietvertragNummer,
    decimal KautionsBetrag,
    decimal ErstatteterBetrag,
    decimal AbzuegeGesamt,
    string ZahlungsartText,
    DateTime RueckgabeDatum,
    byte[] BelegPdfBytes
);
