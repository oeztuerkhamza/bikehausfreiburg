// Mesaj metni gibi görünen ama metin olmayan içerikler.
//
// Medien-Nachrichten tragen in `body` nicht zwingend die Bildunterschrift: im
// Rohmodus steht dort bei Fotos der base64-Block des Bildes selbst und bei
// Kontakten die rohe VCARD (whatsapp-web.js nimmt `body || caption` und hat
// dasselbe Problem). Ungefiltert stand dieser Datenblock als langer
// Zeichensalat unter dem Foto im Chat.

/** Nutzlasten, die als "Text" auftauchen: JPEG, PNG, GIF, WebP, VCARD. */
const PAYLOAD_START = /^(\/9j\/|iVBORw0KGgo|R0lGOD|UklGR|BEGIN:VCARD)/;

/** Trenner zwischen Medien-Etikett und Bildunterschrift ("📷 Foto — Text"). */
const LABEL_SEPARATOR = ' — ';

/**
 * True, wenn der Text als Bildunterschrift durchgeht — also von einem Menschen
 * geschrieben wurde und nicht die Nutzlast des Mediums ist.
 */
export function isCaptionText(text) {
  const value = (text || '').trim();
  if (!value) return false;
  if (PAYLOAD_START.test(value)) return false;
  // Ein zusammenhängender base64-Block über 200 Zeichen ist keine Unterschrift,
  // sondern die Nutzlast. Bewusst auf das base64-Alphabet eingeschränkt: lange
  // Links enthalten ':' und '.' und bleiben damit unangetastet.
  return !(value.length > 200 && /^[A-Za-z0-9+/=]+$/.test(value.slice(0, 200)));
}

/**
 * Repariert einen bereits gespeicherten Text: aus "📷 Foto — <base64>" wird
 * wieder "📷 Foto". Gibt null zurück, wenn nichts zu reparieren ist — bestehende
 * Verläufe liegen als JSON auf der Platte und behalten sonst den Zeichensalat,
 * auch nachdem der Sync ihn nicht mehr erzeugt.
 */
export function repairStoredBody(body) {
  const value = (body || '').trim();
  const cut = value.indexOf(LABEL_SEPARATOR);
  if (cut <= 0) return null;
  const caption = value.slice(cut + LABEL_SEPARATOR.length);
  if (isCaptionText(caption)) return null;
  return value.slice(0, cut);
}
