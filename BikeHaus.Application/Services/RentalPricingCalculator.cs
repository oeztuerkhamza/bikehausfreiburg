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
    /// Zeilensumme einer Zubehörposition in der Miete: Tagespreis × Menge ×
    /// Miettage.
    ///
    /// Einmaliges Zubehör (<paramref name="einmalig"/>) ist Verbrauchsmaterial —
    /// etwa ein Schlauch, den der Mieter für den Notfall mitnimmt. Es wird über
    /// die Mietzeit nicht genutzt, sondern liegt nur bereit, und geht deshalb
    /// GAR NICHT in die Miete ein. Wird es doch verbraucht, ist das ein Fall für
    /// die Kaution, nicht für den Mietvertrag: siehe <see cref="VerbrauchsAbzug"/>.
    /// </summary>
    public static decimal AccessoryLineTotal(decimal preis, int menge, int days, bool einmalig)
        => einmalig ? 0m : preis * menge * Math.Max(1, days);

    /// <summary>Mietanteil einer Zubehörposition eines Mietvertrags.</summary>
    public static decimal LineTotal(this RentalAccessoryItem item, int days)
        => AccessoryLineTotal(item.Tagespreis, item.Menge, days, item.Einmalig);

    /// <summary>Mietanteil einer Zubehörposition einer Online-Buchung.</summary>
    public static decimal LineTotal(this RentalBookingAccessory item, int days)
        => AccessoryLineTotal(item.Tagespreis, item.Menge, days, item.Einmalig);

    /// <summary>
    /// Verbrauchtes Einmal-Zubehör. Der Mieter hat es behalten oder aufgebraucht,
    /// erkennbar daran, dass es bei der Rückgabe nicht abgehakt wurde. Das ist
    /// keine Miete — die Miete steht seit der Unterschrift fest —, sondern ein
    /// Abzug von der Kaution, wie Schaden oder Verspätung.
    /// </summary>
    public static decimal VerbrauchsAbzug(this RentalAccessoryItem item)
        => item.Einmalig && !item.Zurueckgegeben ? item.Tagespreis * item.Menge : 0m;

    /// <summary>Summe des verbrauchten Einmal-Zubehörs eines Mietvertrags.</summary>
    public static decimal VerbrauchsAbzugGesamt(this Rental rental)
        => rental.Accessories.Sum(a => a.VerbrauchsAbzug());

    /// <summary>
    /// Was insgesamt von der Kaution einbehalten wird: Schäden und Verspätung je
    /// Rad, dazu das verbrauchte Einmal-Zubehör des Vertrags. Eine Stelle, damit
    /// Rückgabemaske und Kautionsrückgabebeleg nicht auseinanderlaufen.
    /// </summary>
    public static decimal KautionAbzugGesamt(this Rental rental)
        => rental.Bikes.Sum(b => b.SchadenAbzug + b.VerspaetungsAbzug)
            + rental.VerbrauchsAbzugGesamt();

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