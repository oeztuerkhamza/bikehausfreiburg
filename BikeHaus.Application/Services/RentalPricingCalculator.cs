using BikeHaus.Domain.Entities;

namespace BikeHaus.Application.Services;

public static class RentalPricingCalculator
{
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