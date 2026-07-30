/**
 * Rahmenhöhe (cm) ↔ passende Körpergröße des Fahrers.
 *
 * Die Rahmenhöhe wurde früher als Freitext gepflegt ("54cm / M", "50 cm –
 * geeignet für ca. 165–180 cm Körpergröße"). Daraus ließ sich nichts rechnen
 * und auf der Buchungskachel stand ein halber Satz. Jetzt wird sie in ganzen
 * Zentimetern ausgewählt, und die empfohlene Körpergröße ergibt sich daraus.
 *
 * Die Tabelle folgt den üblichen Trekking-/City-Empfehlungen deutscher
 * Fahrradhändler und ist bewusst als Spanne angelegt: eine Rahmenhöhe passt
 * nie genau einer Körpergröße, und die Bereiche überlappen sich an den Rändern.
 * Der Vorschlag ist deshalb nur ein Vorschlag — im Formular bleiben beide
 * Felder frei überschreibbar.
 */

/** Empfohlene Körpergröße in cm (von/bis). */
export interface RiderHeightRange {
  von: number;
  bis: number;
}

interface FrameHeightBand extends RiderHeightRange {
  /** Obergrenze der Rahmenhöhe, für die dieses Band gilt (einschließlich). */
  maxFrameCm: number;
}

const BANDS: FrameHeightBand[] = [
  { maxFrameCm: 32, von: 120, bis: 135 },
  { maxFrameCm: 36, von: 130, bis: 145 },
  { maxFrameCm: 41, von: 145, bis: 158 },
  { maxFrameCm: 46, von: 155, bis: 168 },
  { maxFrameCm: 49, von: 163, bis: 172 },
  { maxFrameCm: 52, von: 170, bis: 178 },
  { maxFrameCm: 55, von: 176, bis: 184 },
  { maxFrameCm: 58, von: 182, bis: 189 },
  { maxFrameCm: 61, von: 187, bis: 195 },
  { maxFrameCm: 999, von: 193, bis: 202 },
];

/** Auswahlbereich der Rahmenhöhe — von Kinderrädern bis zum größten Rahmen. */
export const FRAME_HEIGHT_MIN_CM = 28;
export const FRAME_HEIGHT_MAX_CM = 64;

/** Optionen für das Auswahlfeld, z.B. "52 cm". */
export const FRAME_HEIGHT_OPTIONS: string[] = Array.from(
  { length: FRAME_HEIGHT_MAX_CM - FRAME_HEIGHT_MIN_CM + 1 },
  (_, i) => `${FRAME_HEIGHT_MIN_CM + i} cm`,
);

/**
 * Liest die Rahmenhöhe aus einem gespeicherten Wert. Erkennt "52", "52cm",
 * "52 cm" und auch die alten Sätze, die mit der Zahl beginnen. Ergibt null,
 * wenn keine plausible Rahmenhöhe darin steht (z.B. bei "M" oder "").
 */
export function parseFrameHeightCm(raw: string | null | undefined): number | null {
  const match = /(\d{2}(?:[.,]\d)?)/.exec((raw ?? '').trim());
  if (!match) return null;
  const value = Math.round(Number(match[1].replace(',', '.')));
  if (value < FRAME_HEIGHT_MIN_CM || value > FRAME_HEIGHT_MAX_CM) return null;
  return value;
}

/**
 * True, wenn der gespeicherte Wert nichts weiter als die Rahmenhöhe enthält.
 * Solche Werte darf das Formular ohne Informationsverlust auf "52 cm"
 * normalisieren; ein ganzer Satz bleibt dagegen stehen, bis jemand aktiv eine
 * Höhe auswählt.
 */
export function isPlainFrameHeight(raw: string | null | undefined): boolean {
  return /^\s*\d{2}(?:[.,]\d)?\s*(?:cm)?\s*$/i.test(raw ?? '');
}

/** Empfohlene Körpergröße zur Rahmenhöhe; null, wenn die Höhe unbekannt ist. */
export function riderHeightForFrame(
  frameCm: number | null,
): RiderHeightRange | null {
  if (frameCm === null) return null;
  const band = BANDS.find((b) => frameCm <= b.maxFrameCm);
  return band ? { von: band.von, bis: band.bis } : null;
}

/** Empfohlene Körpergröße direkt aus dem gespeicherten Freitext/Wert. */
export function riderHeightForFrameValue(
  raw: string | null | undefined,
): RiderHeightRange | null {
  return riderHeightForFrame(parseFrameHeightCm(raw));
}
