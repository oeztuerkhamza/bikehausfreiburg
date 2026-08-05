// WhatsApp ekranı: sohbet listesi, thread, çeviri, AI cevap + Türkçe kontrol/regenerate,
// gönderim, yoklama (polling) + yeni mesaj bildirimi.
import { WA_BASE } from './config.js';
import { http } from './http.js';
import { token } from './session.js';
import { toTurkish } from './translate.js';
import { $, toast, initials, fmtTime, fmtListTime, autoGrow, setText } from './ui.js';
import { notify } from './notify.js';

const api = (p) => WA_BASE + '/api' + p;

let conversations = [];
let activeId = null;
let active = null;              // açık konuşma nesnesi
let seeded = false;             // ilk poll bildirimleri bastırmak için
const lastNotified = new Map(); // chatId -> son bildirilen incoming ts
let appActive = () => true;     // uygulama ön planda mı? (app.js sağlar)
let onOpenThread = () => {};    // app.js: thread görünümüne geç

let generating = false;

// ─────────────────────────── DOM ───────────────────────────
let D = {};
export function mount({ isForeground, showThread }) {
  appActive = isForeground || appActive;
  onOpenThread = showThread || onOpenThread;
  D = {
    list: $('wa-list'), empty: $('wa-empty'), conn: $('wa-conn'),
    messages: $('wa-messages'),
    peerName: $('wa-peer-name'), peerSub: $('wa-peer-sub'), peerAvatar: $('wa-peer-avatar'),
    instruction: $('wa-instruction'), generate: $('wa-generate'),
    panel: $('wa-compose-panel'), draft: $('wa-draft'), draftTr: $('wa-draft-tr'),
    regen: $('wa-regen'), send: $('wa-send'), langBadge: $('wa-lang-badge'),
    tabBadge: $('wa-tabbadge'),
  };

  $('wa-refresh').addEventListener('click', () => refreshList(true));
  D.generate.addEventListener('click', onGenerate);
  D.regen.addEventListener('click', onRegenerate);
  D.send.addEventListener('click', onSend);
  D.instruction.addEventListener('input', () => autoGrow(D.instruction));
  D.instruction.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); onGenerate(); }
  });
  D.draft.addEventListener('blur', persistDraft);
}

// ─────────────────────── Sekme yaşam döngüsü ───────────────────────
// Yoklama zamanlayıcısını app.js yönetir (sekmeden bağımsız bildirim için).
export function activate() { refreshList(false); }

// app.js global yoklaması bunu çağırır (liste + bildirim).
export async function poll() {
  try {
    const [state, convs] = await Promise.all([
      http.get(api('/state')).catch(() => null),
      http.get(api('/conversations')),
    ]);
    if (state) renderConn(state.wa?.status);
    ingest(convs);
  } catch { /* sessiz */ }
}

async function refreshList(manual) {
  try {
    const convs = await http.get(api('/conversations'));
    ingest(convs, /*silentSeed*/ !seeded);
    if (manual) toast('Güncellendi');
  } catch (e) {
    if (manual) toast('Yenilenemedi: ' + e.message);
  }
}

// Gelen konuşmaları işle: liste + bildirim + rozet.
function ingest(convs, silentSeed) {
  if (!Array.isArray(convs)) return;
  conversations = convs.sort((a, b) => b.updatedAt - a.updatedAt);

  for (const c of conversations) {
    const lastIn = [...c.messages].reverse().find((m) => m.direction === 'in');
    if (!lastIn) continue;
    const prev = lastNotified.get(c.chatId) || 0;
    if (seeded && !silentSeed && lastIn.ts > prev) {
      const isOpenForeground = appActive() && activeId === c.chatId;
      if (!isOpenForeground) {
        notify(`💬 ${c.name}`, lastIn.body, { tab: 'wa', chatId: c.chatId });
      }
    }
    if (lastIn.ts > prev) lastNotified.set(c.chatId, lastIn.ts);
  }
  seeded = true;

  renderList();
  if (activeId) {
    const fresh = conversations.find((c) => c.chatId === activeId);
    if (fresh && fresh.messages.length !== (active?.messages.length || 0)) {
      active = fresh;
      renderMessages(active, { keepScroll: false });
      // yeni gelenleri çevir
      translateIncoming(activeId);
    }
  }
}

