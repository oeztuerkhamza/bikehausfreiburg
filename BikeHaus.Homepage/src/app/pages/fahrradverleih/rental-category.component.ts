import {
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { TranslationService } from '../../services/translation.service';
import { getRentalBookingPath } from '../../services/language-config';
import {
  RENTAL_CATEGORIES,
  RentalCategory,
  RentalCategoryContent,
  findCategoryBySlug,
} from './rental-category-content';

@Component({
  selector: 'app-rental-category',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    @if (content(); as c) {
      @if (category(); as cat) {
        <article class="rc-page">
          <!-- Breadcrumb -->
          <nav class="rc-breadcrumb" aria-label="Breadcrumb">
            <div class="rc-container">
              <a [routerLink]="['/' + lang()]">{{ t().home }}</a>
              <span class="rc-sep">/</span>
              <a [routerLink]="['/' + lang() + '/' + parentSlug()]">
                {{ t().bikeRental }}
              </a>
              <span class="rc-sep">/</span>
              <span class="rc-current">{{ c.breadcrumbLabel }}</span>
            </div>
          </nav>

          <!-- Hero -->
          <header class="rc-hero">
            <div class="rc-container">
              <h1>{{ c.heroTitle }}</h1>
              <p class="rc-hero-sub">{{ c.heroSub }}</p>
              <div class="rc-hero-badges">
                @for (badge of c.heroBadges; track $index) {
                  <span class="rc-badge">{{ badge }}</span>
                }
              </div>
              <div class="rc-hero-actions">
                <a [routerLink]="bookingPath()" class="rc-btn-primary">
                  {{ c.ctaButton }}
                </a>
                <a
                  [routerLink]="['/' + lang() + '/' + catalogSlug()]"
                  class="rc-btn-secondary"
                >
                  {{ c.secondaryCtaButton }}
                </a>
              </div>
            </div>
          </header>

          <!-- Intro -->
          <section class="rc-section">
            <div class="rc-container">
              <h2>{{ c.introHeading }}</h2>
              @for (para of c.introText; track $index) {
                <p class="rc-text">{{ para }}</p>
              }
            </div>
          </section>

          <!-- Features grid -->
          <section class="rc-section rc-features">
            <div class="rc-container">
              <h2>{{ c.featuresHeading }}</h2>
              <div class="rc-feature-grid">
                @for (feat of c.features; track $index) {
                  <div class="rc-feature-card">
                    <h3>{{ feat.title }}</h3>
                    <p>{{ feat.text }}</p>
                  </div>
                }
              </div>
            </div>
          </section>

          <!-- Why -->
          <section class="rc-section">
            <div class="rc-container">
              <h2>{{ c.whyHeading }}</h2>
              <ul class="rc-check-list">
                @for (item of c.whyItems; track $index) {
                  <li>
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#4caf50"
                      stroke-width="2.5"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    {{ item }}
                  </li>
                }
              </ul>
            </div>
          </section>

          <!-- Pricing -->
          <section class="rc-section rc-pricing">
            <div class="rc-container">
              <h2>{{ c.pricingHeading }}</h2>
              <p class="rc-text">{{ c.pricingText }}</p>
              <ul class="rc-price-list">
                @for (item of c.pricingItems; track $index) {
                  <li>{{ item }}</li>
                }
              </ul>
            </div>
          </section>

          <!-- FAQ -->
          <section class="rc-section rc-faq">
            <div class="rc-container">
              <h2>{{ c.faqHeading }}</h2>
              <div class="rc-faq-list">
                @for (item of c.faq; track $index) {
                  <details class="rc-faq-item">
                    <summary>{{ item.q }}</summary>
                    <p>{{ item.a }}</p>
                  </details>
                }
              </div>
            </div>
          </section>

          <!-- CTA -->
          <section class="rc-section rc-cta">
            <div class="rc-container">
              <h2>{{ c.ctaHeading }}</h2>
              <p>{{ c.ctaText }}</p>
              <div class="rc-cta-actions">
                <a [routerLink]="bookingPath()" class="rc-btn-primary">
                  {{ c.ctaButton }}
                </a>
                <a
                  href="https://wa.me/4915566300011"
                  target="_blank"
                  rel="noopener"
                  class="rc-btn-whatsapp"
                >
                  WhatsApp
                </a>
              </div>
            </div>
          </section>

          <!-- Related rental categories -->
          <section class="rc-section rc-related">
            <div class="rc-container">
              <h2>{{ t().rentalLinksTitle }}</h2>
              <ul class="rc-related-list">
                @for (other of otherCategories(); track other.id) {
                  <li>
                    <a
                      [routerLink]="[
                        '/' + lang() + '/' + parentSlug() + '/' + other.slugs[lang()]
                      ]"
                    >
                      {{ other.translations[lang()].breadcrumbLabel }}
                    </a>
                  </li>
                }
                <li>
                  <a [routerLink]="['/' + lang() + '/' + catalogSlug()]">
                    {{ t().rentalLinkCatalog }}
                  </a>
                </li>
              </ul>
            </div>
          </section>
        </article>
      }
    }
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .rc-page {
        min-height: 100vh;
        padding-bottom: 4rem;
      }
      .rc-container {
        max-width: 860px;
        margin: 0 auto;
        padding: 0 1.5rem;
      }

      /* Breadcrumb */
      .rc-breadcrumb {
        padding: 1rem 0;
        font-size: 0.85rem;
        color: #666;
        border-bottom: 1px solid var(--color-border, #222);
      }
      .rc-breadcrumb a {
        color: var(--color-text-secondary, #aaa);
        text-decoration: none;
      }
      .rc-breadcrumb a:hover {
        color: var(--color-accent, #ff5722);
      }
      .rc-breadcrumb .rc-sep {
        margin: 0 0.4rem;
        color: #444;
      }
      .rc-breadcrumb .rc-current {
        color: var(--color-text, #fff);
      }

      /* Hero */
      .rc-hero {
        padding: 3rem 0 2.5rem;
        border-bottom: 1px solid var(--color-border, #222);
      }
      .rc-hero h1 {
        font-size: 2.2rem;
        font-weight: 800;
        color: var(--color-text, #fff);
        margin: 0 0 0.8rem;
        line-height: 1.2;
      }
      .rc-hero-sub {
        color: var(--color-text-secondary, #aaa);
        font-size: 1.1rem;
        line-height: 1.6;
        margin: 0 0 1.4rem;
      }
      .rc-hero-badges {
        display: flex;
        gap: 0.6rem;
        flex-wrap: wrap;
        margin-bottom: 1.6rem;
      }
      .rc-badge {
        background: var(--color-surface, #111);
        border: 1px solid var(--color-border, #222);
        border-radius: 8px;
        padding: 0.45rem 0.9rem;
        font-size: 0.88rem;
        color: var(--color-text, #fff);
      }
      .rc-hero-actions {
        display: flex;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      /* Buttons */
      .rc-btn-primary {
        display: inline-block;
        background: var(--color-accent, #ff5722);
        color: #fff;
        padding: 0.85rem 1.6rem;
        border-radius: 10px;
        font-weight: 600;
        text-decoration: none;
        font-size: 0.95rem;
        transition: opacity 0.2s;
      }
      .rc-btn-primary:hover {
        opacity: 0.9;
      }
      .rc-btn-secondary {
        display: inline-block;
        background: transparent;
        color: var(--color-text, #fff);
        border: 1px solid var(--color-border, #444);
        padding: 0.85rem 1.6rem;
        border-radius: 10px;
        font-weight: 600;
        text-decoration: none;
        font-size: 0.95rem;
      }
      .rc-btn-secondary:hover {
        background: var(--color-surface, #111);
      }
      .rc-btn-whatsapp {
        display: inline-block;
        background: #25d366;
        color: #fff;
        padding: 0.85rem 1.6rem;
        border-radius: 10px;
        font-weight: 600;
        text-decoration: none;
        font-size: 0.95rem;
      }

      /* Sections */
      .rc-section {
        padding: 2.5rem 0 0;
      }
      .rc-section h2 {
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--color-text, #fff);
        margin: 0 0 1rem;
      }
      .rc-text {
        color: var(--color-text-secondary, #ccc);
        font-size: 1rem;
        line-height: 1.8;
        margin: 0 0 1rem;
      }

      /* Features grid */
      .rc-feature-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
        gap: 1rem;
      }
      .rc-feature-card {
        background: var(--color-surface, #111);
        border: 1px solid var(--color-border, #222);
        border-radius: 12px;
        padding: 1.2rem 1.3rem;
      }
      .rc-feature-card h3 {
        margin: 0 0 0.5rem;
        font-size: 1rem;
        color: var(--color-text, #fff);
      }
      .rc-feature-card p {
        margin: 0;
        color: var(--color-text-secondary, #ccc);
        font-size: 0.92rem;
        line-height: 1.6;
      }

      /* Check list */
      .rc-check-list {
        list-style: none;
        padding: 0;
        margin: 0;
      }
      .rc-check-list li {
        display: flex;
        align-items: flex-start;
        gap: 0.7rem;
        padding: 0.6rem 0;
        color: var(--color-text-secondary, #ccc);
        font-size: 0.95rem;
        line-height: 1.5;
        border-bottom: 1px solid var(--color-border, #151515);
      }
      .rc-check-list li:last-child {
        border-bottom: none;
      }
      .rc-check-list svg {
        flex-shrink: 0;
        margin-top: 2px;
      }

      /* Pricing */
      .rc-pricing {
        background: rgba(255, 87, 34, 0.03);
        border-radius: 12px;
        padding: 2rem 0;
      }
      .rc-price-list {
        list-style: none;
        padding: 0;
        margin: 0;
      }
      .rc-price-list li {
        background: var(--color-surface, #111);
        border: 1px solid var(--color-border, #222);
        border-radius: 8px;
        padding: 0.8rem 1.1rem;
        margin-bottom: 0.5rem;
        color: var(--color-text, #fff);
        font-size: 0.95rem;
        font-weight: 500;
      }

      /* FAQ */
      .rc-faq-list {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }
      .rc-faq-item {
        background: var(--color-surface, #111);
        border: 1px solid var(--color-border, #222);
        border-radius: 10px;
        padding: 0.9rem 1.2rem;
      }
      .rc-faq-item summary {
        cursor: pointer;
        font-weight: 600;
        color: var(--color-text, #fff);
        font-size: 0.95rem;
        list-style: none;
        position: relative;
        padding-right: 1.5rem;
      }
      .rc-faq-item summary::marker,
      .rc-faq-item summary::-webkit-details-marker {
        display: none;
      }
      .rc-faq-item summary::after {
        content: '+';
        position: absolute;
        right: 0;
        top: 0;
        font-size: 1.3rem;
        color: var(--color-accent, #ff5722);
        transition: transform 0.2s;
      }
      .rc-faq-item[open] summary::after {
        transform: rotate(45deg);
      }
      .rc-faq-item p {
        margin: 0.8rem 0 0;
        color: var(--color-text-secondary, #ccc);
        font-size: 0.92rem;
        line-height: 1.7;
      }

      /* CTA */
      .rc-cta {
        text-align: center;
        margin-top: 2rem;
      }
      .rc-cta p {
        color: var(--color-text-secondary, #ccc);
        font-size: 1rem;
        line-height: 1.7;
        max-width: 600px;
        margin: 0 auto 1.5rem;
      }
      .rc-cta-actions {
        display: flex;
        gap: 0.75rem;
        justify-content: center;
        flex-wrap: wrap;
      }

      /* Related */
      .rc-related-list {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem 1.5rem;
      }
      .rc-related-list a {
        color: var(--color-accent, #ff5722);
        text-decoration: none;
        font-size: 0.95rem;
      }
      .rc-related-list a:hover {
        text-decoration: underline;
      }

      @media (max-width: 640px) {
        .rc-hero h1 {
          font-size: 1.7rem;
        }
        .rc-hero-sub {
          font-size: 1rem;
        }
        .rc-section h2 {
          font-size: 1.25rem;
        }
      }
    `,
  ],
})
export class RentalCategoryComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private translationService = inject(TranslationService);
  private metaService = inject(Meta);
  private titleService = inject(Title);
  private document = inject(DOCUMENT);
  private schemaEl: HTMLScriptElement | null = null;

  t = this.translationService.translations;
  rawLang = this.translationService.currentLanguage;
  lang = computed(() => {
    const l = this.rawLang();
    return l === 'de' || l === 'en' || l === 'fr' ? l : 'de';
  });

  category = signal<RentalCategory | null>(null);
  content = computed(() => {
    const cat = this.category();
    return cat ? cat.translations[this.lang()] : null;
  });

  parentSlug = computed(() => {
    const l = this.lang();
    if (l === 'en') return 'bike-rental';
    if (l === 'fr') return 'location-velo';
    return 'fahrradverleih';
  });

  catalogSlug = computed(() => {
    const l = this.lang();
    if (l === 'en') return 'rental-bikes';
    if (l === 'fr') return 'velos-de-location';
    return 'mietfahrraeder';
  });

  bookingPath = computed(() => getRentalBookingPath(this.lang()));

  otherCategories = computed(() => {
    const current = this.category();
    return RENTAL_CATEGORIES.filter((c) => c.id !== current?.id);
  });

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const slug = params.get('category') ?? '';
      this.applyCategory(slug);
    });
  }

  private applyCategory(slug: string): void {
    const found = findCategoryBySlug(slug);
    if (!found) return;

    this.category.set(found.category);

    const lang = this.lang();
    const content = found.category.translations[lang];
    const parentSlug =
      lang === 'en' ? 'bike-rental' : lang === 'fr' ? 'location-velo' : 'fahrradverleih';
    const pageUrl = `https://bikehausfreiburg.com/${lang}/${parentSlug}/${found.category.slugs[lang]}`;

    this.titleService.setTitle(content.metaTitle);
    this.metaService.updateTag({ name: 'description', content: content.metaDescription });
    this.metaService.updateTag({ property: 'og:title', content: content.metaTitle });
    this.metaService.updateTag({ property: 'og:description', content: content.metaDescription });
    this.metaService.updateTag({ property: 'og:url', content: pageUrl });
    this.metaService.updateTag({ property: 'og:type', content: 'website' });
    this.metaService.updateTag({
      property: 'og:image',
      content: 'https://bikehausfreiburg.com/assets/images/fahrradverleih-freiburg.jpg',
    });
    this.metaService.updateTag({ property: 'og:image:width', content: '1200' });
    this.metaService.updateTag({ property: 'og:image:height', content: '630' });
    this.metaService.updateTag({
      property: 'og:locale',
      content: lang === 'de' ? 'de_DE' : lang === 'en' ? 'en_GB' : 'fr_FR',
    });
    this.metaService.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.metaService.updateTag({ name: 'twitter:title', content: content.metaTitle });
    this.metaService.updateTag({ name: 'twitter:description', content: content.metaDescription });
    this.metaService.updateTag({
      name: 'twitter:image',
      content: 'https://bikehausfreiburg.com/assets/images/fahrradverleih-freiburg.jpg',
    });

    // Canonical + hreflang
    this.upsertLinkTag('canonical', pageUrl);
    for (const l of ['de', 'en', 'fr'] as const) {
      this.upsertLinkTag(
        'alternate',
        `https://bikehausfreiburg.com/${l}/${
          l === 'en' ? 'bike-rental' : l === 'fr' ? 'location-velo' : 'fahrradverleih'
        }/${found.category.slugs[l]}`,
        l,
      );
    }
    this.upsertLinkTag(
      'alternate',
      `https://bikehausfreiburg.com/de/fahrradverleih/${found.category.slugs.de}`,
      'x-default',
    );

    this.injectSchema(pageUrl, content, found.category);
  }

  private upsertLinkTag(rel: string, href: string, hreflang?: string): void {
    const selector = hreflang
      ? `link[rel="${rel}"][hreflang="${hreflang}"]`
      : `link[rel="${rel}"]`;
    let link = this.document.querySelector<HTMLLinkElement>(selector);
    if (!link) {
      link = this.document.createElement('link');
      link.rel = rel;
      if (hreflang) link.hreflang = hreflang;
      this.document.head.appendChild(link);
    }
    link.href = href;
  }

  private injectSchema(
    pageUrl: string,
    content: RentalCategoryContent,
    category: RentalCategory,
  ): void {
    const existing = this.document.getElementById('rental-category-schema');
    if (existing) existing.remove();

    const schema = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Service',
          '@id': `${pageUrl}#service`,
          name: content.heroTitle,
          description: content.metaDescription,
          serviceType: content.breadcrumbLabel,
          provider: {
            '@type': 'LocalBusiness',
            '@id': 'https://bikehausfreiburg.com/#organization',
            name: 'Bike Haus Freiburg',
            address: {
              '@type': 'PostalAddress',
              streetAddress: 'Heckerstraße 27',
              addressLocality: 'Freiburg im Breisgau',
              postalCode: '79114',
              addressRegion: 'Baden-Württemberg',
              addressCountry: 'DE',
            },
            telephone: '+49-155-66300011',
            url: 'https://bikehausfreiburg.com/de',
          },
          areaServed: { '@type': 'City', name: 'Freiburg im Breisgau' },
          url: pageUrl,
        },
        {
          '@type': 'FAQPage',
          '@id': `${pageUrl}#faq`,
          mainEntity: content.faq.map((item) => ({
            '@type': 'Question',
            name: item.q,
            acceptedAnswer: { '@type': 'Answer', text: item.a },
          })),
        },
        {
          '@type': 'BreadcrumbList',
          '@id': `${pageUrl}#breadcrumb`,
          itemListElement: [
            {
              '@type': 'ListItem',
              position: 1,
              name: 'Bike Haus Freiburg',
              item: `https://bikehausfreiburg.com/${this.lang()}`,
            },
            {
              '@type': 'ListItem',
              position: 2,
              name: this.lang() === 'de'
                ? 'Fahrradverleih'
                : this.lang() === 'en'
                  ? 'Bike Rental'
                  : 'Location vélo',
              item: `https://bikehausfreiburg.com/${this.lang()}/${this.parentSlug()}`,
            },
            {
              '@type': 'ListItem',
              position: 3,
              name: content.breadcrumbLabel,
              item: pageUrl,
            },
          ],
        },
      ],
    };

    const el = this.document.createElement('script');
    el.type = 'application/ld+json';
    el.id = 'rental-category-schema';
    el.textContent = JSON.stringify(schema);
    this.document.head.appendChild(el);
    this.schemaEl = el;
  }
}
