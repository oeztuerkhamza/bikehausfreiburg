import {
  Component,
  PLATFORM_ID,
  inject,
  OnInit,
  OnDestroy,
  signal,
} from '@angular/core';
import { CommonModule, DOCUMENT, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { TranslationService } from '../../services/translation.service';
import { ApiService } from '../../services/api.service';
import { BikeCardComponent } from '../../components/bike-card/bike-card.component';
import { NeueBikeCardComponent } from '../../components/neue-bike-card/neue-bike-card.component';
import { HeroSectionComponent } from './hero-section.component';
import { environment } from '../../../environments/environment';
import {
  KleinanzeigenListing,
  KleinanzeigenCategory,
  PublicShopInfo,
  NeueFahrrad,
  RepairShowcase,
  GoogleReview,
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
    HeroSectionComponent,
  ],
  template: `
    <!-- ═══ HERO SECTION 2026 ═══ -->
    <app-hero-section></app-hero-section>

    <!-- ═══ SERVICE CARDS ═══ -->
    <section class="svc-cards-section" [attr.aria-label]="t().homeServicesAria">
      <div class="container">
        <div class="svc-cards-grid">
          <!-- Reparatur -->
          <div class="svc-card svc-card-repair">
            <div class="svc-card-icon">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
              >
                <path
                  d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"
                />
              </svg>
            </div>
            <span class="svc-card-badge">{{ t().svcRepairBadge }}</span>
            <h2 class="svc-card-title">{{ t().svcRepairTitle }}</h2>
            <p class="svc-card-sub">{{ t().svcRepairSub }}</p>
            <ul class="svc-card-list">
              <li>{{ t().svcRepairItem1 }}</li>
              <li>{{ t().svcRepairItem2 }}</li>
              <li>{{ t().svcRepairItem3 }}</li>
              <li>{{ t().svcRepairItem4 }}</li>
            </ul>
            <a
              href="https://wa.me/491556630011"
              target="_blank"
              rel="noopener noreferrer"
              class="svc-card-cta svc-card-cta-whatsapp"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
                style="flex-shrink:0"
              >
                <path
                  d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"
                />
              </svg>
              {{ t().svcRepairWaCta }}
            </a>
          </div>
          <!-- Verleih -->
          <div class="svc-card svc-card-rental">
            <div class="rental-top-row">
              <div class="svc-card-icon">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.5"
                >
                  <circle cx="5.5" cy="17.5" r="3.5" />
                  <circle cx="18.5" cy="17.5" r="3.5" />
                  <path d="M15 6l-4 8h6l-2 3.5" />
                  <path d="M5.5 17.5L9 9h3" />
                </svg>
              </div>
              <span class="rental-best-badge"
                >🔥 {{ t().homeRentalBestBadge }}</span
              >
            </div>
            <span class="svc-card-badge">{{ t().bikeRental }}</span>
            <h2 class="svc-card-title">
              {{ t().homeRentalCardTitle }}<br /><span
                class="rental-price-inline"
                ><strong>{{ t().homeRentalInlinePrice }}</strong></span
              >
            </h2>
            <div class="rental-packages">
              <div class="rental-pkg">
                <span class="pkg-days">{{ t().homeRentalPkgDays }}</span>
                <span class="pkg-price">{{ t().homeRentalPkgPrice }}</span>
                <span class="pkg-day">{{ t().homeRentalPkgSub }}</span>
              </div>
              <div class="rental-pkg rental-pkg-highlight">
                <span class="pkg-badge-top">{{
                  t().homeRentalPopularBadge
                }}</span>
                <span class="pkg-days">{{ t().homeRentalPkgFromDay8 }}</span>
                <span class="pkg-price">{{ t().homeRentalPkgPlusPrice }}</span>
                <span class="pkg-day">{{ t().homeRentalPkgPlusSub }}</span>
              </div>
            </div>
            <ul class="svc-card-list">
              <li>{{ t().homeRentalLock }}</li>
              <li>{{ t().homeRentalHelmet }}</li>
              <li>{{ t().homeRentalAvail }}</li>
            </ul>
            <div class="rental-ctas">
              <a
                [routerLink]="['/' + lang(), 'fahrradverleih']"
                class="rental-cta-primary"
              >
                {{ t().homeRentalBookCta }}
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          </div>
          <!-- Neue Fahrräder -->
          <div class="svc-card svc-card-angebote">
            <div class="svc-card-icon">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
              >
                <circle cx="5.5" cy="17.5" r="3.5" />
                <circle cx="18.5" cy="17.5" r="3.5" />
                <path d="M15 6l-4 8h6l-2 3.5" />
                <path d="M5.5 17.5L9 9h3" />
              </svg>
            </div>
            <span class="svc-card-badge">{{ t().svcAngeboteBadge }}</span>
            <h2 class="svc-card-title">{{ t().svcAngeboteTitle }}</h2>
            <p class="svc-card-sub">{{ t().svcAngeboteSub }}</p>
            <a
              [routerLink]="['/' + lang(), 'neue-fahrraeder']"
              class="svc-card-cta"
            >
              {{ t().svcAngeboteCta }}
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </div>
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
              [alt]="t().homeGalleryImageAltPrefix + ' ' + (i + 1)"
              loading="lazy"
              width="400"
              height="300"
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
        [attr.aria-label]="t().homeLightboxCloseAria"
      >
        &times;
      </button>
      <button
        class="lightbox-nav lightbox-prev"
        (click)="prevPhoto($event)"
        [attr.aria-label]="t().homeLightboxPrevAria"
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
        [alt]="t().homeGalleryImageAltPrefix + ' ' + (lightboxIndex + 1)"
        class="lightbox-img"
        width="1200"
        height="800"
        (click)="$event.stopPropagation()"
      />
      <button
        class="lightbox-nav lightbox-next"
        (click)="nextPhoto($event)"
        [attr.aria-label]="t().homeLightboxNextAria"
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
                {{ t().bikeCheckLightCheck }}
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
                {{ t().bikeCheckReflectorCheck }}
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
                {{ t().bikeCheckBellCheck }}
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
                {{ t().bikeCheckSafetyCheck }}
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
                    d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"
                  />
                </svg>
                {{ t().bikeCheckCableReplace }}
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
                    d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"
                  />
                </svg>
                {{ t().bikeCheckBottomBracket }}
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
                    d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"
                  />
                </svg>
                {{ t().bikeCheckSpokeRepair }}
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
                    d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"
                  />
                </svg>
                {{ t().bikeCheckLightInstall }}
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
                    d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"
                  />
                </svg>
                {{ t().bikeCheckPedalReplace }}
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

    <!-- ═══ Section 7b — REPAIR SHOWCASES ═══ -->
    @if (repairShowcases().length > 0) {
      <section class="repair-section" aria-labelledby="repair-heading">
        <div class="container">
          <span class="section-label fade-in">{{ t().repairLabel }}</span>
          <h2 id="repair-heading" class="section-title fade-in d1">
            {{ t().repairTitle }}
          </h2>
          <p class="section-subtitle fade-in d2">{{ t().repairSub }}</p>

          <div class="repair-showcase fade-in d3">
            <!-- Main image display -->
            <div class="repair-main-image">
              @if (repairShowcases()[repairActiveIndex].images.length) {
                <img
                  [src]="
                    getRepairImageUrl(
                      repairShowcases()[repairActiveIndex].images[
                        repairImageIndex
                      ].filePath
                    )
                  "
                  [alt]="repairShowcases()[repairActiveIndex].titel"
                  loading="lazy"
                  width="800"
                  height="500"
                />
                <!-- Image counter -->
                @if (repairShowcases()[repairActiveIndex].images.length > 1) {
                  <div class="repair-image-counter">
                    {{ repairImageIndex + 1 }} /
                    {{ repairShowcases()[repairActiveIndex].images.length }}
                  </div>
                }
              }
              <!-- Overlay info -->
              <div class="repair-overlay">
                <h3>{{ repairShowcases()[repairActiveIndex].titel }}</h3>
                @if (repairShowcases()[repairActiveIndex].beschreibung) {
                  <p>{{ repairShowcases()[repairActiveIndex].beschreibung }}</p>
                }
              </div>
            </div>

            <!-- Thumbnail strip -->
            @if (repairShowcases().length > 1) {
              <div class="repair-thumbs">
                @for (
                  showcase of repairShowcases();
                  track showcase.id;
                  let i = $index
                ) {
                  <button
                    class="repair-thumb"
                    [class.active]="i === repairActiveIndex"
                    (click)="selectRepairShowcase(i)"
                  >
                    @if (showcase.images.length > 0) {
                      <img
                        [src]="getRepairImageUrl(showcase.images[0].filePath)"
                        [alt]="showcase.titel"
                        loading="lazy"
                        width="120"
                        height="70"
                      />
                    }
                    <span class="repair-thumb-label">{{ showcase.titel }}</span>
                  </button>
                }
              </div>
            }
          </div>
        </div>
      </section>
    }

    <!-- ═══ Section 8 — GOOGLE REVIEWS ═══ -->
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

        <!-- Google Rating Badge -->
        @if (googleRating() > 0) {
          <div class="google-rating-badge fade-in d2">
            <svg class="google-icon" viewBox="0 0 24 24" width="28" height="28">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            <div class="google-rating-info">
              <div class="google-rating-stars">
                <span class="google-rating-value">{{
                  googleRating().toFixed(1)
                }}</span>
                <div class="google-stars-row">
                  @for (s of [1, 2, 3, 4, 5]; track s) {
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      [attr.fill]="s <= googleRating() ? '#f59e0b' : '#4b5563'"
                    >
                      <path
                        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                      />
                    </svg>
                  }
                </div>
              </div>
              <span class="google-review-count"
                >{{ googleTotalReviews() }} Google
                {{ t().reviewCountLabel }}</span
              >
            </div>
            @if (googlePlaceUrl()) {
              <a
                [href]="googlePlaceUrl()"
                target="_blank"
                rel="noopener"
                class="google-review-link"
              >
                {{ t().reviewCta }}
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"
                  />
                </svg>
              </a>
            }
          </div>
        }

        <div class="testimonials-grid">
          <!-- Google Reviews (real) -->
          @if (googleReviews().length > 0) {
            @for (review of googleReviews(); track review.time) {
              @if (review.text) {
                <article class="testimonial-card fade-in d1">
                  <div
                    class="testimonial-stars"
                    [attr.aria-label]="review.rating + ' von 5 Sternen'"
                  >
                    @for (s of [1, 2, 3, 4, 5]; track s) {
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        [attr.fill]="s <= review.rating ? '#f59e0b' : '#4b5563'"
                      >
                        <path
                          d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                        />
                      </svg>
                    }
                  </div>
                  <blockquote class="testimonial-text">
                    "{{ review.text }}"
                  </blockquote>
                  <footer class="testimonial-author">
                    @if (review.authorPhotoUrl) {
                      <img
                        [src]="review.authorPhotoUrl"
                        [alt]="review.authorName"
                        class="author-photo"
                        width="44"
                        height="44"
                        loading="lazy"
                        referrerpolicy="no-referrer"
                      />
                    } @else {
                      <div class="author-avatar">
                        {{ getInitials(review.authorName) }}
                      </div>
                    }
                    <div class="author-info">
                      <cite class="author-name">{{ review.authorName }}</cite>
                      <span class="author-detail">{{
                        review.relativeTime
                      }}</span>
                    </div>
                  </footer>
                </article>
              }
            }
          } @else {
            <!-- Fallback: hardcoded testimonials -->
            <article
              class="testimonial-card fade-in d1"
              *ngFor="let review of fallbackTestimonials(); let i = index"
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
          }
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
      :host {
        display: block;
        background:
          radial-gradient(
            circle at top,
            rgba(255, 87, 34, 0.08),
            transparent 30%
          ),
          linear-gradient(180deg, rgba(255, 255, 255, 0.015), transparent 22%),
          var(--color-bg);
      }

      .section,
      .repair-section,
      .testimonials-section,
      .faq-section,
      .cta-section {
        position: relative;
      }

      .section .container,
      .repair-section .container,
      .testimonials-section .container,
      .faq-section .container,
      .cta-inner {
        position: relative;
        z-index: 1;
      }

      .section {
        padding: 1.4rem 0;
      }

      .section .container,
      .repair-section .container,
      .testimonials-section .container,
      .faq-section .container {
        padding: 2.2rem;
        border-radius: 30px;
        background:
          linear-gradient(
            180deg,
            rgba(255, 255, 255, 0.045),
            rgba(255, 255, 255, 0.015)
          ),
          rgba(17, 20, 27, 0.7);
        border: 1px solid rgba(255, 255, 255, 0.08);
        box-shadow: 0 28px 70px rgba(0, 0, 0, 0.14);
        overflow: hidden;
      }

      .section .container::before,
      .repair-section .container::before,
      .testimonials-section .container::before,
      .faq-section .container::before {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(
          135deg,
          rgba(255, 255, 255, 0.05),
          transparent 40%
        );
        pointer-events: none;
      }

      .section-alt .container,
      .repair-section .container,
      .testimonials-section .container,
      .faq-section .container {
        background:
          linear-gradient(
            180deg,
            rgba(255, 255, 255, 0.05),
            rgba(255, 255, 255, 0.02)
          ),
          rgba(12, 15, 21, 0.82);
      }

      .section-label {
        display: inline-flex;
        align-items: center;
        gap: 0.45rem;
        padding: 0.4rem 0.75rem;
        border-radius: 999px;
        background: rgba(255, 87, 34, 0.1);
        border: 1px solid rgba(255, 87, 34, 0.18);
      }

      .section-title {
        font-size: clamp(2rem, 4vw, 3.35rem);
        line-height: 0.98;
        letter-spacing: -0.04em;
        margin: 1rem 0 0.9rem;
      }

      .section-subtitle {
        max-width: 720px;
        font-size: 1rem;
        line-height: 1.75;
        color: rgba(255, 255, 255, 0.68);
      }

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
        max-width: 980px;
      }

      .hero-label {
        display: inline-block;
        font-size: 0.8rem;
        font-weight: 700;
        letter-spacing: 0.18em;
        text-transform: uppercase;
        color: var(--color-accent);
        margin-bottom: 1.5rem;
        padding: 0.5rem 0.8rem;
        border-radius: 999px;
        background: rgba(255, 87, 34, 0.1);
        border: 1px solid rgba(255, 87, 34, 0.16);
      }

      .hero-h1 {
        font-size: clamp(3.2rem, 8vw, 6rem);
        font-weight: 800;
        line-height: 0.94;
        letter-spacing: -0.055em;
        color: var(--color-text);
        margin: 0 auto 1.35rem;
        max-width: 980px;
      }

      .hero-sub {
        font-size: clamp(1rem, 2vw, 1.2rem);
        color: rgba(255, 255, 255, 0.72);
        line-height: 1.8;
        max-width: 720px;
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
        gap: 1rem;
        flex-wrap: wrap;

        .hero-stats-hidden {
          visibility: hidden;
        }
      }

      .h-stat {
        display: flex;
        flex-direction: column;
        align-items: center;
        min-width: 170px;
        padding: 1rem 1.2rem;
        border-radius: 20px;
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid rgba(255, 255, 255, 0.08);
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
      }

      .h-stat-n {
        font-size: 2.4rem;
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
        position: relative;
        background:
          linear-gradient(
            180deg,
            rgba(255, 255, 255, 0.05),
            rgba(255, 255, 255, 0.015)
          ),
          var(--color-surface);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 22px;
        padding: 2rem 1.6rem;
        transition:
          border-color 0.3s,
          transform 0.3s,
          box-shadow 0.3s;
      }

      .value-card:hover {
        border-color: var(--color-accent);
        transform: translateY(-6px);
        box-shadow: 0 18px 44px rgba(0, 0, 0, 0.18);
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
        gap: 1.25rem;
      }

      .view-all-btn {
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        flex-shrink: 0;
        padding: 0.85rem 1.1rem;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid rgba(255, 255, 255, 0.08);
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
        background: rgba(255, 255, 255, 0.035);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 18px;
        padding: 1.35rem 1.5rem;
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
        padding: 0.4rem;
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
        border-radius: 20px;
        overflow: hidden;
        cursor: pointer;
        aspect-ratio: 4 / 3;
        border: 1px solid rgba(255, 255, 255, 0.08);
        box-shadow: 0 16px 44px rgba(0, 0, 0, 0.14);
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

      /* ═══ REPAIR SHOWCASE SECTION ═══ */
      .repair-section {
        padding: 6rem 0;
        background: linear-gradient(
          180deg,
          rgba(0, 0, 0, 0.02) 0%,
          transparent 100%
        );
      }

      .repair-showcase {
        margin-top: 3rem;
        max-width: 900px;
        margin-left: auto;
        margin-right: auto;
      }

      .repair-main-image {
        position: relative;
        border-radius: 16px;
        overflow: hidden;
        aspect-ratio: 16 / 10;
        background: #111;
      }

      .repair-main-image img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: opacity 0.5s ease;
      }

      .repair-image-counter {
        position: absolute;
        top: 1rem;
        right: 1rem;
        background: rgba(0, 0, 0, 0.6);
        color: #fff;
        padding: 4px 12px;
        border-radius: 20px;
        font-size: 0.75rem;
        font-weight: 600;
        letter-spacing: 0.05em;
      }

      .repair-overlay {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        padding: 2rem 1.5rem 1.5rem;
        background: linear-gradient(transparent, rgba(0, 0, 0, 0.75));
        color: #fff;
      }

      .repair-overlay h3 {
        font-size: 1.2rem;
        font-weight: 700;
        margin: 0 0 0.3rem;
      }

      .repair-overlay p {
        font-size: 0.85rem;
        margin: 0;
        opacity: 0.85;
        line-height: 1.4;
      }

      .repair-thumbs {
        display: flex;
        gap: 0.75rem;
        margin-top: 1rem;
        overflow-x: auto;
        padding-bottom: 0.5rem;
      }

      .repair-thumb {
        flex-shrink: 0;
        width: 120px;
        border: 2px solid transparent;
        border-radius: 10px;
        overflow: hidden;
        cursor: pointer;
        background: #222;
        padding: 0;
        transition:
          border-color 0.2s,
          transform 0.2s;
      }

      .repair-thumb.active {
        border-color: #e8c547;
        transform: scale(1.05);
      }

      .repair-thumb:hover {
        border-color: rgba(232, 197, 71, 0.5);
      }

      .repair-thumb img {
        width: 100%;
        height: 70px;
        object-fit: cover;
        display: block;
      }

      .repair-thumb-label {
        display: block;
        padding: 4px 6px;
        font-size: 0.65rem;
        font-weight: 600;
        color: rgba(255, 255, 255, 0.8);
        text-align: center;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      /* ═══ BIKE CHECK SECTION ═══ */
      .bikecheck-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 2rem;
        margin-top: 3rem;
      }

      .bikecheck-card {
        background: rgba(255, 255, 255, 0.035);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 22px;
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

      /* ═══ TESTIMONIALS / GOOGLE REVIEWS SECTION ═══ */
      .testimonials-section {
        padding: 6rem 0;
        background: var(--color-bg);
      }

      .google-rating-badge {
        display: flex;
        align-items: center;
        gap: 1rem;
        background: rgba(255, 255, 255, 0.035);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 22px;
        padding: 1.25rem 1.75rem;
        margin-top: 2rem;
        width: fit-content;
        margin-left: auto;
        margin-right: auto;
      }

      .google-icon {
        flex-shrink: 0;
      }

      .google-rating-info {
        display: flex;
        flex-direction: column;
        gap: 0.15rem;
      }

      .google-rating-stars {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .google-rating-value {
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--color-text);
      }

      .google-stars-row {
        display: flex;
        gap: 2px;
      }

      .google-review-count {
        font-size: 0.85rem;
        color: var(--color-text-secondary);
      }

      .google-review-link {
        display: flex;
        align-items: center;
        gap: 0.35rem;
        margin-left: 1rem;
        padding: 0.5rem 1rem;
        border-radius: 8px;
        background: var(--color-accent);
        color: white;
        font-size: 0.85rem;
        font-weight: 600;
        text-decoration: none;
        white-space: nowrap;
        transition: opacity 0.2s;
      }

      .google-review-link:hover {
        opacity: 0.9;
      }

      .author-photo {
        width: 44px;
        height: 44px;
        border-radius: 50%;
        object-fit: cover;
      }

      .testimonials-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
        gap: 1.5rem;
        margin-top: 3rem;
      }

      .testimonial-card {
        background: rgba(255, 255, 255, 0.035);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 22px;
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
        background: rgba(255, 255, 255, 0.035);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 18px;
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
          rgba(255, 255, 255, 0.04) 0%,
          rgba(15, 18, 24, 0.95) 100%
        );
        text-align: center;
        overflow: hidden;
        border-top: 1px solid rgba(255, 255, 255, 0.08);
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
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

      /* ═══ SERVICE CARDS ═══ */
      .svc-cards-section {
        background: var(--color-bg);
        padding: 0 0 4rem;
      }
      .svc-cards-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1.25rem;
        padding-top: 2.5rem;
      }
      .svc-card {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        padding: 2rem 1.75rem;
        border-radius: 16px;
        border: 1px solid rgba(255, 255, 255, 0.08);
        background: rgba(255, 255, 255, 0.03);
        transition:
          border-color 0.2s,
          transform 0.2s;
        position: relative;
        overflow: hidden;
      }
      .svc-card::before {
        content: '';
        position: absolute;
        inset: 0;
        opacity: 0;
        transition: opacity 0.3s;
        pointer-events: none;
      }
      .svc-card-repair::before {
        background: radial-gradient(
          ellipse at top left,
          rgba(255, 80, 20, 0.08) 0%,
          transparent 60%
        );
      }
      .svc-card-rental::before {
        background: radial-gradient(
          ellipse at top left,
          rgba(20, 80, 255, 0.08) 0%,
          transparent 60%
        );
      }
      .svc-card-angebote::before {
        background: radial-gradient(
          ellipse at top left,
          rgba(255, 150, 20, 0.08) 0%,
          transparent 60%
        );
      }
      .svc-card:hover {
        border-color: rgba(255, 255, 255, 0.18);
        transform: translateY(-3px);
      }
      .svc-card:hover::before {
        opacity: 1;
      }
      .svc-card-icon {
        width: 48px;
        height: 48px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(255, 255, 255, 0.06);
        border-radius: 12px;
        color: var(--color-accent);
        margin-bottom: 0.25rem;
      }
      .svc-card-icon svg {
        width: 24px;
        height: 24px;
      }
      .svc-card-badge {
        display: inline-block;
        background: var(--color-accent);
        color: #fff;
        font-size: 0.68rem;
        font-weight: 700;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        padding: 0.25rem 0.65rem;
        border-radius: 2rem;
        width: fit-content;
      }
      .svc-card-title {
        font-size: 1.25rem;
        font-weight: 800;
        color: #ffffff;
        line-height: 1.2;
        margin: 0;
      }
      .svc-card-sub {
        font-size: 0.9rem;
        color: rgba(255, 255, 255, 0.55);
        line-height: 1.6;
        margin: 0;
        flex: 1;
      }
      .svc-card-cta {
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        color: var(--color-accent);
        font-size: 0.875rem;
        font-weight: 700;
        text-decoration: none;
        margin-top: 0.5rem;
        transition: gap 0.2s;
      }
      .svc-card-cta:hover {
        gap: 0.65rem;
      }
      .svc-card-list {
        list-style: none;
        padding: 0;
        margin: 0.25rem 0 0.5rem;
        display: flex;
        flex-direction: column;
        gap: 0.45rem;
      }
      .svc-card-list li {
        font-size: 0.875rem;
        color: rgba(255, 255, 255, 0.75);
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
      .svc-card-list li::before {
        content: '✔';
        color: var(--color-accent);
        font-size: 0.75rem;
        flex-shrink: 0;
      }
      .svc-card-cta-whatsapp {
        color: #25d366;
      }
      /* ── Rental card ── */
      .rental-top-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.5rem;
        margin-bottom: 0.25rem;
      }
      .rental-best-badge {
        font-size: 0.72rem;
        font-weight: 700;
        color: #ff9500;
        background: rgba(255, 149, 0, 0.12);
        border: 1px solid rgba(255, 149, 0, 0.25);
        padding: 0.25rem 0.6rem;
        border-radius: 2rem;
        white-space: nowrap;
      }
      .rental-price-inline {
        font-size: 1rem;
        font-weight: 400;
        color: rgba(255, 255, 255, 0.55);
        display: block;
        margin-top: 0.2rem;
      }
      .rental-price-inline strong {
        color: var(--color-accent);
        font-size: 1.4rem;
        font-weight: 800;
      }
      .rental-packages {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 0.75rem;
        margin: 0.75rem 0;
      }
      .rental-pkg {
        position: relative;
        display: flex;
        flex-direction: column;
        gap: 0.2rem;
        padding: 0.9rem 1rem;
        border-radius: 10px;
        border: 1px solid rgba(255, 255, 255, 0.09);
        background: rgba(255, 255, 255, 0.04);
      }
      .rental-pkg-highlight {
        border-color: var(--color-accent);
        background: rgba(255, 80, 20, 0.07);
      }
      .pkg-badge-top {
        position: absolute;
        top: -10px;
        left: 50%;
        transform: translateX(-50%);
        background: var(--color-accent);
        color: #fff;
        font-size: 0.62rem;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        padding: 0.15rem 0.55rem;
        border-radius: 2rem;
        white-space: nowrap;
      }
      .pkg-days {
        font-size: 0.8rem;
        color: rgba(255, 255, 255, 0.5);
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.06em;
      }
      .pkg-price {
        font-size: 1.5rem;
        font-weight: 800;
        color: #fff;
        line-height: 1;
      }
      .rental-pkg-highlight .pkg-price {
        color: var(--color-accent);
      }
      .pkg-day {
        font-size: 0.72rem;
        color: rgba(255, 255, 255, 0.4);
      }
      .rental-ctas {
        display: flex;
        flex-direction: column;
        gap: 0.6rem;
        margin-top: 0.75rem;
      }
      .rental-cta-primary {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        background: linear-gradient(135deg, #ff5722, #e64a19);
        color: #fff;
        font-size: 0.875rem;
        font-weight: 700;
        padding: 0.75rem 1.25rem;
        border-radius: 3rem;
        text-decoration: none;
        transition:
          opacity 0.2s,
          transform 0.2s;
        box-shadow: 0 8px 24px rgba(255, 87, 34, 0.3);
      }
      .rental-cta-primary:hover {
        opacity: 0.9;
        transform: translateY(-1px);
      }
      .rental-cta-wa {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.4rem;
        color: rgba(255, 255, 255, 0.5);
        font-size: 0.82rem;
        font-weight: 600;
        text-decoration: none;
        transition: color 0.2s;
      }
      .rental-cta-wa:hover {
        color: #fff;
      }

      /* ═══ HERO (standalone) ═══ */
      .slide-hero {
        position: relative;
        min-height: 100vh;
        min-height: 100dvh;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--color-bg);
        overflow: hidden;
      }

      /* ═══ RESPONSIVE ═══ */
      @media (max-width: 1024px) {
        .section .container,
        .repair-section .container,
        .testimonials-section .container,
        .faq-section .container {
          padding: 1.7rem;
        }

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
        .svc-cards-grid {
          grid-template-columns: repeat(2, 1fr);
        }
      }

      @media (max-width: 768px) {
        .google-rating-badge {
          flex-wrap: wrap;
          justify-content: center;
          padding: 1rem;
        }
        .google-review-link {
          margin-left: 0;
          margin-top: 0.5rem;
        }
        .bikecheck-grid {
          grid-template-columns: 1fr;
          gap: 1.15rem;
          margin-top: 2rem;
        }
        .bikecheck-card {
          padding: 1.35rem;
        }
        .bikecheck-card-header {
          margin-bottom: 1rem;
        }
        .bikecheck-list {
          gap: 0.8rem;
        }
        .bikecheck-list li {
          align-items: flex-start;
          font-size: 0.95rem;
          line-height: 1.45;
        }
        .bikecheck-badge {
          max-width: 100%;
          white-space: normal;
          line-height: 1.25;
          letter-spacing: 0.06em;
          font-size: 0.62rem;
          padding: 0.3rem 0.55rem;
        }
        .svc-cards-grid {
          grid-template-columns: 1fr;
          gap: 1rem;
        }
        .svc-card {
          padding: 1.5rem 1.25rem;
        }
        .repair-thumb {
          width: 90px;
        }
        .repair-thumb img {
          height: 55px;
        }
      }

      @media (max-width: 640px) {
        .section .container,
        .repair-section .container,
        .testimonials-section .container,
        .faq-section .container {
          padding: 1.2rem;
          border-radius: 22px;
        }

        .hero-inner {
          padding: 7rem 1rem 5rem;
        }

        .hero-h1 {
          font-size: clamp(2.8rem, 15vw, 4rem);
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
          gap: 0.75rem;
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
          padding: 1.2rem;
        }
        .bikecheck-card-header h3 {
          font-size: 1.15rem;
        }
        .bikecheck-badge {
          font-size: 0.6rem;
          padding: 0.28rem 0.5rem;
        }
        .bikecheck-note {
          flex-direction: column;
          text-align: center;
        }
      }
    `,
  ],
})
export class HomeComponent implements OnInit, OnDestroy {
  private translationService = inject(TranslationService);
  private apiService = inject(ApiService);
  private titleService = inject(Title);
  private metaService = inject(Meta);
  private document = inject(DOCUMENT);
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  t = this.translationService.translations;
  lang = this.translationService.currentLanguage;

