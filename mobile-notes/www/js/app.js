// Kabuk: oturum, ekran yönlendirme, dikte akışı, not düzenleme.

import { DEFAULT_LANG, LANGS, IS_NATIVE } from './config.js';
import { loadSession, clearSession, displayName, kv } from './session.js';
import { login, validateSession, logout } from './auth.js';
import * as notes from './notes.js';
import * as speech from './speech.js';
import * as takvim from './calendar.js';
import {
  $, show, hide, toast, onay, escapeHtml, parseDate,
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

/**
 * Listeye dön ve arka planda tazele. Notlar sunucuda durduğu için başka bir
 * cihazda eklenen not ancak böyle görünür — kullanıcıdan yenilemesini
 * beklemek yerine her dönüşte kendimiz alıyoruz.
 */
function listeyeDon({ tazele = true } = {}) {
  acikNot = null;
  ekranGoster('#list-screen');
  if (tazele) listeYenile().catch(() => {});
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

$('#refresh-btn').addEventListener('click', async () => {
  const btn = $('#refresh-btn');
  btn.classList.add('doner');
  await listeYenile();
  btn.classList.remove('doner');
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

// Sessiz ortamda ya da mikrofon istemediğinde: aynı ekran, dinleme kapalı.
$('#type-fab').addEventListener('click', () => {
  $('#record-text').value = '';
  speech.metniAyarla('');
  $('#record-title').textContent = 'Yeni not';
  $('#record-hint').textContent = 'Yaz — istersen ▶ Devam et ile dikteye geçebilirsin.';
  $('#record-toggle').textContent = '▶ Konuşmaya başla';
  $('#record-wave').classList.remove('active');
  ekranGoster('#record-screen');
  $('#record-text').focus();
});

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
  $('#record-title').textContent = 'Dinliyorum…';
  $('#record-hint').textContent = 'Konuş — söylediklerin buraya yazılıyor.';
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
    $('#record-title').textContent = 'Duraklatıldı';
    btn.textContent = '▶ Devam et';
  } else {
    // Elle yapılan düzeltmeler korunsun.
    speech.metniAyarla($('#record-text').value.trim());
    $('#record-wave').classList.add('active');
    $('#record-title').textContent = 'Dinliyorum…';
    btn.textContent = '⏸ Duraklat';
    if (!speech.destekleniyorMu() || !(await speech.izinIste())) {
      toast('Mikrofon kullanılamıyor — yazarak devam edebilirsin.', 'error');
      $('#record-wave').classList.remove('active');
      $('#record-title').textContent = 'Yeni not';
      btn.textContent = '▶ Konuşmaya başla';
      return;
    }
    await speech.basla(dil, (metin) => {
      const alan = $('#record-text');
      if (document.activeElement !== alan) alan.value = metin;
    }, { devam: true });
  }
});

$('#record-cancel').addEventListener('click', dikteIptal);

/** ✕ ve donanım geri tuşu. Yazılmış metin varsa onaysız atılmaz. */
async function dikteIptal() {
  await speech.dur();
  $('#record-wave').classList.remove('active');
  const metin = $('#record-text').value.trim();
  if (metin && !(await onay('Bu not kaydedilmeden atılsın mı?', {
    evet: 'At', hayir: 'Vazgeç', tehlike: true,
  }))) {
    // Vazgeçildi: ekranda kal, dikte duraklatılmış olarak beklesin.
    $('#record-toggle').textContent = '▶ Devam et';
    return;
  }
  listeyeDon({ tazele: false });
}

$('#record-save').addEventListener('click', async () => {
  const btn = $('#record-save');
  await speech.dur();
  $('#record-wave').classList.remove('active');

  const metin = $('#record-text').value.trim();
  if (!metin) {
    toast('Not boş.', 'error');
    listeyeDon({ tazele: false });
    return;
  }

  btn.disabled = true;
  btn.textContent = 'Düzenleniyor…';
  try {
    const not = await notes.ekle({ rohText: metin, sprache: dil });
    liste.unshift(not);
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

// Geri: kaydedilmemiş değişiklik varsa kendiliğinden kaydedilir. Not
// uygulamasında "kaydetmeyi unuttun" diye uyarmak yerine kaydetmek doğrusu.
$('#detail-back').addEventListener('click', async () => {
  if (degistiMi()) {
    const tamam = await notKaydet({ sessiz: false });
    if (!tamam) return;   // kaydedilemedi: ekranda kal, metin kaybolmasın
  }
  listeyeDon();
});

$('#detail-date-clear').addEventListener('click', () => { $('#detail-date').value = ''; });

/** Ekrandaki değerler kayıtlı nottan farklı mı? */
function degistiMi() {
  if (!acikNot) return false;
  const tarih = $('#detail-date').value;
  return $('#detail-title').value.trim() !== (acikNot.titel || '')
    || $('#detail-text').value.trim() !== (acikNot.text || '')
    || tarih !== toLocalInput(parseDate(acikNot.terminAt));
}

/**
 * Detaydaki değerleri kaydeder. Takvim ve hatırlatma da bunu çağırır: yoksa
 * kullanıcı takvime eklediği tarihi notta bulamıyordu.
 * @returns {Promise<boolean>} kaydedildi mi
 */
async function notKaydet({ sessiz = true } = {}) {
  if (!acikNot) return false;
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
    if (!tarih) await takvim.hatirlatmayiIptal(guncel.id);
    if (!sessiz) toast('Kaydedildi.');
    return true;
  } catch (err) {
    toast(err.message || 'Kaydedilemedi', 'error');
    return false;
  } finally {
    btn.disabled = false;
  }
}

$('#detail-save').addEventListener('click', async () => {
  if (await notKaydet({ sessiz: false })) listeyeDon();
});

$('#detail-done').addEventListener('click', async () => {
  if (!acikNot) return;
  try {
    const guncel = await notes.guncelle(acikNot.id, { erledigt: !acikNot.erledigt });
    listeyiTazele(guncel);
    if (guncel.erledigt) await takvim.hatirlatmayiIptal(guncel.id);
    toast(guncel.erledigt ? 'Bitti olarak işaretlendi.' : 'Yeniden açıldı.');
    listeyeDon();
  } catch (err) {
    toast(err.message || 'Güncellenemedi', 'error');
  }
});

$('#detail-delete').addEventListener('click', async () => {
  if (!acikNot) return;
  if (!(await onay('Bu not silinsin mi?', { evet: 'Sil', tehlike: true }))) return;
  try {
    await notes.sil(acikNot.id);
    await takvim.hatirlatmayiIptal(acikNot.id);
    liste = liste.filter((n) => n.id !== acikNot.id);
    listeCiz();
    listeyeDon({ tazele: false });
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
  // Takvime giden tarih notta da kalsın.
  if (degistiMi() && !(await notKaydet())) return;
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
  if (degistiMi() && !(await notKaydet())) return;
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
  // Onay penceresi açıksa geri tuşu önce onu kapatsın.
  const modal = document.querySelector('.modal-kat');
  if (modal) { modal.remove(); return; }
  if (!$('#detail-screen').classList.contains('hidden')) {
    $('#detail-back').click();
  } else if (!$('#record-screen').classList.contains('hidden')) {
    await dikteIptal();
  }
});

if (!IS_NATIVE) {
  console.info('Tarayıcı modu: konuşma tanıma ve takvim yalnızca telefonda çalışır.');
}

baslat();
