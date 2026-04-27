namespace BikeHaus.Application.DTOs;

public record RentalPriceDto(
    decimal? Day1,
    decimal? Day3,
    decimal? Day7,
    decimal? Day14,
    decimal? Day30,
    decimal? PerDayFrom10
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
