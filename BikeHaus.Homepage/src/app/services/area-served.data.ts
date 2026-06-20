// ── Local-SEO areaServed ──────────────────────────────────────────────
// The cities/region Bike Haus Freiburg serves around Freiburg. Mirrors the
// LocalBusiness "areaServed" in src/index.html so the Service schema on the
// service & rental pages carries the same local-reach signal as the homepage
// business node. Keep in sync with index.html (static HTML, can't import this).
export const AREA_SERVED: ReadonlyArray<{
  '@type': string;
  name: string;
  sameAs?: string;
}> = [
  {
    '@type': 'City',
    name: 'Freiburg im Breisgau',
    sameAs: 'https://de.wikipedia.org/wiki/Freiburg_im_Breisgau',
  },
  { '@type': 'City', name: 'Emmendingen' },
  { '@type': 'City', name: 'Bad Krozingen' },
  { '@type': 'City', name: 'Breisach am Rhein' },
  { '@type': 'City', name: 'March' },
  { '@type': 'City', name: 'Gundelfingen' },
  { '@type': 'City', name: 'Merzhausen' },
  { '@type': 'City', name: 'Au' },
  { '@type': 'City', name: 'Denzlingen' },
  { '@type': 'City', name: 'Waldkirch' },
  { '@type': 'City', name: 'Staufen im Breisgau' },
  { '@type': 'City', name: 'Kirchzarten' },
  { '@type': 'City', name: 'Müllheim' },
  { '@type': 'City', name: 'Titisee-Neustadt' },
  { '@type': 'AdministrativeArea', name: 'Breisgau-Hochschwarzwald' },
];