function renderConn(status) {
  const dot = D.conn;
  dot.className = 'conn-dot ' + (status === 'ready' ? 'ok' : status === 'qr' || status === 'authenticated' ? 'warn' : status === 'disconnected' || status === 'loggingout' ? 'err' : '');
  dot.title = 'WhatsApp: ' + (status || '—');
}

// ─────────────────────────── Liste ───────────────────────────
function totalUnread() { return conversations.reduce((n, c) => n + (c.unread || 0), 0); }

function updateTabBadge() {
  const n = totalUnread();
  if (n > 0) { D.tabBadge.textContent = n > 99 ? '99+' : n; D.tabBadge.classList.remove('hidden'); }
  else D.tabBadge.classList.add('hidden');
}
export function getUnreadTotal() { return totalUnread(); }

function renderList() {
  updateTabBadge();
  if (!conversations.length) {
    D.list.innerHTML = '<div class="list-empty"><p>Henüz sohbet yok.<br><small>Müşteri yazınca burada görünür.</small></p></div>';
    return;
  }
  D.list.innerHTML = '';
  for (const c of conversations) {
    const last = c.messages[c.messages.length - 1];
    const preview = last ? (last.direction === 'out' ? 'Sen: ' : '') + last.body : '';
    const unread = c.unread || 0;

    const item = document.createElement('div');
    item.className = 'list-item';
    item.innerHTML = `
      <div class="peer-avatar"></div>
      <div class="li-body">
        <div class="li-top">
          <span class="li-name ${unread ? 'unread' : ''}"></span>
          <span class="li-time ${unread ? 'unread' : ''}">${fmtListTime(c.updatedAt)}</span>
        </div>
        <div class="li-bottom">
          <span class="li-preview ${unread ? 'unread' : ''}"></span>
          ${unread ? `<span class="li-badge">${unread}</span>` : ''}
        </div>
      </div>`;
    item.querySelector('.peer-avatar').textContent = initials(c.name);
    item.querySelector('.li-name').textContent = c.name;
    item.querySelector('.li-preview').textContent = preview;
    item.addEventListener('click', () => openConversation(c.chatId));
    D.list.appendChild(item);
  }
}

// ─────────────────────────── Thread ───────────────────────────
export async function openConversation(chatId) {
  activeId = chatId;
  resetComposer();
  onOpenThread(); // görünümü değiştir

  const local = conversations.find((c) => c.chatId === chatId);
  if (local) { active = local; renderPeer(local); renderMessages(local); }

  try {
    const conv = await http.get(api(`/conversations/${encodeURIComponent(chatId)}`));
    active = conv;
    const i = conversations.findIndex((c) => c.chatId === chatId);
    if (i >= 0) conversations[i] = { ...conv, unread: 0 };
    renderPeer(conv);
    renderMessages(conv);
    renderList();
    // taslak varsa panele koy
    if (conv.draft) showComposePanel(conv.draft);
    translateIncoming(chatId);
  } catch (e) {
    toast('Sohbet açılamadı: ' + e.message);
  }
}

function renderPeer(c) {
  setText(D.peerName, c.name);
  setText(D.peerSub, (c.chatId || '').replace(/@(c\.us|lid)$/, ''));
  setText(D.peerAvatar, initials(c.name));
}

// Fotoğraflar JWT'li uçtan gelir; <img src> başlık gönderemediği için görseli
// tek tek çekip blob URL veriyoruz. Başarısız olursa görsel düşer, mesaj
// '📷 Foto' etiketiyle kalır.
const photoUrls = new Map();
async function loadPhoto(img, file) {
  const cached = photoUrls.get(file);
  if (cached) { img.src = cached; return; }
  try {
    const res = await fetch(api(`/media/${encodeURIComponent(file)}`), {
      headers: { Authorization: `Bearer ${token()}` },
    });
    if (!res.ok) throw new Error(String(res.status));
    const url = URL.createObjectURL(await res.blob());
    photoUrls.set(file, url);
    img.src = url;
  } catch {
    img.remove();
  }
}

