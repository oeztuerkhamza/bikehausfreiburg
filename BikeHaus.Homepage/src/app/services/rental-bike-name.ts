/**
 * Aufbereitung der Mietrad-Stammdaten für Anzeige und Schema.org.
 *
 * Im Feld `marke` steckt bei fast allen Mieträdern die interne Inventarnummer
 * ("E15 - Conway", "32 - Bulls", "Wagen 2 - Thule", "61 Ideal"). Ungefiltert
 * landet die in der H1, im Seitentitel und in `brand` des Product-Schemas —
 * "E15 - Conway" ist für Google keine zuordenbare Marke, und der Markenfilter
 * im Katalog zerfällt in ein Dutzend Einzelmarken statt "Conway".
 *
 * Vorsicht bei Größenangaben: "16-20 zoll Kinder Fahrrad" und "25 - 26 zoll"
 * sehen wie ein Code aus, sind aber echte Angaben. Deshalb wird nur gekürzt,
 * wenn hinter dem Bindestrich KEINE Zahl mehr folgt, und eine führende Zahl
 * nur dann, wenn danach keine Maßeinheit steht.
 */

/** "E15 - ", "32 - ", "26- ", "Wagen 2 - " */
const INVENTORY_CODE = /^\s*(?:[Ee]|[Ww]agen\s*)?\d+\s*[-–—]\s*/;
/** Führende Bestandsnummer ohne Bindestrich: "61 Ideal" */
const LEADING_NUMBER = /^\s*\d{1,3}\s+/;
/** Wörter, vor denen eine Zahl eine Maßangabe ist, keine Bestandsnummer. */
const UNIT_WORDS = /^(?:zoll|cm|mm|watt|wh|kg|size|gang|gänge|zoll\.)\b/i;
/** Ein Markenname besteht aus Buchstaben — nicht aus "16-20" oder "24". */
const BRAND_LIKE = /^[A-Za-zÄÖÜäöüß][A-Za-zÄÖÜäöüß&.'-]*$/;

/** Entfernt Inventarcodes und doppelte Leerzeichen aus einem Stammdatenfeld. */
export function cleanRentalLabel(raw?: string | null): string {
  let value = (raw ?? '').trim();
  if (!value) return '';

  const withoutCode = value.replace(INVENTORY_CODE, '');
  // "16-20 zoll": hinter dem Bindestrich steht wieder eine Zahl → Größe, kein Code.
  if (withoutCode !== value && !/^\d/.test(withoutCode)) {
    value = withoutCode;
  }

  const withoutNumber = value.replace(LEADING_NUMBER, '');
  // Nur kürzen, wenn danach wirklich ein Name folgt. Sonst zerlegt " 25 - 26
  // zoll" zu "- 26 zoll".
  if (
    withoutNumber !== value &&
    /^[A-Za-zÄÖÜäöüß]/.test(withoutNumber) &&
    !UNIT_WORDS.test(withoutNumber)
  ) {
    value = withoutNumber;
  }

  return value.replace(/\s{2,}/g, ' ').trim();
}

/**
 * Vereinheitlicht die Schreibweise, damit "IDEAL" und "Ideal" im Markenfilter
 * nicht als zwei Marken erscheinen. Kurze Kürzel (KTM, BMC) bleiben in
 * Großschreibung.
 */
function normalizeBrandCase(brand: string): string {
  if (brand.length > 3 && brand === brand.toUpperCase()) {
    return brand.charAt(0) + brand.slice(1).toLowerCase();
  }
  return brand;
}

/** Anzeigename "Conway Cairon C 2.0" aus Marke + Modell. */
export function rentalBikeTitle(
  marke?: string | null,
  modell?: string | null,
): string {
  return [cleanRentalLabel(marke), (modell ?? '').trim()]
    .filter(Boolean)
    .join(' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/**
 * Reiner Markenname für `brand` im Product-Schema.
 * Gibt null zurück, wenn sich keine echte Marke erkennen lässt — eine falsche
 * Marke ist schlechter als gar keine.
 */
export function rentalBrandName(marke?: string | null): string | null {
  const cleaned = cleanRentalLabel(marke);
  if (!cleaned) return null;
  const first = cleaned.split(/\s+/)[0];
  return BRAND_LIKE.test(first) ? normalizeBrandCase(first) : null;
}
