// Parses the structured opening-hours JSON stored in shop settings
// (`oeffnungszeitenJson`) into display rows. Shape of the JSON:
//   { "days": [ { "closed": bool, "ranges": [ { "from": "HH:mm", "to": "HH:mm" } ] } x7 (Mon..Sun) ],
//     "notes": [ "..." ] }

export interface HoursRow {
  closed: boolean;
  text: string; // e.g. "13:00 – 17:00" or "11:00 – 13:00 · 15:00 – 18:00"
}

export interface ParsedOpeningHours {
  rows: HoursRow[]; // exactly 7, Monday..Sunday
  notes: string[];
}

/** Fallback schedule used when the shop has no structured hours saved yet. */
// Vom Inhaber bestaetigt 2026-08-24 — deckungsgleich mit SHOP_HOURS in
// opening-hours.ts. Frueher stand hier 13:00-17:00, was an keinem Tag stimmte.
export const DEFAULT_HOURS_ROWS: HoursRow[] = [
  { closed: false, text: '11:00 – 17:30' }, // Mon
  { closed: false, text: '11:00 – 17:30' }, // Tue
  { closed: false, text: '11:00 – 17:30' }, // Wed
  { closed: false, text: '11:00 – 17:30' }, // Thu
  { closed: false, text: '11:00 – 13:00 · 15:00 – 18:00' }, // Fri
  { closed: false, text: '11:30 – 17:00' }, // Sat
  { closed: true, text: '' }, // Sun
];

export function parseOpeningHours(
  json?: string | null,
): ParsedOpeningHours | null {
  if (!json) return null;
  try {
    const p = JSON.parse(json);
    const days: unknown[] = Array.isArray(p?.days) ? p.days : [];
    if (days.length === 0) return null;
    const rows: HoursRow[] = Array.from({ length: 7 }, (_, i) => {
      const d = (days[i] ?? {}) as {
        closed?: boolean;
        ranges?: { from?: string; to?: string }[];
      };
      const ranges = Array.isArray(d.ranges)
        ? d.ranges.filter((r) => r?.from && r?.to)
        : [];
      const closed = !!d.closed || ranges.length === 0;
      const text = closed
        ? ''
        : ranges.map((r) => `${r.from} – ${r.to}`).join(' · ');
      return { closed, text };
    });
    const notes: string[] = Array.isArray(p?.notes)
      ? p.notes.map((n: unknown) => String(n)).filter((n: string) => n.trim())
      : [];
    return { rows, notes };
  } catch {
    return null;
  }
}