  listings = signal<KleinanzeigenListing[]>([]);
  categories = signal<KleinanzeigenCategory[]>([]);
  shopInfo = signal<PublicShopInfo | null>(null);
  neueFahrraeder = signal<NeueFahrrad[]>([]);
  loading = signal(true);

  // ── Service Carousel ──
  currentSlide = 0;
  private carouselInterval: ReturnType<typeof setInterval> | null = null;
  private carouselPaused = false;

  get totalSlides(): number {
    return 3 + (this.angebotBikes().length > 0 ? 1 : 0);
  }

  get slideIndices(): number[] {
    return Array.from({ length: this.totalSlides }, (_, i) => i);
  }

  angebotBikes() {
    return this.neueFahrraeder()
      .filter((b) => b.angebot && b.angebot > 0)
      .slice(0, 3);
  }

  get carouselTransform(): string {
    return `translateX(-${this.currentSlide * 100}%)`;
  }

  getAngebotImageUrl(path: string): string {
    return `${environment.apiUrl.replace('/api/public', '')}${path}`;
  }

  nextSlide(): void {
    this.currentSlide = (this.currentSlide + 1) % this.totalSlides;
    this.resetCarouselTimer();
  }

  prevSlide(): void {
    this.currentSlide =
      (this.currentSlide - 1 + this.totalSlides) % this.totalSlides;
    this.resetCarouselTimer();
  }

