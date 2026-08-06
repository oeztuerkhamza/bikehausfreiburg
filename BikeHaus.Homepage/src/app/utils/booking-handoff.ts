/**
 * Übergabe von Buchungsnummer + E-Mail von der Erfolgsseite der Buchung an die
 * Seite "Buchung verwalten".
 *
 * Bewusst über den sessionStorage und nicht über Query-Parameter: in der URL
 * landet die E-Mail-Adresse des Gasts im Browserverlauf und in jedem Link, der
 * kopiert, geteilt oder abfotografiert wird. Der sessionStorage gilt nur für
 * diesen Tab, wird beim Schließen verworfen, und der Eintrag wird beim Lesen
 * sofort entfernt — die Bequemlichkeit des vorbefüllten Formulars bleibt, die
 * Adresse steht nirgends sichtbar.
 *
 * Eigene Datei, damit der Buchungsablauf nichts aus dem Seitenmodul von
 * "Buchung verwalten" importieren muss (das würde die beiden Lazy-Chunks
 * zusammenziehen).
 */

const HANDOFF_KEY = 'bikehaus-booking-handoff';

export interface BookingHandoff {
  bookingNumber: string;
  email: string;
}

/** Legt die Werte für die nächste Seite ab. Fehlt der Storage, passiert nichts. */
export function storeBookingHandoff(handoff: BookingHandoff): void {
  if (typeof sessionStorage === 'undefined') return;
  try {
    sessionStorage.setItem(HANDOFF_KEY, JSON.stringify(handoff));
  } catch {
    // Privater Modus oder voller Speicher: dann bleibt das Formular leer.
  }
}

/** Liest die Werte **einmalig** und räumt sie dabei weg. */
export function takeBookingHandoff(): BookingHandoff | null {
  if (typeof sessionStorage === 'undefined') return null;
  let raw: string | null = null;
  try {
    raw = sessionStorage.getItem(HANDOFF_KEY);
    sessionStorage.removeItem(HANDOFF_KEY);
  } catch {
    return null;
  }
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<BookingHandoff>;
    if (!parsed?.bookingNumber || !parsed?.email) return null;
    return { bookingNumber: parsed.bookingNumber, email: parsed.email };
  } catch {
    return null;
  }
}
