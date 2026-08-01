// Mail ekranı: Gmail gelen kutusu, mesaj detayı + Türkçe çeviri,
// AI cevap + Türkçe kontrol/regenerate, gönderim, yeni mail bildirimi.
import { API_BASE } from './config.js';
import { http } from './http.js';
import { toTurkish } from './translate.js';
import { $, toast, initials, fmtListTime, setText } from './ui.js';
import { notify } from './notify.js';

const gm = (p) => `${API_BASE}/api/gmail${p}`;

// Kleinanzeigen mesajları kendi sekmesinde sohbet olarak gösteriliyor →
// gelen kutusundan çıkar. (kleinanzeigen.de'den gelen diğer bildirimler kalır.)
const INBOX_QUERY = encodeURIComponent('-from:mail.kleinanzeigen.de');
const ae = (p) => `${API_BASE}/api/aiemail${p}`;

let connected = false;
let messages = [];
let current = null;          // açık mail (GmailMessageDto)
let seeded = false;
const notified = new Set();  // bildirilen mail id'leri
let onOpenDetail = () => {};
let appActive = () => true;
let generating = false;

let D = {};
export function mount({ isForeground, showDetail }) {
  appActive = isForeground || appActive;
  onOpenDetail = showDetail || onOpenDetail;
  D = {
    list: $('mail-list'), conn: $('mail-conn'), connect: $('mail-connect'),
    subject: $('mail-subject'), orig: $('mail-orig'), translation: $('mail-translation'),
    peerName: $('mail-peer-name'), peerSub: $('mail-peer-sub'),
    instruction: $('mail-instruction'), generate: $('mail-generate'),
    panel: $('mail-compose-panel'), draft: $('mail-draft'), draftTr: $('mail-draft-tr'),
    regen: $('mail-regen'), send: $('mail-send'), langBadge: $('mail-lang-badge'),
    tabBadge: $('mail-tabbadge'), scroll: $('mail-body-scroll'),
  };

  $('mail-refresh').addEventListener('click', () => loadInbox(true));
  $('mail-connect-btn').addEventListener('click', connectGmail);
  D.generate.addEventListener('click', onGenerate);
  D.regen.addEventListener('click', onRegenerate);
  D.send.addEventListener('click', onSend);
}

// Yoklama zamanlayıcısını app.js yönetir.
export function activate() {
  refreshStatus().then(() => { if (connected) loadInbox(false); });
}

// ─────────────────────────── Durum ───────────────────────────
async function refreshStatus() {
  try {
    const s = await http.get(gm('/status'));
    connected = !!s.connected;
    D.conn.className = 'conn-dot ' + (connected ? 'ok' : 'err');
    D.conn.title = connected ? `Gmail: ${s.email || 'bağlı'}` : 'Gmail bağlı değil';
    D.connect.classList.toggle('hidden', connected);
    D.list.classList.toggle('hidden', !connected);
  } catch {
    connected = false;
    D.conn.className = 'conn-dot err';
  }
}

async function connectGmail() {
  try {
    const { url } = await http.get(gm('/auth-url'));
    window.open(url, '_system');
    toast('Tarayıcıda bağlan, dönünce Yenile’ye bas', 4200);
  } catch (e) {
    toast('Bağlantı adresi alınamadı: ' + e.message);
  }
}

// ─────────────────────────── Gelen kutusu ───────────────────────────
export async function poll() {
  if (!connected) { await refreshStatus(); if (!connected) return; }
  try {
    const items = await http.get(gm(`/messages?max=25&q=${INBOX_QUERY}`));
    ingest(items);
  } catch { /* sessiz */ }
}

async function loadInbox(manual) {
  try {
    const items = await http.get(gm(`/messages?max=25&q=${INBOX_QUERY}`));
    ingest(items);
    if (manual) toast('Güncellendi');
  } catch (e) {
    D.list.innerHTML = `<div class="list-empty"><p>Yüklenemedi.<br><small>${e.message}</small></p></div>`;
    if (manual) toast('Yenilenemedi');
  }
}

function ingest(items) {
  if (!Array.isArray(items)) return;
  messages = items;

  for (const m of items) {
    if (!m.unread) continue;
    if (seeded && !notified.has(m.id)) {
      if (!(appActive() && current?.id === m.id)) {
        notify(`📧 ${m.fromName || m.fromEmail}`, m.subject || m.snippet, { tab: 'mail', mailId: m.id });
      }
    }
    notified.add(m.id);
  }
  seeded = true;
  renderList();
}

function unreadCount() { return messages.filter((m) => m.unread).length; }

