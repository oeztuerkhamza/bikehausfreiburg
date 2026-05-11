export const SUPPORTED_LANGUAGES = [
  'de',
  'en',
  'fr',
  'tr',
  'es',
  'it',
  'ar',
  'ru',
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
];

export const HOME_ROUTE_REGEX = /^\/(de|en|fr|tr|es|it|ar|ru)\/?$/;

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
