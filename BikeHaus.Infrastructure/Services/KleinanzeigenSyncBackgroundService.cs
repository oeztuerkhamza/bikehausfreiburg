using BikeHaus.Application.Interfaces;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace BikeHaus.Infrastructure.Services;

public class KleinanzeigenSyncBackgroundService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<KleinanzeigenSyncBackgroundService> _logger;
    private readonly TimeSpan _syncInterval = TimeSpan.FromHours(4);
    private readonly TimeSpan _initialDelay = TimeSpan.FromMinutes(2); // Wait 2 min after startup

    public KleinanzeigenSyncBackgroundService(
        IServiceProvider serviceProvider,
        ILogger<KleinanzeigenSyncBackgroundService> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Kleinanzeigen Sync Background Service started. Interval: {Interval} hours", _syncInterval.TotalHours);

        // Wait a bit after startup to let everything initialize
        await Task.Delay(_initialDelay, stoppingToken);

        // Run initial sync
        await RunSyncAsync(stoppingToken);

        // Then run every 4 hours
        using var timer = new PeriodicTimer(_syncInterval);

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await timer.WaitForNextTickAsync(stoppingToken);
                await RunSyncAsync(stoppingToken);
            }
            catch (OperationCanceledException)
            {
                _logger.LogInformation("Kleinanzeigen Sync Background Service is stopping.");
                break;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unhandled error in Kleinanzeigen sync loop. Will retry at next interval.");
            }
        }
    }

    private async Task RunSyncAsync(CancellationToken cancellationToken)
    {
        _logger.LogInformation("Starting scheduled Kleinanzeigen sync at {Time}", DateTime.UtcNow);

        try
        {
            using var scope = _serviceProvider.CreateScope();
            var kleinanzeigenService = scope.ServiceProvider.GetRequiredService<IKleinanzeigenService>();
            var coordinator = scope.ServiceProvider.GetRequiredService<KleinanzeigenSyncCoordinator>();
            var result = await coordinator.RunSyncDirectAsync(kleinanzeigenService, cancellationToken);

            if (result.Error != null)
            {
                _logger.LogWarning("Kleinanzeigen sync completed with error: {Error}", result.Error);
            }
            else
            {
                _logger.LogInformation(
                    "Kleinanzeigen sync completed successfully: {New} new, {Updated} updated, {Deactivated} deactivated",
                    result.NewListings, result.UpdatedListings, result.DeactivatedListings);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to run Kleinanzeigen sync");
        }
    }
}
