import { Injectable, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { TranslationService, Language } from './translation.service';
import {
  DEFAULT_LANGUAGE,
  OG_LOCALE_BY_LANGUAGE,
  SUPPORTED_LANGUAGES,
  getLanguageDirection,
  isSupportedLanguage,
} from './language-config';

const BASE_URL = 'https://bikehausfreiburg.com';
// URL segments that indicate a blog route
const BLOG_SEGMENTS = new Set(['guide', 'ratgeber']);
// Inline helper – avoids pulling blog.data.ts into the initial bundle
function getBlogBasePath(lang: Language): string {
  return lang === 'de' || lang === 'tr' ? 'ratgeber' : 'guide';
}
// Rental page uses language-specific slugs
const RENTAL_SEGMENTS = new Set(['bike-rental', 'fahrradverleih', 'location-velo']);
function getRentalPath(lang: string): string {
  if (lang === 'en') return 'bike-rental';
  if (lang === 'fr') return 'location-velo';
  return 'fahrradverleih';
}
// Rental bike catalog (listing) — uses language-specific slugs
const RENTAL_CATALOG_SEGMENTS = new Set([
  'mietfahrraeder',
  'rental-bikes',
  'velos-de-location',
]);
function getRentalCatalogPath(lang: string): string {
  if (lang === 'en') return 'rental-bikes';
  if (lang === 'fr') return 'velos-de-location';
  return 'mietfahrraeder';
}
// KI-Fahrradberater — uses language-specific slugs
const KI_BERATER_SEGMENTS = new Set([
  'ki-berater',
  'ai-bike-adviser',
  'conseiller-velo',
]);
function getKiBeraterPath(lang: string): string {
  if (lang === 'en') return 'ai-bike-adviser';
  if (lang === 'fr') return 'conseiller-velo';
  return 'ki-berater';
}
// Fahrrad-Service — uses language-specific slugs
const SERVICE_SEGMENTS = new Set(['service', 'bike-service', 'entretien-velo']);
function getServicePath(lang: string): string {
  if (lang === 'en') return 'bike-service';
  if (lang === 'fr') return 'entretien-velo';
  return 'service';
}

@Injectable({ providedIn: 'root' })
export class SeoService {
  private document = inject(DOCUMENT);
  private router = inject(Router);
  private translationService = inject(TranslationService);

  init(): void {
    // Update SEO for the current route immediately on init
    const currentUrl = this.router.url || '/de';
    this.updateCanonicalAndHreflang(currentUrl);

    // Then listen for future navigation events
    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe((e) => {
        const url = (e as NavigationEnd).urlAfterRedirects;
        this.updateCanonicalAndHreflang(url);
      });
  }

  private updateCanonicalAndHreflang(url: string): void {
    const pathSegments = url.split('/').filter(Boolean);
    const currentLang = isSupportedLanguage(pathSegments[0])
      ? pathSegments[0]
      : DEFAULT_LANGUAGE;
    const pathWithoutLang = pathSegments.slice(1).join('/');

    // Update canonical
    const canonicalUrl = `${BASE_URL}${url}`;
    let canonical = this.document.querySelector(
      'link[rel="canonical"]',
    ) as HTMLLinkElement;
    if (canonical) {
      canonical.href = canonicalUrl;
    } else {
      canonical = this.document.createElement('link');
      canonical.rel = 'canonical';
      canonical.href = canonicalUrl;
      this.document.head.appendChild(canonical);
    }

    // Update html lang attribute
    this.document.documentElement.lang = currentLang;
    this.document.documentElement.dir = getLanguageDirection(currentLang);
    this.updateOgLocaleTags(currentLang);

    // Remove existing hreflang links
    this.document
      .querySelectorAll('link[rel="alternate"][hreflang]')
      .forEach((el) => el.remove());

    // ── Blog article route: /:lang/(guide|ratgeber)/:slug ──
    // Hreflang is handled by RatgeberDetailComponent (which already imports blog.data).
    // Here we only update og:url and let the component set language-specific hreflang.
    if (pathSegments.length === 3 && BLOG_SEGMENTS.has(pathSegments[1])) {
      this.updateMetaProperty('og:url', canonicalUrl);
      return;
    }

    // ── Rental page: /:lang/(bike-rental|fahrradverleih) ──
    // EN uses /en/bike-rental; all other langs use /xx/fahrradverleih
    if (pathSegments.length === 2 && RENTAL_SEGMENTS.has(pathSegments[1])) {
      for (const lang of SUPPORTED_LANGUAGES) {
        this.addHreflangLink(lang, `${BASE_URL}/${lang}/${getRentalPath(lang)}`);
      }
      this.addHreflangLink('x-default', `${BASE_URL}/${DEFAULT_LANGUAGE}/fahrradverleih`);
      this.updateMetaProperty('og:url', canonicalUrl);
      return;
    }

    // ── Rental catalog (list): /:lang/(mietfahrraeder|rental-bikes|velos-de-location) ──
    if (
      pathSegments.length === 2 &&
      RENTAL_CATALOG_SEGMENTS.has(pathSegments[1])
    ) {
      for (const lang of SUPPORTED_LANGUAGES) {
        this.addHreflangLink(
          lang,
          `${BASE_URL}/${lang}/${getRentalCatalogPath(lang)}`,
        );
      }
      this.addHreflangLink(
        'x-default',
        `${BASE_URL}/${DEFAULT_LANGUAGE}/mietfahrraeder`,
      );
      this.updateMetaProperty('og:url', canonicalUrl);
      return;
    }

    // ── Rental catalog (detail): /:lang/(mietfahrraeder|rental-bikes|velos-de-location)/:id ──
    if (
      pathSegments.length === 3 &&
      RENTAL_CATALOG_SEGMENTS.has(pathSegments[1])
    ) {
      const bikeId = pathSegments[2];
      for (const lang of SUPPORTED_LANGUAGES) {
        this.addHreflangLink(
          lang,
          `${BASE_URL}/${lang}/${getRentalCatalogPath(lang)}/${bikeId}`,
        );
      }
      this.addHreflangLink(
        'x-default',
        `${BASE_URL}/${DEFAULT_LANGUAGE}/mietfahrraeder/${bikeId}`,
      );
      this.updateMetaProperty('og:url', canonicalUrl);
      return;
    }

    // ── KI-Fahrradberater: /:lang/(ki-berater|ai-bike-adviser|conseiller-velo) ──
    if (pathSegments.length === 2 && KI_BERATER_SEGMENTS.has(pathSegments[1])) {
      for (const lang of SUPPORTED_LANGUAGES) {
        this.addHreflangLink(lang, `${BASE_URL}/${lang}/${getKiBeraterPath(lang)}`);
      }
      this.addHreflangLink('x-default', `${BASE_URL}/${DEFAULT_LANGUAGE}/ki-berater`);
      this.updateMetaProperty('og:url', canonicalUrl);
      return;
    }

    // ── Fahrrad-Service: /:lang/(service|bike-service|entretien-velo) ──
    if (pathSegments.length === 2 && SERVICE_SEGMENTS.has(pathSegments[1])) {
      // Consolidate any non-canonical service slug onto the language canonical.
      const canonicalServiceUrl = `${BASE_URL}/${currentLang}/${getServicePath(currentLang)}`;
      canonical.href = canonicalServiceUrl;
      for (const lang of SUPPORTED_LANGUAGES) {
        this.addHreflangLink(lang, `${BASE_URL}/${lang}/${getServicePath(lang)}`);
      }
      this.addHreflangLink('x-default', `${BASE_URL}/${DEFAULT_LANGUAGE}/service`);
      this.updateMetaProperty('og:url', canonicalServiceUrl);
      return;
    }

    // ── Blog listing route: /:lang/(guide|ratgeber) ──
    if (pathSegments.length === 2 && BLOG_SEGMENTS.has(pathSegments[1])) {
      for (const lang of SUPPORTED_LANGUAGES) {
        this.addHreflangLink(
          lang,
          `${BASE_URL}/${lang}/${getBlogBasePath(lang)}`,
        );
      }
      this.addHreflangLink(
        'x-default',
        `${BASE_URL}/${DEFAULT_LANGUAGE}/${getBlogBasePath(DEFAULT_LANGUAGE)}`,
      );
      this.updateMetaProperty('og:url', canonicalUrl);
      return;
    }

    // ── Default: simple language prefix swap ──
    for (const lang of SUPPORTED_LANGUAGES) {
      const href = pathWithoutLang
        ? `${BASE_URL}/${lang}/${pathWithoutLang}`
        : `${BASE_URL}/${lang}`;
      this.addHreflangLink(lang, href);
    }
    const xDefaultHref = pathWithoutLang
      ? `${BASE_URL}/${DEFAULT_LANGUAGE}/${pathWithoutLang}`
      : `${BASE_URL}/${DEFAULT_LANGUAGE}`;
    this.addHreflangLink('x-default', xDefaultHref);
    this.updateMetaProperty('og:url', canonicalUrl);
  }

  private addHreflangLink(hreflang: string, href: string): void {
    const link = this.document.createElement('link');
    link.rel = 'alternate';
    link.setAttribute('hreflang', hreflang);
    link.href = href;
    this.document.head.appendChild(link);
  }

  private updateMetaProperty(property: string, content: string): void {
    let meta = this.document.querySelector(
      `meta[property="${property}"]`,
    ) as HTMLMetaElement;
    if (meta) {
      meta.content = content;
      return;
    }

    meta = this.document.createElement('meta');
    meta.setAttribute('property', property);
    meta.content = content;
    this.document.head.appendChild(meta);
  }

  private updateOgLocaleTags(currentLang: Language): void {
    this.updateMetaProperty('og:locale', OG_LOCALE_BY_LANGUAGE[currentLang]);

    this.document
      .querySelectorAll('meta[property="og:locale:alternate"]')
      .forEach((el) => el.remove());

    for (const lang of SUPPORTED_LANGUAGES) {
      if (lang === currentLang) {
        continue;
      }

      const meta = this.document.createElement('meta');
      meta.setAttribute('property', 'og:locale:alternate');
      meta.content = OG_LOCALE_BY_LANGUAGE[lang];
      this.document.head.appendChild(meta);
    }
  }
}
