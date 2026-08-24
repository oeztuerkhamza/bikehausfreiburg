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

                // Bestand aendert sich staendig: neue Raeder kommen rein, verkaufte
                // verschwinden. Ohne aktive Meldung merkt eine Suchmaschine das erst
                // beim naechsten eigenen Crawl — bei einem Rad, das in zwei Wochen
                // verkauft ist, oft zu spaet. Deshalb wird nur dann gemeldet, wenn
                // sich wirklich etwas geaendert hat (nicht bei reinen Updates,
                // sonst pingen wir alle vier Stunden ohne Anlass).
                if (result.NewListings + result.DeactivatedListings > 0)
                {
                    await NotifySearchEnginesAsync(scope, kleinanzeigenService);
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to run Kleinanzeigen sync");
        }
    }

    /// <summary>
    /// Meldet geaenderte Showroom-URLs per IndexNow an Bing und Yandex.
    ///
    /// Gemeldet werden die Uebersichtsseiten (deren Inhalt sich bei jeder
    /// Bestandsaenderung aendert) und die Detailseiten frisch aufgenommener
    /// Anzeigen. Bereits laenger bekannte Raeder werden bewusst NICHT jedes Mal
    /// mitgeschickt — das waere ein Ping ohne Anlass und kostet nur Kontingent.
    /// </summary>
    private async Task NotifySearchEnginesAsync(
        IServiceScope scope,
        IKleinanzeigenService kleinanzeigenService)
    {
        try
        {
            var indexNow = scope.ServiceProvider.GetRequiredService<IIndexNowService>();
            const string baseUrl = "https://bikehausfreiburg.com";
            var langs = new[] { "de", "en", "fr", "tr" };

            var urls = new List<string>();
            foreach (var lang in langs)
            {
                urls.Add($"{baseUrl}/{lang}/showroom");
            }

            // Anzeigen, die dieser Lauf neu aufgenommen hat. Etwas Puffer auf das
            // Sync-Intervall, damit ein verzoegerter Lauf nichts verschluckt.
            var cutoff = DateTime.UtcNow - (_syncInterval + TimeSpan.FromMinutes(30));
            var listings = await kleinanzeigenService.GetAllActiveListingsAsync();
            if (listings != null)
            {
                foreach (var listing in listings.Where(l => l.CreatedAt >= cutoff))
                {
                    foreach (var lang in langs)
                    {
                        urls.Add($"{baseUrl}/{lang}/showroom/{listing.Id}");
                    }
                }
            }

            await indexNow.SubmitUrlsAsync(urls);
            _logger.LogInformation("IndexNow: {Count} Showroom-URLs gemeldet", urls.Count);
        }
        catch (Exception ex)
        {
            // Eine fehlgeschlagene Meldung darf den Sync nicht scheitern lassen.
            _logger.LogWarning(ex, "IndexNow-Meldung nach dem Sync fehlgeschlagen");
        }
    }
}
