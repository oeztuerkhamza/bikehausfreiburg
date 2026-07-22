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

let client = null;
let intentionalLogout = false;

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

  // Gelen müşteri mesajları
  client.on('message', async (msg) => {
    // Grup mesajlarını ve durum güncellemelerini atla
    if (msg.from === 'status@broadcast' || msg.from.endsWith('@g.us')) return;
    if (msg.type !== 'chat') return; // şimdilik sadece metin

    let name = msg.from;
    try {
      const contact = await msg.getContact();
      name = contact.pushname || contact.name || contact.number || msg.from;
    } catch {}

    events.emit('message', {
      chatId: msg.from,
      name,
      id: msg.id?._serialized || String(Date.now()),
      body: msg.body,
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

// Mevcut (bireysel) sohbetleri son mesajlarıyla birlikte getir.
export async function getRecentChats(limit = 20, perChatMessages = 12) {
  if (!client) return [];
  const chats = await client.getChats();
  const individual = chats.filter((c) => !c.isGroup).slice(0, limit);
  const result = [];
  for (const chat of individual) {
    const chatId = chat.id?._serialized;
    if (!chatId) continue;
    let raw = [];
    try {
      raw = await chat.fetchMessages({ limit: perChatMessages });
    } catch (err) {
      console.error('[whatsapp] fetchMessages hata:', chatId, err.message);
    }
    let name = chat.name || chatId;
    try {
      const contact = await chat.getContact();
      name =
        contact.pushname ||
        contact.name ||
        chat.name ||
        contact.number ||
        chatId;
    } catch {}
    const messages = raw
      .filter((m) => m.type === 'chat' && m.body)
      .map((m) => ({
        id: m.id?._serialized || String(m.timestamp),
        direction: m.fromMe ? 'out' : 'in',
        body: m.body,
        ts: (m.timestamp || 0) * 1000,
      }));
    result.push({ chatId, name, messages });
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
