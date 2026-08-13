// Sabit uç noktalar ve tercihler.
export const API_BASE = 'https://api.bikehausfreiburg.com';   // giriş + notlar

// Notlar bu uç altında: /api/sprachnotizen
export const NOTES_URL = `${API_BASE}/api/sprachnotizen`;

// Dikte dili. Ayarlar'dan değiştirilir, cihazda saklanır.
export const DEFAULT_LANG = 'tr-TR';
export const LANGS = [
  { code: 'tr-TR', label: 'Türkçe' },
  { code: 'de-DE', label: 'Deutsch' },
  { code: 'en-US', label: 'English' },
];

// Takvim etkinliğinin varsayılan uzunluğu (dakika).
export const EVENT_MINUTES = 60;

export const IS_NATIVE = !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());
