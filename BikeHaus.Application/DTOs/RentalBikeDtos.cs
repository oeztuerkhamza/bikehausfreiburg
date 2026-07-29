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
    string? Rahmennummer,
    string? Farbe,
    string Reifengroesse,
    string? Fahrradtyp,
    string? Art,
    string? Beschreibung,
    string? Rahmengroesse,
    decimal? Kaution,
    List<BicycleImageDto> Images,
    RentalPriceDto Preise,
    // Empfohlene Körpergröße — die einzige der neuen Mietrad-Angaben, die nach
    // außen geht. Die interne Fahrradnummer fehlt hier bewusst.
    int? KoerpergroesseVonCm = null,
    int? KoerpergroesseBisCm = null
);
