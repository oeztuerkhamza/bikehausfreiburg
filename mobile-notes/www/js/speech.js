// Konuşmayı yazıya çevirme — Android'in kendi tanıma servisi üzerinden.
//
// Android SpeechRecognizer bir süre sessizlikte kendiliğinden durur. Uzun
// dikteyi bölmemek için burada bir döngü var: servis durunca o parçanın metni
// birikime eklenir ve dinleme yeniden başlatılır. Kullanıcı "Dur" diyene kadar
// böyle sürer.

const SR = window.Capacitor?.Plugins?.SpeechRecognition || null;

let dinleniyor = false;   // kullanıcı hâlâ konuşmak istiyor mu
let birikmis = '';        // biten parçaların metni
let parca = '';           // içinde bulunulan parçanın son hali
let dil = 'tr-TR';
let onText = null;        // (metin) => void
let dinleyiciler = [];
let yenidenBaslatTimer = null;

export function destekleniyorMu() {
  return !!SR;
}

/** Mikrofon ve tanıma izni. false dönerse dikte başlatılamaz. */
export async function izinIste() {
  if (!SR) return false;
  try {
    const { available } = await SR.available();
    if (available === false) return false;
  } catch {
    // Eski sürümlerde available() yok — izin adımına devam.
  }
  try {
    const res = await SR.requestPermissions();
    // Alan adı sürüme göre değişebiliyor; ikisini de kabul et.
    const durum = res?.speechRecognition || res?.permission || 'granted';
    return durum === 'granted';
  } catch {
    return false;
  }
}

/**
 * Dikteyi başlatır. onChange her yeni sözcükte tüm metinle çağrılır.
 * devam:true ile önceki metnin üstüne eklenir (duraklat → devam et).
 */
export async function basla(language, onChange, { devam = false } = {}) {
  if (!SR || dinleniyor) return;
  dil = language || dil;
  onText = onChange;
  if (!devam) { birikmis = ''; parca = ''; }
  dinleniyor = true;

  await dinleyicileriKur();
  await dinlemeyiBaslat();
}

/** Dikteyi bitirir ve son metni döndürür. */
export async function dur() {
  dinleniyor = false;
  clearTimeout(yenidenBaslatTimer);
  try { await SR?.stop(); } catch {}
  parcayiKaydet();
  await dinleyicileriKaldir();
  return metin();
}

export function calisiyorMu() {
  return dinleniyor;
}

export function metin() {
  return [birikmis, parca].filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
}

/** Metni dışarıdan tazelemek için (elle düzeltme sonrası devam ettirmek). */
export function metniAyarla(yeni) {
  birikmis = yeni || '';
  parca = '';
}

function parcayiKaydet() {
  const t = parca.trim();
  if (t) birikmis = birikmis ? `${birikmis} ${t}` : t;
  parca = '';
}

function bildir() {
  onText?.(metin());
}

async function dinlemeyiBaslat() {
  try {
    await SR.start({
      language: dil,
      maxResults: 1,
      // popup:false → Google'ın dinleme penceresi açılmaz, metin bize akar.
      popup: false,
      partialResults: true,
    });
  } catch {
    // "Zaten dinliyor" gibi geçici hatalarda döngü kopmasın.
    if (dinleniyor) yenidenBaslatiPlanla();
  }
}

function yenidenBaslatiPlanla() {
  clearTimeout(yenidenBaslatTimer);
  // Kısa bekleme şart: servis kapanmadan tekrar start() çağrısı hata verir.
  yenidenBaslatTimer = setTimeout(() => {
    if (dinleniyor) dinlemeyiBaslat();
  }, 350);
}

async function dinleyicileriKur() {
  await dinleyicileriKaldir();

  dinleyiciler.push(await SR.addListener('partialResults', (data) => {
    const m = data?.matches?.[0];
    if (typeof m === 'string' && m.length) {
      parca = m;
      bildir();
    }
  }));

  // Olay adı sürüme göre 'listeningState' ya da 'listeningStateChanged'.
  for (const olay of ['listeningState', 'listeningStateChanged']) {
    try {
      dinleyiciler.push(await SR.addListener(olay, (data) => {
        const durum = data?.status || data?.state;
        if (durum === 'stopped' && dinleniyor) {
          parcayiKaydet();
          bildir();
          yenidenBaslatiPlanla();
        }
      }));
    } catch {}
  }
}

async function dinleyicileriKaldir() {
  for (const l of dinleyiciler) {
    try { await l.remove(); } catch {}
  }
  dinleyiciler = [];
}
