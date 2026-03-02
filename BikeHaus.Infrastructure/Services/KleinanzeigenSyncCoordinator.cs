using BikeHaus.Application.DTOs;
using BikeHaus.Application.Interfaces;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace BikeHaus.Infrastructure.Services;

/// <summary>
/// Singleton service that coordinates Kleinanzeigen sync operations.
/// Ensures only one sync runs at a time and tracks status for polling.
/// </summary>
public class KleinanzeigenSyncCoordinator
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<KleinanzeigenSyncCoordinator> _logger;
    private readonly SemaphoreSlim _syncLock = new(1, 1);
    private CancellationTokenSource? _currentSyncCts;

    /// <summary>Maximum time allowed for a single sync operation (10 minutes).</summary>
    private static readonly TimeSpan SyncTimeout = TimeSpan.FromMinutes(10);

    public bool IsSyncing { get; private set; }
    public KleinanzeigenSyncResultDto? LastResult { get; private set; }
    public DateTime? SyncStartedAt { get; private set; }

    public KleinanzeigenSyncCoordinator(
        IServiceProvider serviceProvider,
        ILogger<KleinanzeigenSyncCoordinator> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    /// <summary>
    /// Triggers a sync in the background. Returns false if already syncing.
    /// </summary>
    public bool TriggerSync()
    {
        if (!_syncLock.Wait(0))
        {
            _logger.LogInformation("Sync already in progress, skipping trigger.");
            return false;
        }

        IsSyncing = true;
        SyncStartedAt = DateTime.UtcNow;
        LastResult = null;

        _ = Task.Run(async () =>
        {
            _currentSyncCts = new CancellationTokenSource(SyncTimeout);
            try
            {
                _logger.LogInformation("Background sync triggered at {Time} (timeout: {Timeout}min)",
                    SyncStartedAt, SyncTimeout.TotalMinutes);

                using var scope = _serviceProvider.CreateScope();
                var service = scope.ServiceProvider.GetRequiredService<IKleinanzeigenService>();
                LastResult = await service.TriggerSyncAsync(_currentSyncCts.Token);

                if (LastResult.Error != null)
                {
                    _logger.LogWarning("Sync completed with error: {Error}", LastResult.Error);
                }
                else
                {
                    _logger.LogInformation(
                        "Sync completed: {New} new, {Updated} updated, {Deactivated} deactivated",
                        LastResult.NewListings, LastResult.UpdatedListings, LastResult.DeactivatedListings);
                }
            }
            catch (OperationCanceledException)
            {
                _logger.LogWarning("Sync was cancelled due to timeout ({Timeout}min)", SyncTimeout.TotalMinutes);
                LastResult = new KleinanzeigenSyncResultDto
                {
                    Error = $"Sync timed out after {SyncTimeout.TotalMinutes} minutes",
                    SyncedAt = DateTime.UtcNow
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Sync failed with exception");
                LastResult = new KleinanzeigenSyncResultDto
                {
                    Error = $"Sync failed: {ex.Message}",
                    SyncedAt = DateTime.UtcNow
                };
            }
            finally
            {
                IsSyncing = false;
                _syncLock.Release();
                _currentSyncCts?.Dispose();
                _currentSyncCts = null;
            }
        });

        return true;
    }

    /// <summary>
    /// Used by the background service to run sync synchronously within its own scope.
    /// </summary>
    public async Task<KleinanzeigenSyncResultDto> RunSyncDirectAsync(
        IKleinanzeigenService service,
        CancellationToken cancellationToken = default)
    {
        if (!_syncLock.Wait(0))
        {
            return new KleinanzeigenSyncResultDto
            {
                Error = "Sync already in progress",
                SyncedAt = DateTime.UtcNow
            };
        }

        IsSyncing = true;
        SyncStartedAt = DateTime.UtcNow;
        LastResult = null;

        // Use a linked CTS so we respect both the caller's token and our own timeout
        using var timeoutCts = new CancellationTokenSource(SyncTimeout);
        using var linkedCts = CancellationTokenSource.CreateLinkedTokenSource(
            cancellationToken, timeoutCts.Token);

        try
        {
            LastResult = await service.TriggerSyncAsync(linkedCts.Token);
            return LastResult;
        }
        catch (OperationCanceledException)
        {
            LastResult = new KleinanzeigenSyncResultDto
            {
                Error = $"Sync timed out after {SyncTimeout.TotalMinutes} minutes",
                SyncedAt = DateTime.UtcNow
            };
            return LastResult;
        }
        catch (Exception ex)
        {
            LastResult = new KleinanzeigenSyncResultDto
            {
                Error = $"Sync failed: {ex.Message}",
                SyncedAt = DateTime.UtcNow
            };
            return LastResult;
        }
        finally
        {
            IsSyncing = false;
            _syncLock.Release();
        }
    }
}
