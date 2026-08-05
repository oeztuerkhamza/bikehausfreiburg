// Base yol: kökte ("/") veya admin panel altında ("/wa/") çalışır.
const BASE = location.pathname.endsWith('/')
  ? location.pathname
  : location.pathname.replace(/[^/]*$/, '');
// JWT: iframe ile gömüldüğünde URL hash'inden gelir (#token=...),
// yoksa aynı-origin localStorage'dan.
const _hashTok = location.hash.match(/token=([^&]+)/);
const TOKEN = _hashTok
  ? decodeURIComponent(_hashTok[1])
  : localStorage.getItem('token') || '';

// Tüm "/..." isteklerini BASE'e taşı ve Authorization ekle.
const _fetch = window.fetch.bind(window);
window.fetch = (url, opts = {}) => {
  if (typeof url === 'string' && url.startsWith('/')) {
    url = BASE + url.slice(1);
    if (TOKEN) {
      opts.headers = { ...(opts.headers || {}), Authorization: 'Bearer ' + TOKEN };
    }
  }
  return _fetch(url, opts);
};

const socket = io({ path: BASE + 'socket.io', auth: { token: TOKEN } });
let conversations = [];
let activeId = null;
let draftDirty = false;

const $ = (id) => document.getElementById(id);

// ---- Durum / QR ----
function renderStatus(s) {
  const el = $('status');
  const map = {
    starting: ['Başlatılıyor…', ''],
    qr: ['QR bekleniyor', 'qr'],
    authenticated: ['Doğrulanıyor…', ''],
    ready: ['Bağlı ✓ ' + (s.me || ''), 'ready'],
    disconnected: ['Bağlantı koptu', ''],
    loggingout: ['Çıkış yapılıyor…', ''],
  };
  const [txt, cls] = map[s.status] || [s.status, ''];
  el.textContent = txt;
  el.className = 'status ' + cls;

  // Çıkış / QR Sıfırlama butonu sadece çıkış yapılırken gizlenir.
  const lo = $('btn-logout');
  if (lo) lo.classList.toggle('hidden', s.status === 'loggingout');

  const modal = $('qr-modal');
  if (s.status === 'qr' && s.qrDataUrl) {
    $('qr-img').src = s.qrDataUrl;
    modal.classList.remove('hidden');
  } else {
    modal.classList.add('hidden');
  }
}

socket.on('status', renderStatus);
socket.on('conversation', (conv) => {
  upsertConversation(conv);
  if (conv.chatId === activeId) renderThread(conv, { keepDraftIfDirty: true });
  renderList();
});
socket.on('drafting', ({ chatId }) => {
  if (chatId === activeId) $('draft-badge').textContent = 'üretiliyor…';
});
socket.on('draft-error', ({ chatId, error }) => {
  if (chatId === activeId) $('draft-badge').textContent = 'AI hatası: ' + error;
});
socket.on('history-unavailable', () => {
  const list = $('conv-list');
  if (!document.getElementById('hist-note')) {
    const li = document.createElement('li');
    li.id = 'hist-note';
    li.className = 'hist-note';
    li.textContent =
      'ℹ️ Eski sohbetler yüklenemedi (WhatsApp Web sınırı). Yeni gelen mesajlar burada görünecek.';
    list.appendChild(li);
  }
});

// ---- Veri ----
function upsertConversation(conv) {
  const i = conversations.findIndex((c) => c.chatId === conv.chatId);
  if (i >= 0) conversations[i] = conv;
  else conversations.push(conv);
  conversations.sort((a, b) => b.updatedAt - a.updatedAt);
}

async function loadAll() {
  const [stateRes, convRes] = await Promise.all([
    fetch('/api/state').then((r) => r.json()),
    fetch('/api/conversations').then((r) => r.json()),
  ]);
  renderStatus(stateRes.wa);
  conversations = convRes;
  renderList();
}

// ---- Konuşma listesi ----
function renderList() {
  const ul = $('conv-list');
  ul.innerHTML = '';
  for (const c of conversations) {
    const li = document.createElement('li');
    li.className = 'conv' + (c.chatId === activeId ? ' active' : '');
    const last = c.messages[c.messages.length - 1];
    const preview = last
      ? (last.direction === 'out' ? 'Sen: ' : '') + last.body
      : '';
    li.innerHTML = `
      <div class="row">
        <span class="name"></span>
        ${c.unread ? `<span class="badge">${c.unread}</span>` : ''}
      </div>
      <span class="preview"></span>`;
    li.querySelector('.name').textContent = c.name;
    li.querySelector('.preview').textContent = preview;
    li.onclick = () => openConversation(c.chatId);
    ul.appendChild(li);
  }
}

