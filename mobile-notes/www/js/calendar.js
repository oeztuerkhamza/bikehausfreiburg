// Takvim ve hatırlatma.
//
// Takvim: telefonun kendi takvim uygulaması başlık/tarih dolu halde açılır,
// kullanıcı kaydete basar. Böylece Google hesabı bağlamaya, OAuth kurmaya
// gerek kalmaz — telefonda hangi hesap varsa ona yazılır.
// Hatırlatma: yerel bildirim (uygulama kapalıyken de çalar).

import { EVENT_MINUTES } from './config.js';

const Kalender = window.Capacitor?.Plugins?.Kalender || null;
const LN = window.Capacitor?.Plugins?.LocalNotifications || null;

export function takvimVarMi() {
  return !!Kalender;
}

/**
 * Takvim uygulamasını yeni etkinlik ekranıyla açar.
 * @param {{titel:string, text?:string, start:Date, dakika?:number}} opts
 */
export async function takvimeEkle({ titel, text = '', start, dakika = EVENT_MINUTES }) {
  if (!Kalender) throw new Error('Takvim yalnızca telefonda çalışır.');
  const bas = start.getTime();
  const bit = bas + dakika * 60000;
  await Kalender.addEvent({
    title: titel || 'Not',
    description: text || '',
    // Java tarafı Long bekliyor; milisaniyeyi metin olarak geçiyoruz ki
    // JS'in sayı sınırlarına ve köprü dönüşümüne takılmasın.
    begin: String(bas),
    end: String(bit),
  });
}

/** Bildirim izni (Android 13+ sorar). */
export async function bildirimIzni() {
  if (!LN) return false;
  try {
    const res = await LN.requestPermissions();
    return res?.display === 'granted';
  } catch {
    return false;
  }
}

/**
 * Notu verilen zamanda hatırlatır. Not id'si bildirim id'si olarak kullanılır,
 * böylece aynı not için ikinci kez kurulduğunda eskisi değiştirilir.
 */
export async function hatirlat({ id, titel, text, zaman }) {
  if (!LN) throw new Error('Bildirim yalnızca telefonda çalışır.');
  if (zaman.getTime() <= Date.now()) throw new Error('Geçmiş bir zamana hatırlatma kurulamaz.');

  await LN.schedule({
    notifications: [{
      id: Number(id) || Date.now() % 100000,
      title: titel || 'Not',
      body: (text || '').slice(0, 180),
      schedule: { at: zaman, allowWhileIdle: true },
    }],
  });
}

/** Not silinince ya da tarih kaldırılınca kurulmuş hatırlatmayı iptal eder. */
export async function hatirlatmayiIptal(id) {
  if (!LN) return;
  try { await LN.cancel({ notifications: [{ id: Number(id) }] }); } catch {}
}
