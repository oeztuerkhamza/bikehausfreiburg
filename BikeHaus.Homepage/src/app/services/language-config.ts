export const SUPPORTED_LANGUAGES = [
  'de',
  'en',
  'fr',
  'tr',
  'es',
  'it',
  'ar',
  'ru',
  'no',
  'da',
  'nl',
  'pl',
] as const;

export type SupportedLanguageCode = (typeof SUPPORTED_LANGUAGES)[number];

export const DEFAULT_LANGUAGE: SupportedLanguageCode = 'de';
export const BLOG_HREFLANG_LANGUAGES = ['de', 'en', 'fr', 'tr'] as const;
export const RTL_LANGUAGES = ['ar'] as const;

export const LANGUAGE_LABELS: Record<SupportedLanguageCode, string> = {
  de: 'Deutsch',
  en: 'English',
  fr: 'Français',
  tr: 'Türkçe',
  es: 'Español',
  it: 'Italiano',
  ar: 'العربية',
  ru: 'Русский',
  no: 'Norsk',
  da: 'Dansk',
  nl: 'Nederlands',
  pl: 'Polski',
};

export const LOCALE_BY_LANGUAGE: Record<SupportedLanguageCode, string> = {
  de: 'de-DE',
  en: 'en-GB',
  fr: 'fr-FR',
  tr: 'tr-TR',
  es: 'es-ES',
  it: 'it-IT',
  ar: 'ar-SA',
  ru: 'ru-RU',
  no: 'no-NO',
  da: 'da-DK',
  nl: 'nl-NL',
  pl: 'pl-PL',
};

export const OG_LOCALE_BY_LANGUAGE: Record<SupportedLanguageCode, string> = {
  de: 'de_DE',
  en: 'en_US',
  fr: 'fr_FR',
  tr: 'tr_TR',
  es: 'es_ES',
  it: 'it_IT',
  ar: 'ar_SA',
  ru: 'ru_RU',
  no: 'nb_NO',
  da: 'da_DK',
  nl: 'nl_NL',
  pl: 'pl_PL',
};

export const SCHEMA_AVAILABLE_LANGUAGES = [
  'German',
  'English',
  'French',
  'Turkish',
  'Spanish',
  'Italian',
  'Arabic',
  'Russian',
  'Norwegian',
  'Danish',
  'Dutch',
  'Polish',
];

export const HOME_ROUTE_REGEX =
  /^\/(de|en|fr|tr|es|it|ar|ru|no|da|nl|pl)\/?$/;

export function isSupportedLanguage(
  value: string | null | undefined,
): value is SupportedLanguageCode {
  return !!value && (SUPPORTED_LANGUAGES as readonly string[]).includes(value);
}

export function getLanguageDirection(
  language: string | null | undefined,
): 'ltr' | 'rtl' {
  return language === 'ar' ? 'rtl' : 'ltr';
}

// ── Fahrradverleih (bike rental) — language-specific slugs ──
// Zentrale Quelle für lokalisierte Miet-Slugs. Alle SEO-Stellen (Routen,
// Canonical, hreflang, 301-Weiterleitungen) leiten sich hieraus ab, damit jede
// Sprache eine eigene, suchmaschinenfreundliche URL für "Fahrrad mieten" hat.
export const RENTAL_SLUG_BY_LANGUAGE: Record<SupportedLanguageCode, string> = {
  de: 'fahrradverleih',
  en: 'bike-rental',
  fr: 'location-velo',
  tr: 'bisiklet-kiralama',
  es: 'alquiler-bicicletas',
  it: 'noleggio-biciclette',
  ar: 'taajir-darrajat',
  ru: 'prokat-velosipedov',
  no: 'sykkelutleie',
  da: 'cykeludlejning',
  nl: 'fietsverhuur',
  pl: 'wypozyczalnia-rowerow',
};

export const RENTAL_BOOKING_SLUG_BY_LANGUAGE: Record<
  SupportedLanguageCode,
  string
> = {
  de: 'buchen',
  en: 'booking',
  fr: 'reservation',
  tr: 'rezervasyon',
  es: 'reserva',
  it: 'prenotazione',
  ar: 'hajz',
  ru: 'bronirovanie',
  no: 'bestilling',
  da: 'booking',
  nl: 'reserveren',
  pl: 'rezerwacja',
};

export const RENTAL_BOOKING_SLUGS = new Set(
  Object.values(RENTAL_BOOKING_SLUG_BY_LANGUAGE),
);

/** Alle Miet-Slugs (für Route-Generierung und Segment-Erkennung). */
export const RENTAL_PAGE_SLUGS = Object.values(RENTAL_SLUG_BY_LANGUAGE);

export function getRentalSlug(lang: string): string {
  return (
    RENTAL_SLUG_BY_LANGUAGE[lang as SupportedLanguageCode] ?? 'fahrradverleih'
  );
}

export function getRentalBookingSlug(lang: string): string {
  return (
    RENTAL_BOOKING_SLUG_BY_LANGUAGE[lang as SupportedLanguageCode] ?? 'buchen'
  );
}

/** Absolute path of the dedicated booking page, e.g. `/de/fahrradverleih/buchen`. */
export function getRentalBookingPath(lang: string): string {
  return `/${lang}/${getRentalSlug(lang)}/${getRentalBookingSlug(lang)}`;
}

