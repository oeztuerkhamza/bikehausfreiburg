// Genel "Türkçeye çevir" yardımcısı — ana API'nin aiemail/translate ucunu kullanır.
// Hem mail hem WhatsApp taslaklarını KONTROL için Türkçeye çevirmede ortak kullanılır.
import { API_BASE } from './config.js';
import { http } from './http.js';

export async function toTurkish(text) {
  if (!text || !text.trim()) return '';
  const data = await http.post(`${API_BASE}/api/aiemail/translate`, { text });
  return data?.translation ?? '';
}
