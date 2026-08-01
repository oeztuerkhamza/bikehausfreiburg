using System.Globalization;
using System.Text.RegularExpressions;
using BikeHaus.Application.DTOs;
using BikeHaus.Application.Interfaces;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;

namespace BikeHaus.Infrastructure.Services;

/// <summary>
/// Liest Titel, Foto und Preis einer Anzeige direkt von der Anzeigenseite.
///
/// Hintergrund: Der Chat zeigt zur Unterhaltung die passende Anzeige. Normalerweise
/// kommen diese Daten aus dem gescrapten Bestand (<c>KleinanzeigenListings</c>) —
/// der deckt aber nur das eine Profil ab, das der Scraper abgrast. Anzeigen unter
/// einem anderen Kleinanzeigen-Konto oder ganz frisch eingestellte fehlen dort.
///
/// Die Anzeigenseite ist ohne Anmeldung erreichbar und trägt alles Nötige in den
/// Meta-Tags: <c>og:image</c>, <c>og:title</c> und <c>itemprop="price"</c>. Ein
/// einfacher GET genügt — kein Browser, kein Playwright. Die Kurz-URL
/// <c>/s-anzeige/-/{Anzeigennummer}</c> funktioniert ohne den Titel-Slug.
///
/// Ergebnisse werden zwischengespeichert (auch Fehlschläge, kürzer), damit das
/// Pollen der App nicht bei jedem Durchlauf erneut bei Kleinanzeigen anklopft.
/// </summary>
public class KleinanzeigenAdLookupService(
    HttpClient http,
    IMemoryCache cache,
    ILogger<KleinanzeigenAdLookupService> logger) : IKleinanzeigenAdLookup
{
    private static readonly TimeSpan HitTtl = TimeSpan.FromHours(12);
    private static readonly TimeSpan MissTtl = TimeSpan.FromHours(2);

    private static readonly Regex ImageRegex =
        new("<meta[^>]+property=\"og:image\"[^>]+content=\"([^\"]+)\"", RegexOptions.IgnoreCase | RegexOptions.Compiled);
    private static readonly Regex TitleRegex =
        new("<meta[^>]+property=\"og:title\"[^>]+content=\"([^\"]+)\"", RegexOptions.IgnoreCase | RegexOptions.Compiled);
    private static readonly Regex PriceRegex =
        new("itemprop=\"price\"[^>]+content=\"([0-9.,]+)\"", RegexOptions.IgnoreCase | RegexOptions.Compiled);

    public static string AdUrl(string adId) => $"https://www.kleinanzeigen.de/s-anzeige/-/{adId}";

    public async Task<KleinanzeigenAdInfoDto?> GetAsync(string adId, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(adId) || !adId.All(char.IsDigit)) return null;

        var key = $"ka-ad:{adId}";
        if (cache.TryGetValue(key, out KleinanzeigenAdInfoDto? cached)) return cached;

        KleinanzeigenAdInfoDto? info = null;
        try
        {
            using var req = new HttpRequestMessage(HttpMethod.Get, AdUrl(adId));
            // Ohne Browser-Kennung liefert Kleinanzeigen eine Sperrseite.
            req.Headers.TryAddWithoutValidation("User-Agent",
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");
            req.Headers.TryAddWithoutValidation("Accept-Language", "de-DE,de;q=0.9");

            using var res = await http.SendAsync(req, ct);
            if (res.IsSuccessStatusCode)
            {
                var html = await res.Content.ReadAsStringAsync(ct);
                var image = ImageRegex.Match(html);
                var title = TitleRegex.Match(html);
                var price = PriceRegex.Match(html);

                // Gibt es die Anzeige nicht (mehr), liefert Kleinanzeigen die
                // Startseite MIT og:image — dann steht dort aber das Seitenlogo von
                // static.kleinanzeigen.de. Echte Anzeigenfotos kommen ausschließlich
                // von img.kleinanzeigen.de; alles andere zählt als "kein Foto".
                var imageUrl = image.Success ? image.Groups[1].Value : null;
                if (imageUrl != null && !imageUrl.Contains("img.kleinanzeigen.de", StringComparison.OrdinalIgnoreCase))
                    imageUrl = null;

                info = new KleinanzeigenAdInfoDto(
                    Title: title.Success ? System.Net.WebUtility.HtmlDecode(title.Groups[1].Value) : null,
                    Price: price.Success && decimal.TryParse(
                            price.Groups[1].Value, NumberStyles.Number, CultureInfo.InvariantCulture, out var p)
                        ? p
                        : null,
                    Url: AdUrl(adId),
                    ImageUrl: imageUrl);

                // Ohne Foto ist der Treffer wertlos — dann lieber als "nicht
                // gefunden" behandeln, damit die Oberfläche auf den Platzhalter
                // zurückfällt statt Titel/Preis der Startseite zu zeigen.
                if (imageUrl == null) info = null;
            }
            else
            {
                logger.LogDebug("Anzeige {AdId} nicht abrufbar: {Status}", adId, res.StatusCode);
            }
        }
        catch (Exception ex)
        {
            logger.LogDebug(ex, "Anzeige {AdId} konnte nicht geladen werden.", adId);
        }

        cache.Set(key, info, info?.ImageUrl != null ? HitTtl : MissTtl);
        return info;
    }
}
