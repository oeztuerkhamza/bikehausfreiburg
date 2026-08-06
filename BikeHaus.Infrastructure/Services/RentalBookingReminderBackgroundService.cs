using BikeHaus.Application.Interfaces;
using BikeHaus.Domain;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace BikeHaus.Infrastructure.Services;

/// <summary>
/// Scheduler for the pickup reminder — sent the day before a RentalBooking's
/// <c>StartDatum</c> ("your bike is ready tomorrow") to cut no-shows, since
/// bookings are approved instantly nowadays and every no-show blocks a bike
/// for nothing. Create/Approve/Cancel already send their own mail via
/// <see cref="IRentalBookingService"/> directly; this covers the one mail that
/// isn't tied to a state change.
///
/// Runs hourly, but only actually sends within <see cref="ShopSendWindow.StartHour"/>–
/// <see cref="ShopSendWindow.EndHour"/> shop-local time (see <see cref="ShopClock"/>):
/// the date filter alone (see below) is true for the ENTIRE UTC day, so an
/// hourly run would otherwise hit its first match just after 00:00 UTC — 2–3am
/// in Freiburg during CEST — and wake someone up with a "your bike is ready
/// tomorrow" push notification. Outside the window the run is skipped
/// entirely and retried at the next hourly tick, which — being 11h wide — is
/// guaranteed to land inside it at least once per calendar day. The Google
/// review request (<see cref="ReviewAutomationBackgroundService"/>) uses the
/// same window so both automated mails behave the same way.
///
/// The job is idempotent: <see cref="IRentalBookingService.SendPickupRemindersAsync"/>
/// only picks up bookings whose StartDatum matches "tomorrow" exactly (in
/// shop-local calendar days) AND that have not been reminded yet
/// (RentalBooking.ErinnerungGesendetAm still null), and stamps the timestamp
/// right after a successful send. That date match alone already rules out
/// mailing the historical backlog on first deploy — a booking's StartDatum
/// only equals "tomorrow" for a single day, so anything already in the past
/// or further out never matches. A single mail failure is logged and does not
/// stop the rest of the run (same "best effort" pattern as every other
/// booking mail in RentalBookingService).
/// </summary>
public class RentalBookingReminderBackgroundService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<RentalBookingReminderBackgroundService> _logger;
    private readonly TimeSpan _runInterval = TimeSpan.FromHours(1);
    private readonly TimeSpan _initialDelay = TimeSpan.FromMinutes(2);

    public RentalBookingReminderBackgroundService(
        IServiceProvider serviceProvider,
        ILogger<RentalBookingReminderBackgroundService> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation(
            "Rental booking pickup reminder background service started. Interval: {Interval}h, send window {Start}-{End}h ({TimeZone}).",
            _runInterval.TotalHours,
            ShopSendWindow.StartHour,
            ShopSendWindow.EndHour,
            ShopClock.TimeZone.Id);

        if (ShopClock.UsingFallbackUtc)
        {
            _logger.LogWarning(
                "Could not resolve the Europe/Berlin time zone (missing tzdata?) — falling back to UTC. " +
                "The reminder mail may go out at the wrong local hour until this is fixed.");
        }

        await Task.Delay(_initialDelay, stoppingToken);
        await RunOnceAsync(stoppingToken);

        using var timer = new PeriodicTimer(_runInterval);
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await timer.WaitForNextTickAsync(stoppingToken);
                await RunOnceAsync(stoppingToken);
            }
            catch (OperationCanceledException)
            {
                _logger.LogInformation("Rental booking pickup reminder background service is stopping.");
                break;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unhandled error in rental booking pickup reminder loop. Will retry at next interval.");
            }
        }
    }

    private async Task RunOnceAsync(CancellationToken stoppingToken)
    {
        try
        {
            var localNow = ShopClock.Now;
            if (!ShopSendWindow.IsWithin(localNow))
            {
                _logger.LogInformation(
                    "Skipping rental booking pickup reminder run — it's {LocalHour}:00 shop-local time, outside the {Start}-{End}h send window.",
                    localNow.Hour,
                    ShopSendWindow.StartHour,
                    ShopSendWindow.EndHour);
                return;
            }

            using var scope = _serviceProvider.CreateScope();
            var bookingService = scope.ServiceProvider.GetRequiredService<IRentalBookingService>();

            var remindersSent = await bookingService.SendPickupRemindersAsync(stoppingToken);

            _logger.LogInformation(
                "Rental booking pickup reminder run completed: {Reminders} reminder(s) sent.",
                remindersSent);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to run rental booking pickup reminder job");
        }
    }
}
