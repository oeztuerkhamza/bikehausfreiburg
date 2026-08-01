// Kleinanzeigen ekranı: ilan mesajları WhatsApp gibi sohbet olarak.
//
// Kaynak Gmail'dir: Kleinanzeigen her mesajı kendi alias adresinden
// (…@mail.kleinanzeigen.de) mail olarak yollar; o adrese cevap yazınca mesaj
// alıcının Kleinanzeigen uygulamasında görünür — yani uygulamadan yazmış gibi.
// Sunucu bu mailleri ayrıştırıp konuşmalara böler (api/kleinanzeigenchat).
import { API_BASE } from './config.js';
import { http } from './http.js';
import { toTurkish } from './translate.js';
import { $, toast, initials, fmtTime, fmtListTime, autoGrow, setText } from './ui.js';
import { notify } from './notify.js';

const api = (p) => `${API_BASE}/api/kleinanzeigenchat${p}`;
const gm  = (p) => `${API_BASE}/api/gmail${p}`;

let conversations = [];
let activeId = null;
let active = null;              // açık konuşma
let connected = true;           // Gmail bağlı mı (409 → false)
let seeded = false;             // ilk yoklamada bildirim gönderme
const lastNotified = new Map(); // konuşma id → son bildirilen gelen mesaj ts
let appActive = () => true;
let onOpenThread = () => {};
let generating = false;
let account = { connected: false, email: null, ownAccount: false };

let D = {};
export function mount({ isForeground, showThread }) {
  appActive = isForeground || appActive;
  onOpenThread = showThread || onOpenThread;
  D = {
    list: $('ka-list'), empty: $('ka-empty'), conn: $('ka-conn'),
    messages: $('ka-messages'),
    peerName: $('ka-peer-name'), peerSub: $('ka-peer-sub'), peerAvatar: $('ka-peer-avatar'),
    adTitle: $('ka-ad-title'), adId: $('ka-ad-id'),
    adThumb: $('ka-ad-thumb'), adIcon: $('ka-ad-icon'), adPrice: $('ka-ad-price'),
    adChip: $('ka-ad-chip'),
    instruction: $('ka-instruction'), generate: $('ka-generate'),
    panel: $('ka-compose-panel'), draft: $('ka-draft'), draftTr: $('ka-draft-tr'),
    regen: $('ka-regen'), send: $('ka-send'), langBadge: $('ka-lang-badge'),
    tabBadge: $('ka-tabbadge'),
  };

  D.connect = $('ka-connect');
  $('ka-refresh').addEventListener('click', () => { refreshAccount(); refreshList(true); });
  $('ka-connect-btn').addEventListener('click', connectAccount);
  D.generate.addEventListener('click', onGenerate);
  D.regen.addEventListener('click', onRegenerate);
  D.send.addEventListener('click', onSend);
  D.instruction.addEventListener('input', () => autoGrow(D.instruction));
  D.instruction.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); onGenerate(); }
  });
  D.draft.addEventListener('blur', persistDraft);
  // İlan şeridine dokununca ilan tarayıcıda açılır.
  D.adChip.addEventListener('click', () => {
    if (active?.adUrl) window.open(active.adUrl, '_system');
  });
}

export function activate() { refreshAccount(); refreshList(false); }

// ─────────────────────── Gmail hesabı ───────────────────────
// Kleinanzeigen kendi hesabına bağlanabilir; bağlı değilse Mail sekmesinin
// hesabı kullanılır (sunucu öyle davranıyor).
export function getAccount() { return account; }

export async function refreshAccount() {
  try {
    account = await http.get(api('/account'));
  } catch {
    account = { connected: false, email: null, ownAccount: false };
  }
  renderConnectPanel();
  return account;
}

function renderConnectPanel() {
  const missing = !account.connected;
  if (D.connect) D.connect.classList.toggle('hidden', !missing);
  D.list.classList.toggle('hidden', missing);
  setConn(account.connected);
  if (D.conn) {
    D.conn.title = account.connected
      ? `Kleinanzeigen: ${account.email}${account.ownAccount ? '' : ' (Mail hesabı)'}`
      : 'Gmail bağlı değil';
  }
}