  goToSlide(index: number): void {
    this.currentSlide = index;
    this.resetCarouselTimer();
  }

  pauseCarousel(): void {
    this.carouselPaused = true;
    if (this.carouselInterval) {
      clearInterval(this.carouselInterval);
      this.carouselInterval = null;
    }
  }

  resumeCarousel(): void {
    this.carouselPaused = false;
    this.startCarouselTimer();
  }

  private startCarouselTimer(): void {
    if (this.carouselInterval) clearInterval(this.carouselInterval);
    this.carouselInterval = setInterval(() => {
      if (!this.carouselPaused) {
        this.currentSlide = (this.currentSlide + 1) % this.totalSlides;
      }
    }, 5000);
  }

  private resetCarouselTimer(): void {
    this.startCarouselTimer();
  }

  // Repair Showcases
  repairShowcases = signal<RepairShowcase[]>([]);
  repairActiveIndex = 0;
  repairImageIndex = 0;
  private repairInterval: ReturnType<typeof setInterval> | null = null;

  // Shop gallery
  shopPhotos: string[] = [
    '/assets/shop/shop-1.webp',
    '/assets/shop/shop-2.webp',
    '/assets/shop/shop-3.webp',
    '/assets/shop/shop-4.webp',
    '/assets/shop/shop-5.webp',
    '/assets/shop/shop-6.webp',
    '/assets/shop/shop-7.webp',
    '/assets/shop/shop-8.webp',
    '/assets/shop/shop-9.webp',
  ];
  lightboxOpen = false;
  lightboxIndex = 0;

