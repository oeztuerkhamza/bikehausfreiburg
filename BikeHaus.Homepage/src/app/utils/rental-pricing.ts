import { RentalPrice } from '../models/models';

export interface RentalPriceLine {
  day: number;
  label: string;
  shortLabel: string;
  price: number;
}

export interface RentalPriceResult {
  total: number | null;
  info: string;
}

function getExactPrice(prices: RentalPrice, day: number): number | null {
  const price =
    day === 1
      ? prices.day1
      : day === 2
        ? prices.day2
        : day === 3
          ? prices.day3
          : day === 4
            ? prices.day4
            : day === 5
              ? prices.day5
              : day === 6
                ? prices.day6
                : day === 7
                  ? prices.day7
                  : null;

  return price ?? null;
}

export function getConfiguredRentalPriceLines(
  prices: RentalPrice,
): RentalPriceLine[] {
  const lines: RentalPriceLine[] = [];

  for (let day = 1; day <= 7; day++) {
    const price = getExactPrice(prices, day);
    if (price != null) {
      lines.push({
        day,
        label: `${day} Tag${day > 1 ? 'e' : ''}`,
        shortLabel: `${day}T`,
        price,
      });
    }
  }

  return lines;
}

export function calculateRentalPrice(
  prices: RentalPrice,
  days: number,
): RentalPriceResult {
  if (days <= 0) {
    return { total: null, info: '' };
  }

  const exactPrice = getExactPrice(prices, days);
  if (exactPrice != null) {
    return {
      total: exactPrice,
      info: `${days} Tag${days > 1 ? 'e' : ''} = ${exactPrice.toFixed(2)} €`,
    };
  }

  if (days <= 7) {
    for (let nextDay = days + 1; nextDay <= 7; nextDay++) {
      const nextPrice = getExactPrice(prices, nextDay);
      if (nextPrice != null) {
        return {
          total: nextPrice,
          info: `${days} Tage nutzen den konfigurierten ${nextDay}-Tage-Preis = ${nextPrice.toFixed(2)} €`,
        };
      }
    }

    for (let previousDay = days - 1; previousDay >= 1; previousDay--) {
      const previousPrice = getExactPrice(prices, previousDay);
      if (previousPrice != null) {
        return {
          total: previousPrice,
          info: `${days} Tage nutzen den letzten verfügbaren Preis (${previousDay} Tage) = ${previousPrice.toFixed(2)} €`,
        };
      }
    }
  }

  if (days > 7 && prices.day7 != null && prices.additionalDayAfter7 != null) {
    const extraDays = days - 7;
    const total = prices.day7 + extraDays * prices.additionalDayAfter7;
    return {
      total,
      info: `7 Tage (${prices.day7.toFixed(2)} €) + ${extraDays} Zusatztag(e) × ${prices.additionalDayAfter7.toFixed(2)} € = ${total.toFixed(2)} €`,
    };
  }

  if (prices.day1 != null) {
    const total = prices.day1 * days;
    return {
      total,
      info: `${days} Tag${days > 1 ? 'e' : ''} × ${prices.day1.toFixed(2)} € = ${total.toFixed(2)} €`,
    };
  }

  return { total: null, info: '' };
}
