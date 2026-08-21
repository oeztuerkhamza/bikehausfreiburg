// whatsapp-web.js sarmalayıcısı. Olayları EventEmitter üzerinden yayar.
import pkg from 'whatsapp-web.js';
import qrcodeTerminal from 'qrcode-terminal';
import QRCode from 'qrcode';
import { EventEmitter } from 'node:events';
import fs from 'node:fs';
import path from 'node:path';
import * as media from './media.js';
import { isCaptionText } from './body-text.js';

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
  call_log: '📞 Arama',
  revoked: '🚫 Silinen mesaj',
};

// WhatsApp geçmişinde mesaj olmayan sistem kayıtları da duruyor (şifre anahtarı
// değişimi, şablon bildirimleri, grup olayları). Bunlar akışta '📎 Ek' olarak
// görünüp sohbeti dolduruyordu — hiç gösterilmiyorlar.
const HIDDEN_TYPES = new Set([
  'e2e_notification',
  'notification',
  'notification_template',
  'gp2',
  'broadcast_notification',
  'newsletter_notification',
  'protocol',
  'ciphertext',
  'groups_v4_invite',
  // Albüm sarmalayıcısı: içindeki fotoğraflar zaten ayrı 'image' mesajları
  // olarak geliyor, sarmalayıcı akışta boş bir '📎 Ek' baloncuğu bırakıyordu.
  'album',
]);

// Mesaj gövdesi + bunun sadece bir ek mi (çeviriye gerek yok) olduğu.
// Boş gövde = akışta hiç görünmez.
export function bodyOf(msg) {
  if (HIDDEN_TYPES.has(msg.type)) return { body: '', mediaOnly: false };
  const caption = (msg.body || '').trim();
  if (msg.type === 'chat') return { body: caption, mediaOnly: false };
  const label = MEDIA_LABELS[msg.type] || '📎 Ek';
  // Nur echte Bildunterschriften kommen mit ans Etikett. Bei Fotos steht in
  // `body` sonst der base64-Block des Bildes — der stand als Zeichensalat
  // unter dem Foto im Chat und ging auch noch in die Übersetzung.
  return isCaptionText(caption)
    ? { body: `${label} — ${caption}`, mediaOnly: false }
    : { body: label, mediaOnly: true };
}

// --- Fotoğraflar ---
// Foto mesajlarında etiketin yanı sıra görselin kendisi de indirilir. Büyük
// dosyalar atlanır; geçmiş senkronunda tur başına bir indirme sınırı var,
// yoksa ilk senkron yüzlerce indirmeye dönüşür.
const PHOTO_MAX_BYTES = Number(process.env.WA_PHOTO_MAX_BYTES || 8 * 1024 * 1024);
const PHOTO_SYNC_LIMIT = Number(process.env.WA_PHOTO_SYNC_LIMIT || 50);

// Zeitbudget fürs Nachladen der Nachrichten im Rohmodus (in der Seite).
const RAW_LOAD_BUDGET_MS = Number(process.env.WA_RAW_LOAD_BUDGET_MS || 90_000);

// Alte Fotos liegen auf WhatsApps Servern nicht mehr (mmsDownload: 404). Das
// Telefon kann sie neu hochladen, deshalb sind ein paar Versuche sinnvoll —
// danach ist Schluss, sonst laedt jeder Sync-Lauf ewig dieselben Fehlschlaege.
const PHOTO_MAX_RETRIES = Number(process.env.WA_PHOTO_MAX_RETRIES || 3);
const fehlversuche = new Map();

// hasMedia bazı whatsapp-web.js sürümlerinde foto mesajlarında da false
// geliyor — bu yüzden tür yeterli, indirme denemesi kararı verir.
function isPhoto(msg) {
  return msg.type === 'image';
}

/**
 * Lädt das Bild NUR über die Nachrichten-ID direkt in der Seite herunter —
 * dieselben Aufrufe, die Message.downloadMedia() intern macht, aber ohne die
 * Message-Klasse. Genau deshalb funktioniert es auch bei @lid-Chats, für die
 * whatsapp-web.js kein Modell bauen kann.
 * @returns {Promise<{data:string, mimetype:string}|null>}
 */
