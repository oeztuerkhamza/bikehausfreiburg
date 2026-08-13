// Kabuk: oturum, ekran yönlendirme, dikte akışı, not düzenleme.

import { DEFAULT_LANG, LANGS, IS_NATIVE } from './config.js';
import { loadSession, clearSession, displayName, kv } from './session.js';
import { login, validateSession, logout } from './auth.js';
import * as notes from './notes.js';
import * as speech from './speech.js';
import * as takvim from './calendar.js';
import {
  $, show, hide, toast, escapeHtml, parseDate,
  toLocalInput, fromLocalInput, formatRelative,
} from './ui.js';

const ekranlar = ['#splash', '#login-screen', '#list-screen', '#record-screen', '#detail-screen'];
let liste = [];
let acikNot = null;
let dil = DEFAULT_LANG;

// ═══════════ Ekran yönetimi ═══════════

function ekranGoster(sel) {
  ekranlar.forEach((s) => hide($(s)));
  show($(sel));
}

// ═══════════ Açılış ═══════════

async function baslat() {
  dil = (await kv.get('lang')) || DEFAULT_LANG;
  dilSecimiKur();

  await loadSession();
  if (await validateSession()) {
    await listeyeGec();
  } else {
    await clearSession();
    ekranGoster('#login-screen');
  }

  // Token süresi dolarsa her yerde girişe dön.
  window.addEventListener('unauthorized', async () => {
    await clearSession();
    ekranGoster('#login-screen');
  });
}

function dilSecimiKur() {
  const sel = $('#lang-select');
  sel.innerHTML = LANGS
    .map((l) => `<option value="${l.code}">${l.label}</option>`)
    .join('');
  sel.value = dil;
  sel.addEventListener('change', async () => {
    dil = sel.value;
    await kv.set('lang', dil);
    toast(`Dikte dili: ${LANGS.find((l) => l.code === dil)?.label || dil}`);
  });
}

// ═══════════ Giriş ═══════════

$('#login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = $('#login-btn');
  const hata = $('#login-error');
  hide(hata);
  btn.disabled = true;
  btn.querySelector('.btn-text').classList.add('hidden');
  btn.querySelector('.btn-loader').classList.remove('hidden');

  try {
    await login($('#username').value.trim(), $('#password').value);
    $('#password').value = '';
    await listeyeGec();
  } catch (err) {
    hata.textContent = err.message || 'Giriş başarısız';
    show(hata);
  } finally {
    btn.disabled = false;
    btn.querySelector('.btn-text').classList.remove('hidden');
    btn.querySelector('.btn-loader').classList.add('hidden');
  }
});

$('#logout-btn').addEventListener('click', async () => {
  await logout();
  ekranGoster('#login-screen');
});

// ═══════════ Liste ═══════════

async function listeyeGec() {
  $('#user-name').textContent = displayName() || '';
  ekranGoster('#list-screen');
  await listeYenile();
}

async function listeYenile() {
  try {
    liste = await notes.listele();
    listeCiz();
  } catch (err) {
    $('#notes').innerHTML = `<div class="empty">Notlar yüklenemedi.<br><small>${escapeHtml(err.message)}</small></div>`;
  }
}

function listeCiz() {
  const kap = $('#notes');
  if (!liste.length) {
    kap.innerHTML = `
      <div class="empty">
        <p>Henüz not yok.</p>
        <p class="hint">Aşağıdaki mikrofona bas ve konuş.</p>
      </div>`;
    return;
  }

  kap.innerHTML = liste.map((n) => {
    const termin = parseDate(n.terminAt);
    const gecmis = termin && termin.getTime() < Date.now();
    return `
      <article class="note ${n.erledigt ? 'done' : ''}" data-id="${n.id}">
        <div class="note-main">
          <h3>${escapeHtml(n.titel || 'Not')}</h3>
          <p>${escapeHtml((n.text || '').slice(0, 160))}</p>
        </div>
        ${termin ? `<span class="note-date ${gecmis ? 'past' : ''}">⏰ ${escapeHtml(formatRelative(termin))}</span>` : ''}
      </article>`;
  }).join('');

  kap.querySelectorAll('.note').forEach((el) => {
    el.addEventListener('click', () => detayAc(Number(el.dataset.id)));
  });
}

