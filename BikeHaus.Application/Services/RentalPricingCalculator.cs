using BikeHaus.Domain.Entities;

namespace BikeHaus.Application.Services;

public static class RentalPricingCalculator
{
    /// <summary>Tage inklusive Start- und Endtag (1 Tag = Start == Ende), mindestens 1.</summary>
    public static int CalculateDaysInclusive(DateTime start, DateTime end)
    {
        var days = (end.Date - start.Date).Days + 1;
        return Math.Max(1, days);
    }

    /// <summary>
    /// Zeilensumme einer Zubehörposition.
    ///
    /// Standard ist ein Tagespreis, der mit den Miettagen multipliziert wird.
    ///
    /// Einmaliges Zubehör (<paramref name="einmalig"/>) ist Verbrauchsmaterial —
    /// etwa ein Schlauch, den der Mieter mitnimmt. Es kostet unabhängig von der
    /// Mietdauer einmal Preis × Menge, und nur dann, wenn es auch verbraucht
    /// wurde (<paramref name="verbraucht"/>). Kommt der Schlauch unbenutzt
    /// zurück, wird nichts berechnet.
    /// </summary>
    public static decimal AccessoryLineTotal(decimal preis, int menge, int days, bool einmalig, bool verbraucht)
        => einmalig
            ? (verbraucht ? preis * menge : 0m)
            : preis * menge * Math.Max(1, days);

    /// <summary>
    /// Zeilensumme einer Zubehörposition eines Mietvertrags. Einmaliges Zubehör
    /// gilt als verbraucht, sobald es bei der Rückgabe nicht als zurückgegeben
    /// abgehakt wurde.
    /// </summary>
    public static decimal LineTotal(this RentalAccessoryItem item, int days)
        => AccessoryLineTotal(item.Tagespreis, item.Menge, days, item.Einmalig, !item.Zurueckgegeben);

    /// <summary>
    /// Zeilensumme einer Zubehörposition einer Online-Buchung. Einmaliges
    /// Zubehör steht bei der Buchung nur bereit — ob es verbraucht wird, zeigt
    /// sich erst bei der Rückgabe im Laden. Es geht deshalb nicht in den
    /// Buchungspreis ein.
    /// </summary>
    public static decimal LineTotal(this RentalBookingAccessory item, int days)
        => AccessoryLineTotal(item.Tagespreis, item.Menge, days, item.Einmalig, verbraucht: false);

    public static decimal? CalculateBikePrice(Bicycle bicycle, int days)
    {
        if (days <= 0)
            return null;

        var exactPrice = days switch
        {
            1 => bicycle.RentalPriceDay1,
            2 => bicycle.RentalPriceDay2,
            3 => bicycle.RentalPriceDay3,
            4 => bicycle.RentalPriceDay4,
            5 => bicycle.RentalPriceDay5,
            6 => bicycle.RentalPriceDay6,
            7 => bicycle.RentalPriceDay7,
            _ => null,
        };

        if (exactPrice.HasValue)
            return exactPrice.Value;

        if (days <= 7)
        {
            var configured = new[]
            {
                (Day: 1, Price: bicycle.RentalPriceDay1),
                (Day: 2, Price: bicycle.RentalPriceDay2),
                (Day: 3, Price: bicycle.RentalPriceDay3),
                (Day: 4, Price: bicycle.RentalPriceDay4),
                (Day: 5, Price: bicycle.RentalPriceDay5),
                (Day: 6, Price: bicycle.RentalPriceDay6),
                (Day: 7, Price: bicycle.RentalPriceDay7),
            };

            var nextConfigured = configured
                .FirstOrDefault(entry => entry.Day >= days && entry.Price.HasValue);

            if (nextConfigured.Price.HasValue)
                return nextConfigured.Price.Value;

            var previousConfigured = configured
                .Where(entry => entry.Day < days && entry.Price.HasValue)
                .OrderByDescending(entry => entry.Day)
                .FirstOrDefault();

            if (previousConfigured.Price.HasValue)
                return previousConfigured.Price.Value;
        }

        if (days > 7 && bicycle.RentalPriceDay7.HasValue && bicycle.RentalPriceAdditionalDayAfter7.HasValue)
            return bicycle.RentalPriceDay7.Value + ((days - 7) * bicycle.RentalPriceAdditionalDayAfter7.Value);

        if (bicycle.RentalPriceDay1.HasValue)
            return bicycle.RentalPriceDay1.Value * days;

        return null;
    }
}