async function downloadPhotoById(waClient, msgId) {
  if (!waClient?.pupPage || !msgId) return { grund: 'istemci yok' };
  return waClient.pupPage.evaluate(async (id) => {
    const collections = window.require('WAWebCollections');
    const msg =
      collections.Msg.get(id) ||
      (await collections.Msg.getMessagesById([id]))?.messages?.[0];

    if (!msg) return { grund: 'mesaj bulunamadı' };
    if (!msg.mediaData) return { grund: 'medya verisi yok' };
    // REUPLOADING = Medium ist abgelaufen und wird gerade neu geholt.
    if (msg.mediaData.mediaStage === 'REUPLOADING') return { grund: 'yeniden yükleniyor' };

    if (msg.mediaData.mediaStage !== 'RESOLVED') {
      try {
        await msg.downloadMedia({ downloadEvenIfExpensive: true, rmrReason: 1 });
      } catch (err) {
        return { grund: 'downloadMedia: ' + (err?.message || 'hata') };
      }
    }
    if (msg.mediaData.mediaStage.includes('ERROR') || msg.mediaData.mediaStage === 'FETCHING') {
      return { grund: 'stage ' + msg.mediaData.mediaStage };
    }

    // Der DownloadManager erwartet ein Telemetrie-Objekt; ein Dummy genügt.
    const mockQpl = { addAnnotations() { return this; }, addPoint() { return this; } };
    try {
      const entschluesselt = await window
        .require('WAWebDownloadManager')
        .downloadManager.downloadAndMaybeDecrypt({
          directPath: msg.directPath,
          encFilehash: msg.encFilehash,
          filehash: msg.filehash,
          mediaKey: msg.mediaKey,
          mediaKeyTimestamp: msg.mediaKeyTimestamp,
          type: msg.type,
          signal: new AbortController().signal,
          downloadQpl: mockQpl,
        });
      return {
        data: await window.WWebJS.arrayBufferToBase64Async(entschluesselt),
        mimetype: msg.mimetype,
      };
    } catch (err) {
      return { grund: 'indirme: ' + (err?.message || 'hata') };
    }
  }, msgId);
}

// Fotoğrafı diske alır. Dönen `grund` başarısızlığın nedenidir — logda
// toplanınca "neden inmedi" sorusu tahmine kalmıyor.
async function savePhotoDetail(msgId, waClient = client) {
  if (!msgId) return { file: null, grund: 'kimlik yok' };

  const existing = media.findExisting(msgId);
  if (existing) {
    fehlversuche.delete(msgId);
    return { file: existing, grund: null };
  }

  if ((fehlversuche.get(msgId) || 0) >= PHOTO_MAX_RETRIES) {
    return { file: null, grund: 'vazgeçildi', aufgegeben: true };
  }

  const gescheitert = (grund) => {
    const n = (fehlversuche.get(msgId) || 0) + 1;
    fehlversuche.set(msgId, n);
    return { file: null, grund, aufgegeben: n >= PHOTO_MAX_RETRIES };
  };

  try {
    const downloaded = await downloadPhotoById(waClient, msgId);
    if (!downloaded?.data) return gescheitert(downloaded?.grund || 'veri yok');
    const fileName = media.fileNameFor(msgId, downloaded.mimetype);
    if (!fileName) return gescheitert('dosya adı üretilemedi');
    if (Buffer.byteLength(downloaded.data, 'base64') > PHOTO_MAX_BYTES) {
      // Zu gross bleibt zu gross — kein erneuter Versuch.
      fehlversuche.set(msgId, PHOTO_MAX_RETRIES);
      return { file: null, grund: 'çok büyük', aufgegeben: true };
    }
    const file = media.save(fileName, downloaded.data);
    fehlversuche.delete(msgId);
    return { file, grund: null };
  } catch (err) {
    return gescheitert(err?.message || 'bilinmeyen hata');
  }
}

// İndirilemezse null — mesaj yine de '📷 Foto' etiketiyle akışta kalır.
export async function savePhotoById(msgId, waClient = client) {
  return (await savePhotoDetail(msgId, waClient)).file;
}

async function savePhoto(msg) {
  if (!isPhoto(msg)) return null;
  return savePhotoById(msg.id?._serialized);
}

// Grup, durum ve yayın sohbetlerini dışarıda bırak.
function isSyncableChatId(chatId) {
  return (
    !!chatId &&
    chatId !== 'status@broadcast' &&
    !chatId.endsWith('@g.us') &&
    !chatId.endsWith('@broadcast') &&
    // Kanallar/haber bültenleri müşteri sohbeti değil; ayrıca whatsapp-web.js
    // bunların modelini kuramayıp hata veriyor.
    !chatId.endsWith('@newsletter')
  );
}