// ═══════════ Dikte ═══════════

$('#mic-fab').addEventListener('click', dikteBaslat);

async function dikteBaslat() {
  if (!speech.destekleniyorMu()) {
    toast('Konuşma tanıma yalnızca telefonda çalışır.', 'error');
    return;
  }
  if (!(await speech.izinIste())) {
    toast('Mikrofon izni verilmedi.', 'error');
    return;
  }

  $('#record-text').value = '';
  $('#record-toggle').textContent = '⏸ Duraklat';
  $('#record-wave').classList.add('active');
  ekranGoster('#record-screen');

  await speech.basla(dil, (metin) => {
    const alan = $('#record-text');
    // Kullanıcı elle yazmaya başladıysa üstüne yazma.
    if (document.activeElement !== alan) alan.value = metin;
  });
}

$('#record-toggle').addEventListener('click', async () => {
  const btn = $('#record-toggle');
  if (speech.calisiyorMu()) {
    await speech.dur();
    $('#record-wave').classList.remove('active');
    btn.textContent = '▶ Devam et';
  } else {
    // Elle yapılan düzeltmeler korunsun.
    speech.metniAyarla($('#record-text').value.trim());
    $('#record-wave').classList.add('active');
    btn.textContent = '⏸ Duraklat';
    await speech.basla(dil, (metin) => {
      const alan = $('#record-text');
      if (document.activeElement !== alan) alan.value = metin;
    }, { devam: true });
  }
});

$('#record-cancel').addEventListener('click', async () => {
  await speech.dur();
  $('#record-wave').classList.remove('active');
  ekranGoster('#list-screen');
});