/** İlanların bağlı olduğu Gmail hesabını bağla (Mail hesabına dokunmaz). */
export async function connectAccount() {
  try {
    const { url } = await http.get(gm('/auth-url?account=kleinanzeigen'));
    window.open(url, '_system');
    toast('Tarayıcıda hesabı seç, dönünce Yenile’ye bas', 4600);
  } catch (e) {
    toast('Bağlantı adresi alınamadı: ' + e.message);
  }
}

/** Sadece Kleinanzeigen hesabını çıkar; Mail hesabı bağlı kalır. */
export async function disconnectAccount() {
  try {
    await http.post(api('/account/disconnect'), {});
    conversations = [];
    activeId = null; active = null;
    renderList();
    await refreshAccount();
    toast('Kleinanzeigen hesabı çıkarıldı');
  } catch (e) {
    toast('Çıkarılamadı: ' + e.message);
  }
}

// ─────────────────────────── Yoklama ───────────────────────────
export async function poll() {
  try {
    const convs = await http.get(api('/conversations'));
    setConn(true);
    ingest(convs);
  } catch (e) {
    if (e.status === 409) { setConn(false); refreshAccount(); }
  }
}

async function refreshList(manual) {
  try {
    const convs = await http.get(api('/conversations'));
    setConn(true);
    ingest(convs, /*silentSeed*/ !seeded);
    if (manual) toast('Güncellendi');
  } catch (e) {
    if (e.status === 409) {
      setConn(false);
      refreshAccount();
    } else if (manual) {
      toast('Yenilenemedi: ' + e.message);
    }
  }
}

function setConn(ok) {
  connected = ok;
  D.conn.className = 'conn-dot ' + (ok ? 'ok' : 'err');
  D.conn.title = ok ? 'Gmail bağlı' : 'Gmail bağlı değil';
}

// Gelen konuşmaları işle: liste + bildirim + rozet.
function ingest(convs, silentSeed) {
  if (!Array.isArray(convs)) return;
  conversations = convs;

  for (const c of conversations) {
    const lastIn = [...(c.messages || [])].reverse().find((m) => m.direction === 'in');
    if (!lastIn) continue;
    const prev = lastNotified.get(c.id) || 0;
    if (seeded && !silentSeed && lastIn.ts > prev) {
      const isOpenForeground = appActive() && activeId === c.id;
      if (!isOpenForeground) {
        notify(`🏷️ ${c.peerName} · Kleinanzeigen`, lastIn.body, { tab: 'ka', chatId: c.id });
      }
    }
    if (lastIn.ts > prev) lastNotified.set(c.id, lastIn.ts);
  }
  seeded = true;

  renderList();
  if (activeId) {
    const fresh = conversations.find((c) => c.id === activeId);
    if (fresh && (fresh.messages?.length || 0) !== (active?.messages?.length || 0)) {
      active = fresh;
      renderMessages(active, { keepScroll: false });
      translateIncoming(activeId);
    }
  }
}

// ─────────────────────────── Liste ───────────────────────────
function totalUnread() { return conversations.reduce((n, c) => n + (c.unread || 0), 0); }
export function getUnreadTotal() { return totalUnread(); }

function updateTabBadge() {
  const n = totalUnread();
  if (n > 0) { D.tabBadge.textContent = n > 99 ? '99+' : n; D.tabBadge.classList.remove('hidden'); }
  else D.tabBadge.classList.add('hidden');
}

function renderList() {
  updateTabBadge();
  if (!conversations.length) {
    D.list.innerHTML =
      '<div class="list-empty"><p>Henüz mesaj yok.<br><small>İlanlarına gelen mesajlar burada çıkar.</small></p></div>';
    return;
  }
  D.list.innerHTML = '';
  for (const c of conversations) {
    const unread = c.unread || 0;
    const preview = (c.lastDirection === 'out' ? 'Sen: ' : '') + (c.lastMessage || '');

    const item = document.createElement('div');
    item.className = 'list-item';
    item.innerHTML = `
      ${c.adImageUrl
        ? `<img class="li-photo" alt="" />`
        : `<div class="peer-avatar ka"></div>`}
      <div class="li-body">
        <div class="li-top">
          <span class="li-name ${unread ? 'unread' : ''}"></span>
          <span class="li-time ${unread ? 'unread' : ''}">${fmtListTime(c.updatedAt)}</span>
        </div>
        <div class="li-ad"></div>
        <div class="li-bottom">
          <span class="li-preview ${unread ? 'unread' : ''}"></span>
          ${unread ? `<span class="li-badge">${unread}</span>` : ''}
        </div>
      </div>`;
    const photo = item.querySelector('.li-photo');
    if (photo) photo.src = c.adImageUrl;
    else item.querySelector('.peer-avatar').textContent = initials(c.peerName);
    item.querySelector('.li-name').textContent = c.peerName;
    item.querySelector('.li-ad').textContent = c.adTitle || '';
    item.querySelector('.li-preview').textContent = preview;
    item.addEventListener('click', () => openConversation(c.id));
    D.list.appendChild(item);
  }
}