// client.getChats() bütün sohbetleri tek bir Promise.all içinde kuruyor:
// listedeki TEK bir bozuk sohbet (kanal, topluluk, tanımadığı yeni bir tür)
// çağrının tamamını düşürüyor ve geçmiş senkronu hiç çalışmıyor. Toplu çağrı
// patlarsa sohbetleri teker teker alıyoruz — bozuk olan atlanır, gerisi gelir.
export async function listChats(waClient = client) {
  if (!waClient) return { chats: [], skipped: 0, mode: 'istemci yok' };
  try {
    const chats = await waClient.getChats();
    noteChatListOutcome('toplu');
    return { chats, skipped: 0, mode: 'toplu' };
  } catch (err) {
    console.error('[whatsapp] getChats topluca başarısız:', err?.message, '— teker teker deneniyor.');
  }

  // Sadece kimlikleri okuyoruz — model kurulmadığı için bu adım bozuk
  // sohbetlerden etkilenmiyor. Erişim yolu kütüphanenin kendi kullandığı yol.
  let ids = [];
  try {
    ids = await waClient.pupPage.evaluate(() => {
      const chatCollection =
        (typeof window.require === 'function' && window.require('WAWebCollections')?.Chat) ||
        window.Store?.Chat;
      if (!chatCollection) return [];
      return chatCollection
        .getModelsArray()
        .map((c) => c?.id?._serialized)
        .filter(Boolean);
    });
  } catch (err) {
    console.error('[whatsapp] sohbet kimlikleri okunamadı:', err?.message);
    noteChatListOutcome('başarısız');
    return { chats: [], skipped: 0, mode: 'başarısız' };
  }

  const chats = [];
  const errors = [];
  let skipped = 0;
  for (const id of ids) {
    if (!isSyncableChatId(id)) continue;
    try {
      const chat = await waClient.getChatById(id);
      if (chat) chats.push(chat);
    } catch (err) {
      skipped++;
      if (errors.length < 3) errors.push(`${id}: ${err?.message}`);
    }
  }
  if (skipped) {
    console.error(`[whatsapp] ${skipped} sohbet atlandı. İlk hatalar: ${errors.join(' | ')}`);
  }
  noteChatListOutcome('teker teker');
  return { chats, skipped, mode: 'teker teker' };
}

/**
 * Son çare: sohbetleri kütüphanenin model katmanına hiç uğramadan doğrudan
 * sayfadaki koleksiyondan okur.
 *
 * Gerekçe: WhatsApp sohbetleri "@lid" kimliğine geçirdi. whatsapp-web.js 1.34.7
 * (en güncel sürüm) bunların modelini kuramıyor — getChatModel her sohbet için
 * hata veriyor, dolayısıyla ne toplu ne teker teker yol iş görüyor. Ham okuma
 * bu katmanı atladığı için kimlik biçiminden etkilenmiyor.
 *
 * Bu modda mesaj gövdesi, yönü ve zamanı gelir; fotoğraf indirilemez (indirme
 * bir Message nesnesi ister). Daha önce indirilmiş fotoğraflar diskten gelmeye
 * devam eder.
 */
