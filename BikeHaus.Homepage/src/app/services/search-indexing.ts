/**
 * EIN Schalter fuer die Sichtbarkeit der Seite in Suchmaschinen.
 *
 * Steht SEARCH_INDEXING_ENABLED auf false, meldet JEDE Seite `noindex` —
 * unabhaengig davon, was die einzelne Komponente sonst setzen wuerde. Die
 * Seite bleibt vollstaendig erreichbar und unveraendert, sie verschwindet
 * nur aus Google, Bing & Co.
 *
 * Warum `follow` und nicht `nofollow`: Damit Google die Seiten wirklich aus
 * dem Index wirft, muss es den noindex-Hinweis auf JEDER Seite auch sehen.
 * Dazu muss es den internen Links weiter folgen duerfen. `nofollow` wuerde
 * genau diese Entdeckung bremsen und die Entfernung in die Laenge ziehen.
 * Aus demselben Grund steht in robots.txt weiter `Allow: /` — ein
 * `Disallow: /` wuerde das Crawlen unterbinden, der noindex nie gelesen
 * werden und bereits indexierte Seiten blieben auf unbestimmte Zeit drin.
 *
 * noimageindex nimmt zusaetzlich die Fotos aus der Google-Bildersuche.
 *
 * Zurueckdrehen: SEARCH_INDEXING_ENABLED = true. Jede Seite meldet dann
 * wieder genau den Wert, den sie vorher hatte (siehe robotsFor()), und die
 * Sitemap fuellt sich beim naechsten Build von selbst. Weitere Schritte und
 * die noetige Handarbeit in der Search Console: SEO-DEINDEX.md.
 */
export const SEARCH_INDEXING_ENABLED = false;

/** Robots-Direktive, solange die Seite aus dem Index genommen wird. */
export const ROBOTS_DEINDEX = 'noindex, follow, noimageindex';

/**
 * Gibt `indexable` zurueck, solange Indexierung erlaubt ist, sonst
 * ROBOTS_DEINDEX. Aufrufseiten behalten so ihren Original-Wert dokumentiert.
 */
export function robotsFor(indexable: string): string {
  return SEARCH_INDEXING_ENABLED ? indexable : ROBOTS_DEINDEX;
}