  // Google Reviews
  googleReviews = signal<GoogleReview[]>([]);
  googleRating = signal(0);
  googleTotalReviews = signal(0);
  googlePlaceUrl = signal('');

  // Testimonials for SEO and social proof (fallback when Google API not configured)
  private readonly testimonialsByLanguage: Record<
    'de' | 'en' | 'fr' | 'tr',
    Testimonial[]
  > = {
    de: [
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
    ],
    en: [
      {
        name: 'Thomas M.',
        initials: 'TM',
        text: 'Bought my trekking bike here. Great advice, fair prices, and the bike was perfectly prepared. Highly recommended!',
        detail: 'Bought a trekking bike',
        rating: 5,
      },
      {
        name: 'Sandra K.',
        initials: 'SK',
        text: 'Finally a bike shop in Freiburg that gives honest advice without inflated prices. My son loves his new kids bike!',
        detail: 'Bought a kids bike',
        rating: 5,
      },
      {
        name: 'Michael W.',
        initials: 'MW',
        text: 'As a student, I was looking for an affordable and reliable bike. I found exactly that at Bike Haus. Great quality for a fair price!',
        detail: 'Bought a city bike',
        rating: 5,
      },
      {
        name: 'Elena B.',
        initials: 'EB',
        text: 'I sold my old bike here and took home an e-bike right away. Easy process and fair offer. Best bike shop in Freiburg!',
        detail: 'Bought an e-bike',
        rating: 5,
      },
      {
        name: 'Peter H.',
        initials: 'PH',
        text: 'Fast and hassle-free service. The used mountain bike was in excellent condition. Strong recommendation!',
        detail: 'Bought a mountain bike',
        rating: 5,
      },
      {
        name: 'Julia F.',
        initials: 'JF',
        text: 'Excellent service! The consultation was great and never pushy. My new bike makes me happy every day.',
        detail: "Bought a women's bike",
        rating: 5,
      },
    ],
    fr: [
      {
        name: 'Thomas M.',
        initials: 'TM',
        text: "J'ai acheté mon vélo de trekking ici. Excellents conseils, prix justes et vélo parfaitement préparé. Je recommande vivement !",
        detail: 'Velo de trekking achete',
        rating: 5,
      },
      {
        name: 'Sandra K.',
        initials: 'SK',
        text: 'Enfin un magasin de vélos à Fribourg qui conseille honnêtement sans prix exagérés. Mon fils adore son nouveau vélo enfant !',
        detail: 'Velo enfant achete',
        rating: 5,
      },
      {
        name: 'Michael W.',
        initials: 'MW',
        text: "En tant qu'étudiant, je cherchais un vélo fiable et abordable. Je l'ai trouvé chez Bike Haus. Très bon rapport qualité-prix !",
        detail: 'Velo de ville achete',
        rating: 5,
      },
      {
        name: 'Elena B.',
        initials: 'EB',
        text: "J'ai vendu mon ancien vélo ici et je suis repartie avec un vélo électrique. Processus simple et offre équitable. Le meilleur magasin de vélos à Fribourg !",
        detail: 'Velo electrique achete',
        rating: 5,
      },
      {
        name: 'Peter H.',
        initials: 'PH',
        text: "Service rapide et sans complication. Le VTT d'occasion était en excellent état. Je recommande !",
        detail: 'VTT achete',
        rating: 5,
      },
      {
        name: 'Julia F.',
        initials: 'JF',
        text: 'Service impeccable ! Les conseils étaient excellents, sans pression. Mon nouveau vélo me rend heureuse chaque jour.',
        detail: 'Velo femme achete',
        rating: 5,
      },
    ],
    tr: [
      {
        name: 'Thomas M.',
        initials: 'TM',
        text: 'Trekking bisikletimi buradan aldim. Harika danismanlik, adil fiyat ve bisiklet cok iyi hazirlanmisti. Kesinlikle tavsiye ederim!',
        detail: 'Trekking bisikleti alindi',
        rating: 5,
      },
      {
        name: 'Sandra K.',
        initials: 'SK',
        text: "Sonunda Freiburg'da durust danismanlik yapan ve abartili fiyat uygulamayan bir bisiklet dukkani bulduk. Oglum yeni cocuk bisikletine bayildi!",
        detail: 'Cocuk bisikleti alindi',
        rating: 5,
      },
      {
        name: 'Michael W.',
        initials: 'MW',
        text: "Ogrenci olarak uygun fiyatli ve guvenilir bir bisiklet ariyordum. Bike Haus'ta tam aradigimi buldum. Adil fiyata cok iyi kalite!",
        detail: 'Sehir bisikleti alindi',
        rating: 5,
      },
      {
        name: 'Elena B.',
        initials: 'EB',
        text: "Eski bisikletimi burada sattim ve hemen bir e-bike aldim. Islem cok kolaydi ve teklif adildi. Freiburg'daki en iyi bisiklet dukkanlardan biri!",
        detail: 'E-bike alindi',
        rating: 5,
      },
      {
        name: 'Peter H.',
        initials: 'PH',
        text: 'Hizli ve sorunsuz surec. Ikinci el dag bisikleti cok iyi durumdaydi. Kesinlikle tavsiye ederim!',
        detail: 'Dag bisikleti alindi',
        rating: 5,
      },
      {
        name: 'Julia F.',
        initials: 'JF',
        text: 'Mukemmel servis! Danismanlik cok iyiydi ve hic baski hissetmedim. Yeni bisikletim beni her gun mutlu ediyor.',
        detail: 'Kadin bisikleti alindi',
        rating: 5,
      },
    ],
  };

