// Basit JSON-dosyası tabanlı depolama (native bağımlılık yok).
// Konuşmalar restart sonrası korunur. Küçük ölçek için yeterli.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { repairStoredBody } from "./body-text.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Ablageort überschreibbar, damit Tests nicht in den echten Verlauf schreiben.
const DATA_DIR = process.env.WA_STORE_PATH || path.join(__dirname, "..", "data");
const DB_FILE = path.join(DATA_DIR, "conversations.json");

/** @type {Map<string, Conversation>} chatId -> conversation */
const conversations = new Map();

// Eski Verläufe enthalten noch Nachrichten, in denen die Bilddaten als Text
// stehen ("📷 Foto — /9j/4AAQ…"). Das wird beim Laden einmal aufgeräumt, sonst
// bleibt der Zeichensalat im Chat stehen, obwohl der Sync ihn nicht mehr baut.
function repairBodies() {
  let repariert = 0;
  for (const conv of conversations.values()) {
    for (const m of conv.messages || []) {
      const clean = repairStoredBody(m.body);
      if (!clean) continue;
      m.body = clean;
      m.mediaOnly = true;
      delete m.translation;
      repariert++;
    }
  }
  if (repariert > 0) {
    console.log(`[store] ${repariert} Nachricht(en) von Mediendaten befreit.`);
    persist();
  }
}

function load() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
      for (const conv of raw) conversations.set(conv.chatId, conv);
      repairBodies();
      entferneDoppelte();
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

// Eine echte WhatsApp-ID sieht aus wie "true_49…@c.us_3EB0…". Wo keine vorlag,
// haben wir selbst eine vergeben ("out-<zeit>" beim Senden, "<zeit>" im
// Live-Event). Genau diese vorläufigen IDs sind die Dubletten-Quelle: der
// nächste Sync bringt dieselbe Nachricht mit ihrer echten ID und findet unter
// der erfundenen nichts wieder. Zwei Einträge mit ECHTER ID sind dagegen immer
// zwei verschiedene Nachrichten — die dürfen nie zusammengelegt werden.
function istVorlaeufig(id) {
  return /^(out-)?\d+$/.test(String(id ?? ""));
}

// Denselben Text, dieselbe Richtung, im selben Zeitfenster und nur gegen einen
// vorläufig gespeicherten Eintrag: das ist die Nachricht, die wir schon haben.
function findeVorlaeufigenZwilling(kandidaten, m) {
  if (!m.body) return null;
  return (
    kandidaten.find(
      (k) =>
        k.direction === m.direction &&
        k.body === m.body &&
        Math.abs((k.ts || 0) - (m.ts || 0)) < OUT_DUP_WINDOW_MS,
    ) || null
  );
}

// Was nur die vorläufige Kopie hatte, geht beim Zusammenlegen nicht verloren.
function uebernehmeZusatz(ziel, quelle) {
  if (!ziel || !quelle) return;
  if (quelle.photo && !ziel.photo) ziel.photo = quelle.photo;
  if (quelle.isPhoto && !ziel.isPhoto) ziel.isPhoto = true;
  if (quelle.mediaOnly && !ziel.mediaOnly) ziel.mediaOnly = true;
  if (quelle.translation && !ziel.translation) ziel.translation = quelle.translation;
}

// Dubletten, die vor dieser Prüfung entstanden sind, liegen noch im Verlauf:
// dieselbe Nachricht einmal unter vorläufiger, einmal unter echter ID. Beim
// Laden einmal aufräumen — sonst steht sie im Chat weiter doppelt.
function entferneDoppelte() {
  let entfernt = 0;
  for (const conv of conversations.values()) {
    const nachrichten = conv.messages || [];

    // Gleiche ID zweimal: defensiv, sollte durch die Prüfungen unten nicht mehr
    // vorkommen.
    const gesehen = new Set();
    const behalten = [];
    for (const m of nachrichten) {
      if (m.id && gesehen.has(m.id)) {
        uebernehmeZusatz(behalten.find((k) => k.id === m.id), m);
        entfernt++;
        continue;
      }
      if (m.id) gesehen.add(m.id);
      behalten.push(m);
    }

    // Vorläufige Kopien gegen die echten halten. Index statt Doppelschleife,
    // damit ein langer Verlauf den Start nicht bremst.
    const echteNachText = new Map();
    for (const m of behalten) {
      if (istVorlaeufig(m.id) || !m.body) continue;
      const schluessel = `${m.direction}\u0000${m.body}`;
      const liste = echteNachText.get(schluessel);
      if (liste) liste.push(m);
      else echteNachText.set(schluessel, [m]);
    }

    const gefiltert = behalten.filter((m) => {
      if (!istVorlaeufig(m.id) || !m.body) return true;
      const echter = findeVorlaeufigenZwilling(
        echteNachText.get(`${m.direction}\u0000${m.body}`) || [],
        m,
      );
      if (!echter) return true;
      uebernehmeZusatz(echter, m);
      entfernt++;
      return false;
    });

    if (gefiltert.length !== nachrichten.length) conv.messages = gefiltert;
  }
  if (entfernt > 0) {
    console.log(`[store] ${entfernt} doppelte Nachricht(en) entfernt.`);
    persist();
  }
}

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
      if (id && istVorlaeufig(zwilling.id)) {
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
  // Einträge, die noch unter einer selbst vergebenen ID liegen. Für sie greift
  // der ID-Abgleich nicht — sie müssen über Text/Zeit wiedergefunden werden,
  // sonst hängt der Sync dieselbe Nachricht ein zweites Mal an.
  const vorlaeufige = conv.messages.filter((m) => istVorlaeufig(m.id));
  for (const m of messages) {
    let known = byId.get(m.id);
    if (!known && vorlaeufige.length) {
      const zwilling = findeVorlaeufigenZwilling(vorlaeufige, m);
      if (zwilling) {
        // Echte ID übernehmen, damit der nächste Sync sie direkt wiederfindet.
        byId.delete(zwilling.id);
        zwilling.id = m.id;
        byId.set(m.id, zwilling);
        vorlaeufige.splice(vorlaeufige.indexOf(zwilling), 1);
        known = zwilling;
      }
    }
    if (!known) { conv.messages.push(m); byId.set(m.id, m); }
    // Fotoğraf bütçesi yüzünden ilk turda inmemiş olabilir — sonradan gelirse
    // mevcut mesaja iliştir.
    else {
      if (m.photo && !known.photo) known.photo = m.photo;
      if (m.isPhoto && !known.isPhoto) known.isPhoto = true;
      // Endgültig nicht ladbar (Medium bei WhatsApp abgelaufen) — sonst holt
      // der Sync diesen Chat bei jedem Lauf erneut.
      if (m.photoAufgegeben && !known.photo) known.photoAufgegeben = true;
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
  return conv.messages.some((m) => m.isPhoto && !m.photo && !m.photoAufgegeben);
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
