/**
 * Telefonnummer des Ladens an EINER Stelle.
 *
 * Hintergrund: `/api/public/shop-info` liefert `telefon: null`, weil das Feld
 * in den Admin-Einstellungen leer ist. Beide Komponenten, die einen
 * `tel:`-Link bauen, sind an genau dieses Feld gebunden und blenden den Link
 * über ihren eigenen Guard aus — Ergebnis: auf der gesamten öffentlichen Seite
 * gab es KEINEN einzigen klickbaren Anruf-Link, obwohl die Nummer an mehreren
 * Stellen als reiner Text steht.
 *
 * Der Fallback hier macht die Links unabhängig davon funktionsfähig. Wird das
 * Feld im Admin gepflegt, gewinnt weiterhin der API-Wert.
 *
 * Die Anzeigeform muss byte-identisch zur NAP-Angabe im restlichen Web bleiben
 * (Google Business Profile, Verzeichnisse) — nicht umformatieren.
 */
export const SHOP_PHONE_DISPLAY = '+49 155 6630 0011';

/** E.164 für tel:-Links. */
export const SHOP_PHONE_E164 = '+4915566300011';

/** Nur Ziffern — für wa.me (Achtung: die Doppel-00 gehört dazu). */
export const SHOP_PHONE_WHATSAPP = '4915566300011';

/** Baut einen tel:-Link aus einem beliebigen Eingabeformat. */
export function toTelHref(phone?: string | null): string {
  const raw = (phone ?? '').trim();
  if (!raw) return `tel:${SHOP_PHONE_E164}`;
  return `tel:${raw.replace(/[^0-9+]/g, '')}`;
}
