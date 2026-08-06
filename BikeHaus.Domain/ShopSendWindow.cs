using System;

namespace BikeHaus.Domain;

/// <summary>
/// Shop-local hours during which customer-facing automated mails (pickup
/// reminder, review request) are allowed to actually go out. Shared by every
/// background service that sends this kind of mail so they all behave the
/// same way — chosen generously (not just opening hours) so a slightly-off
/// run still lands at a normal time of day; the important part is "not at
/// night". Always evaluate against <see cref="ShopClock.Now"/>, never
/// <see cref="DateTime.UtcNow"/> directly.
/// </summary>
public static class ShopSendWindow
{
    /// <summary>
    /// 8 Uhr, weil die Bewertungsanfrage einer Miete laut Entscheidung des
    /// Inhabers am Morgen nach dem Mietende um 8 Uhr rausgehen soll. Stand hier
    /// 9, kam die Mail trotz korrekt berechneter Fälligkeit erst eine Stunde
    /// später — das Fenster hätte die Regel still überstimmt.
    /// </summary>
    public const int StartHour = 8;
    public const int EndHour = 20;

    /// <summary>True when <paramref name="shopLocalTime"/> (e.g. <see cref="ShopClock.Now"/>) falls inside the send window.</summary>
    public static bool IsWithin(DateTime shopLocalTime) =>
        shopLocalTime.Hour >= StartHour && shopLocalTime.Hour < EndHour;
}
