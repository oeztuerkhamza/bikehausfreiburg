using BikeHaus.Application.DTOs;
using BikeHaus.Application.Interfaces;
using BikeHaus.Domain.Enums;
using BikeHaus.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace BikeHaus.Infrastructure.Services;

/// <summary>
/// Sends a Google-review request ~<c>DelayHours</c> after a Sale or Rental.
///
/// Guards:
///  • never contacts addresses for transactions created before
///    <see cref="ReviewAutomationOptions.NotBeforeUtc"/> (no historical blast);
///  • at most one mail per address per <c>MinIntervalDays</c> (enforced in
///    <see cref="ICampaignService.SendReviewRequestAsync"/>, shared with the manual campaign);
///  • respects the unsubscribe list;
///  • stops retrying transactions older than <c>MaxAgeDays</c>.
///
/// Idempotent by design: every scan re-evaluates the recent window and the
/// per-address de-dup skips anyone already contacted, so duplicates are
/// impossible even across restarts or overlapping windows.
/// </summary>
public class ReviewAutomationBackgroundService : BackgroundService
{
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
            "Review automation started. Delay {Delay}h, scan every {Interval}min, not before {NotBefore:u}.",
            _options.DelayHours, interval.TotalMinutes, _options.NotBeforeUtc);

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
        var now = DateTime.UtcNow;
        var matureBefore = now.AddHours(-Math.Max(0, _options.DelayHours));
        var oldest = now.AddDays(-Math.Max(1, _options.MaxAgeDays));
        var notBefore = _options.NotBeforeUtc!.Value;
        var from = notBefore > oldest ? notBefore : oldest;

        // Nothing can be in the window yet (cutoff is in the future).
        if (from > matureBefore) return;

        using var scope = _serviceProvider.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<BikeHausDbContext>();
        var campaign = scope.ServiceProvider.GetRequiredService<ICampaignService>();

        var sales = await db.Sales
            .Where(s => s.CreatedAt >= from && s.CreatedAt <= matureBefore
                        && s.Buyer.Email != null && s.Buyer.Email != "")
            .Select(s => new { s.Buyer.Email, s.Buyer.Vorname })
            .ToListAsync(ct);

        var rentals = await db.Rentals
            .Where(r => r.CreatedAt >= from && r.CreatedAt <= matureBefore
                        && r.Customer.Email != null && r.Customer.Email != "")
            .Select(r => new { r.Customer.Email, r.Customer.Vorname })
            .ToListAsync(ct);

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
}
