namespace BikeHaus.Application.DTOs;

public record RentalPriceDto(
    decimal? Day1,
    decimal? Day2,
    decimal? Day3,
    decimal? Day4,
    decimal? Day5,
    decimal? Day6,
    decimal? Day7,
    decimal? AdditionalDayAfter7
);

public record PublicRentalBicycleDto(
    int Id,
    string Marke,
    string Modell,
    string? Farbe,
    string Reifengroesse,
    string? Fahrradtyp,
    string? Art,
    string? Beschreibung,
    string? Rahmengroesse,
    List<BicycleImageDto> Images,
    RentalPriceDto Preise
);
