import { PublicBicycle } from '../models/models';

/**
 * Baut aus einem eigenen Bestandsrad einen Anzeigentitel im GLEICHEN Format
 * wie die Kleinanzeigen-Anzeigen des Ladens.
 *
 * Warum das Format zaehlt: Der Showroom filtert NICHT ueber strukturierte
 * Felder, sondern parst den Titel (showroom.component.ts, ZOLL_PATTERN /
 * GEARS_PATTERN / SIZE_PATTERN / TYP_PATTERN / NEW_PATTERN). Ein selbst
 * eingepflegtes Rad taucht deshalb nur dann in denselben Filtern auf, wenn
 * sein Titel dieselben Signale traegt wie eine echte Anzeige.
 *
 * Vorlage sind die tatsaechlichen Anzeigen:
 *   "28 Zoll Bulls Fahrrad. 21 Gänge. 46 size."
 *   "29 Zoll wie neue Scott Fahrrad. 16 Gänge, 37 size"
 *
 * Vorher entstand hier "Cube Attention Trekking 28 Zoll 52 cm": Zoll wurde
 * erkannt, die Rahmengroesse wegen "cm" statt "size" aber NICHT, Gaenge fehlten
 * ganz und Herren/Damen/Kinder ebenso. Solche Raeder verschwanden aus jedem
 * Filter ausser Zoll.
 */

/** Erste Zahl aus einer Freitextangabe wie "21 Gänge" oder "Shimano 7-Gang". */
function firstNumber(value?: string | null): number | null {
  const match = (value ?? '').match(/\d{1,2}/);
  return match ? Number(match[0]) : null;
}

export function buildBicycleListingTitle(bike: PublicBicycle): string {
  const parts: string[] = [];

  if (bike.reifengroesse) parts.push(`${bike.reifengroesse} Zoll`);

  // Muss zu NEW_PATTERN passen, damit der Zustand-Filter greift.
  if (bike.zustand === 'Neu') parts.push('neues');

  if (bike.marke) parts.push(bike.marke.trim());
  if (bike.modell) parts.push(bike.modell.trim());

  // Herren / Damen / Kinder — TYP_PATTERN sucht genau diese Woerter.
  if (bike.art) parts.push(bike.art.trim());

  // Fahrradtyp nur, wenn er nicht ohnehin schon dasteht (z.B. "Trekking").
  if (bike.fahrradtyp && bike.fahrradtyp.trim() !== bike.art?.trim()) {
    parts.push(bike.fahrradtyp.trim());
  }

  parts.push('Fahrrad.');

  const gears = firstNumber(bike.gangschaltung);
  if (gears) parts.push(`${gears} Gänge.`);

  // Bewusst "size" statt "cm": SIZE_PATTERN erwartet die Schreibweise, die der
  // Laden auch auf Kleinanzeigen verwendet.
  const size = firstNumber(bike.rahmengroesse);
  if (size) parts.push(`${size} size.`);

  return parts.join(' ').replace(/\s{2,}/g, ' ').trim();
}
