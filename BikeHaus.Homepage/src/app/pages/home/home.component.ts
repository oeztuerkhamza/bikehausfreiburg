import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { TranslationService } from '../../services/translation.service';
import { ApiService } from '../../services/api.service';
import { BikeCardComponent } from '../../components/bike-card/bike-card.component';
import {
  KleinanzeigenListing,
  KleinanzeigenCategory,
  PublicShopInfo,
} from '../../models/models';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, BikeCardComponent],
  template: `
    <!-- ═══ Section 1 — HERO ═══ -->
    <section class="hero" aria-labelledby="hero-heading">
      <div class="hero-bg" aria-hidden="true">
        <div class="hero-grain"></div>
        <div class="hero-radial"></div>
      </div>
      <div class="container hero-inner">
        <span class="hero-label fade-in">Bike Haus Freiburg</span>
        <h1 id="hero-heading" class="hero-h1 fade-in d1">{{ t().heroH1 }}</h1>
        <p class="hero-sub fade-in d2">{{ t().heroSub }}</p>
        <div class="hero-actions fade-in d3">
          <a [routerLink]="['/' + lang(), 'showroom']" class="btn-primary">{{
            t().ctaPrimary
          }}</a>
          <a [routerLink]="['/' + lang(), 'showroom']" class="btn-secondary">{{
            t().ctaSecondary
          }}</a>
        </div>
        <div class="hero-stats fade-in d4" *ngIf="shopInfo()">
          <div class="h-stat">
            <span class="h-stat-n">{{ shopInfo()!.totalActiveListings }}</span>
            <span class="h-stat-l">{{ t().bikesAvailable }}</span>
          </div>
          <div class="h-stat" *ngIf="categories().length">
            <span class="h-stat-n">{{ categories().length }}</span>
            <span class="h-stat-l">{{ t().categories }}</span>
          </div>
        </div>
      </div>
      <div class="hero-scroll" aria-hidden="true">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M12 5v14M5 12l7 7 7-7" />
        </svg>
      </div>
    </section>

    <!-- ═══ Section 2 — VALUE PROPOSITION ═══ -->
    <section class="section" aria-labelledby="values-heading">
      <div class="container">
        <span class="section-label fade-in">{{ t().valueLabel }}</span>
        <h2 id="values-heading" class="section-title fade-in d1">
          {{ t().valueTitle }}
        </h2>
        <div class="values-grid">
          <article class="value-card fade-in d1">
            <div class="value-icon" aria-hidden="true">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
                width="32"
                height="32"
              >
                <path
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <h3>{{ t().value1Title }}</h3>
            <p>{{ t().value1Desc }}</p>
          </article>
          <article class="value-card fade-in d2">
            <div class="value-icon" aria-hidden="true">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
                width="32"
                height="32"
              >
                <path
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3>{{ t().value2Title }}</h3>
            <p>{{ t().value2Desc }}</p>
          </article>
          <article class="value-card fade-in d3">
            <div class="value-icon" aria-hidden="true">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
                width="32"
                height="32"
              >
                <path
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <h3>{{ t().value3Title }}</h3>
            <p>{{ t().value3Desc }}</p>
          </article>
          <article class="value-card fade-in d4">
            <div class="value-icon" aria-hidden="true">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
                width="32"
                height="32"
              >
                <path
                  d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3>{{ t().value4Title }}</h3>
            <p>{{ t().value4Desc }}</p>
          </article>
        </div>
      </div>
    </section>

    <!-- ═══ Section 3 — SHOWROOM PREVIEW ═══ -->
    <section
      class="section section-alt"
      aria-labelledby="showroom-heading"
      *ngIf="listings().length"
    >
      <div class="container">
        <div class="section-head-row">
          <div>
            <span class="section-label fade-in">{{ t().showroomLabel }}</span>
            <h2 id="showroom-heading" class="section-title fade-in d1">
              {{ t().showroomTitle }}
            </h2>
            <p class="section-subtitle fade-in d2">{{ t().showroomSub }}</p>
          </div>
          <a
            [routerLink]="['/' + lang(), 'showroom']"
            class="btn-secondary view-all-btn fade-in d2"
            >{{ t().viewAll }}
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
        </div>
        <div class="bike-grid">
          <app-bike-card
            *ngFor="let bike of listings().slice(0, 6)"
            [listing]="bike"
          ></app-bike-card>
        </div>
      </div>
    </section>

    <!-- ═══ Section 4 — TRUST ═══ -->
    <section class="section" aria-labelledby="trust-heading">
      <div class="container">
        <span class="section-label fade-in">{{ t().trustLabel }}</span>
        <h2 id="trust-heading" class="section-title fade-in d1">
          {{ t().trustTitle }}
        </h2>
        <p class="section-subtitle fade-in d2">{{ t().trustSub }}</p>
        <div class="trust-grid">
          <div class="trust-item fade-in d1">
            <div class="trust-check" aria-hidden="true">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--color-accent)"
                stroke-width="2.5"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <p>{{ t().trust1 }}</p>
          </div>
          <div class="trust-item fade-in d2">
            <div class="trust-check" aria-hidden="true">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--color-accent)"
                stroke-width="2.5"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <p>{{ t().trust2 }}</p>
          </div>
          <div class="trust-item fade-in d3">
            <div class="trust-check" aria-hidden="true">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--color-accent)"
                stroke-width="2.5"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <p>{{ t().trust3 }}</p>
          </div>
          <div class="trust-item fade-in d4">
            <div class="trust-check" aria-hidden="true">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--color-accent)"
                stroke-width="2.5"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <p>{{ t().trust4 }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══ Section 5 — BRAND STORY ═══ -->
    <section class="section section-alt" aria-labelledby="story-heading">
      <div class="container">
        <div class="story-layout">
          <div class="story-text">
            <span class="section-label fade-in">{{ t().storyLabel }}</span>
            <h2 id="story-heading" class="section-title fade-in d1">
              {{ t().storyTitle }}
            </h2>
            <p class="story-body fade-in d2">{{ t().storyText }}</p>
          </div>
          <div class="story-values">
            <div class="story-value fade-in d1">
              <span class="sv-num">01</span>
              <div>
                <h3>{{ t().storyValue1Title }}</h3>
                <p>{{ t().storyValue1Desc }}</p>
              </div>
            </div>
            <div class="story-value fade-in d2">
              <span class="sv-num">02</span>
              <div>
                <h3>{{ t().storyValue2Title }}</h3>
                <p>{{ t().storyValue2Desc }}</p>
              </div>
            </div>
            <div class="story-value fade-in d3">
              <span class="sv-num">03</span>
              <div>
                <h3>{{ t().storyValue3Title }}</h3>
                <p>{{ t().storyValue3Desc }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══ Section 6 — CTA ═══ -->
    <section class="cta-section" aria-labelledby="cta-heading">
      <div class="container cta-inner">
        <h2 id="cta-heading" class="cta-h2 fade-in">
          {{ t().ctaSectionTitle }}
        </h2>
        <p class="cta-sub fade-in d1">{{ t().ctaSectionSub }}</p>
        <a
          [routerLink]="['/' + lang(), 'showroom']"
          class="btn-primary cta-btn fade-in d2"
          >{{ t().ctaSectionButton }}
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </a>
      </div>
    </section>

    <!-- ═══ Section 7 — LOADING (skeleton) ═══ -->
    <section class="section" *ngIf="loading()" aria-label="Loading">
      <div class="container">
        <div class="skeleton-row">
          <div class="skeleton-card" *ngFor="let i of [1, 2, 3]">
            <div class="sk-img"></div>
            <div class="sk-body">
              <div class="sk-line l"></div>
              <div class="sk-line s"></div>
              <div class="sk-line m"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [
    `
      /* ═══ HERO ═══ */
      .hero {
        position: relative;
        min-height: 100vh;
        min-height: 100dvh;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        background: var(--color-bg);
      }

      .hero-bg {
        position: absolute;
        inset: 0;
        z-index: 0;
      }

      .hero-grain {
        position: absolute;
        inset: 0;
        background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
        opacity: 0.5;
      }

      .hero-radial {
        position: absolute;
        inset: 0;
        background: radial-gradient(
          ellipse 80% 60% at 50% 40%,
          rgba(255, 87, 34, 0.08) 0%,
          transparent 70%
        );
      }

      .hero-inner {
        position: relative;
        z-index: 1;
        text-align: center;
        padding: 8rem 1rem 6rem;
      }

      .hero-label {
        display: inline-block;
        font-size: 0.8rem;
        font-weight: 600;
        letter-spacing: 0.15em;
        text-transform: uppercase;
        color: var(--color-accent);
        margin-bottom: 1.5rem;
      }

      .hero-h1 {
        font-size: clamp(2.5rem, 6vw, 4.5rem);
        font-weight: 800;
        line-height: 1.1;
        letter-spacing: -0.02em;
        color: var(--color-text);
        margin: 0 auto 1.5rem;
        max-width: 800px;
      }

      .hero-sub {
        font-size: clamp(1rem, 2vw, 1.25rem);
        color: var(--color-text-secondary);
        line-height: 1.7;
        max-width: 600px;
        margin: 0 auto 2.5rem;
      }

      .hero-actions {
        display: flex;
        gap: 1rem;
        justify-content: center;
        flex-wrap: wrap;
        margin-bottom: 3rem;
      }

      .hero-stats {
        display: flex;
        justify-content: center;
        gap: 3.5rem;
      }

      .h-stat {
        display: flex;
        flex-direction: column;
        align-items: center;
      }

      .h-stat-n {
        font-size: 2.25rem;
        font-weight: 800;
        color: var(--color-accent);
        line-height: 1;
      }

      .h-stat-l {
        font-size: 0.78rem;
        color: var(--color-text-muted);
        text-transform: uppercase;
        letter-spacing: 0.08em;
        margin-top: 0.35rem;
      }

      .hero-scroll {
        position: absolute;
        bottom: 2rem;
        left: 50%;
        transform: translateX(-50%);
        color: var(--color-text-muted);
        animation: floatDown 2s ease-in-out infinite;
      }

      @keyframes floatDown {
        0%,
        100% {
          transform: translateX(-50%) translateY(0);
          opacity: 0.4;
        }
        50% {
          transform: translateX(-50%) translateY(8px);
          opacity: 0.8;
        }
      }

      /* ═══ VALUES ═══ */
      .values-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 1.5rem;
        margin-top: 3rem;
      }

      .value-card {
        background: var(--color-surface);
        border: 1px solid var(--color-border);
        border-radius: 16px;
        padding: 2rem 1.5rem;
        transition:
          border-color 0.3s,
          transform 0.3s;
      }

      .value-card:hover {
        border-color: var(--color-accent);
        transform: translateY(-4px);
      }

      .value-icon {
        width: 48px;
        height: 48px;
        border-radius: 12px;
        background: rgba(255, 87, 34, 0.1);
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 1.25rem;
        color: var(--color-accent);
      }

      .value-card h3 {
        font-size: 1.05rem;
        font-weight: 700;
        color: var(--color-text);
        margin: 0 0 0.5rem;
      }

      .value-card p {
        font-size: 0.9rem;
        color: var(--color-text-secondary);
        line-height: 1.6;
        margin: 0;
      }

      /* ═══ SHOWROOM PREVIEW ═══ */
      .section-head-row {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        margin-bottom: 2.5rem;
      }

      .view-all-btn {
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        flex-shrink: 0;
      }

      .bike-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1.5rem;
      }

      /* ═══ TRUST ═══ */
      .trust-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 1.25rem;
        margin-top: 2.5rem;
        max-width: 800px;
        margin-left: auto;
        margin-right: auto;
      }

      .trust-item {
        display: flex;
        align-items: flex-start;
        gap: 1rem;
        background: var(--color-surface);
        border: 1px solid var(--color-border);
        border-radius: 12px;
        padding: 1.25rem 1.5rem;
      }

      .trust-check {
        flex-shrink: 0;
        margin-top: 2px;
      }

      .trust-item p {
        font-size: 0.95rem;
        color: var(--color-text-secondary);
        line-height: 1.5;
        margin: 0;
      }

      /* ═══ BRAND STORY ═══ */
      .story-layout {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 4rem;
        align-items: start;
      }

      .story-body {
        font-size: 1.1rem;
        line-height: 1.8;
        color: var(--color-text-secondary);
        margin-top: 1.5rem;
      }

      .story-values {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
        padding-top: 1rem;
      }

      .story-value {
        display: flex;
        gap: 1.25rem;
        align-items: flex-start;
      }

      .sv-num {
        font-size: 1.5rem;
        font-weight: 800;
        color: var(--color-accent);
        line-height: 1;
        flex-shrink: 0;
        margin-top: 0.2rem;
      }

      .story-value h3 {
        font-size: 1rem;
        font-weight: 700;
        color: var(--color-text);
        margin: 0 0 0.3rem;
      }

      .story-value p {
        font-size: 0.9rem;
        color: var(--color-text-secondary);
        line-height: 1.5;
        margin: 0;
      }

      /* ═══ CTA SECTION ═══ */
      .cta-section {
        position: relative;
        padding: 6rem 0;
        background: linear-gradient(
          135deg,
          var(--color-surface-alt) 0%,
          var(--color-bg) 100%
        );
        text-align: center;
        overflow: hidden;
      }

      .cta-section::before {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(
          circle at 50% 50%,
          rgba(255, 87, 34, 0.06) 0%,
          transparent 60%
        );
      }

      .cta-inner {
        position: relative;
        z-index: 1;
      }

      .cta-h2 {
        font-size: clamp(1.75rem, 4vw, 2.75rem);
        font-weight: 800;
        color: var(--color-text);
        margin: 0 0 1rem;
      }

      .cta-sub {
        font-size: 1.1rem;
        color: var(--color-text-secondary);
        max-width: 550px;
        margin: 0 auto 2rem;
        line-height: 1.6;
      }

      .cta-btn {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 1.05rem;
        padding: 1rem 2.5rem;
      }

      /* ═══ SKELETON LOADING ═══ */
      .skeleton-row {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1.5rem;
      }

      .skeleton-card {
        border-radius: 16px;
        overflow: hidden;
        background: var(--color-surface);
        border: 1px solid var(--color-border);
      }

      .sk-img {
        aspect-ratio: 16/11;
        background: linear-gradient(
          90deg,
          var(--color-surface) 25%,
          var(--color-surface-alt) 50%,
          var(--color-surface) 75%
        );
        background-size: 200% 100%;
        animation: shimmer 1.5s infinite;
      }

      .sk-body {
        padding: 1.25rem;
      }

      .sk-line {
        height: 12px;
        border-radius: 6px;
        background: linear-gradient(
          90deg,
          var(--color-surface) 25%,
          var(--color-surface-alt) 50%,
          var(--color-surface) 75%
        );
        background-size: 200% 100%;
        animation: shimmer 1.5s infinite;
        margin-bottom: 0.65rem;
      }

      .sk-line.l {
        width: 85%;
      }
      .sk-line.s {
        width: 35%;
      }
      .sk-line.m {
        width: 55%;
      }

      @keyframes shimmer {
        to {
          background-position: -200% 0;
        }
      }

      /* ═══ ANIMATIONS ═══ */
      .fade-in {
        opacity: 0;
        transform: translateY(20px);
        animation: fadeInUp 0.7s cubic-bezier(0.4, 0, 0.2, 1) forwards;
      }

      .d1 {
        animation-delay: 0.1s;
      }
      .d2 {
        animation-delay: 0.2s;
      }
      .d3 {
        animation-delay: 0.3s;
      }
      .d4 {
        animation-delay: 0.4s;
      }

      @keyframes fadeInUp {
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      /* ═══ RESPONSIVE ═══ */
      @media (max-width: 1024px) {
        .values-grid {
          grid-template-columns: repeat(2, 1fr);
        }
        .bike-grid {
          grid-template-columns: repeat(2, 1fr);
        }
        .story-layout {
          grid-template-columns: 1fr;
          gap: 2.5rem;
        }
        .skeleton-row {
          grid-template-columns: repeat(2, 1fr);
        }
      }

      @media (max-width: 640px) {
        .hero-inner {
          padding: 7rem 1rem 5rem;
        }
        .values-grid {
          grid-template-columns: 1fr;
        }
        .bike-grid {
          grid-template-columns: 1fr;
        }
        .trust-grid {
          grid-template-columns: 1fr;
        }
        .section-head-row {
          flex-direction: column;
          align-items: flex-start;
          gap: 1rem;
        }
        .skeleton-row {
          grid-template-columns: 1fr;
        }
        .hero-stats {
          gap: 2rem;
        }
      }
    `,
  ],
})
export class HomeComponent implements OnInit {
  private translationService = inject(TranslationService);
  private apiService = inject(ApiService);
  private titleService = inject(Title);
  private metaService = inject(Meta);

  t = this.translationService.translations;
  lang = this.translationService.currentLanguage;

  listings = signal<KleinanzeigenListing[]>([]);
  categories = signal<KleinanzeigenCategory[]>([]);
  shopInfo = signal<PublicShopInfo | null>(null);
  loading = signal(true);

  ngOnInit(): void {
    // SEO - Reset to homepage defaults
    this.titleService.setTitle('Bike Haus Freiburg — Neue & gebrauchte Fahrräder in Freiburg');
    this.metaService.updateTag({ name: 'description', content: 'Ihr Fahrradhändler in Freiburg im Breisgau. Über 100 neue und geprüfte Gebrauchträder — City, Trekking, Mountain, E-Bike, Kinderfahrräder. Fair, nachhaltig, persönlich.' });
    this.metaService.updateTag({ property: 'og:title', content: 'Bike Haus Freiburg — Neue & gebrauchte Fahrrräder' });
    this.metaService.updateTag({ property: 'og:url', content: 'https://bikehausfreiburg.com' });
    
    this.loadData();
  }

  private loadData(): void {
    this.apiService.getListings().subscribe({
      next: (data) => {
        this.listings.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });

    this.apiService.getCategories().subscribe({
      next: (data) => this.categories.set(data),
    });

    this.apiService.getShopInfo().subscribe({
      next: (data) => this.shopInfo.set(data),
    });
  }
}
