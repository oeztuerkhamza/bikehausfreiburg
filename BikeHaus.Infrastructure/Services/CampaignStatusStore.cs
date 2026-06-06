using BikeHaus.Application.DTOs;

namespace BikeHaus.Infrastructure.Services;

/// <summary>
/// Singleton holding the live status of the (single) running review-request
/// campaign, so the admin UI can poll progress while the send runs in the
/// background. Thread-safe; only one campaign may run at a time.
/// </summary>
public class CampaignStatusStore
{
    private readonly object _lock = new();

    private string _state = "idle";
    private int _total;
    private int _sent;
    private int _failed;
    private DateTime? _startedAt;
    private DateTime? _finishedAt;
    private string? _lastError;

    public bool IsRunning
    {
        get { lock (_lock) return _state == "running"; }
    }

    /// <summary>Atomically transitions idle → running. Returns false if already running.</summary>
    public bool TryBegin(int total)
    {
        lock (_lock)
        {
            if (_state == "running")
                return false;

            _state = "running";
            _total = total;
            _sent = 0;
            _failed = 0;
            _startedAt = DateTime.UtcNow;
            _finishedAt = null;
            _lastError = null;
            return true;
        }
    }

    /// <summary>Updates the recipient total once it is known (after recipient query).</summary>
    public void SetTotal(int total)
    {
        lock (_lock) _total = total;
    }

    public void IncrementSent()
    {
        lock (_lock) _sent++;
    }

    public void IncrementFailed()
    {
        lock (_lock) _failed++;
    }

    public void Complete()
    {
        lock (_lock)
        {
            _state = "completed";
            _finishedAt = DateTime.UtcNow;
        }
    }

    public void Fail(string error)
    {
        lock (_lock)
        {
            _state = "failed";
            _finishedAt = DateTime.UtcNow;
            _lastError = error;
        }
    }

    public CampaignStatusDto Snapshot()
    {
        lock (_lock)
        {
            return new CampaignStatusDto(_state, _total, _sent, _failed, _startedAt, _finishedAt, _lastError);
        }
    }
}
