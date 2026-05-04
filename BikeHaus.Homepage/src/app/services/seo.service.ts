import { Injectable, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { TranslationService, Language } from './translation.service';
import { findArticleBySlug, getBlogBasePath, getBlogSlug } from './blog.data';

const BASE_URL = 'https://bikehausfreiburg.com';
const SUPPORTED_LANGS: Language[] = ['de', 'en', 'fr', 'tr'];
// URL segments that indicate a blog route
const BLOG_SEGMENTS = new Set(['guide', 'ratgeber']);

@Injectable({ providedIn: 'root' })
export class SeoService {
  private document = inject(DOCUMENT);
  private router = inject(Router);
  private translationService = inject(TranslationService);

  init(): void {
    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe((e) => {
        const url = (e as NavigationEnd).urlAfterRedirects;
        this.updateCanonicalAndHreflang(url);
      });
  }

  private updateCanonicalAndHreflang(url: string): void {
    const pathSegments = url.split('/').filter(Boolean);
    const currentLang = pathSegments[0] as Language;
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
    this.document.documentElement.lang = currentLang || 'de';

    // Remove existing hreflang links
    this.document
      .querySelectorAll('link[rel="alternate"][hreflang]')
      .forEach((el) => el.remove());

    // ── Blog article route: /:lang/(guide|ratgeber)/:slug ──
    // Must generate language-specific slug + path for each lang
    if (pathSegments.length === 3 && BLOG_SEGMENTS.has(pathSegments[1])) {
      const slug = pathSegments[2];
      const article = findArticleBySlug(slug, currentLang);
      if (article) {
        for (const lang of SUPPORTED_LANGS) {
          const href = `${BASE_URL}/${lang}/${getBlogBasePath(lang)}/${getBlogSlug(article, lang)}`;
          this.addHreflangLink(lang, href);
        }
        const deSlug = getBlogSlug(article, 'de');
        this.addHreflangLink(
          'x-default',
          `${BASE_URL}/de/${getBlogBasePath('de')}/${deSlug}`,
        );
        this.updateMetaProperty('og:url', canonicalUrl);
        return;
      }
    }

    // ── Blog listing route: /:lang/(guide|ratgeber) ──
    if (pathSegments.length === 2 && BLOG_SEGMENTS.has(pathSegments[1])) {
      for (const lang of SUPPORTED_LANGS) {
        this.addHreflangLink(
          lang,
          `${BASE_URL}/${lang}/${getBlogBasePath(lang)}`,
        );
      }
      this.addHreflangLink(
        'x-default',
        `${BASE_URL}/de/${getBlogBasePath('de')}`,
      );
      this.updateMetaProperty('og:url', canonicalUrl);
      return;
    }

    // ── Default: simple language prefix swap ──
    for (const lang of SUPPORTED_LANGS) {
      const href = pathWithoutLang
        ? `${BASE_URL}/${lang}/${pathWithoutLang}`
        : `${BASE_URL}/${lang}`;
      this.addHreflangLink(lang, href);
    }
    const xDefaultHref = pathWithoutLang
      ? `${BASE_URL}/de/${pathWithoutLang}`
      : `${BASE_URL}/de`;
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
    }
  }
}