$('#record-save').addEventListener('click', async () => {
  const btn = $('#record-save');
  await speech.dur();
  $('#record-wave').classList.remove('active');

  const metin = $('#record-text').value.trim();
  if (!metin) {
    toast('Not boş.', 'error');
    ekranGoster('#list-screen');
    return;
  }

  btn.disabled = true;
  btn.textContent = 'Düzenleniyor…';
  try {
    const not = await notes.ekle({ rohText: metin, sprache: dil });
    liste.unshift(not);
    ekranGoster('#list-screen');
    listeCiz();
    toast('Not kaydedildi.');
    detayAc(not.id);
  } catch (err) {
    toast(err.message || 'Kaydedilemedi', 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Kaydet';
  }
});

// ═══════════ Detay ═══════════

function detayAc(id) {
  const not = liste.find((n) => n.id === id);
  if (!not) return;
  acikNot = not;

  $('#detail-title').value = not.titel || '';
  $('#detail-text').value = not.text || '';
  $('#detail-date').value = toLocalInput(parseDate(not.terminAt));
  $('#detail-raw').textContent = not.rohText || '';
  $('#detail-done').textContent = not.erledigt ? '↩ Bitti işaretini kaldır' : '✓ Bitti olarak işaretle';
  ekranGoster('#detail-screen');
}

$('#detail-back').addEventListener('click', () => {
  acikNot = null;
  ekranGoster('#list-screen');
});

$('#detail-date-clear').addEventListener('click', () => { $('#detail-date').value = ''; });

$('#detail-save').addEventListener('click', async () => {
  if (!acikNot) return;
  const btn = $('#detail-save');
  btn.disabled = true;
  try {
    const tarih = $('#detail-date').value;
    const guncel = await notes.guncelle(acikNot.id, {
      titel: $('#detail-title').value.trim(),
      text: $('#detail-text').value.trim(),
      terminAt: tarih ? fromLocalInput(tarih) : null,
      terminEntfernen: !tarih,
    });
    listeyiTazele(guncel);
    if (!tarih) await takvim.hatirlatmayiIptal(acikNot.id);
    toast('Kaydedildi.');
    ekranGoster('#list-screen');
  } catch (err) {
    toast(err.message || 'Kaydedilemedi', 'error');
  } finally {
    btn.disabled = false;
  }
});

$('#detail-done').addEventListener('click', async () => {
  if (!acikNot) return;
  try {
    const guncel = await notes.guncelle(acikNot.id, { erledigt: !acikNot.erledigt });
    listeyiTazele(guncel);
    if (guncel.erledigt) await takvim.hatirlatmayiIptal(guncel.id);
    toast(guncel.erledigt ? 'Bitti olarak işaretlendi.' : 'Yeniden açıldı.');
    ekranGoster('#list-screen');
  } catch (err) {
    toast(err.message || 'Güncellenemedi', 'error');
  }
});

$('#detail-delete').addEventListener('click', async () => {
  if (!acikNot) return;
  if (!confirm('Bu not silinsin mi?')) return;
  try {
    await notes.sil(acikNot.id);
    await takvim.hatirlatmayiIptal(acikNot.id);
    liste = liste.filter((n) => n.id !== acikNot.id);
    acikNot = null;
    listeCiz();
    ekranGoster('#list-screen');
    toast('Not silindi.');
  } catch (err) {
    toast(err.message || 'Silinemedi', 'error');
  }
});

$('#detail-redo').addEventListener('click', async () => {
  if (!acikNot) return;
  const btn = $('#detail-redo');
  btn.disabled = true;
  try {
    const d = await notes.aufbereiten(acikNot.rohText, acikNot.sprache || dil);
    $('#detail-title').value = d.titel || $('#detail-title').value;
    $('#detail-text').value = d.text || $('#detail-text').value;
    if (d.terminAt) $('#detail-date').value = toLocalInput(parseDate(d.terminAt));
    toast('Yeniden düzenlendi — kaydetmeyi unutma.');
  } catch (err) {
    toast(err.message || 'Düzenlenemedi', 'error');
  } finally {
    btn.disabled = false;
  }
});

$('#detail-calendar').addEventListener('click', async () => {
  const tarih = tarihAlanindanDate();
  if (!tarih) { toast('Önce bir tarih/saat seç.', 'error'); return; }
  try {
    await takvim.takvimeEkle({
      titel: $('#detail-title').value.trim() || 'Not',
      text: $('#detail-text').value.trim(),
      start: tarih,
    });
  } catch (err) {
    toast(err.message || 'Takvim açılamadı', 'error');
  }
});

$('#detail-remind').addEventListener('click', async () => {
  const tarih = tarihAlanindanDate();
  if (!tarih) { toast('Önce bir tarih/saat seç.', 'error'); return; }
  if (!(await takvim.bildirimIzni())) { toast('Bildirim izni verilmedi.', 'error'); return; }
  try {
    await takvim.hatirlat({
      id: acikNot?.id,
      titel: $('#detail-title').value.trim() || 'Not',
      text: $('#detail-text').value.trim(),
      zaman: tarih,
    });
    toast(`Hatırlatma kuruldu: ${formatRelative(tarih)}`);
  } catch (err) {
    toast(err.message || 'Hatırlatma kurulamadı', 'error');
  }
});

function tarihAlanindanDate() {
  const v = $('#detail-date').value;
  if (!v) return null;
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
}

function listeyiTazele(guncel) {
  const i = liste.findIndex((n) => n.id === guncel.id);
  if (i >= 0) liste[i] = guncel;
  acikNot = guncel;
  // Bitmiş notlar listenin sonuna: sunucudaki sıralamanın aynısı.
  liste.sort((a, b) =>
    (a.erledigt === b.erledigt ? 0 : a.erledigt ? 1 : -1) ||
    new Date(b.createdAt) - new Date(a.createdAt));
  listeCiz();
}

// Donanım geri tuşu: detay/dikte → liste, listede çıkış yapma.
window.Capacitor?.Plugins?.App?.addListener('backButton', async () => {
  if (!$('#detail-screen').classList.contains('hidden')) {
    acikNot = null;
    ekranGoster('#list-screen');
  } else if (!$('#record-screen').classList.contains('hidden')) {
    await speech.dur();
    ekranGoster('#list-screen');
  }
});

if (!IS_NATIVE) {
  console.info('Tarayıcı modu: konuşma tanıma ve takvim yalnızca telefonda çalışır.');
}

baslat();
