// Fotoğraf deposu. Görseller diske yazılır, konuşma JSON'unda sadece dosya adı
// durur — base64 gövdeler conversations.json'u hızla şişirirdi.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MEDIA_DIR = process.env.WA_MEDIA_PATH || path.join(__dirname, '..', 'data', 'media');

// Sadece tarayıcının doğrudan gösterebildiği formatlar.
const EXT_BY_MIME = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
};

const MIME_BY_EXT = {
  jpg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  gif: 'image/gif',
};

// Dosya adı doğrudan URL'den geliyor → dizin dışına çıkışı burada kesiyoruz.
const NAME_RE = /^[A-Za-z0-9_]+\.(jpg|png|webp|gif)$/;

function safeId(msgId) {
  return String(msgId).replace(/[^A-Za-z0-9]/g, '_').slice(0, 120);
}

/** Mesaj id + MIME türünden dosya adı. Desteklenmeyen tür → null. */
export function fileNameFor(msgId, mimetype) {
  const ext = EXT_BY_MIME[String(mimetype || '').toLowerCase().split(';')[0].trim()];
  if (!ext) return null;
  return `${safeId(msgId)}.${ext}`;
}

/** Bu mesajın fotoğrafı zaten diskteyse dosya adını döndürür. */
export function findExisting(msgId) {
  const base = safeId(msgId);
  for (const ext of Object.keys(MIME_BY_EXT)) {
    const name = `${base}.${ext}`;
    try {
      if (fs.existsSync(path.join(MEDIA_DIR, name))) return name;
    } catch {}
  }
  return null;
}

/** Base64 gövdeyi diske yazar, dosya adını döndürür. */
export function save(fileName, base64) {
  fs.mkdirSync(MEDIA_DIR, { recursive: true });
  fs.writeFileSync(path.join(MEDIA_DIR, fileName), Buffer.from(base64, 'base64'));
  return fileName;
}

/** Servis için tam yol + MIME. Ad geçersizse ya da dosya yoksa null. */
export function resolve(fileName) {
  if (!NAME_RE.test(String(fileName || ''))) return null;
  const full = path.join(MEDIA_DIR, fileName);
  if (!fs.existsSync(full)) return null;
  const ext = fileName.split('.').pop();
  return { path: full, mimetype: MIME_BY_EXT[ext] || 'application/octet-stream' };
}

/** Numara değişince eski numaranın fotoğrafları da gitsin. */
export function clearAll() {
  try {
    fs.rmSync(MEDIA_DIR, { recursive: true, force: true });
  } catch (err) {
    console.error('[media] temizleme hatası:', err.message);
  }
}