async function openConversation(chatId) {
  activeId = chatId;
  draftDirty = false;
  const conv = await fetch(
    `/api/conversations/${encodeURIComponent(chatId)}`,
  ).then((r) => r.json());
  upsertConversation({ ...conv, unread: 0 });
  renderList();
  $('empty').classList.add('hidden');
  $('thread').classList.remove('hidden');
  renderThread(conv);
  translateConversation(chatId);
}

// Gelen mesajları Türkçeye çevirt (çevrilmemiş olanları), sonra tazele
async function translateConversation(chatId) {
  const conv = conversations.find((c) => c.chatId === chatId);
  const needs =
    conv &&
    conv.messages.some((m) => m.direction === 'in' && !m.translation && m.body);
  if (!needs) return;
  if (chatId === activeId) $('draft-badge').textContent = 'çevriliyor…';
  try {
    const res = await fetch(
      `/api/conversations/${encodeURIComponent(chatId)}/translate`,
      { method: 'POST' },
    );
    if (!res.ok) {
      if (chatId === activeId) $('draft-badge').textContent = '';
      return;
    }
    const updated = await res.json();
    upsertConversation({
      ...updated,
      unread: chatId === activeId ? 0 : updated.unread,
    });
    if (chatId === activeId) {
      $('draft-badge').textContent = '';
      renderThread(updated, { keepDraftIfDirty: true });
    }
  } catch {
    if (chatId === activeId) $('draft-badge').textContent = '';
  }
}

// Fotoğraf uçları JWT ister; <img src> başlık gönderemediği için görseli
// fetch ile (üstteki sarmalayıcı Authorization ekliyor) alıp blob URL veriyoruz.
const photoUrls = new Map();
function loadPhoto(img, file) {
  const cached = photoUrls.get(file);
  if (cached) {
    img.src = cached;
    return;
  }
  fetch(`/api/media/${encodeURIComponent(file)}`)
    .then((r) => (r.ok ? r.blob() : Promise.reject(new Error(String(r.status)))))
    .then((blob) => {
      const url = URL.createObjectURL(blob);
      photoUrls.set(file, url);
      img.src = url;
    })
    .catch(() => img.remove());
}

