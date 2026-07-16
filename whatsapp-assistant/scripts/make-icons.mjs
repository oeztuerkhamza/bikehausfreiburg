// SVG uygulama ikonundan 192 ve 512 px PNG'ler üretir (PWA için).
import sharp from "sharp";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pub = path.join(__dirname, "..", "public");

// Maskable-güvenli: önemli içerik ortada. Yeşil zemin + beyaz sohbet balonu + bisiklet.
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#00a884"/>
  <g transform="translate(96 104)">
    <path d="M40 0 h240 a40 40 0 0 1 40 40 v150 a40 40 0 0 1 -40 40 H150 l-70 60 v-60 H40 a40 40 0 0 1 -40 -40 V40 A40 40 0 0 1 40 0 Z" fill="#ffffff"/>
    <g transform="translate(60 70)" fill="none" stroke="#00a884" stroke-width="14" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="40" cy="70" r="38"/>
      <circle cx="160" cy="70" r="38"/>
      <path d="M40 70 L95 70 L70 30 L120 30 M95 70 L135 30 M160 70 L120 30"/>
      <path d="M118 30 L128 18" stroke-width="12"/>
    </g>
  </g>
</svg>`;

const buf = Buffer.from(svg);
await sharp(buf).resize(192, 192).png().toFile(path.join(pub, "icon-192.png"));
await sharp(buf).resize(512, 512).png().toFile(path.join(pub, "icon-512.png"));
// Maskable varyant (aynı görsel, güvenli alan zaten ortada)
await sharp(buf).resize(512, 512).png().toFile(path.join(pub, "icon-maskable-512.png"));
console.log("İkonlar üretildi: icon-192.png, icon-512.png, icon-maskable-512.png");
