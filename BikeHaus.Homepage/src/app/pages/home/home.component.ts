import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { TranslationService } from '../../services/translation.service';
import { ApiService } from '../../services/api.service';
import { BikeCardComponent } from '../../components/bike-card/bike-card.component';
import { NeueBikeCardComponent } from '../../components/neue-bike-card/neue-bike-card.component';
import {
  KleinanzeigenListing,
  KleinanzeigenCategory,
  PublicShopInfo,
  NeueFahrrad,
} from '../../models/models';

interface Testimonial {
  name: string;
  initials: string;
  text: string;
  detail: string;
  rating: number;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    BikeCardComponent,
    NeueBikeCardComponent,
  ],
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

    <!-- ═══ Section 3b — NEUE FAHRRÄDER PREVIEW ═══ -->
    <section
      class="section"
      aria-labelledby="neue-heading"
      *ngIf="neueFahrraeder().length"
    >
      <div class="container">
        <div class="section-head-row">
          <div>
            <span class="section-label fade-in">{{ t().newBikesLabel }}</span>
            <h2 id="neue-heading" class="section-title fade-in d1">
              {{ t().newBikesTitle }}
            </h2>
            <p class="section-subtitle fade-in d2">{{ t().newBikesSub }}</p>
          </div>
          <a
            [routerLink]="['/' + lang(), 'neue-fahrraeder']"
            class="btn-secondary view-all-btn fade-in d2"
            >{{ t().browseNewBikes }}
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
          <app-neue-bike-card
            *ngFor="let bike of neueFahrraeder().slice(0, 6)"
            [bike]="bike"
          ></app-neue-bike-card>
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

    <!-- ═══ Section 6 — SHOP GALLERY ═══ -->
    <section class="section" aria-labelledby="gallery-heading">
      <div class="container">
        <span class="section-label fade-in">{{ t().galleryLabel }}</span>
        <h2 id="gallery-heading" class="section-title fade-in d1">
          {{ t().galleryTitle }}
        </h2>
        <p class="section-subtitle fade-in d2">{{ t().gallerySub }}</p>
        <div class="gallery-grid fade-in d3">
          <div
            class="gallery-item"
            *ngFor="let photo of shopPhotos; let i = index"
            (click)="openLightbox(i)"
          >
            <img
              [src]="photo"
              [alt]="'Bike Haus Freiburg - Foto ' + (i + 1)"
              loading="lazy"
            />
            <div class="gallery-overlay">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
                <path d="M11 8v6M8 11h6" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Lightbox -->
    <div class="lightbox" *ngIf="lightboxOpen" (click)="closeLightbox()">
      <button
        class="lightbox-close"
        (click)="closeLightbox()"
        aria-label="Close"
      >
        &times;
      </button>
      <button
        class="lightbox-nav lightbox-prev"
        (click)="prevPhoto($event)"
        aria-label="Previous"
      >
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>
      <img
        [src]="shopPhotos[lightboxIndex]"
        [alt]="'Bike Haus Freiburg - Foto ' + (lightboxIndex + 1)"
        class="lightbox-img"
        (click)="$event.stopPropagation()"
      />
      <button
        class="lightbox-nav lightbox-next"
        (click)="nextPhoto($event)"
        aria-label="Next"
      >
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>
      <div class="lightbox-counter" (click)="$event.stopPropagation()">
        {{ lightboxIndex + 1 }} / {{ shopPhotos.length }}
      </div>
    </div>

    <!-- ═══ Section 7 — BIKE CHECK SERVICE ═══ -->
    <section class="section section-alt" aria-labelledby="bikecheck-heading">
      <div class="container">
        <span class="section-label fade-in">{{ t().bikeCheckLabel }}</span>
        <h2 id="bikecheck-heading" class="section-title fade-in d1">
          {{ t().bikeCheckTitle }}
        </h2>
        <p class="section-subtitle fade-in d2">{{ t().bikeCheckSub }}</p>

        <div class="bikecheck-grid fade-in d3">
          <!-- Free Check -->
          <div class="bikecheck-card bikecheck-free">
            <div class="bikecheck-card-header">
              <div class="bikecheck-icon free-icon">
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M9 12l2 2 4-4" />
                  <circle cx="12" cy="12" r="10" />
                </svg>
              </div>
              <h3>{{ t().bikeCheckFreeTitle }}</h3>
              <span class="bikecheck-badge">{{
                t().bikeCheckNoObligation
              }}</span>
            </div>
            <ul class="bikecheck-list">
              <li>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.5"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                {{ t().bikeCheckBrakeCheck }}
              </li>
              <li>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.5"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                {{ t().bikeCheckGearTest }}
              </li>
              <li>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.5"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                {{ t().bikeCheckTireChain }}
              </li>
            </ul>
          </div>

          <!-- Repair on Request -->
          <div class="bikecheck-card bikecheck-repair">
            <div class="bikecheck-card-header">
              <div class="bikecheck-icon repair-icon">
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"
                  />
                </svg>
              </div>
              <h3>{{ t().bikeCheckRepairTitle }}</h3>
              <span class="bikecheck-badge liability-badge">{{
                t().bikeCheckNoLiability
              }}</span>
            </div>
            <ul class="bikecheck-list">
              <li>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <circle cx="12" cy="12" r="3" />
                  <path
                    d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"
                  />
                </svg>
                {{ t().bikeCheckBrakeAdjust }}
              </li>
              <li>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <circle cx="12" cy="12" r="3" />
                  <path
                    d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"
                  />
                </svg>
                {{ t().bikeCheckChainCassette }}
              </li>
              <li>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <circle cx="12" cy="12" r="3" />
                  <path
                    d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"
                  />
                </svg>
                {{ t().bikeCheckGearAdjust }}
              </li>
              <li>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <circle cx="12" cy="12" r="3" />
                  <path
                    d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"
                  />
                </svg>
                {{ t().bikeCheckTireService }}
              </li>
            </ul>
          </div>
        </div>

        <!-- Note & exclusion -->
        <div class="bikecheck-footer fade-in d4">
          <div class="bikecheck-note">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            <span>{{ t().bikeCheckNote }} — {{ t().bikeCheckExclusion }}</span>
          </div>
          <p class="bikecheck-fair">{{ t().bikeCheckFairPrices }}</p>
        </div>
      </div>
    </section>

    <!-- ═══ Section 8 — TESTIMONIALS ═══ -->
    <section
      class="testimonials-section"
      aria-labelledby="testimonials-heading"
    >
      <div class="container">
        <span class="section-label fade-in">{{ t().testimonialsLabel }}</span>
        <h2 id="testimonials-heading" class="section-title fade-in d1">
          {{ t().testimonialsTitle }}
        </h2>
        <p class="section-sub fade-in d2">{{ t().testimonialsSub }}</p>

        <div class="testimonials-grid">
          <article
            class="testimonial-card fade-in d1"
            *ngFor="let review of testimonials; let i = index"
          >
            <div
              class="testimonial-stars"
              [attr.aria-label]="t().ariaStarsRating"
            >
              <svg
                *ngFor="let s of [1, 2, 3, 4, 5]"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path
                  d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                />
              </svg>
            </div>
            <blockquote class="testimonial-text">
              "{{ review.text }}"
            </blockquote>
            <footer class="testimonial-author">
              <div class="author-avatar">{{ review.initials }}</div>
              <div class="author-info">
                <cite class="author-name">{{ review.name }}</cite>
                <span class="author-detail">{{ review.detail }}</span>
              </div>
            </footer>
          </article>
        </div>

        <div class="trust-badges fade-in d3">
          <div class="trust-badge">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="M9 12l2 2 4-4" />
            </svg>
            <span>{{ t().value1Title }}</span>
          </div>
          <div class="trust-badge">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
            <span>{{ t().trustBadgeSince }}</span>
          </div>
          <div class="trust-badge">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <span>{{ t().trustBadgeCustomers }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══ Section 7 — FAQ ═══ -->
    <section class="faq-section" aria-labelledby="faq-heading">
      <div class="container">
        <span class="section-label fade-in">{{ t().faqLabel }}</span>
        <h2 id="faq-heading" class="section-title fade-in d1">
          {{ t().faqTitle }}
        </h2>
        <p class="section-sub fade-in d2">{{ t().faqSub }}</p>

        <div class="faq-list">
          <details class="faq-item fade-in d1">
            <summary class="faq-question">
              <span>{{ t().faq1Q }}</span>
              <svg
                class="faq-chevron"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </summary>
            <p class="faq-answer">{{ t().faq1A }}</p>
          </details>

          <details class="faq-item fade-in d2">
            <summary class="faq-question">
              <span>{{ t().faq2Q }}</span>
              <svg
                class="faq-chevron"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </summary>
            <p class="faq-answer">{{ t().faq2A }}</p>
          </details>

          <details class="faq-item fade-in d3">
            <summary class="faq-question">
              <span>{{ t().faq3Q }}</span>
              <svg
                class="faq-chevron"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </summary>
            <p class="faq-answer">{{ t().faq3A }}</p>
          </details>

          <details class="faq-item fade-in d4">
            <summary class="faq-question">
              <span>{{ t().faq4Q }}</span>
              <svg
                class="faq-chevron"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </summary>
            <p class="faq-answer">{{ t().faq4A }}</p>
          </details>

          <details class="faq-item fade-in d5">
            <summary class="faq-question">
              <span>{{ t().faq5Q }}</span>
              <svg
                class="faq-chevron"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </summary>
            <p class="faq-answer">{{ t().faq5A }}</p>
          </details>
        </div>
      </div>
    </section>

    <!-- ═══ Section 8 — CTA ═══ -->
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

      /* ═══ SHOP GALLERY ═══ */
      .gallery-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
        margin-top: 3rem;
      }

      .gallery-item {
        position: relative;
        border-radius: 14px;
        overflow: hidden;
        cursor: pointer;
        aspect-ratio: 4 / 3;
        border: 1px solid var(--color-border);
      }

      .gallery-item img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.4s ease;
      }

      .gallery-item:hover img {
        transform: scale(1.06);
      }

      .gallery-overlay {
        position: absolute;
        inset: 0;
        background: rgba(0, 0, 0, 0.35);
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: opacity 0.3s ease;
        color: #fff;
      }

      .gallery-item:hover .gallery-overlay {
        opacity: 1;
      }

      /* ═══ LIGHTBOX ═══ */
      .lightbox {
        position: fixed;
        inset: 0;
        z-index: 9999;
        background: rgba(0, 0, 0, 0.92);
        display: flex;
        align-items: center;
        justify-content: center;
        animation: fadeInLightbox 0.25s ease;
      }

      @keyframes fadeInLightbox {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }

      .lightbox-img {
        max-width: 90vw;
        max-height: 85vh;
        border-radius: 12px;
        object-fit: contain;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
      }

      .lightbox-close {
        position: absolute;
        top: 1.5rem;
        right: 1.5rem;
        background: none;
        border: none;
        color: #fff;
        font-size: 2.5rem;
        cursor: pointer;
        line-height: 1;
        opacity: 0.8;
        transition: opacity 0.2s;
        z-index: 10;
      }

      .lightbox-close:hover {
        opacity: 1;
      }

      .lightbox-nav {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        background: rgba(255, 255, 255, 0.1);
        border: none;
        color: #fff;
        cursor: pointer;
        border-radius: 50%;
        width: 48px;
        height: 48px;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0.7;
        transition:
          opacity 0.2s,
          background 0.2s;
        z-index: 10;
      }

      .lightbox-nav:hover {
        opacity: 1;
        background: rgba(255, 255, 255, 0.2);
      }

      .lightbox-prev {
        left: 1.5rem;
      }

      .lightbox-next {
        right: 1.5rem;
      }

      .lightbox-counter {
        position: absolute;
        bottom: 1.5rem;
        left: 50%;
        transform: translateX(-50%);
        color: rgba(255, 255, 255, 0.7);
        font-size: 0.9rem;
        font-weight: 600;
        letter-spacing: 0.05em;
      }

      /* ═══ BIKE CHECK SECTION ═══ */
      .bikecheck-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 2rem;
        margin-top: 3rem;
      }

      .bikecheck-card {
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 16px;
        padding: 2.5rem;
        transition:
          transform 0.3s ease,
          box-shadow 0.3s ease;
      }

      .bikecheck-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
      }

      .bikecheck-free {
        border-color: rgba(227, 135, 30, 0.3);
        background: linear-gradient(
          135deg,
          rgba(227, 135, 30, 0.06) 0%,
          rgba(255, 255, 255, 0.02) 100%
        );
      }

      .bikecheck-card-header {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        margin-bottom: 1.5rem;
      }

      .bikecheck-card-header h3 {
        font-size: 1.3rem;
        font-weight: 700;
        color: var(--color-text);
      }

      .bikecheck-icon {
        width: 52px;
        height: 52px;
        border-radius: 14px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .free-icon {
        background: rgba(227, 135, 30, 0.15);
        color: var(--color-accent);
      }

      .repair-icon {
        background: rgba(255, 255, 255, 0.08);
        color: rgba(255, 255, 255, 0.7);
      }

      .bikecheck-badge {
        display: inline-block;
        background: var(--color-accent);
        color: #000;
        font-size: 0.7rem;
        font-weight: 700;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        padding: 0.3rem 0.8rem;
        border-radius: 20px;
        width: fit-content;
      }

      .bikecheck-badge.liability-badge {
        background: rgba(239, 68, 68, 0.15);
        color: #fca5a5;
        border: 1px solid rgba(239, 68, 68, 0.3);
      }

      .bikecheck-list {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .bikecheck-list li {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        color: rgba(255, 255, 255, 0.85);
        font-size: 1rem;
        font-weight: 500;
      }

      .bikecheck-free .bikecheck-list li svg {
        color: var(--color-accent);
        flex-shrink: 0;
      }

      .bikecheck-repair .bikecheck-list li svg {
        color: rgba(255, 255, 255, 0.5);
        flex-shrink: 0;
      }

      .bikecheck-footer {
        margin-top: 2.5rem;
        text-align: center;
      }

      .bikecheck-note {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 10px;
        padding: 0.8rem 1.5rem;
        color: rgba(255, 255, 255, 0.7);
        font-size: 0.9rem;
      }

      .bikecheck-note svg {
        color: var(--color-accent);
        flex-shrink: 0;
      }

      .bikecheck-fair {
        margin-top: 1rem;
        color: var(--color-accent);
        font-weight: 700;
        font-size: 1rem;
        letter-spacing: 0.03em;
      }

      /* ═══ TESTIMONIALS SECTION ═══ */
      .testimonials-section {
        padding: 6rem 0;
        background: var(--color-bg);
      }

      .testimonials-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
        gap: 1.5rem;
        margin-top: 3rem;
      }

      .testimonial-card {
        background: var(--color-surface);
        border: 1px solid var(--color-border);
        border-radius: 16px;
        padding: 1.75rem;
        transition:
          transform 0.3s ease,
          box-shadow 0.3s ease;
      }

      .testimonial-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
      }

      .testimonial-stars {
        display: flex;
        gap: 2px;
        color: #f59e0b;
        margin-bottom: 1rem;
      }

      .testimonial-text {
        font-size: 1rem;
        line-height: 1.7;
        color: var(--color-text);
        margin: 0 0 1.25rem;
        font-style: italic;
      }

      .testimonial-author {
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }

      .author-avatar {
        width: 44px;
        height: 44px;
        border-radius: 50%;
        background: linear-gradient(
          135deg,
          var(--color-accent) 0%,
          #ff7043 100%
        );
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
        font-size: 0.85rem;
        color: white;
      }

      .author-info {
        display: flex;
        flex-direction: column;
      }

      .author-name {
        font-weight: 600;
        font-size: 0.95rem;
        color: var(--color-text);
        font-style: normal;
      }

      .author-detail {
        font-size: 0.8rem;
        color: var(--color-text-secondary);
      }

      .trust-badges {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 2rem;
        margin-top: 3rem;
        padding-top: 2rem;
        border-top: 1px solid var(--color-border);
      }

      .trust-badge {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: var(--color-text-secondary);
        font-size: 0.9rem;
      }

      .trust-badge svg {
        color: var(--color-accent);
      }

      /* ═══ FAQ SECTION ═══ */
      .faq-section {
        padding: 6rem 0;
        background: var(--color-bg);
      }

      .faq-list {
        max-width: 800px;
        margin: 3rem auto 0;
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .faq-item {
        background: var(--color-surface);
        border: 1px solid var(--color-border);
        border-radius: 12px;
        overflow: hidden;
        transition: all 0.3s ease;
      }

      .faq-item:hover {
        border-color: var(--color-accent);
      }

      .faq-item[open] {
        background: var(--color-surface-alt);
      }

      .faq-question {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 1.25rem 1.5rem;
        cursor: pointer;
        font-weight: 600;
        font-size: 1rem;
        color: var(--color-text);
        list-style: none;
        transition: all 0.2s ease;
      }

      .faq-question::-webkit-details-marker {
        display: none;
      }

      .faq-question:hover {
        color: var(--color-accent);
      }

      .faq-chevron {
        flex-shrink: 0;
        color: var(--color-text-muted);
        transition: transform 0.3s ease;
      }

      .faq-item[open] .faq-chevron {
        transform: rotate(180deg);
        color: var(--color-accent);
      }

      .faq-answer {
        padding: 0 1.5rem 1.25rem;
        color: var(--color-text-secondary);
        font-size: 0.95rem;
        line-height: 1.7;
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
        .gallery-grid {
          grid-template-columns: repeat(2, 1fr);
        }
      }

      @media (max-width: 768px) {
        .bikecheck-grid {
          grid-template-columns: 1fr;
        }
        .bikecheck-card {
          padding: 2rem;
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
        .gallery-grid {
          grid-template-columns: 1fr;
        }
        .lightbox-nav {
          width: 36px;
          height: 36px;
        }
        .lightbox-prev {
          left: 0.75rem;
        }
        .lightbox-next {
          right: 0.75rem;
        }
        .bikecheck-card {
          padding: 1.5rem;
        }
        .bikecheck-card-header h3 {
          font-size: 1.15rem;
        }
        .bikecheck-note {
          flex-direction: column;
          text-align: center;
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
  private document = inject(DOCUMENT);

  t = this.translationService.translations;
  lang = this.translationService.currentLanguage;

  listings = signal<KleinanzeigenListing[]>([]);
  categories = signal<KleinanzeigenCategory[]>([]);
  shopInfo = signal<PublicShopInfo | null>(null);
  neueFahrraeder = signal<NeueFahrrad[]>([]);
  loading = signal(true);

  // Shop gallery
  shopPhotos: string[] = [
    'assets/shop/shop-1.jpeg',
    'assets/shop/shop-2.jpeg',
    'assets/shop/shop-3.jpeg',
    'assets/shop/shop-4.jpeg',
    'assets/shop/shop-5.jpeg',
    'assets/shop/shop-6.jpeg',
    'assets/shop/shop-7.jpeg',
    'assets/shop/shop-8.jpeg',
    'assets/shop/shop-9.jpeg',
  ];
  lightboxOpen = false;
  lightboxIndex = 0;

  // Testimonials for SEO and social proof
  testimonials: Testimonial[] = [
    {
      name: 'Thomas M.',
      initials: 'TM',
      text: 'Habe hier mein Trekkingrad gekauft. Super Beratung, faire Preise und das Rad war top aufbereitet. Kann ich nur empfehlen!',
      detail: 'Trekkingrad gekauft',
      rating: 5,
    },
    {
      name: 'Sandra K.',
      initials: 'SK',
      text: 'Endlich ein Fahrradladen in Freiburg, der ehrlich berät und keine überteuerten Preise hat. Mein Sohn liebt sein neues Kinderfahrrad!',
      detail: 'Kinderfahrrad gekauft',
      rating: 5,
    },
    {
      name: 'Michael W.',
      initials: 'MW',
      text: 'Als Student war ich auf der Suche nach einem günstigen, zuverlässigen Fahrrad. Bei Bike Haus wurde ich fündig. Top Qualität zum fairen Preis!',
      detail: 'Cityrad gekauft',
      rating: 5,
    },
    {
      name: 'Elena B.',
      initials: 'EB',
      text: 'Ich habe mein altes Fahrrad hier verkauft und gleich ein E-Bike mitgenommen. Unkompliziert und fair. Beste Fahrradhandlung in Freiburg!',
      detail: 'E-Bike gekauft',
      rating: 5,
    },
    {
      name: 'Peter H.',
      initials: 'PH',
      text: 'Schnelle und unkomplizierte Abwicklung. Das gebrauchte Mountainbike war in einwandfreiem Zustand. Sehr zu empfehlen!',
      detail: 'Mountainbike gekauft',
      rating: 5,
    },
    {
      name: 'Julia F.',
      initials: 'JF',
      text: 'Toller Service! Die Beratung war super und ich wurde nicht gedrängt. Mein neues Fahrrad macht mich jeden Tag glücklich.',
      detail: 'Damenrad gekauft',
      rating: 5,
    },
  ];

  private reviewSchemaElement: HTMLScriptElement | null = null;

  ngOnInit(): void {
    // SEO - Reset to homepage defaults
    this.titleService.setTitle(this.t().metaTitle);
    this.metaService.updateTag({
      name: 'description',
      content: this.t().metaDescription,
    });
    this.metaService.updateTag({
      property: 'og:title',
      content: this.t().metaTitle,
    });
    this.metaService.updateTag({
      property: 'og:url',
      content: 'https://bikehausfreiburg.com',
    });

    // Add Review/Rating Schema for SEO
    this.addReviewSchema();

    this.loadData();
  }

  private addReviewSchema(): void {
    const reviews = this.testimonials.map((t) => ({
      '@type': 'Review',
      author: {
        '@type': 'Person',
        name: t.name,
      },
      reviewRating: {
        '@type': 'Rating',
        ratingValue: t.rating,
        bestRating: 5,
      },
      reviewBody: t.text,
    }));

    const schema = {
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      '@id': 'https://bikehausfreiburg.com/#localbusiness',
      name: 'Bike Haus Freiburg',
      image: 'https://bikehausfreiburg.com/assets/og-image.jpg',
      url: 'https://bikehausfreiburg.com',
      telephone: '+49-155-66300011',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Heckerstraße 27',
        addressLocality: 'Freiburg im Breisgau',
        postalCode: '79114',
        addressCountry: 'DE',
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: 47.999,
        longitude: 7.8421,
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.9',
        reviewCount: this.testimonials.length.toString(),
        bestRating: '5',
        worstRating: '1',
      },
      review: reviews,
      priceRange: '€-€€€',
      openingHoursSpecification: [
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          opens: '10:00',
          closes: '18:00',
        },
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: 'Saturday',
          opens: '10:00',
          closes: '14:00',
        },
      ],
    };

    this.reviewSchemaElement = this.document.createElement('script');
    this.reviewSchemaElement.type = 'application/ld+json';
    this.reviewSchemaElement.text = JSON.stringify(schema);
    this.document.head.appendChild(this.reviewSchemaElement);
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

    this.apiService.getNeueFahrraeder().subscribe({
      next: (data) => this.neueFahrraeder.set(data),
    });
  }

  openLightbox(index: number): void {
    this.lightboxIndex = index;
    this.lightboxOpen = true;
  }

  closeLightbox(): void {
    this.lightboxOpen = false;
  }

  nextPhoto(event: Event): void {
    event.stopPropagation();
    this.lightboxIndex = (this.lightboxIndex + 1) % this.shopPhotos.length;
  }

  prevPhoto(event: Event): void {
    event.stopPropagation();
    this.lightboxIndex =
      (this.lightboxIndex - 1 + this.shopPhotos.length) %
      this.shopPhotos.length;
  }
}
