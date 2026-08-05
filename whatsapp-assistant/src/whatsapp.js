// whatsapp-web.js sarmalayıcısı. Olayları EventEmitter üzerinden yayar.
import pkg from 'whatsapp-web.js';
import qrcodeTerminal from 'qrcode-terminal';
import QRCode from 'qrcode';
import { EventEmitter } from 'node:events';
import fs from 'node:fs';
import path from 'node:path';

const { Client, LocalAuth } = pkg;

export const events = new EventEmitter();
export const state = { status: 'starting', qrDataUrl: null, me: null };

const DATA_PATH = process.env.WWEBJS_DATA_PATH || '.wwebjs_auth';

// Senkronizasyon sınırları (env ile ayarlanabilir).
const CHAT_LIMIT = Number(process.env.WA_SYNC_CHAT_LIMIT || 50);
const MESSAGE_LIMIT = Number(process.env.WA_SYNC_MESSAGE_LIMIT || 50);

let client = null;
let intentionalLogout = false;

// Metin dışı mesajlar için akışta görünecek kısa etiketler. Böylece telefonda
// gönderilen/gelen foto, ses vb. sohbette boşluk bırakmaz.
const MEDIA_LABELS = {
  image: '📷 Foto',
  video: '🎥 Video',
  audio: '🎙️ Sesli mesaj',
  ptt: '🎙️ Sesli mesaj',
  document: '📄 Belge',
  sticker: '🏷️ Çıkartma',
  location: '📍 Konum',
  vcard: '👤 Kişi kartı',
  multi_vcard: '👤 Kişi kartı',
};

// Mesaj gövdesi + bunun sadece bir ek mi (çeviriye gerek yok) olduğu.
function bodyOf(msg) {
  const caption = (msg.body || '').trim();
  if (msg.type === 'chat') return { body: caption, mediaOnly: false };
  const label = MEDIA_LABELS[msg.type] || '📎 Ek';
  return caption
    ? { body: `${label} — ${caption}`, mediaOnly: false }
    : { body: label, mediaOnly: true };
}

// Grup, durum ve yayın sohbetlerini dışarıda bırak.
function isSyncableChatId(chatId) {
  return (
    !!chatId &&
    chatId !== 'status@broadcast' &&
    !chatId.endsWith('@g.us') &&
    !chatId.endsWith('@broadcast')
  );
}

// Sohbetin karşı tarafının adı. Giden mesajlarda msg.getContact() bizi
// döndürdüğü için ismi her zaman sohbet üzerinden çözüyoruz.
async function resolveName(chat, chatId) {
  try {
    const contact = await chat.getContact();
    return contact.pushname || contact.name || chat.name || contact.number || chatId;
  } catch {
    return chat?.name || chatId;
  }
}

// --- Takılma bekçisi ---
// client.initialize() bazen sessizce asılı kalıyor (ne hata ne olay üretir; konteyner
// "running" göründüğü için Docker restart devreye girmez). Süre dolduğunda hâlâ
// QR/Hazır olamadıysak süreci bitiririz; Docker (canlı) / watchdog.ps1 (yerel) temiz başlatır.
const BOOT_TIMEOUT_MS = Number(process.env.WA_BOOT_TIMEOUT_MS || 5 * 60 * 1000);
let stuckTimer = null;
function armStuckWatchdog(label) {
  clearTimeout(stuckTimer);
  stuckTimer = setTimeout(() => {
    if (state.status !== 'ready' && state.status !== 'qr') {
      console.error(
        `[watchdog] ${label}: ${Math.round(BOOT_TIMEOUT_MS / 60000)} dk içinde QR/Hazır olamadı (durum: ${state.status}) — temiz başlangıç için süreç kapatılıyor.`,
      );
      process.exit(1);
    }
  }, BOOT_TIMEOUT_MS);
  if (stuckTimer.unref) stuckTimer.unref();
}

