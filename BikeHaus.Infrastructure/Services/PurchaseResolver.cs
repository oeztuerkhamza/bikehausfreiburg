using BikeHaus.Domain.Entities;
using BikeHaus.Domain.Interfaces;

namespace BikeHaus.Infrastructure.Services;

/// <summary>
/// Findet den Ankaufbeleg zu einem Verkauf. Gemeinsam genutzt vom
/// Verkaufsbeleg-PDF und von der Belegübersicht, damit beide dieselbe
/// Ankaufnummer und denselben Ankaufpreis zeigen.
/// </summary>
internal static class PurchaseResolver
{
    public static async Task<Purchase?> ForSaleAsync(IPurchaseRepository purchaseRepository, Sale sale)
    {
        // Primary source: loaded navigation from Sale details.
        if (sale.Purchase != null)
            return sale.Purchase;

        // Fallback 1: explicit PurchaseId link.
        if (sale.PurchaseId.HasValue)
        {
            var byPurchaseId = await purchaseRepository.GetByIdAsync(sale.PurchaseId.Value);
            if (byPurchaseId != null)
                return byPurchaseId;
        }

        // Fallback 2: relation by BicycleId.
        var byBicycleId = await purchaseRepository.GetByBicycleIdAsync(sale.BicycleId);
        if (byBicycleId != null)
            return byBicycleId;

        // Fallback 3: relation by Lagernummer (stock number) — the shared key
        // between Ankauf- and Verkaufsbelege, designed for exactly this case
        // where Rahmennummer is missing or mismatched.
        var lagernummer = sale.Bicycle?.Lagernummer;
        if (lagernummer.HasValue)
        {
            var byLagernummer = await purchaseRepository.FindAsync(p =>
                p.Bicycle.Lagernummer == lagernummer.Value);
            var match = byLagernummer
                .OrderByDescending(p => p.Kaufdatum)
                .FirstOrDefault();
            if (match != null)
                return match;
        }

        // Fallback 4: relation by Rahmennummer if available.
        var rahmennummer = sale.Bicycle?.Rahmennummer?.Trim();
        if (string.IsNullOrWhiteSpace(rahmennummer))
            return null;

        var matches = await purchaseRepository.FindAsync(p =>
            p.Bicycle.Rahmennummer != null &&
            p.Bicycle.Rahmennummer.ToLower() == rahmennummer.ToLower());

        return matches
            .OrderByDescending(p => p.Kaufdatum)
            .FirstOrDefault();
    }
}