// ─────────────────────────── Sohbet ───────────────────────────
export async function openConversation(id) {
  activeId = id;
  resetComposer();
  onOpenThread();

  const local = conversations.find((c) => c.id === id);
  if (local) { active = local; renderPeer(local); renderMessages(local); }

  try {
    const conv = await http.get(api(`/conversations/${encodeURIComponent(id)}`));
    active = conv;
    const i = conversations.findIndex((c) => c.id === id);
    if (i >= 0) conversations[i] = { ...conv, unread: 0 };
    renderPeer(conv);
    renderMessages(conv);
    renderList();
    if (conv.draft) showComposePanel(conv.draft, conv.draftTr);

    // Okundu işaretle (Gmail'de de okunmuş olur) + çeviri
    http.post(api(`/conversations/${encodeURIComponent(id)}/read`), {}).catch(() => {});
    translateIncoming(id);
  } catch (e) {
    toast('Sohbet açılamadı: ' + e.message);
  }
}

function renderPeer(c) {
  setText(D.peerName, c.peerName);
  // Başlık zaten ilan şeridinde; burada telefon daha işe yarar.
  setText(D.peerSub, c.peerPhone ? `📞 ${c.peerPhone}` : (c.adTitle || ''));
  setText(D.peerAvatar, initials(c.peerName));

  setText(D.adTitle, c.adTitle || '');
  setText(D.adId, c.adId ? `Nr. ${c.adId}` : '');
  setText(D.adPrice, c.adPrice != null ? `${formatPrice(c.adPrice)} €` : '');

  const hasPhoto = !!c.adImageUrl;
  D.adThumb.classList.toggle('hidden', !hasPhoto);
  D.adIcon.classList.toggle('hidden', hasPhoto);
  if (hasPhoto) D.adThumb.src = c.adImageUrl;
  D.adChip.classList.toggle('clickable', !!c.adUrl);
}

function formatPrice(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n.toLocaleString('de-DE', { maximumFractionDigits: 2 }) : v;
}

function renderMessages(c, opts = {}) {
  const box = D.messages;
  const atBottom = box.scrollHeight - box.scrollTop - box.clientHeight < 80;
  box.innerHTML = '';
  let lastDay = '';
  for (const m of c.messages || []) {
    const day = new Date(m.ts).toDateString();
    if (day !== lastDay) {
      lastDay = day;
      const sep = document.createElement('div');
      sep.className = 'day-sep';
      sep.textContent = new Date(m.ts).toLocaleDateString('tr-TR', { day: '2-digit', month: 'long' });
      box.appendChild(sep);
    }
    const div = document.createElement('div');
    div.className = 'msg ' + (m.direction === 'in' ? 'in' : 'out');
    const body = document.createElement('div');
    body.className = 'body';
    body.textContent = m.body;
    div.appendChild(body);
    if (m.direction === 'in' && m.translation) {
      const tr = document.createElement('div');
      tr.className = 'tr';
      tr.textContent = m.translation;
      div.appendChild(tr);
    }
    const time = document.createElement('span');
    time.className = 'time';
    time.textContent = fmtTime(m.ts);
    div.appendChild(time);
    box.appendChild(div);
  }
  if (opts.keepScroll !== false && (atBottom || opts.forceBottom)) box.scrollTop = box.scrollHeight;
  else if (opts.keepScroll === false) box.scrollTop = box.scrollHeight;
}

