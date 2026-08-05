import "dotenv/config";
import express from "express";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Server as SocketServer } from "socket.io";

import * as store from "./store.js";
import * as wa from "./whatsapp.js";
import * as ai from "./ai.js";
import { saveEnv } from "./config.js";
import { requireAuth, socketAuth } from "./auth.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3000;
const AUTO_DRAFT = (process.env.AUTO_DRAFT ?? "true") !== "false";
// Admin panelinden iframe ile gömülmeye izin verilen ek origin'ler.
// 'self' her zaman eklenir; env yalnızca ek origin(ler) sağlar.
const FRAME_EXTRA =
  process.env.FRAME_ANCESTORS ||
  "https://admin.bikehausfreiburg.com http://localhost:4200";

const app = express();
app.disable("x-powered-by");
// iframe gömme izni (X-Frame-Options yerine CSP frame-ancestors)
app.use((req, res, next) => {
  res.setHeader("Content-Security-Policy", `frame-ancestors 'self' ${FRAME_EXTRA}`);
  next();
});
app.use(express.json());
// Statik dosyalar (index.html, app.js) herkese açık; token sayfa yüklendikten
// sonra hash ile gelir. Veri uçları (/api) ve socket JWT ile korunur.
app.use(express.static(path.join(__dirname, "..", "public")));
app.use("/api", requireAuth);

const server = http.createServer(app);
const io = new SocketServer(server);
io.use(socketAuth);

// --- WhatsApp olayları ---
let synced = false;

/**
 * Sohbetleri WhatsApp'tan çekip depoya birleştirir.
 * onlyChanged: sadece son mesajı bizdekinden yeni olan sohbetlerin mesajlarını
 * çeker (periyodik senkron için ucuz tutar); ad ve okunmadı yine tazelenir.
 */
async function syncChats({ onlyChanged = false } = {}) {
  try {
    const chats = await wa.getRecentChats({
      shouldFetchMessages: onlyChanged
        ? (chatId, lastTs) => {
            const conv = store.get(chatId);
            if (!conv || !conv.messages.length) return true;
            if (!lastTs) return true;
            return conv.messages[conv.messages.length - 1].ts < lastTs;
          }
        : undefined,
    });
    for (const c of chats) {
      const conv = store.importChat(c.chatId, c.name, c.messages, c.unread);
      io.emit("conversation", conv);
    }
    console.log(`[sync] ${chats.length} sohbet yüklendi.`);
    return { ok: true, count: chats.length };
  } catch (err) {
    console.error("[sync] hata:", err?.message, "\n", err?.stack);
    return { ok: false, count: 0, error: err?.message || "bilinmeyen" };
  }
}

// Canlı olaylar bir şeyi kaçırırsa (servis kapalıyken gelen/giden mesajlar)
// arka plan senkronu tamamlar. 0 = kapalı.
const SYNC_INTERVAL_MS = Number(process.env.WA_SYNC_INTERVAL_MS || 10 * 60 * 1000);
let syncTimer = null;
function schedulePeriodicSync() {
  clearInterval(syncTimer);
  if (SYNC_INTERVAL_MS <= 0) return;
  syncTimer = setInterval(() => {
    if (wa.state.status !== "ready") return;
    syncChats({ onlyChanged: true });
  }, SYNC_INTERVAL_MS);
}

wa.events.on("status", (s) => {
  io.emit("status", s);
  // Logout veya bağlantı kopunca synced'i sıfırla, yeniden bağlanınca tekrar senkronize etsin.
  if (s.status === "loggingout" || s.status === "disconnected") {
    synced = false;
    clearInterval(syncTimer);
  }
  if (s.status === "ready" && !synced) {
    synced = true;
    // Geçmişi yüklemeyi dene (WhatsApp Web sürümüne göre çalışmayabilir).
    (async () => {
      await new Promise((r) => setTimeout(r, 5000));
      const res = await syncChats();
      if (!res.ok) {
        console.log("[sync] Geçmiş yüklenemedi (WhatsApp Web uyumsuzluğu). Canlı mod: yeni gelen mesajlar yine de görünecek.");
        io.emit("history-unavailable");
      }
      schedulePeriodicSync();
    })();
  }
});

// Gelen müşteri mesajı VE telefondaki WhatsApp Business'tan yazdığımız cevap.
wa.events.on("message", async (m) => {
  const yon = m.direction === "out" ? "biz" : "müşteri";
  console.log(`[mesaj/${yon}] ${m.name} (${m.chatId}): ${m.body}`);
  const conv = store.addMessage(m.chatId, m.name, {
    id: m.id,
    direction: m.direction === "out" ? "out" : "in",
    body: m.body,
    mediaOnly: m.mediaOnly,
    ts: m.ts,
  });
  io.emit("conversation", conv);
});

// --- REST API ---
app.get("/api/state", (_req, res) => {
  res.json({ wa: wa.state, aiEnabled: ai.isEnabled(), autoDraft: AUTO_DRAFT });
});

// Ayarları oku (anahtar maskeli döner)
app.get("/api/settings", (_req, res) => {
  res.json({ ...ai.getConfig(), autoDraft: AUTO_DRAFT });
});

