// Klavye açıldığında yazdığın metin klavyenin ALTINDA kalmasın diye görünür alanı
// hesaplar ve CSS'e iki değişken olarak verir:
//
//   --app-h : uygulamanın görünür yüksekliği (visualViewport)
//   --kb    : klavyenin içeriğin ÜSTÜNE bindiği yükseklik
//
// Neden iki değer?
//   • Android 14 ve öncesi: manifest'teki `adjustResize` pencereyi küçültür →
//     visualViewport zaten kısalır, ek boşluk gerekmez (--kb = 0).
//   • Android 15+: uygulama edge-to-edge çizildiği için pencere KÜÇÜLMEZ,
//     klavye içeriğin üstüne biner. Bu durumda Capacitor Keyboard eklentisinin
//     bildirdiği klavye yüksekliği kadar uygulamayı yukarı çekeriz (--kb > 0).
// İkisi birden olursa yükseklik iki kez düşülmesin diye fark alınır.

const root = document.documentElement;

let kbHeight = 0;                       // eklentinin bildirdiği klavye yüksekliği (CSS px)
let baseHeight = window.innerHeight;    // klavye kapalıyken pencere yüksekliği
let lastWidth = window.innerWidth;      // yön değişimini yakalamak için
const listeners = new Set();

const visibleHeight = () => Math.round(window.visualViewport?.height ?? window.innerHeight);

export const isOpen = () => root.style.getPropertyValue('--kb') !== '0px' || kbHeight > 0;

/** Klavye açılıp kapandıkça çağrılır: fn(open, overlayPx) */
export function onChange(fn) { listeners.add(fn); }

function apply() {
  const visible = visibleHeight();
  // Henüz yerleşim yapılmadıysa (yükseklik 0) dokunma — yoksa uygulama sıfır
  // yükseklikle çizilir ve ekran boş görünür.
  if (visible < 1) return;

  // Yön değiştiyse referans yüksekliği sıfırla.
  if (window.innerWidth !== lastWidth) { lastWidth = window.innerWidth; baseHeight = visible; }
  baseHeight = Math.max(baseHeight, visible);

  const shrunk = Math.max(0, baseHeight - visible);   // pencere kendisi küçüldü mü?
  const overlay = Math.max(0, kbHeight - shrunk);     // hâlâ örtülen kısım
  const open = kbHeight > 0 || shrunk > 120;

  root.style.setProperty('--app-h', visible + 'px');
  root.style.setProperty('--kb', overlay + 'px');
  document.body.classList.toggle('kb-open', open);

  for (const fn of listeners) { try { fn(open, overlay); } catch {} }
}

function setHeight(px) {
  const h = Number(px) || 0;
  if (h === kbHeight) return;
  kbHeight = h;
  apply();
}

// Odaklanan alanı görünür tut (kendi kaydırma kutusu içinde olanlar için).
function keepFocusVisible() {
  const el = document.activeElement;
  if (!el || (el.tagName !== 'TEXTAREA' && el.tagName !== 'INPUT')) return;
  try { el.scrollIntoView({ block: 'center', behavior: 'smooth' }); } catch {}
}

export function init() {
  const vv = window.visualViewport;
  if (vv) {
    vv.addEventListener('resize', apply);
    vv.addEventListener('scroll', apply);
  }
  window.addEventListener('resize', apply);
  window.addEventListener('orientationchange', () => setTimeout(apply, 350));

  // 1) Capacitor Keyboard eklentisi (Android 15+ edge-to-edge için asıl kaynak)
  const KB = window.Capacitor?.Plugins?.Keyboard;
  if (KB?.addListener) {
    KB.addListener('keyboardWillShow', (info) => setHeight(info?.keyboardHeight));
    KB.addListener('keyboardDidShow', (info) => { setHeight(info?.keyboardHeight); keepFocusVisible(); });
    KB.addListener('keyboardWillHide', () => setHeight(0));
    KB.addListener('keyboardDidHide', () => setHeight(0));
  }

  // 2) Aynı olayların window sürümü (eklenti yüklü ama Plugins proxy'si yoksa)
  const readHeight = (e) => e?.keyboardHeight ?? e?.detail?.keyboardHeight ?? 0;
  window.addEventListener('keyboardWillShow', (e) => setHeight(readHeight(e)));
  window.addEventListener('keyboardDidShow', (e) => { setHeight(readHeight(e)); keepFocusVisible(); });
  window.addEventListener('keyboardWillHide', () => setHeight(0));
  window.addEventListener('keyboardDidHide', () => setHeight(0));

  // 3) Klavye hiç raporlanmasa bile odaklanan alanı görünür kılmayı dene.
  document.addEventListener('focusin', (e) => {
    const el = e.target;
    if (el && (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT')) setTimeout(keepFocusVisible, 300);
  });

  window.addEventListener('load', apply);
  apply();
  // İlk yerleşim gecikirse (WebView açılışı) tekrar dene.
  setTimeout(apply, 300);
  setTimeout(apply, 1200);
}
