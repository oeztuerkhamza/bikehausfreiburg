namespace BikeHaus.Application.DTOs;

/// <summary>
/// Tages-Verfügbarkeit für den öffentlichen Buchungskalender: pro Tag die
/// Anzahl freier (nicht-Kinder-)Mieträder. Bewusst ohne Fahrrad-IDs oder
/// Namen — nur aggregierte Zahlen für die Kalender-Einfärbung.
/// </summary>
public record PublicAvailabilityCalendarDayDto(
    string Date,
    int FreeCount
);

public record PublicAvailabilityCalendarDto(
    int TotalBikes,
    List<PublicAvailabilityCalendarDayDto> Days
);

/// <summary>
/// Funnel-Telemetrie-Ereignis aus dem öffentlichen Buchungs-Flow.
/// </summary>
public record PublicRentalFunnelEventDto(
    string Step,
    string SessionKey,
    string? Language,
    string? Info
);
