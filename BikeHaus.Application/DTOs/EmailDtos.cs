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
