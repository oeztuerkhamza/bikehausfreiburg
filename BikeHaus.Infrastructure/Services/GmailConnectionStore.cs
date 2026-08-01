using System.Text.Json;
using BikeHaus.Application.Interfaces;
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
    GmailConnection? Get(string account = GmailAccounts.Default);
    void Save(GmailConnection connection, string account = GmailAccounts.Default);
    void Clear(string account = GmailAccounts.Default);
}

public class FileGmailConnectionStore : IGmailConnectionStore
{
    private static readonly JsonSerializerOptions JsonOptions = new() { WriteIndented = true };
    private readonly string _dir;
    private readonly object _lock = new();
    private readonly Dictionary<string, GmailConnection?> _cache = new();

    public FileGmailConnectionStore(IConfiguration configuration)
    {
        var basePath = configuration["FileStorage:BasePath"]
            ?? Path.Combine(Directory.GetCurrentDirectory(), "uploads");
        if (!Path.IsPathRooted(basePath))
            basePath = Path.Combine(Directory.GetCurrentDirectory(), basePath);
        _dir = Path.Combine(basePath, "gmail");
        Directory.CreateDirectory(_dir);
    }

    // Das Standardkonto behält den alten Dateinamen — eine bereits bestehende
    // Verbindung bleibt nach dem Update ohne erneutes Anmelden gültig.
    private string FilePath(string account) =>
        account == GmailAccounts.Default
            ? Path.Combine(_dir, "connection.json")
            : Path.Combine(_dir, $"connection-{account}.json");

    public GmailConnection? Get(string account = GmailAccounts.Default)
    {
        account = GmailAccounts.Normalize(account);
        lock (_lock)
        {
            if (_cache.TryGetValue(account, out var cached)) return cached;

            GmailConnection? conn = null;
            var path = FilePath(account);
            if (File.Exists(path))
            {
                try
                {
                    conn = JsonSerializer.Deserialize<GmailConnection>(File.ReadAllText(path));
                }
                catch
                {
                    conn = null;
                }
            }
            _cache[account] = conn;
            return conn;
        }
    }

    public void Save(GmailConnection connection, string account = GmailAccounts.Default)
    {
        account = GmailAccounts.Normalize(account);
        lock (_lock)
        {
            _cache[account] = connection;
            File.WriteAllText(FilePath(account), JsonSerializer.Serialize(connection, JsonOptions));
        }
    }

    public void Clear(string account = GmailAccounts.Default)
    {
        account = GmailAccounts.Normalize(account);
        lock (_lock)
        {
            _cache[account] = null;
            var path = FilePath(account);
            if (File.Exists(path)) File.Delete(path);
        }
    }
}
