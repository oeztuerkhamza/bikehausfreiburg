using System.Text.Json;
using BikeHaus.Application.DTOs;
using BikeHaus.Application.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace BikeHaus.Infrastructure.Services;

public class GoogleReviewsService : IGoogleReviewsService
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IConfiguration _configuration;
    private readonly ILogger<GoogleReviewsService> _logger;

    private static GoogleReviewsResponse? _cache;
    private static DateTime _cacheExpiry = DateTime.MinValue;
    private static readonly SemaphoreSlim _semaphore = new(1, 1);

    public GoogleReviewsService(
        IHttpClientFactory httpClientFactory,
        IConfiguration configuration,
        ILogger<GoogleReviewsService> logger)
    {
        _httpClientFactory = httpClientFactory;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task<GoogleReviewsResponse?> GetReviewsAsync()
    {
        if (_cache != null && DateTime.UtcNow < _cacheExpiry)
            return _cache;

        await _semaphore.WaitAsync();
        try
        {
            // Double-check after acquiring lock
            if (_cache != null && DateTime.UtcNow < _cacheExpiry)
                return _cache;

            var apiKey = _configuration["GooglePlaces:ApiKey"];
            var placeId = _configuration["GooglePlaces:PlaceId"];

            if (string.IsNullOrEmpty(apiKey) || string.IsNullOrEmpty(placeId))
            {
                _logger.LogWarning("GooglePlaces:ApiKey or GooglePlaces:PlaceId not configured");
                return null;
            }

            var client = _httpClientFactory.CreateClient("GooglePlaces");
            var url = $"https://maps.googleapis.com/maps/api/place/details/json?place_id={Uri.EscapeDataString(placeId)}&fields=rating,user_ratings_total,reviews,url&reviews_sort=newest&language=de&key={apiKey}";

            var response = await client.GetAsync(url);
            if (!response.IsSuccessStatusCode)
            {
                _logger.LogError("Google Places API returned {StatusCode}", response.StatusCode);
                return _cache; // Return stale cache if available
            }

            var json = await response.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(json);
            var root = doc.RootElement;

            var status = root.GetProperty("status").GetString();
            if (status != "OK")
            {
                _logger.LogError("Google Places API status: {Status}", status);
                return _cache;
            }

            var result = root.GetProperty("result");
            var reviews = new List<GoogleReviewDto>();

            if (result.TryGetProperty("reviews", out var reviewsElement))
            {
                foreach (var review in reviewsElement.EnumerateArray())
                {
                    reviews.Add(new GoogleReviewDto
                    {
                        AuthorName = review.TryGetProperty("author_name", out var an) ? an.GetString() ?? "" : "",
                        AuthorPhotoUrl = review.TryGetProperty("profile_photo_url", out var pp) ? pp.GetString() ?? "" : "",
                        Rating = review.TryGetProperty("rating", out var r) ? r.GetInt32() : 5,
                        Text = review.TryGetProperty("text", out var t) ? t.GetString() ?? "" : "",
                        RelativeTime = review.TryGetProperty("relative_time_description", out var rt) ? rt.GetString() ?? "" : "",
                        Time = review.TryGetProperty("time", out var tm) ? tm.GetInt64() : 0,
                    });
                }
            }

            _cache = new GoogleReviewsResponse
            {
                Rating = result.TryGetProperty("rating", out var rating) ? rating.GetDouble() : 0,
                TotalReviews = result.TryGetProperty("user_ratings_total", out var total) ? total.GetInt32() : 0,
                Reviews = reviews,
                PlaceUrl = result.TryGetProperty("url", out var placeUrl) ? placeUrl.GetString() ?? "" : "",
            };
            _cacheExpiry = DateTime.UtcNow.AddHours(24);

            _logger.LogInformation("Fetched {Count} Google reviews, rating {Rating}", reviews.Count, _cache.Rating);
            return _cache;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to fetch Google reviews");
            return _cache; // Return stale cache if available
        }
        finally
        {
            _semaphore.Release();
        }
    }
}