  private getLocalizedTestimonials(): Testimonial[] {
    const current = this.lang();
    if (
      current === 'de' ||
      current === 'en' ||
      current === 'fr' ||
      current === 'tr'
    ) {
      return this.testimonialsByLanguage[current];
    }
    return this.testimonialsByLanguage.en;
  }

  fallbackTestimonials(): Testimonial[] {
    return this.getLocalizedTestimonials();
  }

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
      property: 'og:description',
      content: this.t().metaDescription,
    });
    this.metaService.updateTag({
      property: 'og:url',
      content: `https://bikehausfreiburg.com/${this.lang()}`,
    });

    // Add Review/Rating Schema for SEO
    this.addReviewSchema();

    if (this.isBrowser) {
      // Browser-only behavior: timers and API subscriptions
      this.loadData();
      return;
    }

    // Server render should not block on client API calls.
    this.loading.set(false);
  }

  private addReviewSchema(): void {
    const googleReviews = this.googleReviews();
    const useGoogle = googleReviews.length > 0;

    const reviews = useGoogle
      ? googleReviews
          .filter((r) => r.text)
          .map((r) => ({
            '@type': 'Review',
            author: { '@type': 'Person', name: r.authorName },
            reviewRating: {
              '@type': 'Rating',
              ratingValue: r.rating,
              bestRating: 5,
            },
            reviewBody: r.text,
          }))
      : this.fallbackTestimonials().map((t) => ({
          '@type': 'Review',
          author: { '@type': 'Person', name: t.name },
          reviewRating: {
            '@type': 'Rating',
            ratingValue: t.rating,
            bestRating: 5,
          },
          reviewBody: t.text,
        }));

    const ratingValue = useGoogle ? this.googleRating().toFixed(1) : '4.9';
    const reviewCount = useGoogle
      ? this.googleTotalReviews().toString()
      : this.fallbackTestimonials().length.toString();

    const schema = {
      '@context': 'https://schema.org',
      '@type': ['LocalBusiness', 'BikeStore'],
      '@id': 'https://bikehausfreiburg.com/#organization',
      name: 'Bike Haus Freiburg',
      image: 'https://bikehausfreiburg.com/assets/logo.png',
      url: 'https://bikehausfreiburg.com',
      telephone: '+49-155-66300011',
      email: 'info.bikehausfreiburg@gmail.com',
      availableLanguage: [
        'German',
        'English',
        'French',
        'Turkish',
        'Spanish',
        'Italian',
        'Arabic',
        'Russian',
      ],
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
        ratingValue,
        reviewCount,
        bestRating: '5',
        worstRating: '1',
      },
      review: reviews,
      priceRange: '€-€€€',
      currenciesAccepted: 'EUR',
      paymentAccepted: 'Cash, Credit Card, Debit Card, PayPal, Bank Transfer',
      sameAs: [
        'https://maps.app.goo.gl/Q1fXe7A6PRb8E5wV7',
        'https://www.instagram.com/bikehausfreiburg',
        'https://wa.me/4915566300011',
      ],
      openingHoursSpecification: [
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Monday', 'Tuesday', 'Thursday'],
          opens: '11:00',
          closes: '17:30',
        },
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: 'Wednesday',
          opens: '14:00',
          closes: '17:30',
        },
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: 'Friday',
          opens: '11:00',
          closes: '13:00',
        },
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: 'Friday',
          opens: '15:00',
          closes: '18:00',
        },
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: 'Saturday',
          opens: '11:30',
          closes: '17:00',
        },
      ],
    };

    // Remove old schema element if exists (e.g. after Google reviews load)
    if (this.reviewSchemaElement) {
      this.reviewSchemaElement.remove();
    }

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

    this.apiService.getRepairShowcases().subscribe({
      next: (data) => {
        this.repairShowcases.set(data);
        if (data.length > 0) {
          this.startRepairSlideshow();
        }
      },
    });

    this.apiService.getGoogleReviews().subscribe({
      next: (data) => {
        if (data.reviews?.length) {
          this.googleReviews.set(data.reviews);
          this.googleRating.set(data.rating);
          this.googleTotalReviews.set(data.totalReviews);
          this.googlePlaceUrl.set(data.placeUrl);
          // Re-inject schema with real Google data
          this.addReviewSchema();
        }
      },
    });
  }

  ngOnDestroy(): void {
    this.stopRepairSlideshow();
    if (this.carouselInterval) clearInterval(this.carouselInterval);
  }

  // ── Repair Showcase Slideshow ──
  getRepairImageUrl(path: string): string {
    return `${environment.apiUrl.replace('/api/public', '')}${path}`;
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  }

  private startRepairSlideshow(): void {
    this.stopRepairSlideshow();
    this.repairInterval = setInterval(() => {
      const showcases = this.repairShowcases();
      if (showcases.length === 0) return;
      const current = showcases[this.repairActiveIndex];
      if (
        current.images.length > 1 &&
        this.repairImageIndex < current.images.length - 1
      ) {
        this.repairImageIndex++;
      } else {
        this.repairActiveIndex =
          (this.repairActiveIndex + 1) % showcases.length;
        this.repairImageIndex = 0;
      }
    }, 3000);
  }

  private stopRepairSlideshow(): void {
    if (this.repairInterval) {
      clearInterval(this.repairInterval);
      this.repairInterval = null;
    }
  }

  selectRepairShowcase(index: number): void {
    this.repairActiveIndex = index;
    this.repairImageIndex = 0;
    this.startRepairSlideshow();
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
