/**
 * EINZIGE QUELLE DER WAHRHEIT für Öffnungs- und Übergabezeiten.
 *
 * Vorher standen die Zeiten an über einem Dutzend Stellen — index.html,
 * home, fahrrad-stadt, fahrradverleih, city-landing, blog, llms.txt — und
 * widersprachen sich gegenseitig. Die maschinenlesbare Variante behauptete
 * "Mo–Sa 13:00–17:00", was an keinem einzigen Tag stimmte. Genau diese Angabe
 * beantwortet aber bei Google und den KI-Assistenten die Frage "hat der Laden
 * gerade offen?" — ein Kunde stand damit vor verschlossener Tür.
 *
 * Vom Inhaber bestätigt am 2026-08-24. Wer hier etwas ändert, ändert es
 * überall: neue Werte NUR in dieser Datei pflegen.
 *
 * Wichtig: Laden und Verleih haben unterschiedliche Zeiten. Der Verleih
 * öffnet eine Stunde früher (Mo–Fr ab 10:00, Sa ab 11:00) — das deckt sich
 * mit den Abholslots, die die Buchungsstrecke tatsächlich anbietet
 * (rental-booking-steps.component.ts, slotsForDateKey). Deshalb darf der
 * Verleih NICHT in die openingHoursSpecification des Ladens gemischt werden:
 * wer um 10:00 ein Rad kaufen will, steht sonst vor einer verschlossenen Tür.
 */

export interface HoursInterval {
  /** schema.org dayOfWeek-Namen */
  days: string[];
  opens: string;
  closes: string;
}

/** Ladengeschäft — An- & Verkauf, Service/Wartung. */
export const SHOP_HOURS: HoursInterval[] = [
  {
    days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday'],
    opens: '11:00',
    closes: '17:30',
  },
  // Freitag mit Mittagspause 13:00–15:00 — zwei getrennte Intervalle.
  { days: ['Friday'], opens: '11:00', closes: '13:00' },
  { days: ['Friday'], opens: '15:00', closes: '18:00' },
  { days: ['Saturday'], opens: '11:30', closes: '17:00' },
];

/**
 * Verleih-Übergabezeiten. Eine Stunde früher als der Laden, Samstag ab 11:00.
 * Muss mit den Abholslots der Buchungsstrecke übereinstimmen — sonst bewerben
 * wir Zeiten, die niemand buchen kann.
 */
export const RENTAL_HOURS: HoursInterval[] = [
  {
    days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday'],
    opens: '10:00',
    closes: '17:30',
  },
  { days: ['Friday'], opens: '10:00', closes: '13:00' },
  { days: ['Friday'], opens: '15:00', closes: '18:00' },
  { days: ['Saturday'], opens: '11:00', closes: '17:00' },
];

/** schema.org OpeningHoursSpecification-Knoten aus einer Intervall-Liste. */
export function toOpeningHoursSpecification(
  intervals: HoursInterval[],
): Array<Record<string, unknown>> {
  return intervals.map((i) => ({
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: i.days.map((d) => `https://schema.org/${d}`),
    opens: i.opens,
    closes: i.closes,
  }));
}

type HoursLang = 'de' | 'en' | 'fr' | 'tr' | 'es' | 'it' | 'ar' | 'ru';

/** Kurze Ladenöffnungszeiten für die Anzeige, pro Sprache. */
export const SHOP_HOURS_TEXT: Record<HoursLang, string> = {
  de: 'Mo–Do 11:00–17:30 · Fr 11:00–13:00 & 15:00–18:00 · Sa 11:30–17:00 · So geschlossen',
  en: 'Mon–Thu 11:00–17:30 · Fri 11:00–13:00 & 15:00–18:00 · Sat 11:30–17:00 · Sun closed',
  fr: 'Lun–Jeu 11:00–17:30 · Ven 11:00–13:00 & 15:00–18:00 · Sam 11:30–17:00 · Dim fermé',
  tr: 'Pzt–Per 11:00–17:30 · Cum 11:00–13:00 & 15:00–18:00 · Cmt 11:30–17:00 · Paz kapalı',
  es: 'Lun–Jue 11:00–17:30 · Vie 11:00–13:00 & 15:00–18:00 · Sáb 11:30–17:00 · Dom cerrado',
  it: 'Lun–Gio 11:00–17:30 · Ven 11:00–13:00 & 15:00–18:00 · Sab 11:30–17:00 · Dom chiuso',
  ar: 'الاثنين–الخميس 11:00–17:30 · الجمعة 11:00–13:00 و15:00–18:00 · السبت 11:30–17:00 · الأحد مغلق',
  ru: 'Пн–Чт 11:00–17:30 · Пт 11:00–13:00 и 15:00–18:00 · Сб 11:30–17:00 · Вс закрыто',
};

/** Verleih-Übergabezeiten für die Anzeige, pro Sprache. */
export const RENTAL_HOURS_TEXT: Record<HoursLang, string> = {
  de: 'Verleih-Übergabe: Mo–Fr ab 10:00 · Sa ab 11:00 · Rückgabe bis 18:00',
  en: 'Rental handover: Mon–Fri from 10:00 · Sat from 11:00 · return by 18:00',
  fr: 'Remise des vélos : lun–ven dès 10:00 · sam dès 11:00 · retour avant 18:00',
  tr: 'Kiralama teslimi: Pzt–Cum 10:00’dan · Cmt 11:00’den · iade 18:00’e kadar',
  es: 'Entrega de alquiler: lun–vie desde 10:00 · sáb desde 11:00 · devolución hasta 18:00',
  it: 'Consegna noleggio: lun–ven dalle 10:00 · sab dalle 11:00 · riconsegna entro 18:00',
  ar: 'تسليم التأجير: الاثنين–الجمعة من 10:00 · السبت من 11:00 · الإرجاع حتى 18:00',
  ru: 'Выдача проката: пн–пт с 10:00 · сб с 11:00 · возврат до 18:00',
};
