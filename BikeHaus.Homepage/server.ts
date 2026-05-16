import { APP_BASE_HREF } from '@angular/common';
import { CommonEngine } from '@angular/ssr';
import express from 'express';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import bootstrap from './src/main.server';

// The Express app is exported so that it can be used by serverless Functions.
export function app(): express.Express {
  const server = express();
  const serverDistFolder = dirname(fileURLToPath(import.meta.url));
  const browserDistFolder = resolve(serverDistFolder, '../browser');
  const indexHtml = join(serverDistFolder, 'index.server.html');

  const commonEngine = new CommonEngine();

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

  // /en/fahrradverleih → /en/bike-rental (canonical EN slug)
  server.get('/en/fahrradverleih', (_req, res) => {
    res.redirect(301, '/en/bike-rental');
  });

  // /fr/fahrradverleih → /fr/location-velo (canonical FR slug)
  server.get('/fr/fahrradverleih', (_req, res) => {
    res.redirect(301, '/fr/location-velo');
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

    commonEngine
      .render({
        bootstrap,
        documentFilePath: indexHtml,
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
