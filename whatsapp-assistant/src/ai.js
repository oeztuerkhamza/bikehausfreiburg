// Claude ile taslak cevap üretimi. Anahtar/model çalışırken değiştirilebilir.
import Anthropic from "@anthropic-ai/sdk";
import { SHOP_CONTEXT } from "./shop-context.js";

let apiKey = process.env.ANTHROPIC_API_KEY || "";
// KI-E-Mail-Assistent ile aynı model (hız + maliyet + RAM dostu).
let model = process.env.ANTHROPIC_MODEL || "claude-haiku-4-5";
let client = apiKey ? new Anthropic({ apiKey }) : null;

/** Anahtar/model'i çalışırken güncelle. */
export function configure({ apiKey: k, model: m } = {}) {
  if (typeof k === "string" && k.trim()) {
    apiKey = k.trim();
    client = new Anthropic({ apiKey });
  }
  if (typeof m === "string" && m.trim()) {
    model = m.trim();
  }
  return getConfig();
}

export function isEnabled() {
  return !!client;
}

export function getConfig() {
  return {
    hasKey: !!apiKey,
    model,
    keyMasked: apiKey ? apiKey.slice(0, 8) + "…" + apiKey.slice(-4) : "",
  };
}

/**
 * WhatsApp geçmişini Claude'un beklediği alternating role formatına çevirir.
 * Ardışık aynı-rol mesajları tek turda birleştirir.
 */
function toMessages(history) {
  const turns = [];
  for (const m of history) {
    const role = m.direction === "in" ? "user" : "assistant";
    const last = turns[turns.length - 1];
    if (last && last.role === role) last.content += "\n" + m.body;
    else turns.push({ role, content: m.body });
  }
  while (turns.length && turns[0].role !== "user") turns.shift();
  return turns;
}

function textOf(resp) {
  return resp.content
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("\n")
    .trim();
}

/** Gelen (yabancı) mesajı Türkçeye çevir. */
export async function translateToTurkish(text) {
  if (!client) return { ok: false, error: "API anahtarı ayarlı değil." };
  if (!text || !text.trim()) return { ok: true, text: "" };
  try {
    const resp = await client.messages.create({
      model,
      max_tokens: 1500,
      // KI-E-Mail-Assistent ile aynı çevirmen mantığı (WhatsApp'a uyarlandı).
      system:
        "Du bist ein professioneller Übersetzer. Übersetze die folgende eingehende " +
        "WhatsApp-Nachricht ins Türkische. Gib AUSSCHLIESSLICH die türkische Übersetzung " +
        "zurück – ohne Vorbemerkung, ohne Anführungszeichen, ohne Erklärung. Behalte Absätze " +
        "und Zeilenumbrüche bei. Ist der Text bereits Türkisch, gib ihn unverändert zurück. " +
        "Übersetze keine URLs, E-Mail-Adressen oder Telefonnummern.",
      messages: [{ role: "user", content: text }],
    });
    return { ok: true, text: textOf(resp) };
  } catch (err) {
    console.error("[ai] çeviri hatası:", err?.message || err);
    return { ok: false, error: err?.message || "Çeviri hatası" };
  }
}

/**
 * Operatörün TÜRKÇE talimatından, müşterinin dilinde hazır cevap üretir.
 * @param {Array<{direction:"in"|"out", body:string}>} history
 * @param {string} instructionTr  Operatörün "şunu söyle" diye Türkçe yazdığı metin
 */
export async function composeReply(history, instructionTr) {
  if (!client) return { ok: false, error: "API anahtarı ayarlı değil — Ayarlar'dan gir." };
  if (!instructionTr || !instructionTr.trim()) {
    return { ok: false, error: "Önce Türkçe olarak ne demek istediğini yaz." };
  }

  // Sohbet geçmişini düz metin olarak özetle (system prompt'a koy)
  const historyText = history
    .filter((m) => m.body)
    .map((m) => (m.direction === "in" ? `Kunde: ${m.body}` : `Wir: ${m.body}`))
    .join("\n");

  const conversationContext = historyText
    ? `\n\n## Bisheriger Chatverlauf\n${historyText}`
    : "\n\n## Bisheriger Chatverlauf\n(Noch keine Nachrichten.)";

  // Operatör talimatını user mesajı olarak gönder — Claude bunu cevaplar
  const userPrompt =
    `=== NOTIZEN DES INHABERS (Türkisch – Inhalt der Antwort) ===\n` +
    instructionTr.trim() +
    `\n\n` +
    `Bringe NUR diese Notiz höflich in die SPRACHE DES KUNDEN (nicht Türkisch – die Sprache, ` +
    `in der der Kunde geschrieben hat). Bleib KURZ und nah an der Notiz: meist 1–2 Sätze. ` +
    `Füge NICHTS hinzu, was nicht in der Notiz steht – keine zusätzlichen Angebote, Rückfragen, ` +
    `Erklärungen oder Floskeln. Gib die türkischen Notizen niemals wörtlich wieder und erfinde ` +
    `keine Preise, Termine oder Zusagen. Gib AUSSCHLIESSLICH den fertigen, knappen Antworttext aus.`;

  try {
    const resp = await client.messages.create({
      model,
      max_tokens: 1024,
      system: [
        { type: "text", text: SHOP_CONTEXT + conversationContext, cache_control: { type: "ephemeral" } },
      ],
      messages: [{ role: "user", content: userPrompt }],
    });
    return { ok: true, draft: textOf(resp) };
  } catch (err) {
    console.error("[ai] cevap üretim hatası:", err?.message || err);
    return { ok: false, error: err?.message || "Bilinmeyen AI hatası" };
  }
}
