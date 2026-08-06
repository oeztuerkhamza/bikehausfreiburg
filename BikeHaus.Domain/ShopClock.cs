using System;

namespace BikeHaus.Domain;

/// <summary>
/// The shop's local wall-clock time (Freiburg / Europe/Berlin). The API container
/// runs in UTC, but calendar fields like <see cref="Entities.RentalBooking.StartDatum"/>
/// and <c>EndDatum</c> are plain calendar days as the customer/shop sees them —
/// i.e. in local time, not UTC. Anything that compares "today"/"tomorrow"/"yesterday"
/// against those fields, or decides whether it is currently daytime for a
/// customer-facing send, must go through here instead of <see cref="DateTime.UtcNow"/>
/// directly, or it silently drifts by up to two hours (CEST) around midnight.
/// </summary>
public static class ShopClock
{
    private const string IanaTimeZoneId = "Europe/Berlin";
    private const string WindowsTimeZoneId = "W. Europe Standard Time";

    /// <summary>
    /// Resolved once at startup. Falls back to UTC (logged by callers that care)
    /// if the host has neither the IANA tzdata (Linux without the "tzdata"
    /// package) nor the Windows time zone database — this should not happen in
    /// the shipped container (the Dockerfile installs "tzdata"), but a fallback
    /// beats crashing a background service.
    /// </summary>
    public static readonly TimeZoneInfo TimeZone = ResolveTimeZone();

    /// <summary>True only when the resolution above had to fall back to UTC.</summary>
    public static bool UsingFallbackUtc => ReferenceEquals(TimeZone, TimeZoneInfo.Utc);

    /// <summary>Current wall-clock time at the shop, converted from the container's UTC clock.</summary>
    public static DateTime Now => TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, TimeZone);

    private static TimeZoneInfo ResolveTimeZone()
    {
        foreach (var id in new[] { IanaTimeZoneId, WindowsTimeZoneId })
        {
            try
            {
                return TimeZoneInfo.FindSystemTimeZoneById(id);
            }
            catch (TimeZoneNotFoundException)
            {
            }
            catch (InvalidTimeZoneException)
            {
            }
        }

        return TimeZoneInfo.Utc;
    }
}
