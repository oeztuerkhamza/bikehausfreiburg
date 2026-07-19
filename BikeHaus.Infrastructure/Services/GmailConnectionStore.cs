using System.Text.Json;
using Microsoft.Extensions.Configuration;

namespace BikeHaus.Infrastructure.Services;

/// <summary>
/// Persistierte Gmail-Verbindung (zentral, serverseitig). Liegt als JSON im
/// Datenverzeichnis (in Produktion im Docker-Volume /app/data) und übersteht damit
/// Neustarts. Enthält den langlebigen Refresh-Token.
/// </summary>
public class GmailConnection
{
    public string Email { get; set; } = string.Empty;
    public string RefreshToken { get; set; } = string.Empty;
    public string? AccessToken { get; set; }
    public DateTime AccessTokenExpiryUtc { get; set; }
    public DateTime ConnectedAtUtc { get; set; }
}

public interface IGmailConnectionStore
{
    GmailConnection? Get();
    void Save(GmailConnection connection);
    void Clear();
}

public class FileGmailConnectionStore : IGmailConnectionStore
{
    private static readonly JsonSerializerOptions JsonOptions = new() { WriteIndented = true };
    private readonly string _filePath;
    private readonly object _lock = new();
    private GmailConnection? _cached;
    private bool _loaded;

    public FileGmailConnectionStore(IConfiguration configuration)
    {
        var basePath = configuration["FileStorage:BasePath"]
            ?? Path.Combine(Directory.GetCurrentDirectory(), "uploads");
        if (!Path.IsPathRooted(basePath))
            basePath = Path.Combine(Directory.GetCurrentDirectory(), basePath);
        var dir = Path.Combine(basePath, "gmail");
        Directory.CreateDirectory(dir);
        _filePath = Path.Combine(dir, "connection.json");
    }

    public GmailConnection? Get()
    {
        lock (_lock)
        {
            if (!_loaded)
            {
                if (File.Exists(_filePath))
                {
                    try
                    {
                        _cached = JsonSerializer.Deserialize<GmailConnection>(File.ReadAllText(_filePath));
                    }
                    catch
                    {
                        _cached = null;
                    }
                }
                _loaded = true;
            }
            return _cached;
        }
    }

    public void Save(GmailConnection connection)
    {
        lock (_lock)
        {
            _cached = connection;
            _loaded = true;
            File.WriteAllText(_filePath, JsonSerializer.Serialize(connection, JsonOptions));
        }
    }

    public void Clear()
    {
        lock (_lock)
        {
            _cached = null;
            _loaded = true;
            if (File.Exists(_filePath))
                File.Delete(_filePath);
        }
    }
}
