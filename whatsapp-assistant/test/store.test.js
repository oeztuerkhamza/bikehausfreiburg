// Dubletten-Schutz des Verlaufs. Die Fälle stammen alle aus dem Betrieb:
// dieselbe Nachricht stand zweimal im Chat, weil Live-Event und Sync sie unter
// unterschiedlichen IDs ablegten.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

// Jeder Fall bekommt ein eigenes Datenverzeichnis und eine eigene Instanz des
// Moduls — der Store hält seinen Zustand im Modul-Scope und liest die Datei
// beim Import.
let n = 0;
async function frischerStore(vorhandeneChats) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "wa-store-"));
  if (vorhandeneChats) {
    fs.writeFileSync(
      path.join(dir, "conversations.json"),
      JSON.stringify(vorhandeneChats),
    );
  }
  process.env.WA_STORE_PATH = dir;
  return import(`../src/store.js?fall=${n++}`);
}

const CHAT = "4915112345678@c.us";
const ECHT = "true_4915112345678@c.us_3EB0ABC";

test("Sync hängt eine vorläufig gespeicherte Antwort nicht erneut an", async () => {
  const store = await frischerStore();
  const ts = 1_770_000_000_000;

  // Panel hat gesendet, WhatsApp lieferte noch keine ID.
  store.addMessage(CHAT, "Kunde", {
    id: "out-" + ts,
    direction: "out",
    body: "Ihr Rad ist fertig.",
    ts,
  });
  // Sync bringt dieselbe Nachricht mit ihrer echten ID.
  store.importChat(CHAT, "Kunde", [
    { id: ECHT, direction: "out", body: "Ihr Rad ist fertig.", ts: ts + 1000 },
  ]);

  const conv = store.get(CHAT);
  assert.equal(conv.messages.length, 1);
  // Die echte ID wurde übernommen — der nächste Sync trifft direkt.
  assert.equal(conv.messages[0].id, ECHT);

  store.importChat(CHAT, "Kunde", [
    { id: ECHT, direction: "out", body: "Ihr Rad ist fertig.", ts: ts + 1000 },
  ]);
  assert.equal(store.get(CHAT).messages.length, 1);
});

test("Live-Event ohne echte ID wird vom Sync eingeholt statt verdoppelt", async () => {
  const store = await frischerStore();
  const ts = 1_770_000_000_000;

  // Eingang, bei dem `_serialized` fehlte → Zeitstempel als Notnagel.
  store.addMessage(CHAT, "Kunde", {
    id: String(ts),
    direction: "in",
    body: "Ist das Rad fertig?",
    ts,
  });
  store.importChat(CHAT, "Kunde", [
    { id: ECHT, direction: "in", body: "Ist das Rad fertig?", ts: ts + 500 },
  ]);

  const conv = store.get(CHAT);
  assert.equal(conv.messages.length, 1);
  assert.equal(conv.messages[0].id, ECHT);
});

test("zwei echte Nachrichten mit gleichem Text bleiben zwei", async () => {
  const store = await frischerStore();
  const ts = 1_770_000_000_000;

  // Kunde schreibt zweimal kurz hintereinander dasselbe — beide haben echte
  // IDs und dürfen nicht zusammengelegt werden.
  store.importChat(CHAT, "Kunde", [
    { id: ECHT + "1", direction: "in", body: "Hallo", ts },
    { id: ECHT + "2", direction: "in", body: "Hallo", ts: ts + 3000 },
  ]);

  assert.equal(store.get(CHAT).messages.length, 2);
});

test("bereits doppelt gespeicherte Nachrichten werden beim Laden entfernt", async () => {
  const ts = 1_770_000_000_000;
  const store = await frischerStore([
    {
      chatId: CHAT,
      name: "Kunde",
      draft: "",
      unread: 0,
      updatedAt: ts,
      messages: [
        // Dieselbe Antwort zweimal: einmal vorläufig, einmal echt.
        { id: "out-" + ts, direction: "out", body: "Bis morgen!", ts },
        { id: ECHT, direction: "out", body: "Bis morgen!", ts: ts + 800 },
        // Und eine, die nur einmal dasteht.
        { id: ECHT + "X", direction: "in", body: "Danke", ts: ts + 5000 },
      ],
    },
  ]);

  const conv = store.get(CHAT);
  assert.deepEqual(
    conv.messages.map((m) => m.id),
    [ECHT, ECHT + "X"],
  );
});

test("Foto der vorläufigen Kopie geht beim Aufräumen nicht verloren", async () => {
  const ts = 1_770_000_000_000;
  const store = await frischerStore([
    {
      chatId: CHAT,
      name: "Kunde",
      draft: "",
      unread: 0,
      updatedAt: ts,
      messages: [
        { id: String(ts), direction: "in", body: "📷 Foto", ts, isPhoto: true, photo: "a.jpg" },
        { id: ECHT, direction: "in", body: "📷 Foto", ts: ts + 400, isPhoto: true },
      ],
    },
  ]);

  const conv = store.get(CHAT);
  assert.equal(conv.messages.length, 1);
  assert.equal(conv.messages[0].id, ECHT);
  assert.equal(conv.messages[0].photo, "a.jpg");
});
