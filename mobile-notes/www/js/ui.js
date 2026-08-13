// Küçük yardımcılar: toast, tarih biçimleme, güvenli metin.

export function $(sel) { return document.querySelector(sel); }
export function $$(sel) { return Array.from(document.querySelectorAll(sel)); }

export function show(el) { el?.classList.remove('hidden'); }
export function hide(el) { el?.classList.add('hidden'); }

let toastTimer = null;
export function toast(message, kind = 'info') {
  const el = $('#toast');
  if (!el) return;
  el.textContent = message;
  el.className = `toast toast-${kind}`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.add('hidden'), 2600);
  el.classList.remove('hidden');
}

/**
 * Uygulama içi onay penceresi. Tarayıcının confirm()'i yerine: o pencere
 * Android'de "https://localhost diyor ki…" başlığıyla çıkıyor ve uygulamadan
 * kopuk görünüyor.
 */
export function onay(mesaj, { evet = 'Evet', hayir = 'Vazgeç', tehlike = false } = {}) {
  return new Promise((resolve) => {
    const kat = document.createElement('div');
    kat.className = 'modal-kat';
    kat.innerHTML = `
      <div class="modal">
        <p class="modal-metin"></p>
        <div class="modal-tuslar">
          <button class="btn-ghost" data-hayir></button>
          <button class="${tehlike ? 'btn-danger' : 'btn-primary'}" data-evet></button>
        </div>
      </div>`;
    kat.querySelector('.modal-metin').textContent = mesaj;
    kat.querySelector('[data-hayir]').textContent = hayir;
    kat.querySelector('[data-evet]').textContent = evet;

    const kapat = (cevap) => { kat.remove(); resolve(cevap); };
    kat.querySelector('[data-evet]').addEventListener('click', () => kapat(true));
    kat.querySelector('[data-hayir]').addEventListener('click', () => kapat(false));
    // Dışına dokunmak vazgeçmek demek.
    kat.addEventListener('click', (e) => { if (e.target === kat) kapat(false); });

    document.body.appendChild(kat);
  });
}

export function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

/**
 * Sunucudan gelen tarih (yerel saat, zaman dilimi eki olmadan) → Date.
 * "2026-08-13T15:00:00" cihazın yerel saati olarak okunur; sonuna Z eklenmiş
 * olsa bile doğru çalışır.
 */
export function parseDate(value) {
  if (!value) return null;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

const pad = (n) => String(n).padStart(2, '0');

/** <input type="datetime-local"> için biçim. */
export function toLocalInput(d) {
  if (!d) return '';
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** Sunucuya gönderilecek biçim — zaman dilimi eki YOK, yerel saat. */
export function fromLocalInput(value) {
  return value ? `${value}:00` : null;
}

export function formatDateTime(d) {
  if (!d) return '';
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** "bugün 15:00", "yarın 09:00", "3 gün önce" gibi kısa gösterim. */
export function formatRelative(d) {
  if (!d) return '';
  const heute = new Date(); heute.setHours(0, 0, 0, 0);
  const tag = new Date(d); tag.setHours(0, 0, 0, 0);
  const farkGun = Math.round((tag - heute) / 86400000);
  const saat = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  if (farkGun === 0) return `bugün ${saat}`;
  if (farkGun === 1) return `yarın ${saat}`;
  if (farkGun === -1) return `dün ${saat}`;
  return formatDateTime(d);
}
