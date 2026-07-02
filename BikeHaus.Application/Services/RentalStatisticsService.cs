using BikeHaus.Application.DTOs;
using BikeHaus.Application.Interfaces;
using BikeHaus.Domain.Entities;
using BikeHaus.Domain.Enums;
using BikeHaus.Domain.Interfaces;

namespace BikeHaus.Application.Services;

public class RentalStatisticsService : IRentalStatisticsService
{
    private readonly IRentalRepository _rentalRepository;

    public RentalStatisticsService(IRentalRepository rentalRepository)
    {
        _rentalRepository = rentalRepository;
    }

    public async Task<RentalStatisticsDto> GetRentalStatisticsAsync(DateTime startDate, DateTime endDate)
    {
        var rangeStart = startDate.Date;
        var rangeEnd = endDate.Date;

        var allRentals = await _rentalRepository.GetAllAsync();

        // Nur gültige Mietverträge (stornierte zählen nicht als Umsatz/Vermietung).
        // Jedes Rad hat seinen eigenen Zeitraum & Preis (RentalBike).
        var bikes = allRentals
            .Where(r => r.Status != RentalStatus.Cancelled)
            .SelectMany(r => r.Bikes)
            .ToList();

        // Räder, deren Mietzeitraum sich mit dem gewählten Bereich überschneidet.
        var overlappingBikes = bikes
            .Where(b => b.StartDatum.Date <= rangeEnd && b.EndDatum.Date >= rangeStart)
            .ToList();

        // Räder, deren Miete im Bereich beginnt (für Umsatz-Zuordnung am Starttag).
        var bikesStartingInRange = bikes
            .Where(b => b.StartDatum.Date >= rangeStart && b.StartDatum.Date <= rangeEnd)
            .ToList();

        // Gesamt-Miettage = Summe der Überschneidungstage über alle Räder.
        var totalRentalDays = overlappingBikes.Sum(b => OverlapDays(b, rangeStart, rangeEnd));
        var totalRevenue = bikesStartingInRange.Sum(b => b.Mietpreis);
        var rentedBikeCount = overlappingBikes.Select(b => b.BicycleId).Distinct().Count();
        var rentalContractCount = bikesStartingInRange.Select(b => b.RentalId).Distinct().Count();

        // Tägliche Aufschlüsselung
        var days = (rangeEnd - rangeStart).Days + 1;
        var dailyBreakdown = Enumerable.Range(0, days)
            .Select(offset =>
            {
                var date = rangeStart.AddDays(offset);
                var activeThatDay = overlappingBikes
                    .Where(b => b.StartDatum.Date <= date && b.EndDatum.Date >= date)
                    .ToList();
                var startingThatDay = bikes
                    .Where(b => b.StartDatum.Date == date)
                    .ToList();

                return new RentalDailyStatsDto(
                    Date: date,
                    RentedBikeCount: activeThatDay.Count,
                    NewRentalCount: startingThatDay.Count,
                    Revenue: startingThatDay.Sum(b => b.Mietpreis)
                );
            })
            .ToList();

        // Top-Räder nach Miettagen im Zeitraum
        var topBikes = overlappingBikes
            .GroupBy(b => BikeName(b))
            .Select(g => new TopRentalBikeDto(
                Bike: g.Key,
                RentalDays: g.Sum(b => OverlapDays(b, rangeStart, rangeEnd)),
                Revenue: g.Where(b => b.StartDatum.Date >= rangeStart && b.StartDatum.Date <= rangeEnd)
                          .Sum(b => b.Mietpreis)
            ))
            .OrderByDescending(b => b.RentalDays)
            .ThenByDescending(b => b.Revenue)
            .Take(5)
            .ToList();

        return new RentalStatisticsDto(
            StartDate: rangeStart,
            EndDate: rangeEnd,
            TotalRentalDays: totalRentalDays,
            RentalContractCount: rentalContractCount,
            RentedBikeCount: rentedBikeCount,
            TotalRevenue: totalRevenue,
            DailyBreakdown: dailyBreakdown,
            TopBikes: topBikes
        );
    }

    private static int OverlapDays(RentalBike bike, DateTime rangeStart, DateTime rangeEnd)
    {
        var start = bike.StartDatum.Date < rangeStart ? rangeStart : bike.StartDatum.Date;
        var end = bike.EndDatum.Date > rangeEnd ? rangeEnd : bike.EndDatum.Date;
        var days = (end - start).Days + 1;
        return days > 0 ? days : 0;
    }

    private static string BikeName(RentalBike bike)
    {
        var marke = bike.Bicycle?.Marke;
        var modell = bike.Bicycle?.Modell;
        var name = string.Join(" ", new[] { marke, modell }
            .Where(s => !string.IsNullOrWhiteSpace(s)));

        if (!string.IsNullOrWhiteSpace(name))
            return name;

        if (!string.IsNullOrWhiteSpace(bike.Rahmennummer))
            return bike.Rahmennummer!;

        return "—";
    }
}
