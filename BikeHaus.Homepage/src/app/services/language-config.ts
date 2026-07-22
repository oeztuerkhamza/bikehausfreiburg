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

// ── Rental booking page (dedicated flow) — language-specific slugs ──
export const RENTAL_BOOKING_SLUGS = new Set([
  'buchen',
  'booking',
  'reservation',
]);

export function getRentalSlug(lang: string): string {
  if (lang === 'en') return 'bike-rental';
  if (lang === 'fr') return 'location-velo';
  return 'fahrradverleih';
}

export function getRentalBookingSlug(lang: string): string {
  if (lang === 'en') return 'booking';
  if (lang === 'fr') return 'reservation';
  return 'buchen';
}

/** Absolute path of the dedicated booking page, e.g. `/de/fahrradverleih/buchen`. */
export function getRentalBookingPath(lang: string): string {
  return `/${lang}/${getRentalSlug(lang)}/${getRentalBookingSlug(lang)}`;
}
