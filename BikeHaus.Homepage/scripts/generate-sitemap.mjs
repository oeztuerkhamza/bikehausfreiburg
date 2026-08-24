/**
 * Erzeugt dist/<app>/browser/sitemap.xml aus den PRERENDERTEN Seiten.
 *
 * Warum aus dem Build-Ergebnis und nicht aus einer Routenliste:
 * Jede prerenderte Seite traegt bereits ihr eigenes <link rel="canonical"> und
 * ihre vollstaendige, wechselseitige hreflang-Gruppe im <head> — vom SeoService
 * erzeugt. Wer die Sitemap daraus ableitet, kann per Konstruktion nichts
 * eintragen, was der Seite widerspricht, und nichts vergessen, was gebaut wurde.
 *
 * Vorher war src/sitemap.xml von Hand gepflegt und driftete entsprechend:
 * 83 <loc> bei 154 gebauten Seiten, fuenf Eintraege zeigten auf URLs, die nur
 * weiterleiten, ein Eintrag auf eine laengst entfernte Seite.
 *
 * Ausgeschlossen werden Seiten, die sich selbst auf noindex setzen (Impressum,
 * Datenschutz, Danke-Seiten) — eine Seite, die nicht in den Index soll, gehoert
 * auch nicht in die Sitemap.
 *
 * Aufruf: node scripts/generate-sitemap.mjs   (laeuft automatisch nach ng build)
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const browserDir = join(here, '..', 'dist', 'bike-haus.homepage', 'browser');

/** Alle index.html unterhalb von dist/browser einsammeln. */
function collectPages(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) collectPages(full, out);
    else if (entry === 'index.html') out.push(full);
  }
  return out;
}

const CANONICAL = /<link[^>]+rel="canonical"[^>]+href="([^"]+)"/i;
const ROBOTS = /<meta[^>]+name="robots"[^>]+content="([^"]+)"/i;
const ALTERNATE =
  /<link[^>]+rel="alternate"[^>]+hreflang="([^"]+)"[^>]+href="([^"]+)"/gi;

/**
 * Prioritaet nach Seitentyp. Google gewichtet das kaum, aber es kostet nichts
 * und macht die Datei fuer Menschen lesbar.
 */
function priorityFor(pathname) {
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length <= 1) return '1.0'; // /de
  const slug = segments[1];
  if (
    [
      'fahrradverleih',
      'bike-rental',
      'location-velo',
      'bisiklet-kiralama',
      'mietfahrraeder',
      'rental-bikes',
      'velos-de-location',
      'showroom',
      'e-bikes',
      'neue-fahrraeder',
    ].includes(slug)
  ) {
    return segments.length === 2 ? '0.9' : '0.8';
  }
  if (['service', 'bike-service', 'entretien-velo', 'zubehoer'].includes(slug)) {
    return '0.8';
  }
  if (slug.startsWith('fahrrad-')) return '0.7'; // Stadt-Landingpages
  return segments.length === 2 ? '0.6' : '0.5';
}

function changefreqFor(pathname) {
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length <= 1) return 'daily';
  return segments.length === 2 ? 'weekly' : 'monthly';
}

const xmlEscape = (s) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const pages = collectPages(browserDir);
const today = new Date().toISOString().slice(0, 10);

const entries = [];
let skippedNoindex = 0;
let skippedNoCanonical = 0;
const skippedForeignCanonical = [];
const skippedNoHreflang = [];

for (const file of pages) {
  const html = readFileSync(file, 'utf8');

  const robots = html.match(ROBOTS)?.[1] ?? '';
  if (/noindex/i.test(robots)) {
    skippedNoindex++;
    continue;
  }

  const canonical = html.match(CANONICAL)?.[1];
  if (!canonical) {
    skippedNoCanonical++;
    continue;
  }

  const pathname = new URL(canonical).pathname;
  const ownPath =
    '/' + relative(browserDir, file).split(sep).slice(0, -1).join('/');
  const norm = (p) => (p.replace(/\/+$/, '') || '/');

  // Zeigt der Canonical woanders hin, ist diese Seite ein Duplikat — etwa die
  // Wurzel, die auf /de kanonisiert, oder eine ausgemusterte Route, die in den
  // Wildcard laeuft und die deutsche Startseite ausliefert. Solche Seiten
  // gehoeren nicht in die Sitemap, sonst melden wir dieselbe URL mehrfach.
  if (norm(pathname) !== norm(ownPath)) {
    skippedForeignCanonical.push(`${ownPath} -> ${pathname}`);
    continue;
  }

  const alternates = [];
  for (const m of html.matchAll(ALTERNATE)) {
    alternates.push({ hreflang: m[1], href: m[2] });
  }

  // Jede echte Seite bekommt vom SeoService eine hreflang-Gruppe. Bleibt sie
  // leer, hat die Route nicht aufgeloest und es steht Platzhalterinhalt drin.
  if (alternates.length === 0) {
    skippedNoHreflang.push(ownPath);
    continue;
  }
  entries.push({
    loc: canonical,
    alternates,
    priority: priorityFor(pathname),
    changefreq: changefreqFor(pathname),
    routeKey: relative(browserDir, file).split(sep).slice(0, -1).join('/'),
  });
}

// Stabile Reihenfolge — sonst rauscht jeder Build durch das Diff.
entries.sort((a, b) => a.loc.localeCompare(b.loc));

const lines = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<!-- Automatisch erzeugt von scripts/generate-sitemap.mjs aus den prerenderten',
  '     Seiten. NICHT von Hand bearbeiten — Aenderungen gehen beim naechsten',
  '     Build verloren. Neue Route? In prerender-routes.txt aufnehmen, der Rest',
  '     passiert von selbst. Produktdetailseiten stehen in /sitemap-products.xml. -->',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
  '        xmlns:xhtml="http://www.w3.org/1999/xhtml">',
];

for (const e of entries) {
  lines.push('  <url>');
  lines.push(`    <loc>${xmlEscape(e.loc)}</loc>`);
  for (const alt of e.alternates) {
    lines.push(
      `    <xhtml:link rel="alternate" hreflang="${xmlEscape(alt.hreflang)}" href="${xmlEscape(alt.href)}"/>`,
    );
  }
  lines.push(`    <lastmod>${today}</lastmod>`);
  lines.push(`    <changefreq>${e.changefreq}</changefreq>`);
  lines.push(`    <priority>${e.priority}</priority>`);
  lines.push('  </url>');
}
lines.push('</urlset>');

const target = join(browserDir, 'sitemap.xml');
writeFileSync(target, lines.join('\n') + '\n', 'utf8');

console.log(
  `[sitemap] ${entries.length} URLs geschrieben -> ${relative(process.cwd(), target)}` +
    ` (uebersprungen: ${skippedNoindex} noindex, ${skippedNoCanonical} ohne canonical,` +
    ` ${skippedForeignCanonical.length} fremder canonical, ${skippedNoHreflang.length} ohne hreflang)`,
);

// Die beiden folgenden Faelle sind KEINE Sitemap-Probleme, sondern Hinweise auf
// Routen, die gebaut, aber nicht sinnvoll aufgeloest werden. Sie bleiben
// sichtbar, damit sie nicht still im Build verschwinden.
for (const s of skippedForeignCanonical) {
  console.warn(`[sitemap]   uebersprungen (Duplikat): ${s}`);
}
for (const s of skippedNoHreflang) {
  console.warn(
    `[sitemap]   uebersprungen (Route loest nicht auf, Platzhalterinhalt): ${s}`,
  );
}