function cleanStaleLocks() {
  try {
    if (!fs.existsSync(DATA_PATH)) return;
    for (const entry of fs.readdirSync(DATA_PATH, { withFileTypes: true })) {
      if (!entry.isDirectory() || !entry.name.startsWith('session')) continue;
      const dir = path.join(DATA_PATH, entry.name);
      for (const lock of ['SingletonLock', 'SingletonCookie', 'SingletonSocket']) {
        const p = path.join(dir, lock);
        try {
          if (fs.existsSync(p) || fs.lstatSync(p)) {
            fs.rmSync(p, { force: true });
            console.log('[whatsapp] bayat kilit silindi:', p);
          }
        } catch {}
      }
    }
  } catch (err) {
    console.error('[whatsapp] kilit temizleme hatası:', err?.message);
  }
}

function createClient() {
  client = new Client({
    // Allow overriding the LocalAuth data path via env so parallel runs don't conflict.
    authStrategy: new LocalAuth({ dataPath: DATA_PATH }),
    puppeteer: {
      headless: true,
      // Konteynerde sistem Chromium'u; yerelde puppeteer'ın kendi indirdiği.
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--no-first-run',
        '--no-default-browser-check',
        '--disable-extensions',
        '--disable-background-networking',
      ],
    },
  });

  client.on('qr', async (qr) => {
    state.status = 'qr';
    qrcodeTerminal.generate(qr, { small: true });
    console.log('[whatsapp] QR kodu tarayın (yukarıdaki kod veya web arayüzü).');
    try {
      state.qrDataUrl = await QRCode.toDataURL(qr);
    } catch {
      state.qrDataUrl = null;
    }
    events.emit('status', state);
  });

  client.on('authenticated', () => {
    state.status = 'authenticated';
    events.emit('status', state);
    // QR tarandı ama 'ready' hiç gelmezse de takılmış say.
    armStuckWatchdog('kimlik doğrulama sonrası');
  });

  client.on('ready', () => {
    state.status = 'ready';
    state.qrDataUrl = null;
    state.me = client.info?.wid?.user || null;
    console.log(`[whatsapp] Hazır. Bağlı numara: ${state.me}`);
    events.emit('status', state);
    clearTimeout(stuckTimer);
  });

  client.on('disconnected', (reason) => {
    state.status = 'disconnected';
    console.log('[whatsapp] Bağlantı koptu:', reason);
    events.emit('status', state);
    // İstenmeyen kopmada süreci bitir → dışarıdaki denetleyici temiz oturumla yeniden başlatır.
    if (!intentionalLogout) {
      console.error('[watchdog] Beklenmeyen kopma — 15 sn içinde süreç yeniden başlatılacak.');
      const t = setTimeout(() => process.exit(1), 15000);
      if (t.unref) t.unref();
    }
  });

  // Tüm yeni mesajlar — gelenler VE bizim gönderdiklerimiz.
  // 'message' olayı sadece gelenleri verir; telefondaki WhatsApp Business'tan
  // yazılan cevaplar 'message_create' ile gelir. Bu yüzden ikincisini dinliyoruz.
  client.on('message_create', async (msg) => {
    const chatId = msg.fromMe ? msg.to : msg.from;
    if (!isSyncableChatId(chatId)) return;

    const { body, mediaOnly } = bodyOf(msg);
    if (!body) return;

    let name = chatId;
    try {
      name = await resolveName(await msg.getChat(), chatId);
    } catch {}

    events.emit('message', {
      chatId,
      name,
      id: msg.id?._serialized || String(Date.now()),
      direction: msg.fromMe ? 'out' : 'in',
      body,
      mediaOnly,
      ts: (msg.timestamp || Math.floor(Date.now() / 1000)) * 1000,
    });
  });

  return client;
}

export async function sendMessage(chatId, text) {
  if (!client) throw new Error('WhatsApp istemcisi henüz hazır değil.');
  return client.sendMessage(chatId, text);
}

