import { APP_BASE_HREF } from '@angular/common';
import { CommonEngine } from '@angular/ssr';
import express from 'express';
import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import bootstrap from './src/main.server';
import {
  RENTAL_SLUG_BY_LANGUAGE,
  RENTAL_BOOKING_SLUG_BY_LANGUAGE,
} from './src/app/services/language-config';

// The Express app is exported so that it can be used by serverless Functions.
export function app(): express.Express {
  const server = express();
  const serverDistFolder = dirname(fileURLToPath(import.meta.url));
  const browserDistFolder = resolve(serverDistFolder, '../browser');
  const indexHtml = join(serverDistFolder, 'index.server.html');

  const commonEngine = new CommonEngine();

  // Der Showroom zeigt den laufenden Bestand. Prerendert wird er trotzdem —
  // nur so steht er mit canonical und hreflang im Build-Ergebnis, aus dem
  // scripts/generate-sitemap.mjs die Sitemap ableitet. Ausgeliefert wird er
  // aber IMMER frisch gerendert.
  //
  // Sonst friert der Bestand auf den Build-Tag ein: CommonEngine liefert eine
  // prerenderte Seite unveraendert aus, und weil provideClientHydration() den
  // HTTP-Transfer-Cache mitbringt, uebernimmt der Browser auch die damals
  // eingebackene API-Antwort, statt neu zu laden. Genau das ist passiert —
  // nach dem Abschalten der Kleinanzeigen lieferte die API 0 Anzeigen, im
  // Showroom standen weiter die 158 vom Build-Tag.
  //
  // Der Griff dazu: CommonEngine greift nur auf die prerenderte Datei zurueck,
  // wenn es den Pfad zum Dokument kennt (retrieveSSGPage). Uebergibt man den
  // Inhalt stattdessen direkt als `document`, rendert es neu.
  const LIVE_RENDER = /^\/(?:de|en|fr|tr)\/showroom\/?$/;
  const indexHtmlContent = readFileSync(indexHtml, 'utf-8');

  server.set('view engine', 'html');
  server.set('views', browserDistFolder);

  // www → non-www canonical redirect (301 Permanent)
  server.use((req, res, next) => {
    const host = req.headers.host ?? '';
    if (host.startsWith('www.')) {
      const canonicalHost = host.slice(4);
      return res.redirect(301, `https://${canonicalHost}${req.url}`);
    }
    next();
  });

  // Root-level Angular router redirects: override with 301 Permanent
  server.get('/', (_req, res) => res.redirect(301, '/de'));
  server.get('/showroom', (_req, res) => res.redirect(301, '/de/showroom'));
  server.get('/showroom/danke', (_req, res) => res.redirect(301, '/de/showroom/danke'));
  server.get('/showroom/:id', (req, res) => res.redirect(301, `/de/showroom/${req.params['id']}`));

  // Fahrradverleih: jede Sprache hat einen eigenen Slug. Der generische
  // /xx/fahrradverleih (und der deutsche Buchungspfad) wird per 301 auf den
  // lokalisierten Slug umgeleitet, damit keine Duplicate-Content-URLs entstehen.
  for (const [lang, slug] of Object.entries(RENTAL_SLUG_BY_LANGUAGE)) {
    if (lang === 'de' || slug === 'fahrradverleih') continue;
    const bookingSlug = RENTAL_BOOKING_SLUG_BY_LANGUAGE[
      lang as keyof typeof RENTAL_BOOKING_SLUG_BY_LANGUAGE
    ];
    server.get(`/${lang}/fahrradverleih`, (_req, res) => {
      res.redirect(301, `/${lang}/${slug}`);
    });
    server.get(`/${lang}/fahrradverleih/buchen`, (_req, res) => {
      res.redirect(301, `/${lang}/${slug}/${bookingSlug}`);
    });
    server.get(`/${lang}/fahrradverleih/:category`, (req, res) => {
      res.redirect(301, `/${lang}/${slug}/${req.params['category']}`);
    });
  }

  // Bike service: ensure canonical EN/FR slugs are used
  // /en/service → /en/bike-service
  server.get('/en/service', (_req, res) => {
    res.redirect(301, '/en/bike-service');
  });
  // /fr/service → /fr/entretien-velo
  server.get('/fr/service', (_req, res) => {
    res.redirect(301, '/fr/entretien-velo');
  });

  // Rental catalog: ensure canonical EN/FR slugs are used
  // /en/mietfahrraeder → /en/rental-bikes
  server.get('/en/mietfahrraeder', (_req, res) => {
    res.redirect(301, '/en/rental-bikes');
  });
  server.get('/en/mietfahrraeder/:id', (req, res) => {
    res.redirect(301, `/en/rental-bikes/${req.params['id']}`);
  });
  // /fr/mietfahrraeder → /fr/velos-de-location
  server.get('/fr/mietfahrraeder', (_req, res) => {
    res.redirect(301, '/fr/velos-de-location');
  });
  server.get('/fr/mietfahrraeder/:id', (req, res) => {
    res.redirect(301, `/fr/velos-de-location/${req.params['id']}`);
  });

  // Serve static files from /browser
  server.get(
    '*.*',
    express.static(browserDistFolder, {
      maxAge: '1y',
    }),
  );

  // All regular routes use the Angular engine
  server.get('*', (req, res, next) => {
    const { protocol, originalUrl, baseUrl, headers } = req;

    const live = LIVE_RENDER.test(req.path);

    commonEngine
      .render({
        bootstrap,
        ...(live
          ? { document: indexHtmlContent }
          : { documentFilePath: indexHtml }),
        url: `${protocol}://${headers.host}${originalUrl}`,
        publicPath: browserDistFolder,
        providers: [{ provide: APP_BASE_HREF, useValue: baseUrl }],
      })
      .then((html) => {
        // Cache SSR responses for 5 minutes, stale-while-revalidate for 1 hour
        res.set(
          'Cache-Control',
          'public, max-age=300, s-maxage=300, stale-while-revalidate=3600',
        );
        res.send(html);
      })
      .catch((err) => next(err));
  });

  return server;
}

function run(): void {
  const port = process.env['PORT'] || 4000;

  // Start up the Node server
  const server = app();
  server.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

run();