export async function getRawChats(waClient = client, perChatMessages = MESSAGE_LIMIT, limit = CHAT_LIMIT) {
  if (!waClient?.pupPage) return { chats: [], geladen: 0, ohneZeit: 0, stat: {} };
  return waClient.pupPage.evaluate(
    async ([perChat, maxChats, ladeBudgetMs]) => {
      const pick = (fn, fallback = null) => {
        try {
          const v = fn();
          return v === undefined ? fallback : v;
        } catch {
          return fallback;
        }
      };

      const collection = pick(() => window.require('WAWebCollections')?.Chat) || window.Store?.Chat;
      if (!collection) return { chats: [], geladen: 0, ohneZeit: 0, stat: {} };

      const brauchbar = (id) =>
        !!id &&
        id !== 'status@broadcast' &&
        !id.endsWith('@g.us') &&
        !id.endsWith('@broadcast') &&
        !id.endsWith('@newsletter');

      // Erst auswählen, dann laden: Nachrichten für alle 600+ Chats zu holen
      // würde ewig dauern.
      let ohneZeit = 0;
      const kandidaten = [];
      for (const chat of pick(() => collection.getModelsArray(), []) || []) {
        const id = pick(() => chat?.id?._serialized);
        if (!brauchbar(id)) continue;
        const t = pick(() => chat.t, 0) || 0;
        if (!t) ohneZeit++;
        kandidaten.push({ chat, id, t });
      }
      kandidaten.sort((a, b) => b.t - a.t);
      const auswahl = kandidaten.slice(0, maxChats);

      // WhatsApp Web lädt Nachrichten erst beim Öffnen eines Chats — ohne das
      // hier ist chat.msgs leer und der Verlauf bliebe für immer aus.
      const ladeMsgs = window.require('WAWebChatLoadMessages');
      const start = Date.now();
      let geladen = 0;
      // Wo genau Nachrichten verloren gehen, ist von außen nicht sichtbar —
      // deshalb hier zählen statt raten.
      const stat = { alsNotification: 0, inMsgs: 0, ohneId: 0, typen: {} };

      const out = [];
      for (const { chat, id, t } of auswahl) {
        let msgs = (pick(() => chat.msgs?.getModelsArray?.(), []) || []).filter(
          (m) => !pick(() => m.isNotification, false),
        );

        // Höchstens ein paar Runden je Chat und insgesamt ein Zeitbudget,
        // damit ein zäher Chat den Sync nicht blockiert.
        let runden = 0;
        while (msgs.length < perChat && runden < 3 && Date.now() - start < ladeBudgetMs) {
          runden++;
          let neu = null;
          try {
            neu = await ladeMsgs.loadEarlierMsgs({ chat });
          } catch {
            break;
          }
          if (!neu || !neu.length) break;
          geladen += neu.length;
          const echte = neu.filter((m) => !pick(() => m.isNotification, false));
          stat.alsNotification += neu.length - echte.length;
          msgs = [...echte, ...msgs];
        }
        stat.inMsgs += msgs.length;

        const messages = [];
        for (const m of msgs.slice(-perChat)) {
          // serialize() ist der Weg, den whatsapp-web.js selbst geht: erst dort
          // liegen id/body/type garantiert als einfache Werte vor.
          const roh = pick(() => m.serialize?.()) || m;
          const msgId =
            pick(() => roh?.id?._serialized) ||
            pick(() => m?.id?._serialized) ||
            pick(() => m?.id?.toString?.());
          const typ = pick(() => roh.type, '') || pick(() => m.type, '') || 'chat';
          stat.typen[typ] = (stat.typen[typ] || 0) + 1;
          if (!msgId) {
            stat.ohneId++;
            continue;
          }
          // Bei Medien liegt in `body` die Nutzlast (bei Fotos der base64-Block,
          // bei Kontakten die VCARD) — die Bildunterschrift steht in `caption`.
          // Deshalb je Typ das richtige Feld, statt beide zu vermischen.
          const istText = typ === 'chat';
          const rohBody = istText
            ? pick(() => roh.body, '') || pick(() => m.body, '') || ''
            : pick(() => roh.caption, '') || pick(() => m.caption, '') || '';
          messages.push({
            id: msgId,
            body: rohBody,
            fromMe: !!(pick(() => roh.id?.fromMe, false) || pick(() => m.id?.fromMe, false)),
            t: pick(() => roh.t, 0) || pick(() => m.t, 0) || 0,
            type: typ,
          });
        }

        out.push({
          id,
          name:
            pick(() => chat.formattedTitle) ||
            pick(() => chat.name) ||
            pick(() => chat.contact?.pushname) ||
            pick(() => chat.contact?.name) ||
            id,
          unread: pick(() => chat.unreadCount, 0) || 0,
          // Fehlt chat.t, tut es der jüngste Nachrichtenzeitstempel.
          t: t || messages.reduce((max, m) => (m.t > max ? m.t : max), 0),
          messages,
        });
      }
      return { chats: out, geladen, ohneZeit, stat };
    },
    [perChatMessages, limit, RAW_LOAD_BUDGET_MS],
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

// --- Zombi bekçisi (ölü tarayıcı köprüsü) ---
// Chromium OOM-kill yediğinde durum 'ready' kalır ama her CDP çağrısı
// "Runtime.callFunctionOn timed out" ile düşer: Node canlı, konteyner
// "running" göründüğü için ne boot- ne kopma-bekçisi devreye girer — köprü
// günlerce ölü kalabilir (canlıda 11 gün fark edilmedi). Art arda tamamen
// başarısız sohbet turlarında süreci bitiririz; Docker temiz bir Chromium ile
// yeniden başlatır ve oturum volume'den geri gelir.
const ZOMBIE_SYNC_LIMIT = Number(process.env.WA_ZOMBIE_SYNC_LIMIT || 3);
let deadBridgeStreak = 0;
function noteChatListOutcome(mode) {
  if (mode !== 'başarısız') {
    deadBridgeStreak = 0;
    return;
  }
  deadBridgeStreak += 1;
  if (state.status === 'ready' && deadBridgeStreak >= ZOMBIE_SYNC_LIMIT) {
    console.error(
      `[watchdog] ${deadBridgeStreak} sohbet turu üst üste tamamen başarısız — tarayıcı köprüsü ölü görünüyor, temiz başlangıç için süreç kapatılıyor.`,
    );
    process.exit(1);
  }
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

  client.on('ready', async () => {
    state.status = 'ready';
    state.qrDataUrl = null;
    state.me = client.info?.wid?.user || null;
    console.log(`[whatsapp] Hazır. Bağlı numara: ${state.me}`);
    // Tanı için: kütüphane ve WhatsApp Web sürümü uyuşmazlıkların ilk şüphelisi.
    try {
      console.log(
        `[whatsapp] whatsapp-web.js ${pkg.version ?? '?'} | WhatsApp Web ${await client.getWWebVersion()}`,
      );
    } catch {}
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

    const photo = await savePhoto(msg);

    events.emit('message', {
      chatId,
      name,
      id: msg.id?._serialized || String(Date.now()),
      direction: msg.fromMe ? 'out' : 'in',
      body,
      mediaOnly,
      isPhoto: isPhoto(msg),
      photo,
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

// Ham sayfa verisini senkronun beklediği şekle çevirir. Fotoğraflar burada
// indirilemez; daha önce inmiş olanlar diskten bağlanır.
async function buildFromRawChats(limit, perChatMessages, shouldFetchMessages) {
  let roh = { chats: [], geladen: 0, ohneZeit: 0, stat: {} };
  try {
    roh = await getRawChats(client, perChatMessages, limit);
  } catch (err) {
    console.error('[whatsapp] ham sohbet okuma da başarısız:', err?.message);
    return [];
  }

  // Auswahl und Sortierung passieren bereits in der Seite.
  const usable = roh.chats.filter((c) => isSyncableChatId(c.id));
  const st = roh.stat || {};
  const seitenTypen = Object.entries(st.typen || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([t, n]) => `${t}:${n}`)
    .join(' ');
  console.log(
    `[whatsapp] sohbet listesi (ham): ${usable.length} işlenecek, ` +
      `${roh.geladen} Nachricht(en) nachgeladen, ${roh.ohneZeit} Chat(s) ohne Zeitstempel` +
      ` | in der Seite: ${st.inMsgs ?? '?'} übrig, ${st.alsNotification ?? '?'} als Notification verworfen,` +
      ` ${st.ohneId ?? '?'} ohne ID | Seitentypen: ${seitenTypen}`,
  );

  // Auch im Rohmodus werden Fotos geladen — der Download läuft nur über die
  // Nachrichten-ID in der Seite und braucht kein Chat-Modell. Budget pro Lauf,
  // neueste zuerst.
  let photoBudget = PHOTO_SYNC_LIMIT;
  // Zähler, damit im Log steht, WO es klemmt, wenn keine Fotos ankommen.
  const foto = { gesehen: 0, ausCache: 0, geladen: 0, fehlgeschlagen: 0, aufgegeben: 0, offen: 0 };
  const gruende = new Map();
  const alleTypen = new Map();

  const result = [];
  for (const chat of usable) {
    const lastTs = (chat.t || 0) * 1000;
    if (shouldFetchMessages && !shouldFetchMessages(chat.id, lastTs)) {
      result.push({ chatId: chat.id, name: chat.name, unread: chat.unread, messages: [] });
      continue;
    }

    const messages = [];
    for (const m of [...chat.messages].reverse()) {
      const { body, mediaOnly } = bodyOf(m);
      if (!body) continue;
      const msg = {
        id: m.id,
        direction: m.fromMe ? 'out' : 'in',
        body,
        ts: (m.t || 0) * 1000,
      };
      if (mediaOnly) msg.mediaOnly = true;

      alleTypen.set(m.type, (alleTypen.get(m.type) || 0) + 1);

      if (isPhoto(m)) {
        // Merkmal bleibt im Store: fehlt das Bild, holt der nächste Lauf es
        // nach — auch wenn im Chat nichts Neues passiert ist.
        msg.isPhoto = true;
        foto.gesehen++;
        const cached = media.findExisting(m.id);
        if (cached) {
          msg.photo = cached;
          foto.ausCache++;
        } else if (photoBudget > 0) {
          photoBudget--;
          const { file, grund, aufgegeben } = await savePhotoDetail(m.id);
          if (file) {
            msg.photo = file;
            foto.geladen++;
          } else {
            foto.fehlgeschlagen++;
            const kurz = (grund || 'bilinmeyen').slice(0, 40);
            gruende.set(kurz, (gruende.get(kurz) || 0) + 1);
            // Endgültig gescheitert → nicht bei jedem Lauf erneut versuchen.
            if (aufgegeben) {
              msg.photoAufgegeben = true;
              foto.aufgegeben++;
            }
          }
        } else {
          // Budget erschöpft — nächster Lauf holt den Rest.
          foto.offen++;
        }
      }
      messages.push(msg);
    }
    messages.sort((a, b) => a.ts - b.ts);
    result.push({ chatId: chat.id, name: chat.name, unread: chat.unread, messages });
  }

  const typen = [...alleTypen.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([t, n]) => `${t}:${n}`)
    .join(' ');
  const fehlerGruende = [...gruende.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([g, n]) => `${g}×${n}`)
    .join(', ');
  console.log(
    `[whatsapp] ham modda foto — gesehen ${foto.gesehen}, aus Cache ${foto.ausCache}, ` +
      `geladen ${foto.geladen}, fehlgeschlagen ${foto.fehlgeschlagen} (davon ${foto.aufgegeben} aufgegeben), offen ${foto.offen}` +
      (fehlerGruende ? ` | Gründe: ${fehlerGruende}` : '') +
      ` | Nachrichtentypen: ${typen}`,
  );
  return result;
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

  const { chats, skipped, mode } = await listChats();
  // En son konuşulan sohbetler önce — teker teker modda sıra garantili değil.
  const individual = chats
    .filter((c) => !c.isGroup && isSyncableChatId(c.id?._serialized))
    .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
    .slice(0, limit);
  console.log(
    `[whatsapp] sohbet listesi (${mode}): ${chats.length} bulundu, ${individual.length} işlenecek` +
      (skipped ? `, ${skipped} atlandı` : ''),
  );

  // Model katmanı hiçbir sohbeti veremediyse (WhatsApp'ın @lid kimlikleri)
  // ham okumaya düş — metin akışı böyle kurtarılıyor.
  if (individual.length === 0 && skipped > 0) {
    return buildFromRawChats(limit, perChatMessages, shouldFetchMessages);
  }

  // Diskte olmayan fotoğraflar için tur başına indirme bütçesi. Zaten kayıtlı
  // olanlar bütçeyi harcamaz; kalanlar bir sonraki senkronda tamamlanır.
  let photoBudget = PHOTO_SYNC_LIMIT;

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
    // Yeniden eskiye doğru: bütçe dolarsa en güncel fotoğraflar elde kalır.
    const messages = [];
    for (const m of [...raw].reverse()) {
      const { body, mediaOnly } = bodyOf(m);
      if (!body) continue;
      const msg = {
        id: m.id?._serialized || String(m.timestamp),
        direction: m.fromMe ? 'out' : 'in',
        body,
        ts: (m.timestamp || 0) * 1000,
      };
      if (mediaOnly) msg.mediaOnly = true;

      if (isPhoto(m)) {
        msg.isPhoto = true;
        const cached = media.findExisting(msg.id);
        if (cached) msg.photo = cached;
        else if (photoBudget > 0) {
          photoBudget--;
          const saved = await savePhoto(m);
          if (saved) msg.photo = saved;
        }
      }
      messages.push(msg);
    }
    messages.reverse();
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
