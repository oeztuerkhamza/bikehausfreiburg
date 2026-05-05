export interface RentalPriceConfig {
  rentalPriceDay1?: number | null;
  rentalPriceDay2?: number | null;
  rentalPriceDay3?: number | null;
  rentalPriceDay4?: number | null;
  rentalPriceDay5?: number | null;
  rentalPriceDay6?: number | null;
  rentalPriceDay7?: number | null;
  rentalPriceAdditionalDayAfter7?: number | null;
}

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

function getExactPrice(config: RentalPriceConfig, day: number): number | null {
  const price =
    day === 1
      ? config.rentalPriceDay1
      : day === 2
        ? config.rentalPriceDay2
        : day === 3
          ? config.rentalPriceDay3
          : day === 4
            ? config.rentalPriceDay4
            : day === 5
              ? config.rentalPriceDay5
              : day === 6
                ? config.rentalPriceDay6
                : day === 7
                  ? config.rentalPriceDay7
                  : null;

  return price ?? null;
}

export function getConfiguredRentalPriceLines(
  config: RentalPriceConfig,
): RentalPriceLine[] {
  const lines: RentalPriceLine[] = [];

  for (let day = 1; day <= 7; day++) {
    const price = getExactPrice(config, day);
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
  config: RentalPriceConfig,
  days: number,
): RentalPriceResult {
  if (days <= 0) {
    return { total: null, info: '' };
  }

  const exactPrice = getExactPrice(config, days);
  if (exactPrice != null) {
    return {
      total: exactPrice,
      info: `${days} Tag${days > 1 ? 'e' : ''} = ${exactPrice.toFixed(2)} €`,
    };
  }

  if (days <= 7) {
    for (let nextDay = days + 1; nextDay <= 7; nextDay++) {
      const nextPrice = getExactPrice(config, nextDay);
      if (nextPrice != null) {
        return {
          total: nextPrice,
          info: `${days} Tage nutzen den konfigurierten ${nextDay}-Tage-Preis = ${nextPrice.toFixed(2)} €`,
        };
      }
    }

    for (let previousDay = days - 1; previousDay >= 1; previousDay--) {
      const previousPrice = getExactPrice(config, previousDay);
      if (previousPrice != null) {
        return {
          total: previousPrice,
          info: `${days} Tage nutzen den letzten verfügbaren Preis (${previousDay} Tage) = ${previousPrice.toFixed(2)} €`,
        };
      }
    }
  }

  if (
    days > 7 &&
    config.rentalPriceDay7 != null &&
    config.rentalPriceAdditionalDayAfter7 != null
  ) {
    const extraDays = days - 7;
    const total =
      config.rentalPriceDay7 +
      extraDays * config.rentalPriceAdditionalDayAfter7;
    return {
      total,
      info: `7 Tage (${config.rentalPriceDay7.toFixed(2)} €) + ${extraDays} Zusatztag(e) × ${config.rentalPriceAdditionalDayAfter7.toFixed(2)} € = ${total.toFixed(2)} €`,
    };
  }

  if (config.rentalPriceDay1 != null) {
    const total = config.rentalPriceDay1 * days;
    return {
      total,
      info: `${days} Tag${days > 1 ? 'e' : ''} × ${config.rentalPriceDay1.toFixed(2)} € = ${total.toFixed(2)} €`,
    };
  }

  return { total: null, info: '' };
}