function renderMessages(c, opts = {}) {
  const box = D.messages;
  const atBottom = box.scrollHeight - box.scrollTop - box.clientHeight < 80;
  box.innerHTML = '';
  let lastDay = '';
  for (const m of c.messages) {
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
    if (m.photo) {
      const img = document.createElement('img');
      img.className = 'photo';
      img.alt = 'Fotoğraf';
      img.loading = 'lazy';
      div.appendChild(img);
      loadPhoto(img, m.photo);
    }
    // Sadece fotoğraftan ibaret mesajda '📷 Foto' etiketini tekrar yazma.
    if (!(m.photo && m.mediaOnly)) {
      const body = document.createElement('div');
      body.className = 'body';
      body.textContent = m.body;
      div.appendChild(body);
    }
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

// Çevrilmemiş gelen mesajları Türkçeye çevirt (WA servisi kalıcı saklar).
async function translateIncoming(chatId) {
  const conv = conversations.find((c) => c.chatId === chatId) || active;
  const needs = conv && conv.messages.some((m) => m.direction === 'in' && !m.translation && m.body);
  if (!needs) return;
  try {
    const updated = await http.post(api(`/conversations/${encodeURIComponent(chatId)}/translate`), {});
    if (activeId === chatId) { active = updated; renderMessages(updated); }
    const i = conversations.findIndex((c) => c.chatId === chatId);
    if (i >= 0) conversations[i] = { ...updated, unread: activeId === chatId ? 0 : updated.unread };
  } catch { /* AI kapalıysa sessiz geç */ }
}

// ─────────────────────── Cevap oluştur + kontrol ───────────────────────
function resetComposer() {
  D.panel.classList.add('hidden');
  D.draft.value = ''; D.draftTr.value = ''; D.instruction.value = '';
  autoGrow(D.instruction);
}
function showComposePanel(draft) {
  D.panel.classList.remove('hidden');
  D.draft.value = draft || '';
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

// Türkçe talimattan müşteri dilinde taslak üret, sonra kontrol için Türkçeye geri çevir.
async function generateFrom(instructionTr) {
  generating = true;
  setBusy(true, 'AI cevabı üretiliyor…');
  try {
    const conv = await http.post(api(`/conversations/${encodeURIComponent(activeId)}/compose`), { instruction: instructionTr });
    active = conv;
    const i = conversations.findIndex((c) => c.chatId === activeId);
    if (i >= 0) conversations[i] = conv;
    renderMessages(conv);
    showComposePanel(conv.draft);
    setText(D.langBadge, 'AI ✨');
    // gönderilecek metnin Türkçe kontrolü
    await backTranslateDraft();
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
  try {
    D.draftTr.value = await toTurkish(text);
  } catch {
    D.draftTr.value = '(çeviri alınamadı)';
  }
}

function setBusy(on, msg) {
  D.generate.disabled = on;
  D.regen.disabled = on;
  D.send.disabled = on;
  removeThinking();
  if (on) {
    const t = document.createElement('div');
    t.className = 'thinking'; t.id = 'wa-thinking';
    t.innerHTML = `<div class="spinner"></div><span>${msg || 'İşleniyor…'}</span>`;
    D.messages.appendChild(t);
    D.messages.scrollTop = D.messages.scrollHeight;
  }
}
function removeThinking() { const t = $('wa-thinking'); if (t) t.remove(); }

async function persistDraft() {
  if (!activeId) return;
  try { await http.put(api(`/conversations/${encodeURIComponent(activeId)}/draft`), { draft: D.draft.value }); } catch {}
}

async function onSend() {
  if (!activeId) return;
  const text = D.draft.value.trim();
  if (!text) { toast('Mesaj boş'); return; }
  D.send.disabled = true;
  try {
    await http.post(api(`/conversations/${encodeURIComponent(activeId)}/send`), { text });
    resetComposer();
    const conv = await http.get(api(`/conversations/${encodeURIComponent(activeId)}`));
    active = conv;
    const i = conversations.findIndex((c) => c.chatId === activeId);
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

// Bağlı numarayı değiştir (logout → yeni QR admin panelde taranır).
export async function logoutNumber() {
  try {
    await http.post(api('/logout'), {});
    toast('Numara çıkarıldı. Yeni QR için admin panelini kullan.');
    conversations = []; renderList();
  } catch (e) { toast('Hata: ' + e.message); }
}