function fmtTime(ts) {
  return new Date(ts).toLocaleTimeString('tr-TR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function renderThread(conv, opts = {}) {
  $('chat-head').innerHTML =
    `${conv.name} <small>${conv.chatId.replace('@c.us', '')}</small>`;
  const box = $('messages');
  box.innerHTML = '';
  for (const m of conv.messages) {
    const div = document.createElement('div');
    div.className = 'msg ' + m.direction;
    if (m.photo) {
      const img = document.createElement('img');
      img.className = 'photo';
      img.alt = 'Fotoğraf';
      img.loading = 'lazy';
      img.onclick = () => {
        if (img.src) window.open(img.src, '_blank');
      };
      div.appendChild(img);
      loadPhoto(img, m.photo);
    }
    // Sadece fotoğraftan ibaret mesajda '📷 Foto' etiketini tekrar yazma.
    if (!(m.photo && m.mediaOnly)) div.appendChild(document.createTextNode(m.body));
    if (m.direction === 'in' && m.translation) {
      const tr = document.createElement('div');
      tr.className = 'translation';
      tr.textContent = '🇹🇷 ' + m.translation;
      div.appendChild(tr);
    }
    const time = document.createElement('span');
    time.className = 'time';
    time.textContent = fmtTime(m.ts);
    div.appendChild(time);
    box.appendChild(div);
  }
  box.scrollTop = box.scrollHeight;

  if (!(opts.keepDraftIfDirty && draftDirty)) {
    $('draft').value = conv.draft || '';
    $('draft-badge').textContent = '';
  }
}

// ---- Aksiyonlar ----
// ---- Ayarlar ----
async function openSettings() {
  const s = await fetch('/api/settings').then((r) => r.json());
  $('set-model').value = s.model || 'claude-opus-4-8';
  $('set-key').value = '';
  $('key-status').textContent = s.hasKey
    ? '✓ Kayıtlı anahtar var (' +
      s.keyMasked +
      '). Değiştirmek için yenisini gir.'
    : '⚠ Henüz anahtar yok — AI taslağı kapalı.';
  $('key-status').style.color = s.hasKey ? 'var(--green)' : '#f0b8b8';
  $('settings-modal').classList.remove('hidden');
}
$('btn-settings').onclick = openSettings;
$('set-cancel').onclick = () => $('settings-modal').classList.add('hidden');
$('settings-modal').addEventListener('click', (e) => {
  if (e.target.id === 'settings-modal')
    $('settings-modal').classList.add('hidden');
});
$('set-save').onclick = async () => {
  const btn = $('set-save');
  btn.disabled = true;
  const body = { model: $('set-model').value };
  const key = $('set-key').value.trim();
  if (key) body.apiKey = key;
  try {
    const res = await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const cfg = await res.json();
    if (!res.ok) {
      alert('Kaydedilemedi: ' + (cfg.error || res.status));
      return;
    }
    $('settings-modal').classList.add('hidden');
    // Durum rozetini tazele
    fetch('/api/state')
      .then((r) => r.json())
      .then((st) => renderStatus(st.wa));
    alert(
      cfg.hasKey
        ? 'Kaydedildi ✓ AI taslağı artık açık.'
        : 'Model kaydedildi. (Anahtar hâlâ yok.)',
    );
  } finally {
    btn.disabled = false;
  }
};

async function doLogout() {
  const ok = confirm(
    'WhatsApp oturumunu kapatıp yeni bir QR kod almak istediğinize emin misiniz?\n\n' +
      'Mevcut bağlantı sıfırlanacak ve taramanız için yeni bir QR kod oluşturulacaktır.',
  );
  if (!ok) return;

  const btnLo = $('btn-logout');
  const btnQr = $('btn-qr-reset');
  if (btnLo) btnLo.disabled = true;
  if (btnQr) btnQr.disabled = true;

  $('status').textContent = 'Oturum kapatılıyor, yeni QR hazırlanıyor…';
  $('status').className = 'status';

  try {
    await fetch('/api/logout', { method: 'POST' });
  } catch (err) {
    console.error('Logout hatası:', err);
  }

  conversations = [];
  activeId = null;
  renderList();
  $('thread').classList.add('hidden');
  $('empty').classList.remove('hidden');

  if (btnLo) btnLo.disabled = false;
  if (btnQr) btnQr.disabled = false;
}

if ($('btn-logout')) $('btn-logout').onclick = doLogout;
if ($('btn-qr-reset')) $('btn-qr-reset').onclick = doLogout;

$('btn-sync').onclick = async () => {
  const btn = $('btn-sync');
  btn.disabled = true;
  const orig = btn.textContent;
  btn.textContent = 'yükleniyor…';
  try {
    const res = await fetch('/api/sync', { method: 'POST' });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) alert('Yüklenemedi: ' + (data.error || res.status));
    else if (!data.count) alert('Hiç bireysel sohbet bulunamadı.');
  } finally {
    btn.disabled = false;
    btn.textContent = orig;
  }
};

$('draft').addEventListener('input', () => {
  draftDirty = true;
});

$('draft').addEventListener('blur', () => {
  if (activeId && draftDirty) {
    fetch(`/api/conversations/${encodeURIComponent(activeId)}/draft`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ draft: $('draft').value }),
    });
  }
});

$('btn-send').onclick = async () => {
  if (!activeId) return;
  const text = $('draft').value.trim();
  if (!text) return;
  const btn = $('btn-send');
  btn.disabled = true;
  const res = await fetch(
    `/api/conversations/${encodeURIComponent(activeId)}/send`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    },
  );
  btn.disabled = false;
  if (!res.ok) {
    const e = await res.json().catch(() => ({}));
    alert('Gönderilemedi: ' + (e.error || res.status));
    return;
  }
  draftDirty = false;
  $('draft').value = '';
  const conv = await fetch(
    `/api/conversations/${encodeURIComponent(activeId)}`,
  ).then((r) => r.json());
  renderThread(conv);
};

// Ctrl/Cmd + Enter ile gönder
$('draft').addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    e.preventDefault();
    $('btn-send').click();
  }
});

// ---- Cevap oluştur ----
$('btn-compose').onclick = async () => {
  if (!activeId) return;
  const instruction = $('instruction').value.trim();
  if (!instruction) {
    alert('Lütfen önce Türkçe talimat girin.');
    return;
  }
  const btn = $('btn-compose');
  btn.disabled = true;
  $('draft-badge').textContent = 'üretiliyor…';
  try {
    const res = await fetch(
      `/api/conversations/${encodeURIComponent(activeId)}/compose`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ instruction }),
      },
    );
    if (!res.ok) {
      const e = await res.json().catch(() => ({}));
      $('draft-badge').textContent = 'hata: ' + (e.error || res.status);
      return;
    }
    const conv = await res.json();
    draftDirty = false;
    renderThread(conv);
  } catch (err) {
    $('draft-badge').textContent = 'hata: ' + (err.message || 'bilinmeyen');
  } finally {
    btn.disabled = false;
  }
};

loadAll();