// Ayarları kaydet (API anahtarı / model). Çalışırken uygular + .env'e yazar.
app.post("/api/settings", (req, res) => {
  const { apiKey, model } = req.body || {};
  const cfg = ai.configure({ apiKey, model });
  const toSave = {};
  if (typeof apiKey === "string" && apiKey.trim()) toSave.ANTHROPIC_API_KEY = apiKey.trim();
  if (typeof model === "string" && model.trim()) toSave.ANTHROPIC_MODEL = model.trim();
  if (Object.keys(toSave).length) {
    try { saveEnv(toSave); } catch (e) { console.error("[settings] .env yazılamadı:", e.message); }
  }
  console.log(`[settings] güncellendi — AI ${ai.isEnabled() ? "AÇIK" : "kapalı"}, model ${cfg.model}`);
  res.json(cfg);
});

app.get("/api/conversations", (_req, res) => {
  res.json(store.list());
});

// Bağlı numarayı çıkar (Abmeldung) — başka numarayla giriş için.
// Oturumu + eski sohbetleri temizler, servisi yeniden başlatır → yeni QR.
app.post("/api/logout", async (_req, res) => {
  if (wa.state.status !== "ready" && wa.state.status !== "qr" && wa.state.status !== "authenticated") {
    // yine de devam et; en kötü ihtimalle temiz yeniden başlatma
  }
  res.json({ ok: true });
  console.log("[logout] numara çıkarılıyor, oturum + sohbetler temizleniyor...");
  store.clearAll();
  io.emit("status", { status: "loggingout", qrDataUrl: null, me: null });
  await wa.logout();
});

// Mevcut sohbetleri WhatsApp'tan elle yeniden yükle
app.post("/api/sync", async (_req, res) => {
  if (wa.state.status !== "ready") {
    return res.status(503).json({ error: "WhatsApp henüz hazır değil" });
  }
  const result = await syncChats();
  res.json(result);
});

app.get("/api/conversations/:chatId", (req, res) => {
  const conv = store.get(req.params.chatId);
  if (!conv) return res.status(404).json({ error: "bulunamadı" });
  store.markRead(req.params.chatId);
  res.json(conv);
});

// Taslağı elle güncelle (kullanıcı düzenlerken)
app.put("/api/conversations/:chatId/draft", (req, res) => {
  const conv = store.setDraft(req.params.chatId, req.body.draft ?? "");
  if (!conv) return res.status(404).json({ error: "bulunamadı" });
  res.json(conv);
});

// Gelen mesajları Türkçeye çevir (henüz çevrilmemiş olanları)
app.post("/api/conversations/:chatId/translate", async (req, res) => {
  const conv = store.get(req.params.chatId);
  if (!conv) return res.status(404).json({ error: "bulunamadı" });
  if (!ai.isEnabled()) return res.status(400).json({ error: "AI devre dışı — Ayarlar'dan API anahtarı gir" });
  const pending = conv.messages.filter(
    (m) => m.direction === "in" && !m.translation && m.body && !m.mediaOnly,
  );
  for (const m of pending) {
    const r = await ai.translateToTurkish(m.body);
    if (r.ok) store.setTranslation(conv.chatId, m.id, r.text);
  }
  res.json(store.get(conv.chatId));
});

// Operatörün Türkçe talimatından müşteri diliyle cevap oluştur
app.post("/api/conversations/:chatId/compose", async (req, res) => {
  const conv = store.get(req.params.chatId);
  if (!conv) return res.status(404).json({ error: "bulunamadı" });
  if (!ai.isEnabled()) return res.status(400).json({ error: "AI devre dışı — Ayarlar'dan API anahtarı gir" });
  const instruction = (req.body.instruction ?? "").trim();
  if (!instruction) return res.status(400).json({ error: "Önce Türkçe olarak ne demek istediğini yaz" });
  io.emit("drafting", { chatId: conv.chatId });
  const result = await ai.composeReply(conv.messages, instruction);
  if (!result.ok) return res.status(500).json({ error: result.error });
  const updated = store.setDraft(conv.chatId, result.draft);
  io.emit("conversation", updated);
  res.json(updated);
});

// Onaylanan cevabı gönder
app.post("/api/conversations/:chatId/send", async (req, res) => {
  const chatId = req.params.chatId;
  const text = (req.body.text ?? "").trim();
  if (!text) return res.status(400).json({ error: "boş mesaj" });
  if (wa.state.status !== "ready") {
    return res.status(503).json({ error: "WhatsApp henüz hazır değil" });
  }
  try {
    // Gerçek WhatsApp mesaj id'siyle kaydet: 'message_create' olayı aynı mesajı
    // birazdan tekrar getirecek, depo aynı id'yi ikinci kez eklemez.
    const sent = await wa.sendMessage(chatId, text);
    const conv = store.addMessage(chatId, null, {
      id: sent?.id?._serialized || "out-" + Date.now(),
      direction: "out",
      body: text,
      ts: (sent?.timestamp || 0) * 1000 || Date.now(),
    });
    store.setDraft(chatId, ""); // gönderince taslağı temizle
    io.emit("conversation", store.get(chatId));
    res.json(conv);
  } catch (err) {
    console.error("[send] hata:", err.message);
    res.status(500).json({ error: err.message });
  }
});

io.on("connection", (socket) => {
  socket.emit("status", wa.state);
});

server.listen(PORT, () => {
  console.log(`\n  Web arayüzü:  http://localhost:${PORT}`);
  console.log(`  AI taslak:    ${ai.isEnabled() ? "AÇIK (" + ai.getConfig().model + ")" : "KAPALI — Ayarlar'dan anahtar gir"}`);
  console.log(`  Oto-taslak:   ${AUTO_DRAFT ? "açık" : "kapalı"}\n`);
  wa.start();
});