function renderList() {
  const n = unreadCount();
  if (n > 0) { D.tabBadge.textContent = n > 99 ? '99+' : n; D.tabBadge.classList.remove('hidden'); }
  else D.tabBadge.classList.add('hidden');

  if (!messages.length) {
    D.list.innerHTML = '<div class="list-empty"><p>Gelen kutusu boş.</p></div>';
    return;
  }
  D.list.innerHTML = '';
  for (const m of messages) {
    const item = document.createElement('div');
    item.className = 'list-item';
    item.innerHTML = `
      <div class="peer-avatar"></div>
      <div class="li-body">
        <div class="li-top">
          <span class="li-name ${m.unread ? 'unread' : ''}"></span>
          <span class="li-time ${m.unread ? 'unread' : ''}">${fmtListTime(Date.parse(m.date) || 0)}</span>
        </div>
        <div class="li-bottom">
          <span class="li-preview ${m.unread ? 'unread' : ''}"></span>
          ${m.unread ? '<span class="li-badge">●</span>' : ''}
        </div>
      </div>`;
    item.querySelector('.peer-avatar').textContent = initials(m.fromName || m.fromEmail);
    item.querySelector('.li-name').textContent = m.fromName || m.fromEmail;
    item.querySelector('.li-preview').textContent = (m.subject || '') + ' — ' + (m.snippet || '');
    item.addEventListener('click', () => openMessage(m.id));
    D.list.appendChild(item);
  }
}

// ─────────────────────────── Detay ───────────────────────────
export async function openMessage(id) {
  resetComposer();
  onOpenDetail();
  setText(D.subject, 'Yükleniyor…');
  D.orig.textContent = '';
  D.translation.innerHTML = '<em>çevriliyor…</em>';

  try {
    const msg = await http.get(gm(`/messages/${encodeURIComponent(id)}`));
    current = msg;
    setText(D.peerName, msg.fromName || msg.fromEmail);
    setText(D.peerSub, msg.fromEmail);
    setText(D.subject, msg.subject || '(konu yok)');
    D.orig.textContent = msg.body || '';
    D.scroll.scrollTop = 0;

    http.post(gm(`/messages/${encodeURIComponent(id)}/read`), {}).catch(() => {});
    const local = messages.find((m) => m.id === id);
    if (local) { local.unread = false; renderList(); }

    // Gelen mailin Türkçe çevirisi
    try {
      const tr = await toTurkish(msg.body || '');
      D.translation.textContent = tr || '(çeviri yok)';
    } catch {
      D.translation.textContent = '(çeviri alınamadı)';
    }
  } catch (e) {
    setText(D.subject, 'Açılamadı');
    D.translation.textContent = e.message;
  }
}

// ─────────────────────── Cevap oluştur + kontrol ───────────────────────
function resetComposer() {
  D.panel.classList.add('hidden');
  D.draft.value = ''; D.draftTr.value = ''; D.instruction.value = '';
  setText(D.langBadge, '');
}

async function onGenerate() {
  const instruction = D.instruction.value.trim();
  if (!instruction) { toast('Önce Türkçe talimat yaz'); return; }
  await generateFrom(instruction);
}
async function onRegenerate() {
  const tr = D.draftTr.value.trim();
  if (!tr) { toast('Türkçe kısım boş'); return; }
  await generateFrom(tr);
}

async function generateFrom(instructionTr) {
  if (!current || generating) return;
  generating = true;
  D.generate.disabled = D.regen.disabled = D.send.disabled = true;
  const origLabel = D.generate.textContent;
  D.generate.textContent = '✨ Üretiliyor…';
  try {
    const r = await http.post(ae('/generate-reply'), {
      body: current.body || '',
      instruction: instructionTr,
      fromName: current.fromName,
      fromEmail: current.fromEmail,
      subject: current.subject,
      tone: 'formal',
    });
    D.panel.classList.remove('hidden');
    D.draft.value = r.replyBody || '';
    current._replySubject = r.replySubject || ('Re: ' + (current.subject || ''));
    setText(D.langBadge, r.detectedLanguageName || r.detectedLanguage || '');
    await backTranslateDraft();
  } catch (e) {
    toast('Üretilemedi: ' + e.message);
  } finally {
    generating = false;
    D.generate.disabled = D.regen.disabled = D.send.disabled = false;
    D.generate.textContent = origLabel;
  }
}

async function backTranslateDraft() {
  const text = D.draft.value.trim();
  if (!text) { D.draftTr.value = ''; return; }
  D.draftTr.value = '⏳ çevriliyor…';
  try { D.draftTr.value = await toTurkish(text); }
  catch { D.draftTr.value = '(çeviri alınamadı)'; }
}

async function onSend() {
  if (!current) return;
  const body = D.draft.value.trim();
  if (!body) { toast('Mesaj boş'); return; }
  D.send.disabled = true;
  try {
    await http.post(gm('/send'), {
      to: current.fromEmail,
      subject: current._replySubject || ('Re: ' + (current.subject || '')),
      body,
      threadId: current.threadId,
      inReplyTo: current.messageIdHeader,
      references: current.references,
    });
    resetComposer();
    toast('Mail gönderildi ✓');
  } catch (e) {
    toast('Gönderilemedi: ' + e.message);
  } finally {
    D.send.disabled = false;
  }
}