// Bağlı numarayı çıkar (Abmeldung) → oturumu temizle → yeni QR üret.
export async function logout() {
  intentionalLogout = true;
  clearTimeout(stuckTimer);
  state.status = 'loggingout';
  state.qrDataUrl = null;
  state.me = null;
  events.emit('status', state);

  if (client) {
    try {
      if (client.info) await client.logout();
    } catch (err) {
      console.error('[whatsapp] logout hatası:', err?.message);
    }
    try {
      await client.destroy();
    } catch (err) {
      console.error('[whatsapp] destroy hatası:', err?.message);
    }
    client = null;
  }

  // Puppeteer işlemlerinin tamamen kapanması için kısa bir süre bekle
  await new Promise((resolve) => setTimeout(resolve, 800));

  // Oturum klasörlerini tamamen sil (aksi halde aynı numarayla otomatik girer).
  try {
    if (fs.existsSync(DATA_PATH)) {
      fs.rmSync(DATA_PATH, { recursive: true, force: true });
    }
    console.log('[whatsapp] oturum verileri silindi.');
  } catch (err) {
    console.error('[whatsapp] oturum silme hatası:', err?.message);
  }

  starting = false;
  intentionalLogout = false;
  console.log('[whatsapp] çıkış yapıldı, yeniden başlatılıyor ve yeni QR bekleniyor...');
  start();
}

/**
 * Mevcut (bireysel) sohbetleri son mesajlarıyla birlikte getir.
 * @param {object} [opts]
 * @param {number} [opts.limit]            En fazla kaç sohbet.
 * @param {number} [opts.perChatMessages]  Sohbet başına kaç mesaj.
 * @param {(chatId: string, lastTs: number) => boolean} [opts.shouldFetchMessages]
 *        false dönerse o sohbetin mesajları çekilmez (sadece ad/okunmadı tazelenir).
 *        Periyodik senkronda değişmemiş sohbetleri atlamak için.
 */
export async function getRecentChats(opts = {}) {
  if (!client) return [];
  const limit = opts.limit ?? CHAT_LIMIT;
  const perChatMessages = opts.perChatMessages ?? MESSAGE_LIMIT;
  const shouldFetchMessages = opts.shouldFetchMessages;

  const chats = await client.getChats();
  const individual = chats
    .filter((c) => !c.isGroup && isSyncableChatId(c.id?._serialized))
    .slice(0, limit);

  const result = [];
  for (const chat of individual) {
    const chatId = chat.id._serialized;
    const name = await resolveName(chat, chatId);
    const unread = chat.unreadCount ?? 0;
    const lastTs = (chat.lastMessage?.timestamp || chat.timestamp || 0) * 1000;

    if (shouldFetchMessages && !shouldFetchMessages(chatId, lastTs)) {
      result.push({ chatId, name, unread, messages: [] });
      continue;
    }

    let raw = [];
    try {
      raw = await chat.fetchMessages({ limit: perChatMessages });
    } catch (err) {
      console.error('[whatsapp] fetchMessages hata:', chatId, err.message);
    }
    const messages = raw
      .map((m) => {
        const { body, mediaOnly } = bodyOf(m);
        if (!body) return null;
        const msg = {
          id: m.id?._serialized || String(m.timestamp),
          direction: m.fromMe ? 'out' : 'in',
          body,
          ts: (m.timestamp || 0) * 1000,
        };
        if (mediaOnly) msg.mediaOnly = true;
        return msg;
      })
      .filter(Boolean);
    result.push({ chatId, name, unread, messages });
  }
  return result;
}

let starting = false;
export function start() {
  if (starting) return;
  starting = true;
  state.status = 'starting';
  events.emit('status', state);

  if (!client) {
    createClient();
  }
  cleanStaleLocks();
  console.log('[whatsapp] İstemci başlatılıyor...');
  armStuckWatchdog('başlatma');
  client.initialize().catch((err) => {
    // Chromium başlatma hatası node'u çökertmesin (yoksa restart döngüsü).
    state.status = 'error';
    console.error('[whatsapp] initialize hatası:', err?.message);
    events.emit('status', state);
    // Kilidi temizleyip bir kez daha dene.
    setTimeout(() => {
      cleanStaleLocks();
      console.log('[whatsapp] yeniden deneniyor...');
      if (client) {
        client.initialize().catch((e) =>
          console.error('[whatsapp] yeniden deneme hatası:', e?.message),
        );
      }
    }, 8000);
  });
}
