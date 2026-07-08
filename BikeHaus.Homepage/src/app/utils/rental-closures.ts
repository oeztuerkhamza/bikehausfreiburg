/**
 * Fixed holiday closures during which the bike rental is unavailable.
 *
 * Each range is inclusive and expressed as a local `YYYY-MM-DD` key. A rental
 * cannot start or end on a closure day, and a rental period may not span across
 * one. Both the booking-flow calendar and the shared availability calendar read
 * from this single source of truth so the site stays consistent.
 *
 * To re-open the rental, remove the corresponding entry (or the whole array).
 */
export interface RentalClosure {
  /** First closed day, inclusive (YYYY-MM-DD). */
  start: string;
  /** Last closed day, inclusive (YYYY-MM-DD). */
  end: string;
}

export const RENTAL_CLOSURES: readonly RentalClosure[] = [
  // No active closures — rental is open. Add a { start, end } entry here to
  // close the rental for a period (e.g. a holiday break).
];

/** Local `YYYY-MM-DD` key for a Date (no UTC shift). */
function toClosureKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

/** True when the given day (Date or `YYYY-MM-DD` key) falls within a closure. */
export function isClosureDay(date: Date | string): boolean {
  const key = typeof date === 'string' ? date : toClosureKey(date);
  return RENTAL_CLOSURES.some((c) => key >= c.start && key <= c.end);
}

/**
 * True when an inclusive `[startKey, endKey]` range overlaps any closure period.
 * Guards against ranges that begin before and end after a closure window.
 */
export function rangeOverlapsClosure(startKey: string, endKey: string): boolean {
  if (!startKey || !endKey) return false;
  return RENTAL_CLOSURES.some((c) => startKey <= c.end && endKey >= c.start);
}

/**
 * True when there is a closure period that has not fully passed yet, i.e. one
 * worth announcing to visitors. Returns false once every closure is over (and
 * when the array is empty), so the closure banner hides automatically.
 */
export function hasUpcomingClosure(reference: Date = new Date()): boolean {
  const key = toClosureKey(reference);
  return RENTAL_CLOSURES.some((c) => c.end >= key);
}
