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
 * @typedef {{id:string, direction:"in"|"out", body:string, ts:number}} Msg
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

export function addMessage(chatId, name, { id, direction, body, ts }) {
  const conv = getOrCreate(chatId, name);
  conv.messages.push({ id, direction, body, ts: ts || Date.now() });
  if (direction === "in") conv.unread += 1;
  conv.updatedAt = Date.now();
  persist();
  return conv;
}

// Mevcut WhatsApp sohbetini içe aktar (geçmiş yükleme). Mesajları id'ye göre
// birleştirir, unread'i şişirmez.
export function importChat(chatId, name, messages) {
  const conv = getOrCreate(chatId, name);
  const seen = new Set(conv.messages.map((m) => m.id));
  for (const m of messages) {
    if (!seen.has(m.id)) { conv.messages.push(m); seen.add(m.id); }
  }
  conv.messages.sort((a, b) => a.ts - b.ts);
  if (name && (conv.name === chatId || !conv.name)) conv.name = name;
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

export function list() {
  return [...conversations.values()].sort((a, b) => b.updatedAt - a.updatedAt);
}

load();