// Çevrilmemiş gelen mesajları Türkçeye çevirt (sunucu kalıcı saklar).
async function translateIncoming(id) {
  const conv = conversations.find((c) => c.id === id) || active;
  const needs = conv && (conv.messages || []).some((m) => m.direction === 'in' && !m.translation && m.body);
  if (!needs) return;
  try {
    const updated = await http.post(api(`/conversations/${encodeURIComponent(id)}/translate`), {});
    if (activeId === id) { active = updated; renderMessages(updated); }
    const i = conversations.findIndex((c) => c.id === id);
    if (i >= 0) conversations[i] = { ...updated, unread: activeId === id ? 0 : updated.unread };
  } catch { /* AI kapalıysa sessiz geç */ }
}

// ─────────────────────── Cevap oluştur + kontrol ───────────────────────
function resetComposer() {
  D.panel.classList.add('hidden');
  D.draft.value = ''; D.draftTr.value = ''; D.instruction.value = '';
  setText(D.langBadge, '');
  autoGrow(D.instruction);
}

function showComposePanel(draft, draftTr) {
  D.panel.classList.remove('hidden');
  D.draft.value = draft || '';
  if (draftTr !== undefined) D.draftTr.value = draftTr || '';
}

async function onGenerate() {
  if (!activeId || generating) return;
  const instruction = D.instruction.value.trim();
  if (!instruction) { toast('Önce Türkçe talimat yaz'); return; }
  await generateFrom(instruction);
}

async function onRegenerate() {
  if (!activeId || generating) return;
  const tr = D.draftTr.value.trim();
  if (!tr) { toast('Türkçe kısım boş'); return; }
  await generateFrom(tr);
}

// Türkçe talimattan alıcının dilinde kısa cevap üret; Türkçesi de sunucudan gelir.
async function generateFrom(instructionTr) {
  generating = true;
  setBusy(true, 'AI cevabı üretiliyor…');
  try {
    const conv = await http.post(api(`/conversations/${encodeURIComponent(activeId)}/compose`), {
      instruction: instructionTr,
    });
    active = conv;
    const i = conversations.findIndex((c) => c.id === activeId);
    if (i >= 0) conversations[i] = conv;
    renderMessages(conv);
    showComposePanel(conv.draft, conv.draftTr);
    setText(D.langBadge, 'AI ✨');
    if (!conv.draftTr) await backTranslateDraft();
  } catch (e) {
    toast('Üretilemedi: ' + e.message);
  } finally {
    generating = false;
    setBusy(false);
  }
}

async function backTranslateDraft() {
  const text = D.draft.value.trim();
  if (!text) { D.draftTr.value = ''; return; }
  D.draftTr.value = '⏳ çevriliyor…';
  try { D.draftTr.value = await toTurkish(text); }
  catch { D.draftTr.value = '(çeviri alınamadı)'; }
}

function setBusy(on, msg) {
  D.generate.disabled = on;
  D.regen.disabled = on;
  D.send.disabled = on;
  removeThinking();
  if (on) {
    const t = document.createElement('div');
    t.className = 'thinking'; t.id = 'ka-thinking';
    t.innerHTML = `<div class="spinner"></div><span>${msg || 'İşleniyor…'}</span>`;
    D.messages.appendChild(t);
    D.messages.scrollTop = D.messages.scrollHeight;
  }
}
function removeThinking() { const t = $('ka-thinking'); if (t) t.remove(); }

async function persistDraft() {
  if (!activeId) return;
  try {
    await http.put(api(`/conversations/${encodeURIComponent(activeId)}/draft`), {
      draft: D.draft.value,
      draftTr: D.draftTr.value,
    });
  } catch {}
}

async function onSend() {
  if (!activeId) return;
  const text = D.draft.value.trim();
  if (!text) { toast('Mesaj boş'); return; }
  D.send.disabled = true;
  try {
    const conv = await http.post(api(`/conversations/${encodeURIComponent(activeId)}/send`), { text });
    resetComposer();
    active = conv;
    const i = conversations.findIndex((c) => c.id === activeId);
    if (i >= 0) conversations[i] = conv;
    renderMessages(conv, { forceBottom: true });
    renderList();
    toast('Gönderildi ✓');
  } catch (e) {
    toast('Gönderilemedi: ' + e.message);
  } finally {
    D.send.disabled = false;
  }
}
