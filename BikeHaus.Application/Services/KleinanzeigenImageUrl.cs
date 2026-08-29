using System.Text.RegularExpressions;

namespace BikeHaus.Application.Services;

/// <summary>
/// Bildadressen von Kleinanzeigen auf die grosse Variante bringen.
///
/// Die Groesse steckt in der Adresse selbst, in zwei Formen:
///
///   alt   .../images/ab/&lt;id&gt;/$_2.JPG          — im PFAD
///   heute .../images/ab/&lt;id&gt;?rule=$_2.AUTO    — im QUERY
///
/// Weil das eine reine Umschrift ist und keinen Seitenabruf braucht, laeuft sie
/// an ZWEI Stellen: beim Einlesen (damit gar nichts Kleines gespeichert wird)
/// und beim Ausliefern (damit auch die bereits gespeicherten Adressen sofort
/// gross ausgehen, ohne auf einen neuen Durchlauf des Scrapers zu warten).
/// Deshalb liegt sie hier und nicht im Scraper.
/// </summary>
public static class KleinanzeigenImageUrl
{
    private const string LargeRule = "$_59";

    private static readonly Regex SizeInPath = new(
        @"/\$_\d+\.(JPG|AUTO)", RegexOptions.IgnoreCase | RegexOptions.Compiled);

    private static readonly Regex SizeInQuery = new(
        @"rule=\$_\d+\.(JPG|AUTO)", RegexOptions.IgnoreCase | RegexOptions.Compiled);

    /// <summary>
    /// Gibt die Adresse in der grossen Variante zurueck. Fremde Adressen und
    /// leere Werte bleiben unveraendert.
    /// </summary>
    public static string ToLargeVariant(string? imageUrl)
    {
        if (string.IsNullOrWhiteSpace(imageUrl)) return imageUrl ?? string.Empty;

        // ACHTUNG: Der Ersetzungstext darf NICHT als Zeichenkette uebergeben
        // werden — "$_" ist in .NET ein Platzhalter fuer die gesamte Eingabe und
        // baut die komplette Adresse in sich selbst ein. Daher MatchEvaluator.
        var result = SizeInPath.Replace(imageUrl, _ => $"/{LargeRule}.JPG");
        result = SizeInQuery.Replace(result, _ => $"rule={LargeRule}.AUTO");

        if (result != imageUrl) return result;

        // Keine Groessenangabe vorhanden: nur anhaengen, wenn die Adresse noch
        // keinen Query-String hat, sonst zerstoert man einen vorhandenen Parameter.
        if (result.IndexOf('?') < 0
            && result.Contains("/prod-ads/images/", StringComparison.OrdinalIgnoreCase))
            return $"{result}?rule={LargeRule}.AUTO";

        return result;
    }

    /// <summary>Adressen, die schon gross sind — nichts zu tun.</summary>
    public static bool IsLargeVariant(string? imageUrl)
        => !string.IsNullOrWhiteSpace(imageUrl) && imageUrl.Contains(LargeRule, StringComparison.Ordinal);
}
