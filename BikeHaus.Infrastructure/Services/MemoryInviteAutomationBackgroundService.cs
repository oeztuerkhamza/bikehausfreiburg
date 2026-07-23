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
/// Sendet die Einladung zur Erinnerungsecke am FOLGETAG um <c>SendHourLocal</c>
/// Uhr (Ortszeit), nachdem ein Mietvertrag zurückgegeben wurde.
///
/// Beispiel: Rückgabe am 10.07. (egal welche Uhrzeit) → Versand am 11.07. 08:00
/// Europe/Berlin.
///
/// Schutzmechanismen (analog zur Review-Automation):
///  • kontaktiert nie Rückgaben vor <see cref="MemoryInviteAutomationOptions.NotBeforeUtc"/>;
///  • jede Adresse wird höchstens EINMAL eingeladen (MemoryInvite-Dedup, geteilt
///    mit der manuellen Kampagne);
///  • respektiert die Abmelde-Liste;
///  • holt Rückgaben, die älter als <c>MaxAgeDays</c> sind, nicht mehr nach.
/// Idempotent: jeder Scan wertet das Fenster neu aus, Dedup verhindert Doppel.
/// </summary>
public class MemoryInviteAutomationBackgroundService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly MemoryInviteAutomationOptions _options;
    private readonly ILogger<MemoryInviteAutomationBackgroundService> _logger;
    private readonly TimeSpan _initialDelay = TimeSpan.FromMinutes(4);
    private const int ThrottleMs = 350;

    public MemoryInviteAutomationBackgroundService(
        IServiceProvider serviceProvider,
        IOptions<MemoryInviteAutomationOptions> options,
        ILogger<MemoryInviteAutomationBackgroundService> logger)
    {
        _serviceProvider = serviceProvider;
        _options = options.Value;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        if (!_options.Enabled)
        {
            _logger.LogInformation("Memory invite automation disabled. Service idle.");
            return;
        }
        if (_options.NotBeforeUtc is null)
        {
            _logger.LogWarning(
                "Memory invite automation enabled but NotBeforeUtc is not set. " +
                "Refusing to run to avoid contacting historical customers.");
            return;
        }

        var interval = TimeSpan.FromMinutes(Math.Max(5, _options.ScanIntervalMinutes));
        _logger.LogInformation(
            "Memory invite automation started. Next-day {Hour}:00 {Tz}, scan every {Interval}min, not before {NotBefore:u}.",
            _options.SendHourLocal, _options.TimeZone, interval.TotalMinutes, _options.NotBeforeUtc);

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
                _logger.LogInformation("Memory invite automation is stopping.");
                break;
            }
        }
    }

    private async Task RunOnceSafelyAsync(CancellationToken ct)
    {
        try { await RunOnceAsync(ct); }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Memory invite automation run failed. Will retry at next interval.");
        }
    }

    private TimeZoneInfo ResolveTimeZone()
    {
        try { return TimeZoneInfo.FindSystemTimeZoneById(_options.TimeZone); }
        catch
        {
            // Windows-Fallback, falls die IANA-ID nicht auflösbar ist.
            try { return TimeZoneInfo.FindSystemTimeZoneById("W. Europe Standard Time"); }
            catch { return TimeZoneInfo.Utc; }
        }
    }

    /// <summary>Versandzeitpunkt (UTC) = Folgetag der Rückgabe um SendHourLocal Uhr Ortszeit.</summary>
    private DateTime ComputeSendTimeUtc(DateTime returnedAtUtc, TimeZoneInfo tz)
    {
        var localReturn = TimeZoneInfo.ConvertTimeFromUtc(
            DateTime.SpecifyKind(returnedAtUtc, DateTimeKind.Utc), tz);
        var hour = Math.Clamp(_options.SendHourLocal, 0, 23);
        var localSend = localReturn.Date.AddDays(1).AddHours(hour);
        return TimeZoneInfo.ConvertTimeToUtc(
            DateTime.SpecifyKind(localSend, DateTimeKind.Unspecified), tz);
    }

    private async Task RunOnceAsync(CancellationToken ct)
    {
        var now = DateTime.UtcNow;
        var tz = ResolveTimeZone();
        var notBefore = _options.NotBeforeUtc!.Value;
        var oldest = now.AddDays(-Math.Max(1, _options.MaxAgeDays));
        var from = notBefore > oldest ? notBefore : oldest;

        using var scope = _serviceProvider.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<BikeHausDbContext>();
        var campaign = scope.ServiceProvider.GetRequiredService<ICampaignService>();

        // Zurückgegebene Mietverträge im Fenster mit gültiger Kunden-E-Mail.
        var candidates = await db.Rentals
            .Where(r => r.Status == RentalStatus.Returned
                        && r.RueckgabeAt != null
                        && r.RueckgabeAt >= from
                        && r.Customer.Email != null && r.Customer.Email != "")
            .Select(r => new { r.RueckgabeAt, r.Customer.Email, r.Customer.Vorname })
            .ToListAsync(ct);

        // Nur die, deren "Folgetag 08:00" bereits erreicht ist; pro Adresse einmal.
        var due = new List<(string Email, string? Vorname)>();
        var seen = new HashSet<string>();
        foreach (var c in candidates)
        {
            var sendAt = ComputeSendTimeUtc(c.RueckgabeAt!.Value, tz);
            if (sendAt > now) continue; // noch nicht fällig
            if (!seen.Add(c.Email!.Trim().ToLowerInvariant())) continue;
            due.Add((c.Email!, c.Vorname));
        }

        if (due.Count == 0) return;

        int sent = 0, skipped = 0, failed = 0;
        foreach (var rec in due)
        {
            if (ct.IsCancellationRequested) break;
            var outcome = await campaign.SendMemoryInviteAsync(rec.Email, rec.Vorname, MemoryInviteSource.AutoAfterReturn, ct);
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
                "Memory invite automation run: {Sent} sent, {Skipped} skipped, {Failed} failed.",
                sent, skipped, failed);
    }
}
