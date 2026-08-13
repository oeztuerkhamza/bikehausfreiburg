// Notların sunucu tarafı: listeleme, kaydetme, düzenleme, silme.
// Notlar BikeHaus API'sinde durur → her cihazdan aynı liste görünür.

import { NOTES_URL } from './config.js';
import { http } from './http.js';

export async function listele() {
  return (await http.get(NOTES_URL)) || [];
}

/**
 * Diktelenen ham metni kaydeder. Sunucu Claude ile başlık/düzgün metin ve
 * varsa tarihi çıkarır; başaramazsa ham metin olduğu gibi kaydedilir.
 */
export async function ekle({ rohText, sprache }) {
  return http.post(NOTES_URL, { rohText, sprache, aufbereiten: true });
}

export async function guncelle(id, alanlar) {
  return http.put(`${NOTES_URL}/${id}`, alanlar);
}

export async function sil(id) {
  return http.del(`${NOTES_URL}/${id}`);
}

/** Ham metni kaydetmeden yeniden düzenletir (↻ düğmesi). */
export async function aufbereiten(rohText, sprache) {
  return http.post(`${NOTES_URL}/aufbereiten`, { rohText, sprache });
}
