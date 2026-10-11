using BikeHaus.Application.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.Net.Http.Json;

namespace BikeHaus.Infrastructure.Services;

public class IndexNowService : IIndexNowService
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly ILogger<IndexNowService> _logger;
    private readonly string _apiKey;
    private readonly string _host;
    private readonly bool _enabled;

    public IndexNowService(
        IHttpClientFactory httpClientFactory,
        ILogger<IndexNowService> logger,
        IConfiguration configuration)
    {
        _httpClientFactory = httpClientFactory;
        _logger = logger;
        _apiKey = configuration["IndexNow:ApiKey"] ?? throw new InvalidOperationException("IndexNow:ApiKey is not configured.");
        _host = configuration["IndexNow:Host"] ?? "bikehausfreiburg.com";
        // Standard ist AUS: die Seite wird bewusst aus dem Index genommen, da
        // waere es widersinnig, neue URLs aktiv bei Suchmaschinen anzumelden.
        // Der Schalter sitzt hier und nicht an den Aufrufstellen, damit beide
        // Wege stillliegen — der 4h-Sync UND POST /api/public/notify-indexnow.
        // Wieder einschalten: IndexNow:Enabled = true (bzw. IndexNow__Enabled).
        // Bewusst ueber den Indexer statt GetValue<T>(): das braucht nur
        // Configuration.Abstractions, nicht zusaetzlich den Binder.
        _enabled = bool.TryParse(configuration["IndexNow:Enabled"], out var enabled) && enabled;
    }

    public async Task SubmitUrlAsync(string url)
    {
        await SubmitUrlsAsync(new[] { url });
    }

    public async Task SubmitUrlsAsync(IEnumerable<string> urls)
    {
        var urlList = urls.ToList();
        if (urlList.Count == 0) return;

        if (!_enabled)
        {
            _logger.LogInformation(
                "IndexNow: abgeschaltet (IndexNow:Enabled=false) — {Count} URL(s) NICHT gemeldet. Siehe SEO-DEINDEX.md",
                urlList.Count);
            return;
        }

        try
        {
            var client = _httpClientFactory.CreateClient("IndexNow");
            var payload = new
            {
                host = _host,
                key = _apiKey,
                keyLocation = $"https://{_host}/{_apiKey}.txt",
                urlList = urlList
            };

            var response = await client.PostAsJsonAsync(
                "https://api.indexnow.org/IndexNow",
                payload);

            if (response.IsSuccessStatusCode)
            {
                _logger.LogInformation("IndexNow: Successfully submitted {Count} URL(s)", urlList.Count);
            }
            else
            {
                var body = await response.Content.ReadAsStringAsync();
                _logger.LogWarning("IndexNow: Failed with {Status} — {Body}", response.StatusCode, body);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "IndexNow: Error submitting URLs");
        }
    }
}
