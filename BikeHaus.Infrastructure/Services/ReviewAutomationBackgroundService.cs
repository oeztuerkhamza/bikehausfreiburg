using BikeHaus.Application.DTOs;
using BikeHaus.Application.Interfaces;
using BikeHaus.Domain;
using BikeHaus.Domain.Enums;
using BikeHaus.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace BikeHaus.Infrastructure.Services;

/// <summary>
/// Sends a Google-review request once a transaction is "done" from the
/// customer's point of view. The two transaction types use DIFFERENT rules —
/// they are not analogous, so don't unify them:
///
///  • Sale — <c>DelayHours</c> after <c>CreatedAt</c> (unchanged: a purchase is
///    complete the moment it is recorded).
///  • Rental — due on the CALENDAR DAY AFTER the rental ends, from
///    <see cref="RentalReviewDueHour"/> (08:00) shop-local onward. Not a flat
///    delay: a Rental row is created at PICKUP (<c>CreatedAt</c>), and a fixed
///    hours-after-anchor delay (as used for Sales) almost always landed after
///    the send window anyway — returns happen during opening hours, so "+4h"
///    was nearly always after 20:00 and got pushed to the next day regardless.
///    A fixed next-morning rule is simpler and equally predictable. The anchor
///    is <c>RueckgabeAt</c> (real return time) when the shop has recorded one,
///    otherwise the planned <c>EndDatum</c> as a fallback for rentals that ran
///    to term without an explicit return booking.
///
/// Guards:
///  • never contacts addresses for transactions anchored before
///    <see cref="ReviewAutomationOptions.NotBeforeUtc"/> (no historical blast);
///  • at most one mail per address per <c>MinIntervalDays</c>, and a hard lifetime
///    cap per address (enforced in <see cref="ICampaignService.SendReviewRequestAsync"/>,
///    shared with the manual campaign);
///  • respects the unsubscribe list;
///  • stops retrying transactions older than <c>MaxAgeDays</c> (measured from the
///    same anchor used for maturity — CreatedAt for Sale, RueckgabeAt/EndDatum
///    for Rental);
///  • only actually sends within the shop-local <see cref="ShopSendWindow"/> — same
///    "not at night" rule as the pickup-reminder mail, checked via <see cref="ShopClock"/>.
///    The window opens at the same hour a Rental review becomes due (08:00), so
///    it does not delay the rule it is supposed to protect. If a scheduled run is
///    missed (server down, error), the mail still goes out later the same day once
///    maturity + the window both hold — "due from 08:00", not "only exactly at 08:00".
///
/// Idempotent by design: every scan re-evaluates the recent window and the
/// per-address de-dup skips anyone already contacted, so duplicates are
/// impossible even across restarts or overlapping windows.
/// </summary>
public class ReviewAutomationBackgroundService : BackgroundService
{
    // Rentals become due for a review request from this shop-local hour on the
    // calendar day AFTER the rental ends (see RentalReviewDueUtc). Muss zum
    // Beginn von ShopSendWindow passen: liegt das Fenster später, verschiebt es
    // die Fälligkeit still nach hinten.
    private const int RentalReviewDueHour = 8;

    private readonly IServiceProvider _serviceProvider;
    private readonly ReviewAutomationOptions _options;
    private readonly ILogger<ReviewAutomationBackgroundService> _logger;
    private readonly TimeSpan _initialDelay = TimeSpan.FromMinutes(3);
    private const int ThrottleMs = 350;

