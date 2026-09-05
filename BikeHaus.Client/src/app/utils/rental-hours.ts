/**
 * Übergabezeiten des Verleihs — die einzige Stelle im Admin-Portal, an der die
 * Regel steht.
 *
 * Der Verleih hat eigene Zeiten, unabhängig von den Öffnungszeiten des Ladens
 * (An- & Verkauf):
 *
 *   Mo–Do  10:00–18:00
 *   Fr     10:00–13:00 und 15:00–18:00  (13:00–15:00 Mittagspause)
 *   Sa     11:00–18:00
 *   So     geschlossen
 *
 * Letzte Abholung ist 17:30, damit die Rückgabe bis 18:00 möglich bleibt.
 *
 * Dieselbe Regel steckt in `slotsForDateKey` der öffentlichen Buchungsstrecke
 * (BikeHaus.Homepage, rental-booking-steps.component.ts). Die beiden Angular-
 * Anwendungen teilen keinen Code, die Regel steht deshalb zweimal — wer sie
 * hier ändert, muss sie dort ebenfalls ändern.
 */

const SLOT_MINUTES = 30;

/** Letzte Abholung, damit die Rückgabe bis 18:00 Uhr möglich bleibt. */
const LAST_PICKUP = { hour: 17, minute: 30 };

function fill(fromH: number, fromM: number, toH: number, toM: number): string[] {
  const slots: string[] = [];
  for (let t = fromH * 60 + fromM; t <= toH * 60 + toM; t += SLOT_MINUTES) {
    const h = Math.floor(t / 60);
    const m = t % 60;
    slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
  }
  return slots;
}

/**
 * Mögliche Abholzeiten für einen Tag im Format `YYYY-MM-DD`.
 * Sonntags (und bei leerem Datum) leer.
 */
export function rentalPickupSlots(dateKey: string): string[] {
  if (!dateKey) return [];
  const date = new Date(`${dateKey}T00:00:00`);
  if (Number.isNaN(date.getTime())) return [];

  const day = date.getDay();
  if (day >= 1 && day <= 4) {
    return fill(10, 0, LAST_PICKUP.hour, LAST_PICKUP.minute);
  }
  if (day === 5) {
    // Vor der Mittagspause endet die Übergabe um 12:30, danach geht es um
    // 15:00 weiter — zwischen 13:00 und 15:00 finden keine Übergaben statt.
    return [
      ...fill(10, 0, 12, 30),
      ...fill(15, 0, LAST_PICKUP.hour, LAST_PICKUP.minute),
    ];
  }
  if (day === 6) {
    return fill(11, 0, LAST_PICKUP.hour, LAST_PICKUP.minute);
  }
  return [];
}
