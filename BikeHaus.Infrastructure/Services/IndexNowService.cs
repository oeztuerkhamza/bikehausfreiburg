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

    public IndexNowService(
        IHttpClientFactory httpClientFactory,
        ILogger<IndexNowService> logger,
        IConfiguration configuration)
    {
        _httpClientFactory = httpClientFactory;
        _logger = logger;
        _apiKey = configuration["IndexNow:ApiKey"] ?? "b7e4c8a1d3f54e89a2c6b0d7f1e3a5c9";
        _host = configuration["IndexNow:Host"] ?? "bikehausfreiburg.com";
    }

    public async Task SubmitUrlAsync(string url)
    {
        await SubmitUrlsAsync(new[] { url });
    }

    public async Task SubmitUrlsAsync(IEnumerable<string> urls)
    {
        var urlList = urls.ToList();
        if (urlList.Count == 0) return;

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