    public ReviewAutomationBackgroundService(
        IServiceProvider serviceProvider,
        IOptions<ReviewAutomationOptions> options,
        ILogger<ReviewAutomationBackgroundService> logger)
    {
        _serviceProvider = serviceProvider;
        _options = options.Value;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        if (!_options.Enabled)
        {
            _logger.LogInformation("Review automation disabled (ReviewAutomation:Enabled=false). Service idle.");
            return;
        }

        if (_options.NotBeforeUtc is null)
        {
            _logger.LogWarning(
                "Review automation is enabled but ReviewAutomation:NotBeforeUtc is not set. " +
                "Refusing to run to avoid contacting historical customers.");
            return;
        }

        var interval = TimeSpan.FromMinutes(Math.Max(5, _options.ScanIntervalMinutes));
        _logger.LogInformation(
            "Review automation started. Sale: {Delay}h after purchase. Rental: day after return, from {DueHour}:00 shop-local. Scan every {Interval}min, not before {NotBefore:u}.",
            _options.DelayHours, RentalReviewDueHour, interval.TotalMinutes, _options.NotBeforeUtc);

        await Task.Delay(_initialDelay, stoppingToken);
        await RunOnceSafelyAsync(stoppingToken);

        using var timer = new PeriodicTimer(interval);
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await timer.WaitForNextTickAsync(stoppingToken);
                await RunOnceSafelyAsync(stoppingToken);
            }
            catch (OperationCanceledException)
            {
                _logger.LogInformation("Review automation is stopping.");
                break;
            }
        }
    }

    private async Task RunOnceSafelyAsync(CancellationToken ct)
    {
        try
        {
            await RunOnceAsync(ct);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Review automation run failed. Will retry at next interval.");
        }
    }

    private async Task RunOnceAsync(CancellationToken ct)
    {
        // Gleiche "nicht nachts"-Regel wie die Abholungs-Erinnerung: der
        // Datums-/Stunden-Filter unten ist ueber den ganzen UTC-Tag erfuellbar,
        // ein Lauf kurz nach Mitternacht UTC wuerde also mitten in der Nacht
        // Ortszeit verschicken.
        var localNow = ShopClock.Now;
        if (!ShopSendWindow.IsWithin(localNow))
        {
            _logger.LogInformation(
                "Skipping review automation run — it's {LocalHour}:00 shop-local time, outside the {Start}-{End}h send window.",
                localNow.Hour, ShopSendWindow.StartHour, ShopSendWindow.EndHour);
            return;
        }

        var now = DateTime.UtcNow;

        // Shared "not before" gate: both the Sale (CreatedAt) and Rental
        // (RueckgabeAt/EndDatum) anchor must be no older than MaxAgeDays and
        // no earlier than NotBeforeUtc. What counts as "mature" differs below.
        var oldest = now.AddDays(-Math.Max(1, _options.MaxAgeDays));
        var notBefore = _options.NotBeforeUtc!.Value;
        var from = notBefore > oldest ? notBefore : oldest;

        using var scope = _serviceProvider.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<BikeHausDbContext>();
        var campaign = scope.ServiceProvider.GetRequiredService<ICampaignService>();

        // Sale: unchanged — DelayHours after CreatedAt. If "from" is already
        // past this threshold the range is empty and the query simply returns
        // no rows, so no separate early-exit is needed.
        var saleMatureBefore = now.AddHours(-Math.Max(0, _options.DelayHours));
        var sales = await db.Sales
            .Where(s => s.CreatedAt >= from && s.CreatedAt <= saleMatureBefore
                        && s.Buyer.Email != null && s.Buyer.Email != "")
            .Select(s => new { s.Buyer.Email, s.Buyer.Vorname })
            .ToListAsync(ct);

        // Rentals: the anchor is the ACTUAL return (RueckgabeAt) when the shop
        // recorded one, otherwise the PLANNED EndDatum as a fallback. Maturity
        // is NOT a delay after the anchor (DelayHours does not apply to
        // Rentals) — it is a fixed rule: due from RentalReviewDueHour (08:00)
        // shop-local on the calendar day AFTER the anchor. EndDatum is a bare
        // shop-local calendar day (like RentalBooking.StartDatum/EndDatum), so
        // turning it (or the due instant derived from it) into a comparable
        // UTC instant needs a ShopClock conversion, which cannot be translated
        // to SQL. We therefore pull a generously time-padded candidate set
        // (a few days around the window, enough to absorb the CET/CEST offset
        // and the "day after" shift) and compute the exact anchor + due
        // instant + apply the real filter in memory — cancelled rentals never
        // got ridden, so they are excluded outright.
        var paddedFrom = from.AddDays(-2);
        var paddedTo = now.AddDays(1);
        var rentalCandidates = await db.Rentals
            .Where(r => r.Status != RentalStatus.Cancelled
                        && r.Customer.Email != null && r.Customer.Email != ""
                        && (
                            (r.RueckgabeAt != null && r.RueckgabeAt >= from && r.RueckgabeAt <= now)
                            || (r.RueckgabeAt == null && r.EndDatum >= paddedFrom && r.EndDatum <= paddedTo)
                        ))
            .Select(r => new { r.RueckgabeAt, r.EndDatum, r.Customer.Email, r.Customer.Vorname })
            .ToListAsync(ct);

        var rentals = rentalCandidates
            .Select(r => new { r.Email, r.Vorname, Anchor = RentalReviewAnchorUtc(r.RueckgabeAt, r.EndDatum) })
            // NotBeforeUtc / MaxAgeDays gate, applied to the true anchor (when the
            // rental actually ended) — not the due instant computed from it.
            .Where(r => r.Anchor >= from)
            // Matured: the day-after-anchor 08:00 shop-local due instant has passed.
            .Where(r => RentalReviewDueUtc(r.Anchor) <= now)
            .ToList();

        // One mail per customer even if they both bought and rented in the window.
        var recipients = new List<(string Email, string? Vorname, ReviewRequestSource Source)>();
        var seen = new HashSet<string>();
        foreach (var s in sales)
            if (seen.Add(s.Email!.Trim().ToLowerInvariant()))
                recipients.Add((s.Email!, s.Vorname, ReviewRequestSource.Sale));
        foreach (var r in rentals)
            if (seen.Add(r.Email!.Trim().ToLowerInvariant()))
                recipients.Add((r.Email!, r.Vorname, ReviewRequestSource.Rental));

        if (recipients.Count == 0) return;

        int sent = 0, skipped = 0, failed = 0;
        foreach (var rec in recipients)
        {
            if (ct.IsCancellationRequested) break;

            var outcome = await campaign.SendReviewRequestAsync(rec.Email, rec.Vorname, rec.Source, ct);
            switch (outcome)
            {
                case ReviewSendOutcome.Sent: sent++; break;
                case ReviewSendOutcome.Failed: failed++; break;
                default: skipped++; break;
            }

            try { await Task.Delay(ThrottleMs, ct); }
            catch (TaskCanceledException) { break; }
        }

        if (sent > 0 || failed > 0)
            _logger.LogInformation(
                "Review automation run: {Sent} sent, {Skipped} skipped, {Failed} failed.",
                sent, skipped, failed);
    }

    /// <summary>
    /// The instant a rental actually ended: the real return
    /// (<paramref name="rueckgabeAt"/>, already a UTC instant) when the shop
    /// recorded one, otherwise local midnight of the planned
    /// <paramref name="endDatum"/> converted to UTC. <paramref name="endDatum"/>
    /// carries no reliable time-of-day (it is a bare shop-local calendar day,
    /// same convention as RentalBooking.StartDatum/EndDatum), so it must go
    /// through <see cref="ShopClock.TimeZone"/> rather than being treated as
    /// UTC directly. This is the ANCHOR — see <see cref="RentalReviewDueUtc"/>
    /// for when the review request actually becomes due.
    /// </summary>
    private static DateTime RentalReviewAnchorUtc(DateTime? rueckgabeAt, DateTime endDatum)
    {
        if (rueckgabeAt.HasValue)
            return rueckgabeAt.Value;

        var localMidnight = DateTime.SpecifyKind(endDatum.Date, DateTimeKind.Unspecified);
        return TimeZoneInfo.ConvertTimeToUtc(localMidnight, ShopClock.TimeZone);
    }

    /// <summary>
    /// The instant a rental review request becomes due: <see cref="RentalReviewDueHour"/>
    /// (08:00) shop-local on the calendar day AFTER <paramref name="anchorUtc"/>
    /// (see <see cref="RentalReviewAnchorUtc"/>). Converts the anchor to shop-local
    /// to find "the day after" in the customer's own calendar, then converts the
    /// resulting local due-moment back to UTC so it is directly comparable to
    /// <see cref="DateTime.UtcNow"/>.
    /// </summary>
    private static DateTime RentalReviewDueUtc(DateTime anchorUtc)
    {
        var anchorLocal = TimeZoneInfo.ConvertTimeFromUtc(anchorUtc, ShopClock.TimeZone);
        var dueLocal = anchorLocal.Date.AddDays(1).AddHours(RentalReviewDueHour);
        return TimeZoneInfo.ConvertTimeToUtc(DateTime.SpecifyKind(dueLocal, DateTimeKind.Unspecified), ShopClock.TimeZone);
    }
}
