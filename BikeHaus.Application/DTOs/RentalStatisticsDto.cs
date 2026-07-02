namespace BikeHaus.Application.DTOs;

// ── Vermietungs-Statistik DTOs ──
// Auswertung der formalen Mietverträge (Rental) über einen Zeitraum:
// pro Tag vermietete Räder + Einnahmen, plus Summen für den ganzen Zeitraum.
public record RentalStatisticsDto(
    DateTime StartDate,
    DateTime EndDate,
    // Summe aller Miettage über alle Räder (1 Rad × 7 Tage = 7, 2 Räder × 2 Tage = 4)
    int TotalRentalDays,
    // Anzahl Mietverträge, die im Zeitraum begonnen haben
    int RentalContractCount,
    // Anzahl unterschiedlicher Räder, die im Zeitraum (irgendwann) vermietet waren
    int RentedBikeCount,
    // Summe der Mietpreise der im Zeitraum gestarteten Räder
    decimal TotalRevenue,
    IEnumerable<RentalDailyStatsDto> DailyBreakdown,
    IEnumerable<TopRentalBikeDto> TopBikes
);

public record RentalDailyStatsDto(
    DateTime Date,
    // Räder, deren Mietzeitraum diesen Tag abdeckt (Start <= Tag <= Ende)
    int RentedBikeCount,
    // Räder, deren Miete an diesem Tag beginnt
    int NewRentalCount,
    // Einnahmen: Mietpreise der an diesem Tag startenden Räder (voller Betrag am Starttag)
    decimal Revenue
);

public record TopRentalBikeDto(
    string Bike,
    int RentalDays,
    decimal Revenue
);
