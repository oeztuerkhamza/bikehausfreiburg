// .env dosyasına anahtar/değer kalıcı yazma (varsa satırı günceller, yoksa ekler).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ENV_FILE = path.join(__dirname, "..", ".env");

export function saveEnv(updates) {
  let lines = [];
  try {
    if (fs.existsSync(ENV_FILE)) {
      lines = fs.readFileSync(ENV_FILE, "utf8").split(/\r?\n/);
    }
  } catch {}

  for (const [key, value] of Object.entries(updates)) {
    if (value === undefined || value === null) continue;
    const idx = lines.findIndex((l) => l.trim().startsWith(key + "="));
    const line = `${key}=${value}`;
    if (idx >= 0) lines[idx] = line;
    else lines.push(line);
  }

  fs.writeFileSync(ENV_FILE, lines.join("\n"));
}
