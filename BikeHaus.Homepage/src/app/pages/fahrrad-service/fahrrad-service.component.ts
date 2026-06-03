import {
  Component,
  inject,
  OnInit,
  OnDestroy,
  computed,
  effect,
} from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { TranslationService } from '../../services/translation.service';
import {
  SERVICE_CONTENT,
  ServiceTranslation,
} from '../../services/service-landing.data';

const BASE_URL = 'https://bikehausfreiburg.com';

// Canonical slug per language (mirrors the rental-page slug strategy).
function getServiceSlug(lang: string): string {
  if (lang === 'en') return 'bike-service';
  if (lang === 'fr') return 'entretien-velo';
  return 'service';
}

@Component({
  selector: 'app-fahrrad-service',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    @if (t(); as s) {
      <div class="service-page">
        <!-- Breadcrumb -->
        <nav class="breadcrumb" aria-label="Breadcrumb">
          <div class="container">
            <a [routerLink]="['/' + lang()]">{{ tr().home }}</a>
            <span class="sep">/</span>
            <span class="current">{{ s.heroTitle }}</span>
          </div>
        </nav>

        <!-- Hero -->
        <header class="service-hero">
          <div class="container">
            <h1>{{ s.heroTitle }}</h1>
            <p class="hero-sub">{{ s.heroSub }}</p>
            <div class="hero-badges">
              @for (b of s.badges; track $index) {
                <span class="badge">{{ b }}</span>
              }
            </div>
          </div>
        </header>

        <!-- Intro -->
        <section class="service-section">
          <div class="container">
            <h2>{{ s.introHeading }}</h2>
            <p class="intro-text">{{ s.introText }}</p>
          </div>
        </section>

        <!-- Services -->
        <section class="service-section service-list-section">
          <div class="container">
            <h2>{{ s.servicesHeading }}</h2>
            <ul class="check-list">
              @for (item of s.services; track $index) {
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

        <!-- Process -->
        <section class="service-section">
          <div class="container">
            <h2>{{ s.processHeading }}</h2>
            <ol class="process-list">
              @for (step of s.processSteps; track $index) {
                <li>
                  <span class="step-num">{{ $index + 1 }}</span>
                  <span class="step-text">{{ step }}</span>
                </li>
              }
            </ol>
          </div>
        </section>

        <!-- FAQ -->
        <section class="service-section">
          <div class="container">
            <h2>{{ s.faqHeading }}</h2>
            <div class="faq-list">
              @for (f of s.faq; track $index) {
                <details class="faq-item">
                  <summary>{{ f.q }}</summary>
                  <p>{{ f.a }}</p>
                </details>
              }
            </div>
          </div>
        </section>

        <!-- CTA -->
        <section class="service-section service-cta">
          <div class="container">
            <h2>{{ s.ctaHeading }}</h2>
            <p>{{ s.ctaText }}</p>
            <div class="cta-actions">
              <a
                href="https://wa.me/4915566300011"
                target="_blank"
                rel="noopener"
                class="btn-whatsapp"
              >
                WhatsApp
              </a>
              <a
                [routerLink]="['/' + lang(), 'contact']"
                class="btn-secondary-outline"
                >{{ tr().contact }}</a
              >
            </div>
          </div>
        </section>
      </div>
    }
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .service-page {
        min-height: 100vh;
        padding-bottom: 4rem;
      }
      .container {
        max-width: 860px;
        margin: 0 auto;
        padding: 0 1.5rem;
      }

      .breadcrumb {
        padding: 1rem 0;
        font-size: 0.8rem;
        color: #666;
        border-bottom: 1px solid var(--color-border, #222);
      }
      .breadcrumb a {
        color: var(--color-text-secondary, #aaa);
        text-decoration: none;
      }
      .breadcrumb a:hover {
        color: var(--color-accent, #ff5722);
      }
      .breadcrumb .sep {
        margin: 0 0.4rem;
        color: #444;
      }
      .breadcrumb .current {
        color: var(--color-text, #fff);
      }

      .service-hero {
        padding: 3rem 0 2.5rem;
        border-bottom: 1px solid var(--color-border, #222);
      }
      .service-hero h1 {
        font-size: 2.2rem;
        font-weight: 800;
        color: var(--color-text, #fff);
        margin: 0 0 0.7rem;
        line-height: 1.2;
      }
      .hero-sub {
        color: var(--color-text-secondary, #aaa);
        font-size: 1.1rem;
        line-height: 1.6;
        margin: 0 0 1.2rem;
      }
      .hero-badges {
        display: flex;
        gap: 0.75rem;
        flex-wrap: wrap;
      }
      .badge {
        background: var(--color-surface, #111);
        border: 1px solid var(--color-border, #222);
        border-radius: 8px;
        padding: 0.4rem 0.9rem;
        font-size: 0.85rem;
        color: var(--color-text, #fff);
      }

      .service-section {
        padding: 2.5rem 0 0;
      }
      .service-section h2 {
        font-size: 1.4rem;
        font-weight: 700;
        color: var(--color-text, #fff);
        margin: 0 0 1rem;
      }
      .intro-text {
        color: var(--color-text-secondary, #ccc);
        font-size: 1rem;
        line-height: 1.8;
        margin: 0;
      }

      .check-list {
        list-style: none;
        padding: 0;
        margin: 0;
      }
      .check-list li {
        display: flex;
        align-items: flex-start;
        gap: 0.7rem;
        padding: 0.6rem 0;
        color: var(--color-text-secondary, #ccc);
        font-size: 0.95rem;
        line-height: 1.5;
        border-bottom: 1px solid var(--color-border, #151515);
      }
      .check-list li:last-child {
        border-bottom: none;
      }
      .check-list svg {
        flex-shrink: 0;
        margin-top: 2px;
      }

      .process-list {
        list-style: none;
        padding: 0;
        margin: 0;
        counter-reset: step;
      }
      .process-list li {
        display: flex;
        align-items: flex-start;
        gap: 0.9rem;
        padding: 0.6rem 0;
        color: var(--color-text-secondary, #ccc);
        font-size: 0.95rem;
        line-height: 1.5;
      }
      .step-num {
        flex-shrink: 0;
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background: var(--color-accent, #ff5722);
        color: #fff;
        font-weight: 700;
        font-size: 0.85rem;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .step-text {
        padding-top: 3px;
      }

      .faq-list {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }
      .faq-item {
        background: var(--color-surface, #111);
        border: 1px solid var(--color-border, #222);
        border-radius: 10px;
        padding: 0.9rem 1.1rem;
      }
      .faq-item summary {
        cursor: pointer;
        font-weight: 600;
        color: var(--color-text, #fff);
        font-size: 0.98rem;
        list-style: none;
      }
      .faq-item summary::-webkit-details-marker {
        display: none;
      }
      .faq-item[open] summary {
        margin-bottom: 0.6rem;
      }
      .faq-item p {
        margin: 0;
        color: var(--color-text-secondary, #ccc);
        font-size: 0.93rem;
        line-height: 1.7;
      }

      .service-cta {
        background: var(--color-surface, #0a0a0a);
        border-top: 1px solid var(--color-border, #222);
        padding: 3rem 0;
        margin-top: 2.5rem;
        text-align: center;
      }
      .service-cta p {
        color: var(--color-text-secondary, #ccc);
        font-size: 1rem;
        line-height: 1.7;
        margin: 0 0 1.5rem;
      }
      .cta-actions {
        display: flex;
        gap: 1rem;
        justify-content: center;
        flex-wrap: wrap;
      }
      .btn-whatsapp {
        padding: 0.75rem 1.5rem;
        background: #25d366;
        color: #fff;
        border-radius: 8px;
        text-decoration: none;
        font-weight: 600;
        font-size: 0.95rem;
      }
      .btn-secondary-outline {
        padding: 0.75rem 1.5rem;
        border: 1px solid var(--color-border, #444);
        color: var(--color-text, #fff);
        border-radius: 8px;
        text-decoration: none;
        font-weight: 600;
        font-size: 0.95rem;
        transition: border-color 0.2s;
      }
      .btn-secondary-outline:hover {
        border-color: var(--color-accent, #ff5722);
      }

      @media (max-width: 600px) {
        .service-hero h1 {
          font-size: 1.6rem;
        }
        .cta-actions {
          flex-direction: column;
          align-items: center;
        }
      }
    `,
  ],
})
export class FahrradServiceComponent implements OnInit, OnDestroy {
  private meta = inject(Meta);
  private title = inject(Title);
  private ts = inject(TranslationService);
  private doc = inject(DOCUMENT);

  lang = this.ts.currentLanguage;
  tr = this.ts.translations;
  t = computed<ServiceTranslation>(
    () => SERVICE_CONTENT[this.lang()] ?? SERVICE_CONTENT.en,
  );

  private schemaEl?: HTMLScriptElement;

  private metaEffect = effect(() => {
    const s = this.t();
    this.title.setTitle(s.metaTitle);
    this.meta.updateTag({ name: 'description', content: s.metaDescription });
  });

  ngOnInit(): void {
    this.meta.updateTag({ name: 'robots', content: 'index, follow' });
    this.injectSchema();
  }

  ngOnDestroy(): void {
    this.schemaEl?.remove();
  }

  private injectSchema(): void {
    const lang = this.lang();
    const s = SERVICE_CONTENT[lang] ?? SERVICE_CONTENT.en;
    const url = `${BASE_URL}/${lang}/${getServiceSlug(lang)}`;

    const localBusiness = {
      '@type': 'LocalBusiness',
      '@id': `${BASE_URL}/#localbusiness`,
      name: 'Bike Haus Freiburg',
      image: `${BASE_URL}/assets/images/og-image.jpg`,
      telephone: '+4915566300011',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Heckerstraße 27',
        addressLocality: 'Freiburg im Breisgau',
        postalCode: '79114',
        addressCountry: 'DE',
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: 47.9877,
        longitude: 7.8194,
      },
      availableLanguage: ['German', 'English', 'French', 'Turkish'],
    };

    const schema = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Service',
          '@id': `${url}#service`,
          name: s.heroTitle,
          serviceType: s.heroTitle,
          description: s.metaDescription,
          url,
          areaServed: {
            '@type': 'City',
            name: 'Freiburg im Breisgau',
          },
          provider: localBusiness,
          hasOfferCatalog: {
            '@type': 'OfferCatalog',
            name: s.servicesHeading,
            itemListElement: s.services.map((name) => ({
              '@type': 'Offer',
              itemOffered: { '@type': 'Service', name },
            })),
          },
        },
        {
          '@type': 'FAQPage',
          '@id': `${url}#faq`,
          mainEntity: s.faq.map((f) => ({
            '@type': 'Question',
            name: f.q,
            acceptedAnswer: { '@type': 'Answer', text: f.a },
          })),
        },
        {
          '@type': 'BreadcrumbList',
          '@id': `${url}#breadcrumb`,
          itemListElement: [
            {
              '@type': 'ListItem',
              position: 1,
              name: this.tr().home,
              item: `${BASE_URL}/${lang}`,
            },
            {
              '@type': 'ListItem',
              position: 2,
              name: s.heroTitle,
              item: url,
            },
          ],
        },
      ],
    };

    const el = this.doc.createElement('script');
    el.id = 'service-schema';
    el.type = 'application/ld+json';
    el.textContent = JSON.stringify(schema);
    this.doc.head.appendChild(el);
    this.schemaEl = el;
  }
}
