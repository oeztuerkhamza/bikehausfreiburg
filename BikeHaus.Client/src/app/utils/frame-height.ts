/**
 * Rahmenhöhe (cm) ↔ passende Körpergröße des Fahrers.
 *
 * Die Rahmenhöhe wurde früher als Freitext gepflegt ("54cm / M", "50 cm –
 * geeignet für ca. 165–180 cm Körpergröße"). Daraus ließ sich nichts rechnen
 * und auf der Buchungskachel stand ein halber Satz. Jetzt wird sie in ganzen
 * Zentimetern ausgewählt, und die empfohlene Körpergröße ergibt sich daraus.
 *
 * Die Bänder stammen nicht aus einer Kauf-Größentabelle: dort wird der Rahmen
 * auf eine Person eingepasst, hier wird ein Rad an wechselnde Gäste verliehen,
 * und die Sattelhöhe deckt einen großen Teil des Unterschieds ab. Der Kern
 * eines 50er Trekkingrads ist deshalb 165–180 cm — genau die Spanne, die im
 * Bestand früher als Freitext an der Rahmenhöhe stand. Auf diesen Kern kommt
 * die Toleranz unten drauf, sodass die Bänder am Ende gut 20 cm breit sind.
 *
 * Zu enge Bänder wären hier der teurere Fehler: die Körpergröße ist auf der
 * Website reiner Hinweistext und filtert nichts, ein zu knapper Bereich lässt
 * also nur passende Räder unpassend aussehen — und zwingt dazu, die Zahlen bei
 * jedem Rad von Hand zu weiten. Der Vorschlag bleibt ein Vorschlag: im
 * Formular sind beide Felder frei überschreibbar.
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

/**
 * Toleranz, die auf jedes Band oben wie unten aufgeschlagen wird. Sie steht
 * bewusst getrennt von der Tabelle: die Kernwerte sind die fachliche Aussage,
 * die Toleranz ist die Stellschraube dafür, wie großzügig der Verleih sein
 * will. Einmal hier ändern wirkt auf alle Rahmenhöhen.
 */
export const RIDER_HEIGHT_TOLERANCE_CM = 4;

/** Kernbereiche ohne Toleranz — nicht direkt verwenden, siehe riderHeightForFrame(). */
const BANDS: FrameHeightBand[] = [
  { maxFrameCm: 32, von: 115, bis: 135 }, // Kinderrad ~20"
  { maxFrameCm: 36, von: 128, bis: 145 }, // Kinderrad ~24"
  { maxFrameCm: 41, von: 140, bis: 158 }, // Jugendrad ~26"
  { maxFrameCm: 46, von: 152, bis: 170 },
  { maxFrameCm: 49, von: 160, bis: 175 },
  { maxFrameCm: 52, von: 165, bis: 180 },
  { maxFrameCm: 55, von: 172, bis: 186 },
  { maxFrameCm: 58, von: 178, bis: 192 },
  { maxFrameCm: 61, von: 185, bis: 198 },
  { maxFrameCm: 999, von: 190, bis: 205 },
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
  if (!band) return null;
  return {
    von: band.von - RIDER_HEIGHT_TOLERANCE_CM,
    bis: band.bis + RIDER_HEIGHT_TOLERANCE_CM,
  };
}

/** Empfohlene Körpergröße direkt aus dem gespeicherten Freitext/Wert. */
export function riderHeightForFrameValue(
  raw: string | null | undefined,
): RiderHeightRange | null {
  return riderHeightForFrame(parseFrameHeightCm(raw));
}
