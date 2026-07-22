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
import { getRentalSlug, getRentalBookingPath } from '../../services/language-config';
import {
  BIKE_TOURS_FACTS,
  BIKE_TOURS_TEXT,
  BikeTourFacts,
  BikeToursPageText,
} from '../../services/bike-tours.data';

const BASE_URL = 'https://bikehausfreiburg.com';

@Component({
  selector: 'app-bike-tours',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    @if (tx(); as t) {
      <div class="tours-page">
        <!-- Breadcrumb -->
        <nav class="breadcrumb" aria-label="Breadcrumb">
          <div class="container">
            <a [routerLink]="['/' + lang()]">{{ tr().home }}</a>
            <span class="sep">/</span>
            <span class="current">{{ t.heroTitle }}</span>
          </div>
        </nav>

        <!-- Hero -->
        <header class="tours-hero">
          <div class="container">
            <h1>{{ t.heroTitle }}</h1>
            <p class="hero-sub">{{ t.heroSub }}</p>
            <div class="hero-badges">
              <span class="badge">🚲 {{ t.badge1 }}</span>
              <span class="badge">⛰️ {{ t.badge2 }}</span>
              <span class="badge">🍷 {{ t.badge3 }}</span>
            </div>
          </div>
        </header>

        <!-- Intro -->
        <section class="tours-section">
          <div class="container">
            <h2>{{ t.introHeading }}</h2>
            <p class="intro-text">{{ t.introText }}</p>
          </div>
        </section>

        <!-- Tour cards -->
        <section class="tours-section">
          <div class="container">
            <div class="tour-list">
              @for (f of facts; track f.id) {
                @if (t.routes[f.id]; as r) {
                  <article class="tour-card" [class.rtl]="isRtl()">
                    <div class="tour-media">
                      <img
                        [src]="'/assets/tours/' + f.svg"
                        [alt]="r.name"
                        width="800"
                        height="450"
                        loading="lazy"
                      />
                      <span
                        class="diff-tag"
                        [class.easy]="f.difficulty === 'easy'"
                        [class.moderate]="f.difficulty === 'moderate'"
                        [class.hard]="f.difficulty === 'hard'"
                        >{{ difficultyLabel(f.difficulty, t) }}</span
                      >
                    </div>
                    <div class="tour-body">
                      <h3>{{ r.name }}</h3>
                      <p class="tour-start">📍 {{ r.startPoint }}</p>

                      <div class="stat-row">
                        <div class="stat">
                          <span class="stat-val"
                            >{{ f.distanceKm }} {{ t.unitKm }}</span
                          >
                          <span class="stat-key">{{ t.labelDistance }}</span>
                        </div>
                        <div class="stat">
                          <span class="stat-val"
                            >{{ f.elevationGainM }} {{ t.unitM }}</span
                          >
                          <span class="stat-key">{{ t.labelElevation }}</span>
                        </div>
                        <div class="stat">
                          <span class="stat-val">{{ r.durationText }}</span>
                          <span class="stat-key">{{ t.labelDuration }}</span>
                        </div>
                      </div>

                      <p class="tour-desc">{{ r.description }}</p>

                      <h4 class="hl-head">{{ t.highlightsHeading }}</h4>
                      <ul class="hl-list">
                        @for (h of r.highlights; track $index) {
                          <li>
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="#4caf50"
                              stroke-width="2.5"
                            >
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                            {{ h }}
                          </li>
                        }
                      </ul>

                      <div class="tour-meta">
                        <div class="meta-pill">
                          <span class="meta-key">{{ t.labelBestFor }}</span>
                          <span class="meta-val">{{ r.bestFor }}</span>
                        </div>
                        <div class="meta-pill">
                          <span class="meta-key">{{ t.labelRecommended }}</span>
                          <span class="meta-val">{{
                            bikeLabel(f.recommendedBike, t)
                          }}</span>
                        </div>
                      </div>

                      <div class="tour-actions">
                        <a
                          [routerLink]="['/' + lang(), rentalSlug()]"
                          class="btn-rent"
                          >{{ t.rentThisBike }}</a
                        >
                        <a
                          [href]="f.externalUrl"
                          target="_blank"
                          rel="noopener nofollow"
                          class="btn-route"
                          >{{ r.externalLabel }} ↗</a
                        >
                      </div>
                    </div>
                  </article>
                }
              }
            </div>
          </div>
        </section>

        <!-- Practical tips -->
        <section class="tours-section tours-tips">
          <div class="container">
            <h2>{{ t.tipsHeading }}</h2>
            <div class="tips-grid">
              @for (tip of t.tips; track $index) {
                <div class="tip-card">
                  <h4>{{ tip.title }}</h4>
                  <p>{{ tip.text }}</p>
                </div>
              }
            </div>
            <p class="tips-guide">
              {{ t.guideLinkText }}
              <a [routerLink]="['/' + lang(), 'ratgeber', 'radfahren-freiburg-routen-guide']">{{
                t.guideLinkLabel
              }}</a>
            </p>
          </div>
        </section>

        <!-- Final CTA -->
        <section class="tours-section tours-cta">
          <div class="container">
            <h2>{{ t.ctaHeading }}</h2>
            <p>{{ t.ctaText }}</p>
            <div class="cta-actions">
              <a [href]="bookingPath()" class="btn-primary">{{
                t.ctaButton
              }}</a>
              <a
                [routerLink]="['/' + lang(), rentalSlug()]"
                class="btn-secondary-outline"
                >{{ t.ctaSecondary }}</a
              >
              <a
                href="https://wa.me/4915566300011"
                target="_blank"
                rel="noopener"
                class="btn-whatsapp"
                >WhatsApp</a
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
      .tours-page {
        min-height: 100vh;
        padding-bottom: 4rem;
      }
      .container {
        max-width: 1040px;
        margin: 0 auto;
        padding: 0 1.5rem;
      }

      /* Breadcrumb */
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

      /* Hero */
      .tours-hero {
        padding: 3rem 0 2.5rem;
        border-bottom: 1px solid var(--color-border, #222);
      }
      .tours-hero h1 {
        font-size: 2.3rem;
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
        max-width: 720px;
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

      /* Sections */
      .tours-section {
        padding: 2.5rem 0 0;
      }
      .tours-section h2 {
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--color-text, #fff);
        margin: 0 0 1rem;
      }
      .intro-text {
        color: var(--color-text-secondary, #ccc);
        font-size: 1rem;
        line-height: 1.8;
        margin: 0;
        max-width: 820px;
      }

      /* Tour cards */
      .tour-list {
        display: grid;
        grid-template-columns: 1fr;
        gap: 1.75rem;
        margin-top: 0.5rem;
      }
      .tour-card {
        display: grid;
        grid-template-columns: 360px 1fr;
        background: var(--color-surface, #111);
        border: 1px solid var(--color-border, #222);
        border-radius: 16px;
        overflow: hidden;
        transition:
          border-color 0.25s,
          transform 0.25s;
      }
      .tour-card:hover {
        border-color: var(--color-accent, #ff5722);
        transform: translateY(-2px);
      }
      .tour-media {
        position: relative;
        background: #0c0c0c;
      }
      .tour-media img {
        display: block;
        width: 100%;
        height: 100%;
        min-height: 220px;
        object-fit: cover;
      }
      .diff-tag {
        position: absolute;
        top: 0.85rem;
        left: 0.85rem;
        padding: 0.3rem 0.7rem;
        border-radius: 999px;
        font-size: 0.72rem;
        font-weight: 700;
        letter-spacing: 0.03em;
        color: #fff;
        backdrop-filter: blur(4px);
      }
      .diff-tag.easy {
        background: rgba(76, 175, 80, 0.85);
      }
      .diff-tag.moderate {
        background: rgba(255, 152, 0, 0.88);
      }
      .diff-tag.hard {
        background: rgba(244, 67, 54, 0.88);
      }

      .tour-body {
        padding: 1.5rem 1.6rem 1.6rem;
      }
      .tour-body h3 {
        font-size: 1.25rem;
        font-weight: 700;
        color: var(--color-text, #fff);
        margin: 0 0 0.3rem;
      }
      .tour-start {
        color: var(--color-text-muted, #888);
        font-size: 0.85rem;
        margin: 0 0 1rem;
      }

      .stat-row {
        display: flex;
        gap: 0.6rem;
        margin-bottom: 1rem;
        flex-wrap: wrap;
      }
      .stat {
        flex: 1;
        min-width: 90px;
        background: var(--color-bg-secondary, #0b0b0b);
        border: 1px solid var(--color-border, #1c1c1c);
        border-radius: 10px;
        padding: 0.55rem 0.7rem;
        text-align: center;
      }
      .stat-val {
        display: block;
        font-size: 1rem;
        font-weight: 700;
        color: var(--color-accent, #ff5722);
      }
      .stat-key {
        display: block;
        font-size: 0.68rem;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: var(--color-text-muted, #888);
        margin-top: 0.15rem;
      }

      .tour-desc {
        color: var(--color-text-secondary, #ccc);
        font-size: 0.95rem;
        line-height: 1.7;
        margin: 0 0 1rem;
      }
      .hl-head {
        font-size: 0.78rem;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: var(--color-text-muted, #999);
        margin: 0 0 0.5rem;
      }
      .hl-list {
        list-style: none;
        padding: 0;
        margin: 0 0 1rem;
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 0.35rem 1rem;
      }
      .hl-list li {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
        color: var(--color-text-secondary, #ccc);
        font-size: 0.88rem;
        line-height: 1.4;
      }
      .hl-list svg {
        flex-shrink: 0;
        margin-top: 2px;
      }

      .tour-meta {
        display: flex;
        gap: 0.6rem;
        flex-wrap: wrap;
        margin-bottom: 1.1rem;
      }
      .meta-pill {
        background: var(--color-bg-secondary, #0b0b0b);
        border: 1px solid var(--color-border, #1c1c1c);
        border-radius: 10px;
        padding: 0.45rem 0.8rem;
      }
      .meta-key {
        display: block;
        font-size: 0.66rem;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: var(--color-text-muted, #888);
      }
      .meta-val {
        display: block;
        font-size: 0.9rem;
        font-weight: 600;
        color: var(--color-text, #eee);
      }

      .tour-actions {
        display: flex;
        gap: 0.75rem;
        flex-wrap: wrap;
      }
      .btn-rent {
        padding: 0.6rem 1.2rem;
        background: var(--color-accent, #ff5722);
        color: #fff;
        border-radius: 8px;
        text-decoration: none;
        font-weight: 600;
        font-size: 0.9rem;
        transition: opacity 0.2s;
      }
      .btn-rent:hover {
        opacity: 0.9;
      }
      .btn-route {
        padding: 0.6rem 1.2rem;
        border: 1px solid var(--color-border, #444);
        color: var(--color-text-secondary, #ccc);
        border-radius: 8px;
        text-decoration: none;
        font-weight: 600;
        font-size: 0.9rem;
        transition: border-color 0.2s;
      }
      .btn-route:hover {
        border-color: var(--color-accent, #ff5722);
        color: #fff;
      }

      /* Tips */
      .tips-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
        gap: 0.85rem;
      }
      .tip-card {
        background: var(--color-surface, #111);
        border: 1px solid var(--color-border, #222);
        border-radius: 12px;
        padding: 1.1rem 1.2rem;
      }
      .tip-card h4 {
        margin: 0 0 0.4rem;
        font-size: 0.98rem;
        color: var(--color-text, #fff);
      }
      .tip-card p {
        margin: 0;
        font-size: 0.88rem;
        line-height: 1.6;
        color: var(--color-text-secondary, #bbb);
      }
      .tips-guide {
        margin: 1.2rem 0 0;
        font-size: 0.92rem;
        color: var(--color-text-secondary, #bbb);
      }
      .tips-guide a {
        color: var(--color-accent, #ff5722);
        font-weight: 600;
        text-decoration: none;
      }
      .tips-guide a:hover {
        text-decoration: underline;
      }

      /* CTA */
      .tours-cta {
        background: var(--color-surface, #0a0a0a);
        border-top: 1px solid var(--color-border, #222);
        padding: 3rem 0;
        margin-top: 3rem;
        text-align: center;
      }
      .tours-cta p {
        color: var(--color-text-secondary, #ccc);
        font-size: 1rem;
        line-height: 1.7;
        margin: 0 auto 1.5rem;
        max-width: 640px;
      }
      .cta-actions {
        display: flex;
        gap: 1rem;
        justify-content: center;
        flex-wrap: wrap;
      }
      .btn-primary {
        padding: 0.8rem 1.6rem;
        background: var(--color-accent, #ff5722);
        color: #fff;
        border-radius: 8px;
        text-decoration: none;
        font-weight: 600;
        font-size: 0.95rem;
        transition: opacity 0.2s;
      }
      .btn-primary:hover {
        opacity: 0.9;
      }
      .btn-secondary-outline {
        padding: 0.8rem 1.6rem;
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
      .btn-whatsapp {
        padding: 0.8rem 1.6rem;
        background: #25d366;
        color: #fff;
        border-radius: 8px;
        text-decoration: none;
        font-weight: 600;
        font-size: 0.95rem;
      }

      /* RTL */
      :host-context([dir='rtl']) .breadcrumb,
      :host-context([dir='rtl']) .tour-start {
        text-align: right;
      }

      @media (max-width: 760px) {
        .tours-hero h1 {
          font-size: 1.7rem;
        }
        .tour-card {
          grid-template-columns: 1fr;
        }
        .tour-media img {
          min-height: 180px;
          max-height: 200px;
        }
        .hl-list {
          grid-template-columns: 1fr;
        }
        .cta-actions {
          flex-direction: column;
          align-items: center;
        }
      }
    `,
  ],
})
export class BikeToursComponent implements OnInit, OnDestroy {
  private meta = inject(Meta);
  private title = inject(Title);
  private ts = inject(TranslationService);
  private doc = inject(DOCUMENT);

  lang = this.ts.currentLanguage;
  tr = this.ts.translations;
  facts = BIKE_TOURS_FACTS;

  tx = computed(() => BIKE_TOURS_TEXT[this.lang()] ?? BIKE_TOURS_TEXT.en!);
  isRtl = computed(() => this.lang() === 'ar');
  rentalSlug = computed(() => getRentalSlug(this.lang()));
  bookingPath = computed(() => getRentalBookingPath(this.lang()));

  private schemaEl?: HTMLScriptElement;

  private metaEffect = effect(() => {
    const t = this.tx();
    this.title.setTitle(t.metaTitle);
    this.meta.updateTag({ name: 'description', content: t.metaDescription });
  });

  ngOnInit(): void {
    // Set synchronously too — the effect does not run before prerender serialization.
    const t = this.tx();
    this.title.setTitle(t.metaTitle);
    this.meta.updateTag({ name: 'description', content: t.metaDescription });
    this.meta.updateTag({ name: 'robots', content: 'index, follow' });
    this.injectSchema();
  }

  ngOnDestroy(): void {
    this.schemaEl?.remove();
  }

  difficultyLabel(
    d: BikeTourFacts['difficulty'],
    t: BikeToursPageText,
  ): string {
    return d === 'easy'
      ? t.difficultyEasy
      : d === 'moderate'
        ? t.difficultyModerate
        : t.difficultyHard;
  }

  bikeLabel(
    b: BikeTourFacts['recommendedBike'],
    t: BikeToursPageText,
  ): string {
    switch (b) {
      case 'city':
        return t.bikeCity;
      case 'trekking':
        return t.bikeTrekking;
      case 'e-bike':
        return t.bikeEbike;
      case 'e-mtb':
        return t.bikeEmtb;
      case 'road':
        return t.bikeRoad;
    }
  }

  private injectSchema(): void {
    const lang = this.lang();
    const t = this.tx();
    const toursPath =
      lang === 'en'
        ? 'bike-tours'
        : lang === 'fr'
          ? 'circuits-velo'
          : 'fahrradtouren';
    const pageUrl = `${BASE_URL}/${lang}/${toursPath}`;

    const itemList = {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: t.metaTitle,
      description: t.metaDescription,
      url: pageUrl,
      numberOfItems: this.facts.length,
      itemListElement: this.facts.map((f, i) => {
        const r = t.routes[f.id];
        return {
          '@type': 'ListItem',
          position: i + 1,
          item: {
            '@type': 'TouristTrip',
            name: r?.name,
            description: r?.description,
            touristType: r?.bestFor,
            url: f.externalUrl,
          },
        };
      }),
    };

    const breadcrumb = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
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
          name: t.heroTitle,
          item: pageUrl,
        },
      ],
    };

    this.schemaEl?.remove();
    const el = this.doc.createElement('script');
    el.type = 'application/ld+json';
    el.textContent = JSON.stringify([itemList, breadcrumb]);
    this.doc.head.appendChild(el);
    this.schemaEl = el;
  }
}
