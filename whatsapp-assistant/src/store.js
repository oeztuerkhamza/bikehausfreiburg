// Basit JSON-dosyası tabanlı depolama (native bağımlılık yok).
// Konuşmalar restart sonrası korunur. Küçük ölçek için yeterli.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "..", "data");
const DB_FILE = path.join(DATA_DIR, "conversations.json");

/** @type {Map<string, Conversation>} chatId -> conversation */
const conversations = new Map();

function load() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
      for (const conv of raw) conversations.set(conv.chatId, conv);
    }
  } catch (err) {
    console.error("[store] yükleme hatası:", err.message);
  }
}

let saveTimer = null;
function persist() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try {
      fs.mkdirSync(DATA_DIR, { recursive: true });
      fs.writeFileSync(DB_FILE, JSON.stringify([...conversations.values()], null, 2));
    } catch (err) {
      console.error("[store] kayıt hatası:", err.message);
    }
  }, 300);
}

/**
 * @typedef {{id:string, direction:"in"|"out", body:string, ts:number, mediaOnly?:boolean, photo?:string}} Msg
 * @typedef {{chatId:string, name:string, messages:Msg[], draft:string, unread:number, updatedAt:number}} Conversation
 */

export function getOrCreate(chatId, name) {
  let conv = conversations.get(chatId);
  if (!conv) {
    conv = { chatId, name: name || chatId, messages: [], draft: "", unread: 0, updatedAt: Date.now() };
    conversations.set(chatId, conv);
  } else if (name && conv.name === chatId) {
    conv.name = name; // gerçek isim geldiyse güncelle
  }
  return conv;
}

// Panelden gesendete Antwort und WhatsApps eigenes Event können mit
// UNTERSCHIEDLICHEN IDs ankommen — dann stand dieselbe Antwort zweimal im
// Verlauf. Innerhalb dieses Fensters gilt gleicher Text als dieselbe
// ausgehende Nachricht.
const OUT_DUP_WINDOW_MS = 60_000;

// Tek mesaj ekle. Aynı id ikinci kez gelirse (canlı olay + senkron, ya da
// panelden gönderip ardından WhatsApp olayını almak) yoksayılır.
export function addMessage(chatId, name, { id, direction, body, ts, mediaOnly, isPhoto, photo }) {
  const conv = getOrCreate(chatId, name);
  if (id && conv.messages.some((m) => m.id === id)) return conv;

  const zeit = ts || Date.now();

  if (direction === "out" && body) {
    const zwilling = conv.messages.find(
      (m) =>
        m.direction === "out" &&
        m.body === body &&
        Math.abs((m.ts || 0) - zeit) < OUT_DUP_WINDOW_MS,
    );
    if (zwilling) {
      // Kam die echte WhatsApp-ID erst mit dem Event nach, ersetzt sie die
      // vorläufige — sonst greift die ID-Prüfung beim nächsten Sync nicht.
      if (id && String(zwilling.id).startsWith("out-")) {
        zwilling.id = id;
        persist();
      }
      return conv;
    }
  }

  const msg = { id, direction, body, ts: zeit };
  if (mediaOnly) msg.mediaOnly = true;
  if (isPhoto) msg.isPhoto = true;
  if (photo) msg.photo = photo;
  conv.messages.push(msg);
  // Geç gelen bir mesaj sırayı bozmasın.
  const prev = conv.messages[conv.messages.length - 2];
  if (prev && prev.ts > msg.ts) conv.messages.sort((a, b) => a.ts - b.ts);

  // Giden mesaj = biz cevapladık (panelden ya da telefondaki Business'tan) →
  // okunmadı rozeti sıfırlanır.
  if (direction === "in") conv.unread += 1;
  else conv.unread = 0;

  conv.updatedAt = Date.now();
  persist();
  return conv;
}

// Mevcut WhatsApp sohbetini içe aktar (geçmiş yükleme). Mesajları id'ye göre
// birleştirir, unread'i şişirmez.
// unread: WhatsApp'taki okunmadı sayısı. Sadece SIFIRLAMAK için kullanılır —
// sohbet telefonda okunduysa buradaki rozet de düşer, tersi olmaz.
export function importChat(chatId, name, messages, unread) {
  const conv = getOrCreate(chatId, name);
  const byId = new Map(conv.messages.map((m) => [m.id, m]));
  for (const m of messages) {
    const known = byId.get(m.id);
    if (!known) { conv.messages.push(m); byId.set(m.id, m); }
    // Fotoğraf bütçesi yüzünden ilk turda inmemiş olabilir — sonradan gelirse
    // mevcut mesaja iliştir.
    else {
      if (m.photo && !known.photo) known.photo = m.photo;
      if (m.isPhoto && !known.isPhoto) known.isPhoto = true;
    }
  }
  conv.messages.sort((a, b) => a.ts - b.ts);
  if (name && (conv.name === chatId || !conv.name)) conv.name = name;
  if (unread === 0) conv.unread = 0;
  const last = conv.messages[conv.messages.length - 1];
  conv.updatedAt = last ? last.ts : conv.updatedAt;
  persist();
  return conv;
}

export function setDraft(chatId, draft) {
  const conv = conversations.get(chatId);
  if (conv) { conv.draft = draft; conv.updatedAt = Date.now(); persist(); }
  return conv;
}

export function setTranslation(chatId, msgId, translation) {
  const conv = conversations.get(chatId);
  if (!conv) return;
  const m = conv.messages.find((x) => x.id === msgId);
  if (m) { m.translation = translation; persist(); }
}

export function markRead(chatId) {
  const conv = conversations.get(chatId);
  if (conv) { conv.unread = 0; persist(); }
  return conv;
}

export function get(chatId) {
  return conversations.get(chatId);
}

// Foto-Nachricht ohne Bild: das Download-Budget eines Laufs ist begrenzt, der
// Rest bleibt liegen. Der periodische Sync fragt darüber, ob ein Chat trotz
// unveränderter Nachrichten noch einmal geholt werden muss.
export function hasPendingPhotos(chatId) {
  const conv = conversations.get(chatId);
  if (!conv) return false;
  return conv.messages.some((m) => m.isPhoto && !m.photo);
}

export function list() {
  return [...conversations.values()].sort((a, b) => b.updatedAt - a.updatedAt);
}

// Tüm sohbetleri sil (numara değiştirince eski numaranın sohbetleri karışmasın).
// Süreç hemen ardından çıkacağı için senkron yazar.
export function clearAll() {
  conversations.clear();
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(DB_FILE, "[]");
  } catch (err) {
    console.error("[store] temizleme hatası:", err.message);
  }
}

load();
