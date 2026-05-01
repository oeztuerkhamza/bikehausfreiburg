import {
  Component,
  computed,
  HostListener,
  inject,
  OnInit,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { TranslationService } from '../../services/translation.service';
import { ApiService } from '../../services/api.service';
import { PublicRentalBicycle, RentalBookingCreate } from '../../models/models';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-fahrradverleih',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="rental-page">
      <!-- ═══ HERO BANNER ═══ -->
      <header class="rental-hero">
        <div class="rental-hero-bg" aria-hidden="true">
          <div class="rental-hero-radial"></div>
          <div class="rental-hero-grain"></div>
        </div>
        <div class="container rental-hero-inner">
          <div class="rental-hero-left">
            <span class="rental-hero-chip">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <circle cx="5.5" cy="17.5" r="3.5" />
                <circle cx="18.5" cy="17.5" r="3.5" />
                <path d="M15 6l-4 8h6l-2 3.5" />
                <path d="M5.5 17.5L9 9h3" />
              </svg>
              Fahrradverleih Freiburg
            </span>
            <h1 class="rental-hero-h1">
              Fahrrad mieten<br /><span class="rental-hero-accent"
                >ab 6,80 € / Tag</span
              >
            </h1>
            <p class="rental-hero-sub">
              Sofort verfügbar – fair, flexibel, ohne versteckte Kosten.<br />Direkt
              bei uns in Freiburg abholen.
            </p>
            <div class="rental-hero-features">
              <span class="rfeat"
                ><svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="3"
                >
                  <polyline points="20 6 9 17 4 12" /></svg
                >Schloss inklusive</span
              >
              <span class="rfeat"
                ><svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="3"
                >
                  <polyline points="20 6 9 17 4 12" /></svg
                >Helm kostenlos</span
              >
              <span class="rfeat"
                ><svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="3"
                >
                  <polyline points="20 6 9 17 4 12" /></svg
                >Sofort verfügbar</span
              >
              <span class="rfeat"
                ><svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="3"
                >
                  <polyline points="20 6 9 17 4 12" /></svg
                >300 € Kaution (bar)</span
              >
            </div>
            <div class="rental-hero-ctas">
              <button
                type="button"
                class="hero-cta-scroll"
                (click)="scrollToBikes()"
              >
                {{ t().rentalHeroScrollCta }}
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M12 5v14M5 12l7 7 7-7" />
                </svg>
              </button>
              <a
                href="https://wa.me/491556630011"
                target="_blank"
                rel="noopener noreferrer"
                class="hero-cta-wa"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path
                    d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"
                  />
                </svg>
                {{ t().rentalHeroWaCta }}
              </a>
            </div>
          </div>
          <div class="rental-hero-right">
            <div class="rental-hero-price-card">
              <div class="rhpc-badge">🔥 Bestes Angebot · Spare 30%</div>
              <div class="rhpc-duration">14 Tage</div>
              <div class="rhpc-price">95 €</div>
              <div class="rhpc-per-day">= nur 6,80 € / Tag</div>
              <div class="rhpc-vs">statt 12 € / Tag einzeln</div>
              <div class="rhpc-features">
                <span>✔ Schloss</span>
                <span>✔ Helm</span>
                <span>✔ Sofort</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div class="container rental-body">
        <section class="rental-signature-band" aria-label="Service Highlights">
          <div class="signature-editorial">
            <span class="section-label">Urban Rental System</span>
            <p>
              Entwickelt wie ein modernes Performance-Studio: schnelle
              Reservierung, klare Preise und direkte Abholung ohne Reibung.
            </p>
          </div>
          <div class="signature-stat-grid">
            <article class="signature-stat-card">
              <span class="signature-stat-value">6,80 €</span>
              <span class="signature-stat-label">Bestpreis pro Tag</span>
            </article>
            <article class="signature-stat-card">
              <span class="signature-stat-value">WhatsApp</span>
              <span class="signature-stat-label">Reservierung in Minuten</span>
            </article>
            <article class="signature-stat-card">
              <span class="signature-stat-value">Helm + Schloss</span>
              <span class="signature-stat-label">Immer im Setup enthalten</span>
            </article>
          </div>
        </section>

        <!-- ═══ PRICING SECTION ═══ -->
        <section class="pricing-section">
          <div class="pricing-header">
            <span class="section-label">{{ t().bikeRentalPricesTitle }}</span>
            <h2 class="pricing-title">{{ t().rentalPricingTitle }}</h2>
            <p class="pricing-sub">{{ t().rentalPricingSub }}</p>
          </div>

          <!-- 3 Main cards -->
          <div class="pricing-main-grid">
            <!-- 7 Tage -->
            <div class="pcard pcard-popular">
              <div class="pcard-top-badge">🔥 Beliebt</div>
              <div class="pcard-label">Woche</div>
              <div class="pcard-duration">7 Tage</div>
              <div class="pcard-price">55 €</div>
              <div class="pcard-per-day">7,85 € / Tag</div>
              <ul class="pcard-features">
                <li>Schloss inklusive</li>
                <li>Helm kostenlos</li>
                <li>Sofort verfügbar</li>
              </ul>
              <a
                href="https://wa.me/491556630011"
                target="_blank"
                rel="noopener noreferrer"
                class="pcard-cta-wa"
              >
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path
                    d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"
                  />
                </svg>
                Jetzt reservieren (WhatsApp)
              </a>
              <a href="#fahrrad-waehlen" class="pcard-cta-alt"
                >Fahrrad wählen &amp; buchen</a
              >
            </div>

            <!-- 14 Tage – best deal -->
            <div class="pcard pcard-best">
              <div class="pcard-top-badge pcard-best-badge">
                🏆 Bestes Angebot · Spare 30%
              </div>
              <div class="pcard-label">2 Wochen</div>
              <div class="pcard-duration">14 Tage</div>
              <div class="pcard-price">95 €</div>
              <div class="pcard-per-day">6,80 € / Tag</div>
              <ul class="pcard-features">
                <li>Schloss inklusive</li>
                <li>Helm kostenlos</li>
                <li>Sofort verfügbar</li>
              </ul>
              <a
                href="https://wa.me/491556630011"
                target="_blank"
                rel="noopener noreferrer"
                class="pcard-cta-wa"
              >
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path
                    d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"
                  />
                </svg>
                Jetzt reservieren (WhatsApp)
              </a>
              <a href="#fahrrad-waehlen" class="pcard-cta-alt"
                >Fahrrad wählen &amp; buchen</a
              >
            </div>

            <!-- 1 Tag -->
            <div class="pcard">
              <div class="pcard-label">Tagesmiete</div>
              <div class="pcard-duration">1 Tag</div>
              <div class="pcard-price">12 €</div>
              <div class="pcard-per-day">12 € / Tag</div>
              <ul class="pcard-features">
                <li>Schloss inklusive</li>
                <li>Helm kostenlos</li>
                <li>Sofort verfügbar</li>
              </ul>
              <a
                href="https://wa.me/491556630011"
                target="_blank"
                rel="noopener noreferrer"
                class="pcard-cta-wa pcard-cta-wa-muted"
              >
                Jetzt anfragen (WhatsApp)
              </a>
              <a href="#fahrrad-waehlen" class="pcard-cta-alt"
                >Fahrrad wählen &amp; buchen</a
              >
            </div>
          </div>

          <!-- Extra prices compact -->
          <div class="pricing-extra-row">
            <div class="pextra-item">
              <span class="pextra-dur">3 Tage</span>
              <span class="pextra-price">28 €</span>
              <span class="pextra-day">9,33 € / Tag</span>
              <a
                href="https://wa.me/491556630011"
                target="_blank"
                rel="noopener noreferrer"
                class="pextra-cta"
                >Anfragen</a
              >
            </div>
            <div class="pextra-item">
              <span class="pextra-dur">30 Tage</span>
              <span class="pextra-price">149 €</span>
              <span class="pextra-day">4,97 € / Tag</span>
              <a
                href="https://wa.me/491556630011"
                target="_blank"
                rel="noopener noreferrer"
                class="pextra-cta"
                >Anfragen</a
              >
            </div>
            <div class="pextra-item">
              <span class="pextra-dur">ab 10 Tage / Tag</span>
              <span class="pextra-price">7 €</span>
              <span class="pextra-day">individuell</span>
              <a
                href="https://wa.me/491556630011"
                target="_blank"
                rel="noopener noreferrer"
                class="pextra-cta"
                >Anfragen</a
              >
            </div>
          </div>

          <!-- Deposit & included info bar -->
          <div class="pricing-info-bar">
            <div class="pinfo-item">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <div>
                <strong>Kaution</strong>
                <span>300 € bar, wird bei Rückgabe erstattet</span>
              </div>
            </div>
            <div class="pinfo-item">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <div>
                <strong>Immer dabei</strong>
                <span>Schloss &amp; Helm kostenlos – ohne Aufpreis</span>
              </div>
            </div>
            <div class="pinfo-item">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <div>
                <strong>Öffnungszeiten</strong>
                <span
                  >Mo, Di, Do 11–17:30 · Mi 14–17:30 · Fr 11–13 &amp; 15–18 · Sa
                  11:30–17</span
                >
              </div>
            </div>
          </div>
        </section>

        <!-- Seat-Map: Fahrrad wählen -->
        <section class="bikes-section" id="fahrrad-waehlen">
          <div class="section-header">
            <span class="section-label">{{
              t().bikeRentalAvailableLabel
            }}</span>
            <h2 class="bikes-title">{{ t().bikeRentalAvailableTitle }}</h2>
            <p class="bikes-subtitle">
              {{ t().rentalBikesSub }}
            </p>
          </div>

          <!-- Loading -->
          <div class="seat-map" *ngIf="bikesLoading()">
            <div class="seat-skeleton" *ngFor="let i of [1, 2, 3, 4]"></div>
          </div>

          <!-- Empty -->
          <div
            class="bikes-empty"
            *ngIf="!bikesLoading() && bikes().length === 0"
          >
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
            >
              <circle cx="5.5" cy="17.5" r="3.5" />
              <circle cx="18.5" cy="17.5" r="3.5" />
              <path
                d="M15 6a1 1 0 100-2 1 1 0 000 2zM12 17.5V14l-3-3 4-3 2 3h3"
              />
            </svg>
            <p>{{ t().bikeRentalNoBikes }}</p>
          </div>

          <!-- Seat cards -->
          <div class="seat-map" *ngIf="!bikesLoading() && bikes().length > 0">
            <div
              class="seat-card"
              *ngFor="let bike of bikes()"
              [class.seat-selected]="selectedBike()?.id === bike.id"
              (click)="selectBike(bike)"
            >
              <div class="seat-img-wrap">
                <img
                  *ngIf="bike.images.length > 0"
                  [src]="getImageUrl(bike.images[0].filePath)"
                  [alt]="bike.marke + ' ' + bike.modell"
                  loading="lazy"
                />
                <div
                  class="seat-img-placeholder"
                  *ngIf="bike.images.length === 0"
                >
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.5"
                  >
                    <circle cx="5.5" cy="17.5" r="3.5" />
                    <circle cx="18.5" cy="17.5" r="3.5" />
                    <path
                      d="M15 6a1 1 0 100-2 1 1 0 000 2zM12 17.5V14l-3-3 4-3 2 3h3"
                    />
                  </svg>
                </div>
                <span class="seat-type-badge" *ngIf="bike.fahrradtyp">{{
                  bike.fahrradtyp
                }}</span>
              </div>
              <div class="seat-info">
                <div class="seat-name">{{ bike.marke }} {{ bike.modell }}</div>
                <div class="seat-specs">
                  <span *ngIf="bike.rahmengroesse">{{
                    bike.rahmengroesse
                  }}</span>
                  <span *ngIf="bike.farbe">· {{ bike.farbe }}</span>
                </div>
                <div class="seat-price-from" *ngIf="getMinPrice(bike) as minP">
                  ab {{ minP | number: '1.0-0' }} €
                </div>
              </div>
              <div
                class="seat-check-mark"
                *ngIf="selectedBike()?.id === bike.id"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="3"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
            </div>
          </div>
        </section>

        <!-- Inline Booking Panel -->
        <section
          class="booking-panel"
          *ngIf="selectedBike()"
          id="booking-panel"
        >
          <!-- Panel header: selected bike + change button -->
          <div class="bp-bike-bar">
            <div class="bp-bike-thumb">
              <img
                *ngIf="getSelectedBikeImagePath() as selectedImagePath"
                [src]="getImageUrl(selectedImagePath)"
                [alt]="selectedBike()!.marke"
              />
              <svg
                *ngIf="!getSelectedBikeImagePath()"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
              >
                <circle cx="5.5" cy="17.5" r="3.5" />
                <circle cx="18.5" cy="17.5" r="3.5" />
                <path
                  d="M15 6a1 1 0 100-2 1 1 0 000 2zM12 17.5V14l-3-3 4-3 2 3h3"
                />
              </svg>
            </div>
            <div class="bp-bike-details">
              <span class="bp-bike-name"
                >{{ selectedBike()!.marke }} {{ selectedBike()!.modell }}</span
              >
              <span class="bp-bike-meta">
                <span *ngIf="selectedBike()!.rahmengroesse">{{
                  selectedBike()!.rahmengroesse
                }}</span>
                <span *ngIf="selectedBike()!.farbe">
                  · {{ selectedBike()!.farbe }}</span
                >
              </span>
            </div>
            <button class="bp-change-btn" (click)="deselectBike()">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
              >
                <path
                  d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"
                />
                <path
                  d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"
                />
              </svg>
              {{ t().rentalChangeBike }}
            </button>
          </div>

          <!-- Selected bike details + gallery -->
          <div class="bp-bike-overview" *ngIf="!bookingSuccess()">
            <div class="bp-gallery" *ngIf="selectedBike()!.images.length > 0">
              <button
                type="button"
                class="bp-gallery-main"
                (click)="openLightbox()"
                aria-label="Bild vergrößern"
              >
                <img
                  *ngIf="getSelectedBikeImagePath() as selectedImagePath"
                  [src]="getImageUrl(selectedImagePath)"
                  [alt]="selectedBike()!.marke + ' ' + selectedBike()!.modell"
                />
                <span class="bp-zoom-hint" aria-hidden="true">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.3-4.3M11 8v6M8 11h6" />
                  </svg>
                </span>
              </button>

              <div
                class="bp-gallery-thumbs"
                *ngIf="selectedBike()!.images.length > 1"
              >
                <button
                  type="button"
                  class="bp-thumb-btn"
                  *ngFor="let image of selectedBike()!.images; let i = index"
                  [class.active]="i === selectedBikeImageIndex()"
                  (click)="selectBikeImage(i)"
                >
                  <img
                    [src]="getImageUrl(image.filePath)"
                    [alt]="
                      selectedBike()!.marke +
                      ' ' +
                      selectedBike()!.modell +
                      ' Bild ' +
                      (i + 1)
                    "
                    loading="lazy"
                  />
                </button>
              </div>
            </div>

            <div class="bp-bike-info-panel">
              <h4>{{ t().rentalBikeDetails }}</h4>
              <div class="bp-bike-facts">
                <span class="bp-fact" *ngIf="selectedBike()!.fahrradtyp"
                  >Typ: {{ selectedBike()!.fahrradtyp }}</span
                >
                <span class="bp-fact" *ngIf="selectedBike()!.art"
                  >Kategorie: {{ selectedBike()!.art }}</span
                >
                <span class="bp-fact" *ngIf="selectedBike()!.rahmengroesse"
                  >Rahmen: {{ selectedBike()!.rahmengroesse }}</span
                >
                <span class="bp-fact" *ngIf="selectedBike()!.reifengroesse"
                  >Reifen: {{ selectedBike()!.reifengroesse }}</span
                >
                <span class="bp-fact" *ngIf="selectedBike()!.farbe"
                  >Farbe: {{ selectedBike()!.farbe }}</span
                >
              </div>

              <p
                class="bp-bike-description"
                *ngIf="selectedBike()!.beschreibung"
              >
                {{ selectedBike()!.beschreibung }}
              </p>

              <div class="bp-price-grid">
                <div
                  class="bp-price-item"
                  *ngIf="selectedBike()!.preise.day1 != null"
                >
                  <span>1 Tag</span
                  ><strong
                    >{{
                      selectedBike()!.preise.day1 | number: '1.0-0'
                    }}
                    €</strong
                  >
                </div>
                <div
                  class="bp-price-item"
                  *ngIf="selectedBike()!.preise.day3 != null"
                >
                  <span>3 Tage</span
                  ><strong
                    >{{
                      selectedBike()!.preise.day3 | number: '1.0-0'
                    }}
                    €</strong
                  >
                </div>
                <div
                  class="bp-price-item"
                  *ngIf="selectedBike()!.preise.day7 != null"
                >
                  <span>7 Tage</span
                  ><strong
                    >{{
                      selectedBike()!.preise.day7 | number: '1.0-0'
                    }}
                    €</strong
                  >
                </div>
                <div
                  class="bp-price-item"
                  *ngIf="selectedBike()!.preise.day14 != null"
                >
                  <span>14 Tage</span
                  ><strong
                    >{{
                      selectedBike()!.preise.day14 | number: '1.0-0'
                    }}
                    €</strong
                  >
                </div>
                <div
                  class="bp-price-item"
                  *ngIf="selectedBike()!.preise.day30 != null"
                >
                  <span>30 Tage</span
                  ><strong
                    >{{
                      selectedBike()!.preise.day30 | number: '1.0-0'
                    }}
                    €</strong
                  >
                </div>
                <div
                  class="bp-price-item"
                  *ngIf="selectedBike()!.preise.perDayFrom10 != null"
                >
                  <span>ab 10 Tagen / Tag</span
                  ><strong
                    >{{
                      selectedBike()!.preise.perDayFrom10 | number: '1.0-0'
                    }}
                    €</strong
                  >
                </div>
              </div>
            </div>
          </div>

          <!-- Success state -->
          <div class="bp-success" *ngIf="bookingSuccess()">
            <div class="bp-success-icon">
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <h3>{{ t().rentalSuccessTitle }}</h3>
            <p>
              {{ t().rentalSuccessText }}<br />Eine Bestätigung wurde an
              <strong>{{ bookingForm.email }}</strong> gesendet.
            </p>
            <div class="bp-booking-nr">
              {{ t().rentalSuccessBookingNr }}: <strong>{{ confirmedBookingNr() }}</strong>
            </div>
            <button class="bp-new-btn" (click)="deselectBike()">
              {{ t().rentalSuccessNewRequest }}
            </button>
          </div>

          <!-- Booking body: calendar + form -->
          <div class="bp-body" *ngIf="!bookingSuccess()">
            <!-- Calendar column -->
            <div class="bp-cal-col">
              <h3 class="bp-col-title">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                {{ t().rentalFormPeriod }}
              </h3>

              <!-- Busy loading -->
              <div class="bp-cal-loading" *ngIf="busyPeriodsLoading()">
                <div class="bp-spinner"></div>
                <span>{{ t().rentalLoadingAvail }}</span>
              </div>

              <div class="booking-calendar" *ngIf="!busyPeriodsLoading()">
                <div class="bc-header">
                  <button type="button" class="bc-nav" (click)="prevMonth()">
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2.5"
                    >
                      <path d="M15 18l-6-6 6-6" />
                    </svg>
                  </button>
                  <span class="bc-month-title">{{ calMonthLabel() }}</span>
                  <button type="button" class="bc-nav" (click)="nextMonth()">
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2.5"
                    >
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </button>
                </div>
                <div class="bc-weekdays">
                  <span>Mo</span><span>Di</span><span>Mi</span><span>Do</span
                  ><span>Fr</span><span>Sa</span><span>So</span>
                </div>
                <div class="bc-grid">
                  <div
                    *ngFor="let day of calendarDays()"
                    class="bc-cell"
                    [class.bc-empty]="!day"
                    [class.bc-past]="day && isPast(day)"
                    [class.bc-busy]="
                      day && !isPast(day) && getDayBusyType(day) === 'booking'
                    "
                    [class.bc-pending]="
                      day && !isPast(day) && getDayBusyType(day) === 'pending'
                    "
                    [class.bc-closed]="
                      day && !isPast(day) && !isDayBusy(day) && isClosedDay(day)
                    "
                    [class.bc-today]="day && isToday(day)"
                    [class.bc-start]="day && isStart(day)"
                    [class.bc-end]="day && isEnd(day)"
                    [class.bc-range]="day && isInRange(day)"
                    [class.bc-clickable]="
                      day &&
                      !isPast(day) &&
                      !isDayBusy(day) &&
                      !isClosedDay(day)
                    "
                    (click)="
                      day &&
                        !isPast(day) &&
                        !isDayBusy(day) &&
                        !isClosedDay(day) &&
                        onCalDayClick(day)
                    "
                  >
                    <span *ngIf="day">{{ day.getDate() }}</span>
                    <div
                      class="bc-busy-tip"
                      *ngIf="day && !isPast(day) && isDayBusy(day)"
                    >
                      {{
                        getDayBusyType(day) === 'pending'
                          ? t().rentalStatusPending
                          : t().rentalStatusBooked
                      }}
                    </div>
                    <div
                      class="bc-busy-tip bc-closed-tip"
                      *ngIf="
                        day &&
                        !isPast(day) &&
                        !isDayBusy(day) &&
                        isClosedDay(day)
                      "
                    >
                      {{ day.getDay() === 0 ? t().rentalSundayLabel : t().rentalStatusClosed }}
                    </div>
                  </div>
                </div>
                <div class="bc-legend">
                  <span class="bc-legend-item"
                    ><span class="bc-leg-dot bc-leg-busy"></span>{{ t().rentalStatusBooked }}</span
                  >
                  <span class="bc-legend-item"
                    ><span class="bc-leg-dot bc-leg-pending"></span>{{ t().rentalStatusPending }}</span
                  >
                  <span class="bc-legend-item"
                    ><span class="bc-leg-dot bc-leg-closed"></span
                    >{{ t().rentalStatusClosed }}</span
                  >
                  <span class="bc-legend-item"
                    ><span class="bc-leg-dot bc-leg-sel"></span>{{ t().rentalStatusSelected }}</span
                  >
                </div>
                <div class="bc-info" *ngIf="calendarStart()">
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  <span *ngIf="!calendarEnd()"
                    >{{ formatCalDay(calendarStart()!) }} → {{ t().rentalSelectEndDate }}</span
                  >
                  <span *ngIf="calendarEnd()"
                    >{{ formatCalDay(calendarStart()!) }} –
                    {{ formatCalDay(calendarEnd()!) }}</span
                  >
                </div>
              </div>

              <!-- Price preview -->
              <div
                class="price-preview"
                *ngIf="calculatedDays() > 0 && calculatedPrice() !== null"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <line x1="12" y1="1" x2="12" y2="23" />
                  <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
                </svg>
                <span>{{ calculatedDays() }} {{ t().bikeRentalDays }} · {{ t().rentalEstPrice }}:</span>
                <strong>{{ calculatedPrice() | number: '1.0-0' }} €</strong>
              </div>
              <div
                class="price-preview warn"
                *ngIf="calculatedDays() > 0 && calculatedPrice() === null"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>{{ calculatedDays() }} {{ t().bikeRentalDays }} · {{ t().priceOnRequest }}</span>
              </div>
            </div>

            <!-- Form column -->
            <div class="bp-form-col">
              <h3 class="bp-col-title">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                {{ t().rentalFormYourData }}
              </h3>

              <div class="form-row">
                <div class="form-field">
                  <label>{{ t().rentalFormFirstName }} *</label>
                  <input
                    type="text"
                    [(ngModel)]="bookingForm.vorname"
                    placeholder="Max"
                  />
                </div>
                <div class="form-field">
                  <label>{{ t().rentalFormLastName }} *</label>
                  <input
                    type="text"
                    [(ngModel)]="bookingForm.nachname"
                    placeholder="Mustermann"
                  />
                </div>
              </div>

              <div class="form-row">
                <div class="form-field">
                  <label>E-Mail *</label>
                  <input
                    type="email"
                    [(ngModel)]="bookingForm.email"
                    placeholder="max&#64;example.com"
                  />
                </div>
                <div class="form-field">
                  <label>{{ t().rentalFormPhone }}</label>
                  <input
                    type="tel"
                    [(ngModel)]="bookingForm.telefon"
                    placeholder="+49 ..."
                  />
                </div>
              </div>

              <div class="form-field">
                <label>{{ t().rentalFormLang }}</label>
                <div class="lang-toggle">
                  <button
                    type="button"
                    [class.active]="bookingForm.sprache === 'de'"
                    (click)="bookingForm.sprache = 'de'"
                  >
                    Deutsch
                  </button>
                  <button
                    type="button"
                    [class.active]="bookingForm.sprache === 'en'"
                    (click)="bookingForm.sprache = 'en'"
                  >
                    English
                  </button>
                </div>
              </div>

              <div class="form-field">
                <label>{{ t().rentalFormNotes }}</label>
                <textarea
                  [(ngModel)]="bookingForm.notizen"
                  rows="3"
                  placeholder="Besondere Wünsche, Fragen..."
                ></textarea>
              </div>

              <div class="form-error" *ngIf="bookingError()">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
                {{ bookingError() }}
              </div>

              <button
                class="btn-submit"
                (click)="submitBooking()"
                [disabled]="bookingSubmitting()"
              >
                <svg
                  *ngIf="!bookingSubmitting()"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.5"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <div *ngIf="bookingSubmitting()" class="submit-spinner"></div>
                {{
                  bookingSubmitting() ? t().rentalFormSending : t().rentalFormSubmit
                }}
              </button>

              <p class="bp-note">{{ t().rentalFormConfirmNote }}</p>
            </div>
          </div>
        </section>

        <!-- Note -->
        <section class="note-banner">
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
          <div>
            <strong>{{ t().bikeRentalNoteTitle }}</strong>
            <p>{{ t().bikeRentalNoteText }}</p>
          </div>
        </section>

        <!-- WhatsApp Contact -->
        <section class="whatsapp-section">
          <a
            [href]="getWhatsappLink()"
            target="_blank"
            rel="noopener"
            class="whatsapp-card"
          >
            <div class="wa-icon">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path
                  d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"
                />
              </svg>
            </div>
            <div class="wa-content">
              <h3>WhatsApp</h3>
              <p>+49 155 6630 0011</p>
              <span class="wa-hint">{{ t().contactWhatsappHint }}</span>
            </div>
            <svg
              class="wa-arrow"
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
        </section>

        <!-- Back -->
        <section class="rental-cta">
          <a [routerLink]="['/' + lang()]" class="back-link">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            {{ t().home }}
          </a>
        </section>
      </div>

      <!-- Lightbox / Image zoom overlay -->
      <div
        class="lightbox"
        *ngIf="lightboxOpen() && selectedBike()"
        (click)="closeLightbox()"
        role="dialog"
        aria-modal="true"
        aria-label="Bild vergrößert"
      >
        <button
          type="button"
          class="lightbox-close"
          (click)="closeLightbox(); $event.stopPropagation()"
          aria-label="Schließen"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
          >
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        <button
          type="button"
          class="lightbox-nav lightbox-prev"
          *ngIf="selectedBike()!.images.length > 1"
          (click)="lightboxPrev(); $event.stopPropagation()"
          aria-label="Vorheriges Bild"
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        <div class="lightbox-stage" (click)="$event.stopPropagation()">
          <img
            *ngIf="getSelectedBikeImagePath() as p"
            [src]="getImageUrl(p)"
            [alt]="selectedBike()!.marke + ' ' + selectedBike()!.modell"
            [class.zoomed]="lightboxZoomed()"
            (click)="toggleLightboxZoom()"
            draggable="false"
          />
        </div>

        <button
          type="button"
          class="lightbox-nav lightbox-next"
          *ngIf="selectedBike()!.images.length > 1"
          (click)="lightboxNext(); $event.stopPropagation()"
          aria-label="Nächstes Bild"
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M9 6l6 6-6 6" />
          </svg>
        </button>

        <div class="lightbox-counter" *ngIf="selectedBike()!.images.length > 1">
          {{ selectedBikeImageIndex() + 1 }} /
          {{ selectedBike()!.images.length }}
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .rental-page {
        --rental-display-font:
          'Bahnschrift', 'Aptos Display', 'Segoe UI Variable Display',
          'Trebuchet MS', sans-serif;
        position: relative;
        background:
          radial-gradient(
            circle at top left,
            rgba(255, 87, 34, 0.12),
            transparent 28%
          ),
          radial-gradient(
            circle at 85% 18%,
            rgba(255, 184, 0, 0.08),
            transparent 22%
          ),
          linear-gradient(
            180deg,
            rgba(255, 255, 255, 0.01),
            rgba(255, 255, 255, 0)
          );
        font-family: var(--font-family);
      }

      .rental-page::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image:
          linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
        background-size: 72px 72px;
        mask-image: linear-gradient(
          180deg,
          rgba(0, 0, 0, 0.35),
          transparent 78%
        );
        pointer-events: none;
        opacity: 0.16;
      }

      .rental-body,
      .rental-hero-inner {
        position: relative;
        z-index: 1;
      }

      .section-label {
        display: inline-flex;
        align-items: center;
        gap: 0.45rem;
        font-size: 0.72rem;
        font-weight: 800;
        letter-spacing: 0.16em;
        text-transform: uppercase;
        color: rgba(255, 255, 255, 0.7);
      }

      .section-label::before {
        content: '';
        width: 24px;
        height: 1px;
        background: linear-gradient(90deg, var(--color-accent), transparent);
      }

      .pricing-title,
      .bikes-title,
      .bp-bike-name,
      .bp-success h3,
      .rental-hero-h1,
      .pcard-duration,
      .rhpc-price {
        font-family: var(--rental-display-font);
      }

      /* ═══ RENTAL HERO ═══ */
      .rental-hero {
        position: relative;
        background: var(--color-bg);
        overflow: hidden;
        padding: 6rem 0 4rem;
        border-bottom: 1px solid var(--color-border);
      }
      .rental-hero-bg {
        position: absolute;
        inset: 0;
        pointer-events: none;
      }
      .rental-hero-radial {
        position: absolute;
        top: -200px;
        left: -100px;
        width: 700px;
        height: 700px;
        background: radial-gradient(
          ellipse,
          rgba(255, 87, 34, 0.12) 0%,
          transparent 65%
        );
      }
      .rental-hero-grain {
        position: absolute;
        inset: 0;
        background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E");
        opacity: 0.5;
      }
      .rental-hero-inner {
        position: relative;
        display: grid;
        grid-template-columns: minmax(0, 1fr) 340px;
        gap: 3.5rem;
        align-items: center;
      }
      .rental-hero-chip {
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        padding: 0.35rem 0.85rem;
        background: rgba(255, 87, 34, 0.1);
        border: 1px solid rgba(255, 87, 34, 0.2);
        border-radius: 3rem;
        color: var(--color-accent);
        font-size: 0.75rem;
        font-weight: 700;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        margin-bottom: 1.25rem;
      }
      .rental-hero-h1 {
        font-size: clamp(2rem, 5vw, 3.2rem);
        font-weight: 900;
        color: var(--color-text);
        line-height: 0.96;
        letter-spacing: -0.05em;
        margin: 0 0 1rem;
        max-width: 8ch;
      }
      .rental-hero-accent {
        color: var(--color-accent);
        text-shadow: 0 0 28px rgba(255, 87, 34, 0.16);
      }
      .rental-hero-sub {
        font-size: 1.02rem;
        color: rgba(255, 255, 255, 0.7);
        line-height: 1.8;
        margin: 0 0 1.75rem;
        max-width: 580px;
      }
      .rental-hero-features {
        display: flex;
        flex-wrap: wrap;
        gap: 0.7rem;
        margin-bottom: 2rem;
      }
      .rfeat {
        display: inline-flex;
        align-items: center;
        gap: 0.45rem;
        font-size: 0.84rem;
        font-weight: 600;
        color: rgba(255, 255, 255, 0.9);
        padding: 0.48rem 0.78rem;
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 999px;
        backdrop-filter: blur(10px);
      }
      .rfeat svg {
        color: #22c55e;
        flex-shrink: 0;
      }
      .rental-hero-ctas {
        display: flex;
        flex-wrap: wrap;
        gap: 0.75rem;
        align-items: center;
      }
      .hero-cta-scroll {
        display: inline-flex;
        align-items: center;
        gap: 0.55rem;
        background: linear-gradient(135deg, #ff5722, #e64a19);
        color: #fff;
        font-size: 0.95rem;
        font-weight: 700;
        padding: 0.95rem 1.55rem;
        border-radius: 3rem;
        border: none;
        cursor: pointer;
        text-decoration: none;
        transition:
          opacity 0.2s,
          transform 0.2s;
        box-shadow: 0 18px 40px rgba(255, 87, 34, 0.28);
      }
      .hero-cta-scroll:hover {
        opacity: 0.9;
        transform: translateY(-1px);
      }
      .hero-cta-wa {
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        font-size: 0.875rem;
        font-weight: 600;
        color: rgba(255, 255, 255, 0.62);
        text-decoration: none;
        transition:
          color 0.2s,
          gap 0.2s;
      }
      .hero-cta-wa:hover {
        color: #fff;
        gap: 0.6rem;
      }
      /* Hero right card */
      .rental-hero-right {
        position: relative;
      }
      .rental-hero-price-card {
        background: linear-gradient(
          135deg,
          rgba(255, 87, 34, 0.14) 0%,
          rgba(255, 152, 0, 0.08) 100%
        );
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 28px;
        padding: 2.25rem 1.9rem;
        text-align: center;
        position: relative;
        overflow: hidden;
        box-shadow:
          0 20px 60px rgba(0, 0, 0, 0.26),
          inset 0 1px 0 rgba(255, 255, 255, 0.08);
        backdrop-filter: blur(18px);
      }
      .rental-hero-price-card::before {
        content: '';
        position: absolute;
        top: -60px;
        right: -60px;
        width: 200px;
        height: 200px;
        background: radial-gradient(
          circle,
          rgba(255, 87, 34, 0.15) 0%,
          transparent 65%
        );
        pointer-events: none;
      }
      .rhpc-badge {
        display: inline-block;
        background: linear-gradient(90deg, #ff8a00, var(--color-accent));
        color: #fff;
        font-size: 0.72rem;
        font-weight: 700;
        padding: 0.38rem 0.9rem;
        border-radius: 3rem;
        margin-bottom: 1.25rem;
      }
      .rhpc-duration {
        font-size: 0.85rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        color: var(--color-text-secondary);
        margin-bottom: 0.25rem;
      }
      .rhpc-price {
        font-size: 3.5rem;
        font-weight: 900;
        color: var(--color-accent);
        line-height: 1;
        letter-spacing: -0.04em;
        margin-bottom: 0.25rem;
      }
      .rhpc-per-day {
        font-size: 1rem;
        font-weight: 700;
        color: var(--color-text);
        margin-bottom: 0.2rem;
      }
      .rhpc-vs {
        font-size: 0.78rem;
        color: var(--color-text-secondary);
        text-decoration: line-through;
        margin-bottom: 1rem;
      }
      .rhpc-features {
        display: flex;
        justify-content: center;
        flex-wrap: wrap;
        gap: 0.75rem;
        font-size: 0.78rem;
        font-weight: 700;
        color: #22c55e;
      }

      .rental-signature-band {
        display: grid;
        grid-template-columns: minmax(0, 1.1fr) minmax(0, 1.4fr);
        gap: 1.25rem;
        margin: -1.2rem 0 2.75rem;
        align-items: stretch;
      }

      .signature-editorial,
      .signature-stat-card {
        position: relative;
        overflow: hidden;
        border-radius: 24px;
        border: 1px solid rgba(255, 255, 255, 0.08);
        background:
          linear-gradient(
            145deg,
            rgba(255, 255, 255, 0.055),
            rgba(255, 255, 255, 0.02)
          ),
          var(--color-surface);
        box-shadow: 0 18px 50px rgba(0, 0, 0, 0.18);
      }

      .signature-editorial {
        padding: 1.5rem 1.5rem 1.45rem;
      }

      .signature-editorial p {
        margin: 1rem 0 0;
        font-size: 0.95rem;
        line-height: 1.8;
        color: rgba(255, 255, 255, 0.72);
        max-width: 44ch;
      }

      .signature-stat-grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 1.25rem;
      }

      .signature-stat-card {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        min-height: 132px;
        padding: 1.35rem 1.2rem;
      }

      .signature-stat-card::before,
      .pricing-section::before,
      .bikes-section::before,
      .booking-panel::before,
      .whatsapp-card::before {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(
          135deg,
          rgba(255, 255, 255, 0.08),
          transparent 40%
        );
        pointer-events: none;
      }

      .signature-stat-value {
        font-family: var(--rental-display-font);
        font-size: 1.25rem;
        font-weight: 800;
        letter-spacing: -0.03em;
        color: #fff;
      }

      .signature-stat-label {
        font-size: 0.78rem;
        line-height: 1.55;
        color: rgba(255, 255, 255, 0.64);
        text-transform: uppercase;
        letter-spacing: 0.08em;
      }

      /* ═══ PRICING SECTION ═══ */
      .pricing-section {
        position: relative;
        padding: 2rem 1.5rem 2rem;
        margin-bottom: 2rem;
        border-radius: 28px;
        border: 1px solid rgba(255, 255, 255, 0.07);
        background:
          linear-gradient(
            180deg,
            rgba(255, 255, 255, 0.04),
            rgba(255, 255, 255, 0.015)
          ),
          var(--color-surface);
        box-shadow: 0 18px 60px rgba(0, 0, 0, 0.16);
      }
      .pricing-header {
        text-align: center;
        margin-bottom: 2.5rem;
      }
      .pricing-title {
        font-size: clamp(1.5rem, 3vw, 2rem);
        font-weight: 800;
        color: var(--color-text);
        margin: 0.5rem 0 0.5rem;
        letter-spacing: -0.02em;
      }
      .pricing-sub {
        font-size: 0.95rem;
        color: rgba(255, 255, 255, 0.62);
        margin: 0;
      }
      /* Main 3 price cards */
      .pricing-main-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1.25rem;
        margin-bottom: 1.25rem;
      }
      .pcard {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        padding: 2.1rem 1.55rem 1.5rem;
        border-radius: 22px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        background:
          linear-gradient(
            180deg,
            rgba(255, 255, 255, 0.045),
            rgba(255, 255, 255, 0.018)
          ),
          var(--color-surface);
        position: relative;
        transition:
          border-color 0.2s,
          transform 0.2s,
          box-shadow 0.2s;
        overflow: hidden;
      }
      .pcard:hover {
        border-color: rgba(255, 255, 255, 0.22);
        transform: translateY(-4px);
        box-shadow: 0 18px 40px rgba(0, 0, 0, 0.18);
      }
      .pcard-popular {
        border-color: var(--color-accent);
        background: linear-gradient(
          135deg,
          var(--color-surface) 0%,
          rgba(255, 87, 34, 0.05) 100%
        );
      }
      .pcard-best {
        border-color: #f59e0b;
        background: linear-gradient(
          135deg,
          rgba(255, 255, 255, 0.05) 0%,
          rgba(245, 158, 11, 0.08) 100%
        );
      }
      .pcard-top-badge {
        position: absolute;
        top: -13px;
        left: 50%;
        transform: translateX(-50%);
        background: var(--color-accent);
        color: #fff;
        font-size: 0.68rem;
        font-weight: 700;
        letter-spacing: 0.06em;
        padding: 0.22rem 0.7rem;
        border-radius: 3rem;
        white-space: nowrap;
      }
      .pcard-best-badge {
        background: #d97706;
      }
      .pcard-label {
        font-size: 0.7rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        color: rgba(255, 255, 255, 0.55);
        margin-top: 0.5rem;
      }
      .pcard-duration {
        font-size: 2rem;
        font-weight: 900;
        color: var(--color-text);
        line-height: 1;
        letter-spacing: -0.02em;
      }
      .pcard-popular .pcard-duration,
      .pcard-popular .pcard-price {
        color: var(--color-accent);
      }
      .pcard-best .pcard-duration,
      .pcard-best .pcard-price {
        color: #d97706;
      }
      .pcard-price {
        font-size: 2.8rem;
        font-weight: 900;
        color: var(--color-text);
        line-height: 1;
        letter-spacing: -0.03em;
      }
      .pcard-per-day {
        font-size: 0.85rem;
        color: rgba(255, 255, 255, 0.62);
        font-weight: 600;
      }
      .pcard-features {
        list-style: none;
        padding: 0;
        margin: 0.5rem 0 0.75rem;
        display: flex;
        flex-direction: column;
        gap: 0.35rem;
        flex: 1;
      }
      .pcard-features li {
        font-size: 0.82rem;
        color: rgba(255, 255, 255, 0.7);
        display: flex;
        align-items: center;
        gap: 0.4rem;
      }
      .pcard-features li::before {
        content: '✔';
        color: #22c55e;
        font-size: 0.72rem;
        flex-shrink: 0;
      }
      .pcard-cta-wa {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.4rem;
        background: #25d366;
        color: #fff;
        font-size: 0.82rem;
        font-weight: 700;
        padding: 0.7rem 1rem;
        border-radius: 2rem;
        text-decoration: none;
        transition:
          opacity 0.2s,
          transform 0.2s;
        text-align: center;
      }
      .pcard-cta-wa:hover {
        opacity: 0.88;
        transform: translateY(-1px);
      }
      .pcard-cta-wa-muted {
        background: rgba(37, 211, 102, 0.15);
        color: #22c55e;
      }
      .pcard-cta-wa-muted:hover {
        background: #25d366;
        color: #fff;
      }
      .pcard-cta-alt {
        display: block;
        text-align: center;
        font-size: 0.78rem;
        font-weight: 600;
        color: rgba(255, 255, 255, 0.62);
        text-decoration: none;
        padding: 0.4rem 0;
        transition: color 0.2s;
      }
      .pcard-cta-alt:hover {
        color: var(--color-accent);
      }
      /* Extra compact price row */
      .pricing-extra-row {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
        margin-bottom: 2rem;
      }
      .pextra-item {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 1rem 1.25rem;
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 16px;
        background: rgba(255, 255, 255, 0.025);
        overflow: hidden;
      }
      .pextra-dur {
        font-size: 0.85rem;
        font-weight: 700;
        color: var(--color-text);
        min-width: 70px;
      }
      .pextra-price {
        font-size: 1.1rem;
        font-weight: 800;
        color: var(--color-accent);
      }
      .pextra-day {
        font-size: 0.72rem;
        color: var(--color-text-secondary);
        flex: 1;
      }
      .pextra-cta {
        font-size: 0.75rem;
        font-weight: 700;
        color: #25d366;
        text-decoration: none;
        white-space: nowrap;
        padding: 0.3rem 0.7rem;
        border-radius: 2rem;
        background: rgba(37, 211, 102, 0.1);
        transition: background 0.2s;
      }
      .pextra-cta:hover {
        background: rgba(37, 211, 102, 0.2);
      }
      /* Info bar */
      .pricing-info-bar {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
        padding: 1.5rem;
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 20px;
      }
      .pinfo-item {
        display: flex;
        align-items: flex-start;
        gap: 0.75rem;
      }
      .pinfo-item svg {
        color: var(--color-accent);
        flex-shrink: 0;
        margin-top: 2px;
      }
      .pinfo-item strong {
        display: block;
        font-size: 0.8rem;
        font-weight: 700;
        color: var(--color-text);
        margin-bottom: 0.2rem;
      }
      .pinfo-item span {
        font-size: 0.78rem;
        color: var(--color-text-secondary);
        line-height: 1.5;
      }

      .rental-body {
        padding-top: 0;
        padding-bottom: 4rem;
      }

      .bike-img-count {
        position: absolute;
        bottom: 10px;
        right: 10px;
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 3px 8px;
        background: rgba(0, 0, 0, 0.6);
        color: #fff;
        border-radius: 999px;
        font-size: 0.72rem;
        font-weight: 600;
        backdrop-filter: blur(4px);
      }

      /* ── Note Banner ── */
      .note-banner {
        position: relative;
        display: flex;
        gap: 0.75rem;
        align-items: flex-start;
        padding: 1.35rem 1.5rem;
        background: linear-gradient(
          90deg,
          rgba(255, 87, 34, 0.09),
          rgba(255, 255, 255, 0.03)
        );
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-left: 4px solid var(--color-accent);
        border-radius: 18px;
        margin-bottom: 3rem;
        overflow: hidden;
      }

      .note-banner svg {
        flex-shrink: 0;
        margin-top: 2px;
        color: var(--color-accent);
      }

      .note-banner strong {
        font-family: var(--rental-display-font);
        display: block;
        font-size: 0.82rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--color-text);
        margin-bottom: 0.25rem;
      }

      .note-banner p {
        font-size: 0.9rem;
        color: var(--color-text-secondary);
        line-height: 1.65;
        margin: 0;
      }

      /* ── WhatsApp Card ── */
      .whatsapp-section {
        margin-bottom: 2rem;
      }

      .whatsapp-card {
        position: relative;
        display: flex;
        align-items: center;
        gap: 1.25rem;
        padding: 1.6rem 1.9rem;
        background: linear-gradient(
          135deg,
          rgba(37, 211, 102, 0.08),
          rgba(255, 255, 255, 0.03)
        );
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 22px;
        text-decoration: none;
        transition:
          border-color 0.3s,
          transform 0.3s,
          box-shadow 0.3s;
        overflow: hidden;
      }

      .whatsapp-card:hover {
        border-color: #25d366;
        transform: translateY(-3px);
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.16);
      }

      .wa-icon {
        width: 52px;
        height: 52px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 14px;
        background: rgba(37, 211, 102, 0.12);
        color: #25d366;
        flex-shrink: 0;
      }

      .wa-content {
        flex: 1;
      }

      .wa-content h3 {
        font-size: 1rem;
        font-weight: 700;
        color: var(--color-text);
        margin: 0 0 0.15rem;
      }

      .wa-content p {
        font-size: 0.95rem;
        font-weight: 600;
        color: var(--color-text);
        margin: 0 0 0.25rem;
      }

      .wa-hint {
        font-size: 0.8rem;
        color: var(--color-text-secondary);
      }

      .wa-arrow {
        color: var(--color-text-muted);
        flex-shrink: 0;
        transition: transform 0.2s;
      }

      .whatsapp-card:hover .wa-arrow {
        transform: translateX(3px);
        color: #25d366;
      }

      /* ── Available Bikes ── */
      .bikes-section {
        position: relative;
        margin-bottom: 3rem;
        padding: 2rem 1.5rem;
        border-radius: 28px;
        border: 1px solid rgba(255, 255, 255, 0.07);
        background:
          linear-gradient(
            180deg,
            rgba(255, 255, 255, 0.035),
            rgba(255, 255, 255, 0.015)
          ),
          var(--color-surface);
        box-shadow: 0 18px 60px rgba(0, 0, 0, 0.14);
        overflow: hidden;
      }

      .bikes-title {
        font-size: clamp(1.25rem, 3vw, 1.6rem);
        font-weight: 800;
        color: var(--color-text);
        margin: 0.5rem 0 1.5rem;
        letter-spacing: -0.02em;
      }

      .bikes-loading {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 1.5rem;
      }

      .bike-skeleton {
        height: 340px;
        border-radius: 16px;
        background: linear-gradient(
          90deg,
          var(--color-surface) 25%,
          var(--color-border) 50%,
          var(--color-surface) 75%
        );
        background-size: 200% 100%;
        animation: shimmer 1.5s infinite;
      }

      @keyframes shimmer {
        0% {
          background-position: 200% 0;
        }
        100% {
          background-position: -200% 0;
        }
      }

      .bikes-empty {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1rem;
        padding: 3rem 2rem;
        background: var(--color-surface);
        border: 1px solid var(--color-border);
        border-radius: 16px;
        color: var(--color-text-secondary);
        text-align: center;
      }

      .bikes-empty svg {
        opacity: 0.4;
      }

      /* ── Seat Map (Airline-style bike selector) ── */
      .bikes-subtitle {
        font-size: 0.9rem;
        color: rgba(255, 255, 255, 0.6);
        margin: 0.5rem 0 0;
      }

      .seat-map {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(235px, 1fr));
        gap: 1.1rem;
        margin-top: 1.75rem;
      }

      .seat-skeleton {
        height: 120px;
        border-radius: 14px;
        background: linear-gradient(
          90deg,
          var(--color-surface) 25%,
          rgba(255, 255, 255, 0.04) 50%,
          var(--color-surface) 75%
        );
        background-size: 200% 100%;
        animation: shimmer 1.4s infinite;
        border: 1px solid var(--color-border);
      }
      @keyframes shimmer {
        0% {
          background-position: 200% 0;
        }
        100% {
          background-position: -200% 0;
        }
      }

      .seat-card {
        background:
          linear-gradient(
            180deg,
            rgba(255, 255, 255, 0.05),
            rgba(255, 255, 255, 0.018)
          ),
          var(--color-surface);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 20px;
        overflow: hidden;
        cursor: pointer;
        transition:
          border-color 0.2s,
          transform 0.2s,
          box-shadow 0.2s;
        position: relative;
        display: flex;
        flex-direction: column;
      }
      .seat-card:hover {
        border-color: var(--color-accent);
        transform: translateY(-5px);
        box-shadow: 0 20px 38px rgba(0, 0, 0, 0.22);
      }
      .seat-card.seat-selected {
        border-color: var(--color-accent);
        box-shadow:
          0 0 0 3px rgba(255, 87, 34, 0.2),
          0 20px 38px rgba(0, 0, 0, 0.22);
        background: linear-gradient(
          135deg,
          rgba(255, 255, 255, 0.05) 0%,
          rgba(255, 87, 34, 0.08) 100%
        );
      }

      .seat-card::after {
        content: '';
        position: absolute;
        inset: auto 0 0 0;
        height: 3px;
        background: linear-gradient(
          90deg,
          transparent,
          var(--color-accent),
          transparent
        );
        opacity: 0;
        transition: opacity 0.2s;
      }

      .seat-card:hover::after,
      .seat-card.seat-selected::after {
        opacity: 1;
      }

      .seat-img-wrap {
        position: relative;
        height: 156px;
        overflow: hidden;
        background: var(--color-bg);
        flex-shrink: 0;
      }
      .seat-img-wrap img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.3s;
      }
      .seat-card:hover .seat-img-wrap img {
        transform: scale(1.05);
      }
      .seat-img-placeholder {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--color-text-secondary);
        opacity: 0.3;
      }
      .seat-type-badge {
        position: absolute;
        top: 12px;
        left: 12px;
        padding: 0.34rem 0.72rem;
        background: rgba(7, 10, 15, 0.72);
        color: #fff;
        border-radius: 999px;
        font-size: 0.66rem;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        backdrop-filter: blur(8px);
      }

      .seat-info {
        padding: 1rem 1rem 1.05rem;
        flex: 1;
      }
      .seat-name {
        font-size: 1rem;
        font-weight: 700;
        color: var(--color-text);
        margin-bottom: 0.2rem;
      }
      .seat-specs {
        font-size: 0.78rem;
        color: rgba(255, 255, 255, 0.58);
        margin-bottom: 0.6rem;
      }
      .seat-price-from {
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
        font-size: 0.8rem;
        font-weight: 800;
        color: var(--color-accent);
        padding: 0.3rem 0.58rem;
        border-radius: 999px;
        background: rgba(255, 87, 34, 0.09);
        width: fit-content;
      }

      .seat-check-mark {
        position: absolute;
        top: 12px;
        right: 12px;
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background: var(--color-accent);
        color: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 8px rgba(255, 87, 34, 0.4);
      }

      /* ── Inline Booking Panel ── */
      .booking-panel {
        position: relative;
        background:
          linear-gradient(
            180deg,
            rgba(255, 255, 255, 0.04),
            rgba(255, 255, 255, 0.015)
          ),
          var(--color-surface);
        border: 1px solid rgba(255, 255, 255, 0.09);
        border-radius: 28px;
        margin-bottom: 3rem;
        overflow: hidden;
        animation: slideDown 0.3s ease;
        scroll-margin-top: 80px;
        box-shadow: 0 24px 70px rgba(0, 0, 0, 0.18);
      }
      @keyframes slideDown {
        from {
          opacity: 0;
          transform: translateY(-12px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .bp-bike-bar {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 1.1rem 1.5rem;
        background: linear-gradient(
          90deg,
          rgba(255, 87, 34, 0.12),
          rgba(255, 255, 255, 0.03)
        );
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      }
      .bp-bike-thumb {
        width: 48px;
        height: 48px;
        border-radius: 10px;
        overflow: hidden;
        background: var(--color-bg);
        border: 1px solid var(--color-border);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      .bp-bike-thumb img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .bp-bike-thumb svg {
        opacity: 0.4;
      }
      .bp-bike-details {
        flex: 1;
        min-width: 0;
      }
      .bp-bike-name {
        font-size: 1rem;
        font-weight: 700;
        color: var(--color-text);
      }
      .bp-bike-meta {
        font-size: 0.78rem;
        color: var(--color-text-secondary);
      }
      .bp-change-btn {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 0.62rem 0.9rem;
        border-radius: 999px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        background: rgba(255, 255, 255, 0.04);
        color: rgba(255, 255, 255, 0.7);
        font-size: 0.8rem;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.15s;
        flex-shrink: 0;
      }
      .bp-change-btn:hover {
        border-color: var(--color-accent);
        color: var(--color-accent);
      }

      .bp-bike-overview {
        display: grid;
        grid-template-columns: 320px 1fr;
        gap: 1.2rem;
        padding: 1.25rem 1.5rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      }

      .bp-gallery-main {
        width: 100%;
        aspect-ratio: 4 / 3;
        border-radius: 12px;
        overflow: hidden;
        border: 1px solid var(--color-border);
        background: var(--color-bg);
        position: relative;
        padding: 0;
        cursor: zoom-in;
        display: block;
      }

      .bp-gallery-main img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
        transition: transform 0.3s ease;
      }

      .bp-gallery-main:hover img {
        transform: scale(1.03);
      }

      .bp-zoom-hint {
        position: absolute;
        right: 8px;
        bottom: 8px;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(0, 0, 0, 0.55);
        color: #fff;
        border-radius: 8px;
        backdrop-filter: blur(6px);
        opacity: 0.85;
        pointer-events: none;
      }

      /* Lightbox */
      .lightbox {
        position: fixed;
        inset: 0;
        z-index: 10000;
        background: rgba(0, 0, 0, 0.92);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 1rem;
        animation: lightbox-fade 0.2s ease;
      }

      @keyframes lightbox-fade {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }

      .lightbox-stage {
        flex: 1;
        max-width: min(1400px, 100%);
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: auto;
        touch-action: pinch-zoom;
      }

      .lightbox-stage img {
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
        cursor: zoom-in;
        user-select: none;
        transition: transform 0.25s ease;
        transform-origin: center center;
      }

      .lightbox-stage img.zoomed {
        cursor: zoom-out;
        transform: scale(2);
        max-width: none;
        max-height: none;
      }

      .lightbox-close {
        position: absolute;
        top: 1rem;
        right: 1rem;
        width: 44px;
        height: 44px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(255, 255, 255, 0.1);
        color: #fff;
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 50%;
        cursor: pointer;
        backdrop-filter: blur(8px);
        transition: background 0.2s;
        z-index: 1;
      }

      .lightbox-close:hover {
        background: rgba(255, 255, 255, 0.2);
      }

      .lightbox-nav {
        width: 48px;
        height: 48px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(255, 255, 255, 0.1);
        color: #fff;
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 50%;
        cursor: pointer;
        backdrop-filter: blur(8px);
        flex-shrink: 0;
        transition: background 0.2s;
        margin: 0 0.5rem;
      }

      .lightbox-nav:hover {
        background: rgba(255, 255, 255, 0.2);
      }

      .lightbox-counter {
        position: absolute;
        bottom: 1.25rem;
        left: 50%;
        transform: translateX(-50%);
        color: #fff;
        font-size: 0.85rem;
        font-weight: 500;
        background: rgba(0, 0, 0, 0.5);
        padding: 0.4rem 0.85rem;
        border-radius: 999px;
        backdrop-filter: blur(8px);
      }

      @media (max-width: 640px) {
        .lightbox-nav {
          width: 40px;
          height: 40px;
          margin: 0 0.25rem;
        }
        .lightbox-close {
          top: 0.5rem;
          right: 0.5rem;
        }
      }

      .bp-gallery-thumbs {
        margin-top: 0.6rem;
        display: grid;
        grid-template-columns: repeat(5, minmax(0, 1fr));
        gap: 0.45rem;
      }

      .bp-thumb-btn {
        border: 1.5px solid var(--color-border);
        border-radius: 8px;
        overflow: hidden;
        padding: 0;
        background: var(--color-bg);
        cursor: pointer;
        transition: border-color 0.2s;
      }

      .bp-thumb-btn img {
        width: 100%;
        height: 58px;
        object-fit: cover;
        display: block;
      }

      .bp-thumb-btn.active,
      .bp-thumb-btn:hover {
        border-color: var(--color-accent);
      }

      .bp-bike-info-panel {
        min-width: 0;
      }

      .bp-bike-info-panel h4 {
        margin: 0 0 0.65rem;
        font-size: 0.9rem;
        font-weight: 800;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--color-text);
      }

      .bp-bike-facts {
        display: flex;
        flex-wrap: wrap;
        gap: 0.45rem;
      }

      .bp-fact {
        padding: 0.35rem 0.6rem;
        border-radius: 999px;
        background: rgba(255, 87, 34, 0.09);
        border: 1px solid rgba(255, 87, 34, 0.18);
        color: var(--color-text);
        font-size: 0.75rem;
        font-weight: 600;
      }

      .bp-bike-description {
        margin: 0.75rem 0 0;
        color: var(--color-text-secondary);
        line-height: 1.6;
        font-size: 0.85rem;
      }

      .bp-price-grid {
        margin-top: 0.85rem;
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 0.45rem;
      }

      .bp-price-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 0.5rem;
        padding: 0.55rem 0.68rem;
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 12px;
        background: rgba(255, 255, 255, 0.025);
        font-size: 0.78rem;
        color: rgba(255, 255, 255, 0.62);
      }

      .bp-price-item strong {
        color: var(--color-text);
        font-size: 0.8rem;
      }

      .bp-success {
        padding: 3rem 2rem;
        text-align: center;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1rem;
      }
      .bp-success-icon {
        width: 72px;
        height: 72px;
        border-radius: 50%;
        background: rgba(16, 185, 129, 0.1);
        color: #10b981;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .bp-success h3 {
        margin: 0;
        font-size: 1.3rem;
        font-weight: 800;
        color: var(--color-text);
      }
      .bp-success p {
        margin: 0;
        font-size: 0.9rem;
        color: var(--color-text-secondary);
        line-height: 1.7;
        max-width: 420px;
      }
      .bp-booking-nr {
        padding: 8px 20px;
        border-radius: 8px;
        background: rgba(16, 185, 129, 0.08);
        border: 1px solid rgba(16, 185, 129, 0.2);
        font-size: 0.88rem;
        color: var(--color-text);
      }
      .bp-new-btn {
        padding: 11px 28px;
        border-radius: 10px;
        background: var(--color-accent);
        color: #fff;
        border: none;
        font-weight: 700;
        cursor: pointer;
        font-size: 0.9rem;
        transition: opacity 0.15s;
      }
      .bp-new-btn:hover {
        opacity: 0.88;
      }

      .bp-body {
        display: grid;
        grid-template-columns: 340px 1fr;
        gap: 0;
      }

      .bp-cal-col {
        padding: 1.5rem;
        border-right: 1px solid rgba(255, 255, 255, 0.08);
      }

      .bp-form-col {
        padding: 1.5rem;
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .bp-col-title {
        display: flex;
        align-items: center;
        gap: 8px;
        margin: 0 0 1rem;
        font-size: 0.95rem;
        font-weight: 700;
        color: var(--color-text);
      }
      .bp-col-title svg {
        color: var(--color-accent);
        flex-shrink: 0;
      }

      .bp-cal-loading {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 2rem;
        color: var(--color-text-secondary);
        font-size: 0.88rem;
        justify-content: center;
      }
      .bp-spinner {
        width: 18px;
        height: 18px;
        border: 2px solid var(--color-border);
        border-top-color: var(--color-accent);
        border-radius: 50%;
        animation: spin 0.7s linear infinite;
        flex-shrink: 0;
      }

      .bp-note {
        font-size: 0.78rem;
        color: var(--color-text-secondary);
        line-height: 1.6;
        margin: auto 0 0;
      }

      .modal-form {
        padding: 1.5rem;
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }
      .modal-title {
        margin: 0 0 0.5rem;
        font-size: 1.1rem;
        font-weight: 800;
        color: var(--color-text);
      }

      .form-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
      }
      .form-field {
        display: flex;
        flex-direction: column;
        gap: 5px;
      }
      .form-field label {
        font-size: 0.75rem;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        color: rgba(255, 255, 255, 0.54);
      }
      .form-field input,
      .form-field textarea,
      .form-field select {
        padding: 0.85rem 0.95rem;
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 14px;
        background: rgba(7, 10, 15, 0.5);
        color: var(--color-text);
        font-size: 0.9rem;
        transition:
          border-color 0.2s,
          box-shadow 0.2s,
          background 0.2s;
        resize: vertical;
      }
      .form-field input:focus,
      .form-field textarea:focus {
        outline: none;
        border-color: var(--color-accent);
        box-shadow: 0 0 0 3px rgba(255, 87, 34, 0.1);
      }

      .price-preview {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 14px;
        border-radius: 10px;
        background: rgba(255, 87, 34, 0.08);
        border: 1px solid rgba(255, 87, 34, 0.2);
        font-size: 0.88rem;
        color: var(--color-text);
      }
      .price-preview svg {
        color: var(--color-accent);
        flex-shrink: 0;
      }
      .price-preview strong {
        color: var(--color-accent);
        font-size: 1rem;
        margin-left: auto;
      }
      .price-preview.warn {
        background: rgba(245, 158, 11, 0.08);
        border-color: rgba(245, 158, 11, 0.2);
      }
      .price-preview.warn svg {
        color: #f59e0b;
      }

      .lang-toggle {
        display: flex;
        gap: 8px;
      }
      .lang-toggle button {
        padding: 0.65rem 1rem;
        border-radius: 999px;
        border: 1px solid rgba(255, 255, 255, 0.09);
        background: rgba(255, 255, 255, 0.03);
        color: rgba(255, 255, 255, 0.68);
        font-size: 0.85rem;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.15s;
      }
      .lang-toggle button.active {
        background: var(--color-accent);
        border-color: var(--color-accent);
        color: #fff;
      }

      .form-error {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 14px;
        border-radius: 10px;
        background: rgba(239, 68, 68, 0.08);
        border: 1px solid rgba(239, 68, 68, 0.2);
        font-size: 0.85rem;
        color: #ef4444;
      }

      .btn-submit {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        width: 100%;
        padding: 0.95rem;
        border-radius: 16px;
        background: linear-gradient(135deg, var(--color-accent), #ff8a00);
        color: #fff;
        border: none;
        font-size: 0.95rem;
        font-weight: 700;
        cursor: pointer;
        transition:
          opacity 0.2s,
          transform 0.2s,
          box-shadow 0.2s;
        margin-top: 4px;
        box-shadow: 0 18px 34px rgba(255, 87, 34, 0.22);
      }
      .btn-submit:hover:not(:disabled) {
        opacity: 0.88;
        transform: translateY(-1px);
      }
      .btn-submit:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
      .submit-spinner {
        width: 16px;
        height: 16px;
        border: 2px solid rgba(255, 255, 255, 0.4);
        border-top-color: #fff;
        border-radius: 50%;
        animation: spin 0.7s linear infinite;
      }
      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }

      /* ── Booking Calendar ── */
      .booking-calendar {
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 18px;
        overflow: hidden;
        background: rgba(7, 10, 15, 0.42);
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
      }

      .bc-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0.8rem 0.95rem;
        background: rgba(255, 255, 255, 0.03);
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      }

      .bc-month-title {
        font-size: 0.88rem;
        font-weight: 700;
        color: var(--color-text);
        text-transform: capitalize;
      }

      .bc-nav {
        background: none;
        border: none;
        cursor: pointer;
        color: var(--color-text-secondary);
        padding: 4px 8px;
        border-radius: 6px;
        display: flex;
        transition: all 0.15s;
      }
      .bc-nav:hover {
        background: rgba(255, 255, 255, 0.08);
        color: var(--color-text);
      }

      .bc-weekdays {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        padding: 6px 10px 2px;
      }
      .bc-weekdays span {
        text-align: center;
        font-size: 0.67rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: var(--color-text-secondary);
        padding: 4px 0;
      }

      .bc-grid {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        padding: 4px 10px 10px;
        gap: 2px;
      }

      .bc-cell {
        aspect-ratio: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 8px;
        font-size: 0.82rem;
        font-weight: 500;
        color: var(--color-text);
        transition: all 0.12s;
        position: relative;
        user-select: none;
      }

      .bc-empty {
        pointer-events: none;
      }
      .bc-clickable {
        cursor: pointer;
      }
      .bc-clickable:hover:not(.bc-start):not(.bc-end) {
        background: rgba(255, 255, 255, 0.08);
      }

      .bc-past {
        opacity: 0.28;
        pointer-events: none;
      }

      .bc-busy {
        background: rgba(239, 68, 68, 0.15);
        color: #f87171;
        cursor: not-allowed;
      }

      .bc-pending {
        background: rgba(236, 72, 153, 0.18);
        color: #f9a8d4;
        cursor: not-allowed;
      }

      .bc-closed {
        background: rgba(148, 163, 184, 0.12);
        color: var(--color-text-secondary, #94a3b8);
        cursor: not-allowed;
        font-style: italic;
      }
      .bc-closed-tip {
        background: #64748b !important;
      }
      .bc-closed-tip::after {
        border-top-color: #64748b !important;
      }

      .bc-today::after {
        content: '';
        position: absolute;
        bottom: 3px;
        left: 50%;
        transform: translateX(-50%);
        width: 4px;
        height: 4px;
        border-radius: 50%;
        background: var(--color-accent);
      }

      .bc-start,
      .bc-end {
        background: var(--color-accent) !important;
        color: #fff !important;
        font-weight: 700;
      }

      .bc-range {
        background: rgba(255, 87, 34, 0.18);
        border-radius: 0;
      }

      .bc-legend {
        display: flex;
        flex-wrap: wrap;
        gap: 16px;
        padding: 6px 14px 8px;
        border-top: 1px solid rgba(255, 255, 255, 0.08);
      }

      .bc-legend-item {
        display: flex;
        align-items: center;
        gap: 5px;
        font-size: 0.7rem;
        color: var(--color-text-secondary);
      }

      .bc-leg-dot {
        width: 10px;
        height: 10px;
        border-radius: 3px;
        flex-shrink: 0;
      }
      .bc-leg-busy {
        background: rgba(239, 68, 68, 0.4);
      }
      .bc-leg-pending {
        background: rgba(236, 72, 153, 0.5);
      }
      .bc-leg-closed {
        background: rgba(148, 163, 184, 0.5);
      }
      .bc-leg-sel {
        background: var(--color-accent);
      }

      .bc-info {
        display: flex;
        align-items: center;
        gap: 7px;
        padding: 8px 14px;
        background: rgba(255, 87, 34, 0.08);
        border-top: 1px solid rgba(255, 87, 34, 0.2);
        font-size: 0.82rem;
        color: var(--color-text);
      }
      .bc-info svg {
        color: var(--color-accent);
        flex-shrink: 0;
      }

      .bc-busy-tip {
        position: absolute;
        bottom: calc(100% + 6px);
        left: 50%;
        transform: translateX(-50%);
        background: #1e293b;
        color: #f87171;
        font-size: 0.65rem;
        font-weight: 700;
        padding: 3px 7px;
        border-radius: 6px;
        white-space: nowrap;
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.15s;
        z-index: 10;
      }
      .bc-cell.bc-busy:hover .bc-busy-tip {
        opacity: 1;
      }

      @media (max-width: 900px) {
        .bp-bike-overview {
          grid-template-columns: 1fr;
        }

        .bp-body {
          grid-template-columns: 1fr;
        }
        .bp-cal-col {
          border-right: none;
          border-bottom: 1px solid var(--color-border);
        }
      }

      @media (max-width: 600px) {
        .seat-map {
          grid-template-columns: repeat(2, 1fr);
        }
        .form-row {
          grid-template-columns: 1fr;
        }

        .bp-price-grid {
          grid-template-columns: 1fr;
        }

        .bp-gallery-thumbs {
          grid-template-columns: repeat(4, minmax(0, 1fr));
        }

        .bp-bike-bar {
          padding: 0.75rem 1rem;
        }
        .bp-cal-col,
        .bp-form-col {
          padding: 1rem;
        }
        .booking-panel {
          border-radius: 14px;
        }
      }

      /* ── CTA ── */
      .rental-cta {
        display: flex;
        align-items: center;
        gap: 2rem;
        padding-top: 2rem;
        border-top: 1px solid rgba(255, 255, 255, 0.08);
      }

      .back-link {
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        font-size: 0.9rem;
        font-weight: 600;
        color: var(--color-text-secondary);
        text-decoration: none;
        transition:
          color 0.2s,
          gap 0.2s;
      }

      .back-link:hover {
        color: var(--color-accent);
        gap: 0.6rem;
      }

      /* ── Responsive ── */
      @media (max-width: 900px) {
        .rental-signature-band {
          grid-template-columns: 1fr;
        }

        .signature-stat-grid {
          grid-template-columns: 1fr;
        }

        .rental-hero-inner {
          grid-template-columns: 1fr;
        }

        .rental-hero-right {
          display: none;
        }

        .pricing-main-grid {
          grid-template-columns: 1fr 1fr;
        }

        .pricing-extra-row,
        .pricing-info-bar {
          grid-template-columns: 1fr;
        }
      }

      @media (max-width: 768px) {
        .rental-hero {
          padding: 5rem 0 3rem;
        }

        .pricing-section,
        .bikes-section {
          padding-left: 1rem;
          padding-right: 1rem;
          border-radius: 22px;
        }

        .rental-signature-band {
          margin-top: -0.6rem;
          margin-bottom: 2rem;
        }

        .signature-editorial,
        .signature-stat-card {
          border-radius: 18px;
        }

        .pricing-main-grid {
          grid-template-columns: 1fr;
        }

        .seat-map {
          grid-template-columns: 1fr 1fr;
        }

        .rental-cta {
          flex-direction: column;
          align-items: flex-start;
          gap: 1rem;
        }
      }

      @media (max-width: 600px) {
        .seat-map,
        .pricing-extra-row {
          grid-template-columns: 1fr;
        }

        .hero-cta-wa,
        .hero-cta-scroll {
          width: 100%;
          justify-content: center;
        }

        .whatsapp-card {
          padding: 1.25rem;
        }

        .pcard-top-badge {
          font-size: 0.62rem;
        }
      }
    `,
  ],
})
export class FahrradverleihComponent implements OnInit {
  private translationService = inject(TranslationService);
  private titleService = inject(Title);
  private metaService = inject(Meta);
  private apiService = inject(ApiService);
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  t = this.translationService.translations;
  lang = this.translationService.currentLanguage;

  bikes = signal<PublicRentalBicycle[]>([]);
  bikesLoading = signal(true);

  // Inline booking state
  selectedBike = signal<PublicRentalBicycle | null>(null);
  selectedBikeImageIndex = signal(0);
  lightboxOpen = signal(false);
  lightboxZoomed = signal(false);
  busyPeriodsLoading = signal(false);
  bookingSubmitting = signal(false);
  bookingSuccess = signal(false);
  bookingError = signal<string | null>(null);
  confirmedBookingNr = signal<string>('');

  bookingForm = {
    startDatum: '',
    endDatum: '',
    vorname: '',
    nachname: '',
    email: '',
    telefon: '',
    sprache: 'de',
    notizen: '',
  };

  today = new Date().toISOString().split('T')[0];
  calculatedDays = signal(0);
  calculatedPrice = signal<number | null>(null);

  // Calendar state
  busyPeriods = signal<{ start: Date; end: Date; type: string }[]>([]);
  calendarCurrentDate = signal(new Date());
  calendarStart = signal<Date | null>(null);
  calendarEnd = signal<Date | null>(null);

  calMonthLabel = computed(() => {
    const d = this.calendarCurrentDate();
    return d.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' });
  });

  calendarDays = computed(() => {
    const d = this.calendarCurrentDate();
    const year = d.getFullYear();
    const month = d.getMonth();
    const firstDay = new Date(year, month, 1);
    const offset = (firstDay.getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days: (Date | null)[] = [];
    for (let i = 0; i < offset; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i));
    return days;
  });

  scrollToBikes(): void {
    if (this.isBrowser) {
      document
        .getElementById('fahrrad-waehlen')
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  ngOnInit(): void {
    const t = this.t();
    this.titleService.setTitle(t.bikeRentalMetaTitle);
    this.metaService.updateTag({
      name: 'description',
      content: t.bikeRentalMetaDescription,
    });
    this.apiService.getRentableBikes().subscribe({
      next: (bikes) => {
        this.bikes.set(bikes);
        this.bikesLoading.set(false);
      },
      error: () => this.bikesLoading.set(false),
    });
  }

  selectBike(bike: PublicRentalBicycle): void {
    if (this.selectedBike()?.id === bike.id) return;
    this.selectedBike.set(bike);
    this.selectedBikeImageIndex.set(0);
    this.bookingSuccess.set(false);
    this.bookingError.set(null);
    this.calculatedDays.set(0);
    this.calculatedPrice.set(null);
    this.bookingForm = {
      startDatum: '',
      endDatum: '',
      vorname: '',
      nachname: '',
      email: '',
      telefon: '',
      sprache: 'de',
      notizen: '',
    };
    this.calendarStart.set(null);
    this.calendarEnd.set(null);
    this.calendarCurrentDate.set(new Date());
    this.busyPeriods.set([]);
    this.busyPeriodsLoading.set(true);
    this.apiService.getBusyPeriods(bike.id).subscribe({
      next: (periods) => {
        const toLocal = (s: string) => {
          const d = new Date(s);
          return new Date(d.getFullYear(), d.getMonth(), d.getDate());
        };
        this.busyPeriods.set(
          periods.map((p) => ({
            start: toLocal(p.start),
            end: toLocal(p.end),
            type: p.type,
          })),
        );
        this.busyPeriodsLoading.set(false);
      },
      error: () => this.busyPeriodsLoading.set(false),
    });
    setTimeout(() => {
      document
        .getElementById('booking-panel')
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  }

  deselectBike(): void {
    this.selectedBike.set(null);
    this.selectedBikeImageIndex.set(0);
    this.bookingSuccess.set(false);
    this.bookingError.set(null);
    this.calendarStart.set(null);
    this.calendarEnd.set(null);
    this.busyPeriods.set([]);
    this.calculatedDays.set(0);
    this.calculatedPrice.set(null);
  }

  getMinPrice(bike: PublicRentalBicycle): number | null {
    const p = bike.preise;
    const prices = [p.day1, p.day3, p.day7, p.day14, p.day30].filter(
      (v): v is number => v != null,
    );
    return prices.length > 0 ? Math.min(...prices) : null;
  }

  selectBikeImage(index: number): void {
    const bike = this.selectedBike();
    if (!bike || index < 0 || index >= bike.images.length) return;
    this.selectedBikeImageIndex.set(index);
  }

  openLightbox(): void {
    if (!this.selectedBike()) return;
    this.lightboxZoomed.set(false);
    this.lightboxOpen.set(true);
    if (this.isBrowser) {
      document.body.style.overflow = 'hidden';
    }
  }

  closeLightbox(): void {
    this.lightboxOpen.set(false);
    this.lightboxZoomed.set(false);
    if (this.isBrowser) {
      document.body.style.overflow = '';
    }
  }

  toggleLightboxZoom(): void {
    this.lightboxZoomed.update((v) => !v);
  }

  lightboxNext(): void {
    const bike = this.selectedBike();
    if (!bike) return;
    const next = (this.selectedBikeImageIndex() + 1) % bike.images.length;
    this.selectedBikeImageIndex.set(next);
    this.lightboxZoomed.set(false);
  }

  lightboxPrev(): void {
    const bike = this.selectedBike();
    if (!bike) return;
    const len = bike.images.length;
    const prev = (this.selectedBikeImageIndex() - 1 + len) % len;
    this.selectedBikeImageIndex.set(prev);
    this.lightboxZoomed.set(false);
  }

  @HostListener('document:keydown', ['$event'])
  onLightboxKeydown(event: KeyboardEvent): void {
    if (!this.lightboxOpen()) return;
    if (event.key === 'Escape') {
      this.closeLightbox();
    } else if (event.key === 'ArrowRight') {
      this.lightboxNext();
    } else if (event.key === 'ArrowLeft') {
      this.lightboxPrev();
    }
  }

  getSelectedBikeImagePath(): string | null {
    const bike = this.selectedBike();
    if (!bike || bike.images.length === 0) return null;
    const index = Math.min(
      this.selectedBikeImageIndex(),
      bike.images.length - 1,
    );
    return bike.images[index].filePath;
  }

  onDatesChange(): void {
    this.bookingError.set(null);
    const { startDatum, endDatum } = this.bookingForm;
    if (!startDatum || !endDatum) {
      this.calculatedDays.set(0);
      this.calculatedPrice.set(null);
      return;
    }
    const days =
      Math.floor(
        (new Date(endDatum).getTime() - new Date(startDatum).getTime()) /
          86400000,
      ) + 1;
    if (days <= 0) {
      this.calculatedDays.set(0);
      this.calculatedPrice.set(null);
      return;
    }
    this.calculatedDays.set(days);
    const bike = this.selectedBike();
    if (!bike) {
      this.calculatedPrice.set(null);
      return;
    }
    const p = bike.preise;
    let price: number | null = null;
    if (days <= 1 && p.day1 != null) price = p.day1;
    else if (days <= 3 && p.day3 != null) price = p.day3;
    else if (days <= 7 && p.day7 != null) price = p.day7;
    else if (days <= 14 && p.day14 != null) price = p.day14;
    else if (days <= 30 && p.day30 != null) price = p.day30;
    else if (days > 10 && p.perDayFrom10 != null) price = p.perDayFrom10 * days;
    else if (p.day1 != null) price = p.day1 * days;
    this.calculatedPrice.set(price);
  }

  prevMonth(): void {
    const d = this.calendarCurrentDate();
    this.calendarCurrentDate.set(
      new Date(d.getFullYear(), d.getMonth() - 1, 1),
    );
  }

  nextMonth(): void {
    const d = this.calendarCurrentDate();
    this.calendarCurrentDate.set(
      new Date(d.getFullYear(), d.getMonth() + 1, 1),
    );
  }

  isDayBusy(date: Date): boolean {
    return this.getDayBusyType(date) !== null;
  }

  private bwHolidayCache = new Map<number, Set<string>>();

  private easterDate(year: number): Date {
    const a = year % 19;
    const b = Math.floor(year / 100);
    const c = year % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const month = Math.floor((h + l - 7 * m + 114) / 31) - 1;
    const day = ((h + l - 7 * m + 114) % 31) + 1;
    return new Date(year, month, day);
  }

  private getBWHolidays(year: number): Set<string> {
    if (this.bwHolidayCache.has(year)) return this.bwHolidayCache.get(year)!;
    const fmt = (d: Date) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const add = (d: Date, days: number) =>
      new Date(d.getFullYear(), d.getMonth(), d.getDate() + days);
    const easter = this.easterDate(year);
    const holidays = new Set<string>([
      fmt(new Date(year, 0, 1)), // Neujahr
      fmt(new Date(year, 0, 6)), // Heilige Drei Könige (BW)
      fmt(new Date(year, 4, 1)), // Tag der Arbeit
      fmt(new Date(year, 9, 3)), // Tag der Deutschen Einheit
      fmt(new Date(year, 10, 1)), // Allerheiligen (BW)
      fmt(new Date(year, 11, 25)), // 1. Weihnachtstag
      fmt(new Date(year, 11, 26)), // 2. Weihnachtstag
      fmt(add(easter, -2)), // Karfreitag
      fmt(easter), // Ostersonntag
      fmt(add(easter, 1)), // Ostermontag
      fmt(add(easter, 39)), // Christi Himmelfahrt
      fmt(add(easter, 49)), // Pfingstsonntag
      fmt(add(easter, 50)), // Pfingstmontag
      fmt(add(easter, 60)), // Fronleichnam (BW)
    ]);
    this.bwHolidayCache.set(year, holidays);
    return holidays;
  }

  isClosedDay(date: Date): boolean {
    if (date.getDay() === 0) return true; // Sonntag
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    return this.getBWHolidays(date.getFullYear()).has(key);
  }

  getDayBusyType(date: Date): 'booking' | 'pending' | 'rental' | null {
    const t = date.getTime();
    const covering = this.busyPeriods().filter(
      (p) => t >= p.start.getTime() && t <= p.end.getTime(),
    );
    if (covering.length === 0) return null;
    if (covering.some((p) => p.type === 'booking' || p.type === 'rental'))
      return 'booking';
    if (covering.some((p) => p.type === 'pending')) return 'pending';
    return 'booking';
  }

  isPast(date: Date): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  }

  isToday(date: Date): boolean {
    const now = new Date();
    return (
      date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth() &&
      date.getDate() === now.getDate()
    );
  }

  isStart(date: Date): boolean {
    const s = this.calendarStart();
    return !!s && date.getTime() === s.getTime();
  }

  isEnd(date: Date): boolean {
    const e = this.calendarEnd();
    return !!e && date.getTime() === e.getTime();
  }

  isInRange(date: Date): boolean {
    const s = this.calendarStart();
    const e = this.calendarEnd();
    if (!s || !e) return false;
    return date > s && date < e;
  }

  onCalDayClick(date: Date): void {
    if (this.isClosedDay(date)) return;
    const s = this.calendarStart();
    const e = this.calendarEnd();
    if (!s || (s && e) || date < s) {
      this.calendarStart.set(date);
      this.calendarEnd.set(null);
      this.bookingForm.startDatum = this.toIsoDate(date);
      this.bookingForm.endDatum = '';
      this.calculatedDays.set(0);
      this.calculatedPrice.set(null);
      this.bookingError.set(null);
    } else {
      const hasBusy = this.busyPeriods().some(
        (p) =>
          p.start.getTime() <= date.getTime() && p.end.getTime() >= s.getTime(),
      );
      if (hasBusy) {
        this.calendarStart.set(date);
        this.calendarEnd.set(null);
        this.bookingForm.startDatum = this.toIsoDate(date);
        this.bookingForm.endDatum = '';
        this.bookingError.set(
          'Dieser Zeitraum enthält bereits gebuchte Tage. Bitte wählen Sie einen anderen Zeitraum.',
        );
        return;
      }
      this.bookingError.set(null);
      this.calendarEnd.set(date);
      this.bookingForm.endDatum = this.toIsoDate(date);
      this.onDatesChange();
    }
  }

  toIsoDate(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  formatCalDay(date: Date): string {
    return date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  submitBooking(): void {
    const f = this.bookingForm;
    if (!f.startDatum || !f.endDatum) {
      this.bookingError.set('Bitte wählen Sie einen Zeitraum aus.');
      return;
    }
    if (new Date(f.endDatum) < new Date(f.startDatum)) {
      this.bookingError.set(
        'Das Enddatum darf nicht vor dem Startdatum liegen.',
      );
      return;
    }
    if (!f.vorname.trim() || !f.nachname.trim()) {
      this.bookingError.set('Bitte geben Sie Ihren vollständigen Namen ein.');
      return;
    }
    if (!f.email.trim() || !f.email.includes('@')) {
      this.bookingError.set('Bitte geben Sie eine gültige E-Mail-Adresse ein.');
      return;
    }

    const bike = this.selectedBike();
    if (!bike) return;

    this.bookingSubmitting.set(true);
    this.bookingError.set(null);

    const dto: RentalBookingCreate = {
      bicycleId: bike.id,
      startDatum: f.startDatum,
      endDatum: f.endDatum,
      vorname: f.vorname.trim(),
      nachname: f.nachname.trim(),
      email: f.email.trim(),
      telefon: f.telefon.trim() || undefined,
      sprache: f.sprache,
      notizen: f.notizen.trim() || undefined,
    };

    this.apiService.createRentalBooking(dto).subscribe({
      next: (res) => {
        this.confirmedBookingNr.set(res.buchungsNummer);
        this.bookingSuccess.set(true);
        this.bookingSubmitting.set(false);
      },
      error: (err) => {
        const msg =
          err?.error?.error ||
          'Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.';
        this.bookingError.set(msg);
        this.bookingSubmitting.set(false);
      },
    });
  }

  getWhatsappLink(): string {
    return 'https://wa.me/4915566300011';
  }

  getImageUrl(path: string): string {
    const base = environment.apiUrl
      .replace('/api/public', '')
      .replace(/\/$/, '');
    const p = path.startsWith('/') ? path : `/${path}`;
    return `${base}${p}`;
  }
}
