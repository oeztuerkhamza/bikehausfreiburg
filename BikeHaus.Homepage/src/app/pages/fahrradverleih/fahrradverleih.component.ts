import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
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
      <!-- Header -->
      <header class="page-header">
        <div class="container">
          <span class="label">{{ t().bikeRentalPageLabel }}</span>
          <h1>{{ t().bikeRentalPageTitle }}</h1>
        </div>
      </header>

      <div class="container rental-body">
        <!-- Hero Intro -->
        <section class="hero-intro">
          <div class="intro-content">
            <div class="intro-badge">
              <svg
                width="28"
                height="28"
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
              <span>{{ t().bikeRental }}</span>
            </div>
            <p class="intro-text">{{ t().bikeRentalIntro }}</p>
          </div>
          <div class="intro-visual">
            <div class="visual-card">
              <div class="visual-price">{{ t().bikeRentalPriceDay1 }}</div>
              <div class="visual-content">
                <p class="visual-tagline">{{ t().bikeRentalHeroPrice }}</p>
              </div>
            </div>
          </div>
        </section>

        <!-- Prices Section -->
        <section class="prices-section">
          <div class="section-header">
            <span class="section-label">{{ t().bikeRentalPricesTitle }}</span>
          </div>
          <div class="prices-grid">
            <div class="price-card">
              <div class="price-icon">
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.5"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <span class="price-label">{{ t().bikeRentalTierShort }}</span>
              <span class="price-duration">{{
                t().bikeRentalDurationDay1
              }}</span>
              <span class="price-amount">{{ t().bikeRentalPriceDay1 }}</span>
            </div>
            <div class="price-card popular">
              <div class="price-icon">
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.5"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <span class="price-label">{{ t().bikeRentalTierPopular }}</span>
              <span class="price-duration">{{
                t().bikeRentalDurationDay3
              }}</span>
              <span class="price-amount">{{ t().bikeRentalPriceDay3 }}</span>
            </div>
            <div class="price-card featured">
              <div class="price-icon">
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.5"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <span class="price-label">{{ t().bikeRentalTierTop }}</span>
              <span class="price-duration">{{
                t().bikeRentalDurationDay7
              }}</span>
              <span class="price-amount">{{ t().bikeRentalPriceDay7 }}</span>
            </div>
            <div class="price-card">
              <div class="price-icon">
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.5"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <span class="price-label">{{ t().bikeRentalTierLong }}</span>
              <span class="price-duration">{{
                t().bikeRentalDurationDay14
              }}</span>
              <span class="price-amount">{{ t().bikeRentalPriceDay14 }}</span>
            </div>
            <div class="price-card deal">
              <div class="price-icon">
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.5"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <span class="price-label">{{ t().bikeRentalTierBest }}</span>
              <span class="price-duration">{{
                t().bikeRentalDurationDay30
              }}</span>
              <span class="price-amount">{{ t().bikeRentalPriceDay30 }}</span>
            </div>
            <div class="price-card">
              <div class="price-icon">
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.5"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <span class="price-label">{{ t().bikeRentalTierAddon }}</span>
              <span class="price-duration small">{{
                t().bikeRentalDurationFromDay10
              }}</span>
              <span class="price-amount">{{ t().bikeRentalPriceAddon }}</span>
            </div>
          </div>
        </section>

        <!-- Info Cards Grid -->
        <section class="info-section">
          <div class="info-grid">
            <!-- Deposit -->
            <div class="info-card">
              <div class="info-icon deposit-icon">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.5"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <h3>{{ t().bikeRentalDepositTitle }}</h3>
              <p>{{ t().bikeRentalDepositText }}</p>
            </div>

            <!-- Included -->
            <div class="info-card">
              <div class="info-icon included-icon">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.5"
                >
                  <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
              <h3>{{ t().bikeRentalIncludedTitle }}</h3>
              <ul class="included-list">
                <li>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.5"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  {{ t().bikeRentalIncluded1 }}
                </li>
                <li>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.5"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  {{ t().bikeRentalIncluded2 }}
                </li>
              </ul>
              <p class="included-note">{{ t().bikeRentalIncludedNote }}</p>
            </div>
          </div>
        </section>

        <!-- Available Bikes -->
        <section class="bikes-section">
          <div class="section-header">
            <span class="section-label">{{ t().bikeRentalAvailableLabel }}</span>
            <h2 class="bikes-title">{{ t().bikeRentalAvailableTitle }}</h2>
          </div>

          <!-- Loading -->
          <div class="bikes-loading" *ngIf="bikesLoading()">
            <div class="bike-skeleton" *ngFor="let i of [1,2,3]"></div>
          </div>

          <!-- Empty State -->
          <div class="bikes-empty" *ngIf="!bikesLoading() && bikes().length === 0">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <circle cx="5.5" cy="17.5" r="3.5"/><circle cx="18.5" cy="17.5" r="3.5"/>
              <path d="M15 6a1 1 0 100-2 1 1 0 000 2zM12 17.5V14l-3-3 4-3 2 3h3"/>
            </svg>
            <p>{{ t().bikeRentalNoBikes }}</p>
          </div>

          <!-- Bike Grid -->
          <div class="bikes-grid" *ngIf="!bikesLoading() && bikes().length > 0">
            <div class="bike-card" *ngFor="let bike of bikes()" (click)="openBikeDetail(bike)">
              <div class="bike-img-wrap">
                <img
                  *ngIf="bike.images.length > 0"
                  [src]="getImageUrl(bike.images[0].filePath)"
                  [alt]="bike.marke + ' ' + bike.modell"
                  loading="lazy"
                  class="bike-img"
                />
                <div class="bike-img-placeholder" *ngIf="bike.images.length === 0">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2">
                    <circle cx="5.5" cy="17.5" r="3.5"/><circle cx="18.5" cy="17.5" r="3.5"/>
                    <path d="M15 6a1 1 0 100-2 1 1 0 000 2zM12 17.5V14l-3-3 4-3 2 3h3"/>
                  </svg>
                </div>
                <div class="bike-type-badge" *ngIf="bike.fahrradtyp">{{ bike.fahrradtyp }}</div>
                <div class="bike-img-count" *ngIf="bike.images.length > 1">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                  {{ bike.images.length }}
                </div>
              </div>
              <div class="bike-info">
                <div class="bike-name">{{ bike.marke }} {{ bike.modell }}</div>
                <div class="bike-meta">
                  <span *ngIf="bike.rahmengroesse">{{ bike.rahmengroesse }}</span>
                  <span *ngIf="bike.reifengroesse">{{ bike.reifengroesse }}"</span>
                  <span *ngIf="bike.farbe">{{ bike.farbe }}</span>
                </div>
                <p class="bike-desc" *ngIf="bike.beschreibung">{{ bike.beschreibung }}</p>
                <div class="bike-prices">
                  <div class="price-pill" *ngIf="bike.preise.day1">
                    <span class="pill-duration">1 {{ t().bikeRentalDay }}</span>
                    <span class="pill-price">{{ bike.preise.day1 | number:'1.0-0' }} €</span>
                  </div>
                  <div class="price-pill" *ngIf="bike.preise.day3">
                    <span class="pill-duration">3 {{ t().bikeRentalDays }}</span>
                    <span class="pill-price">{{ bike.preise.day3 | number:'1.0-0' }} €</span>
                  </div>
                  <div class="price-pill featured" *ngIf="bike.preise.day7">
                    <span class="pill-duration">7 {{ t().bikeRentalDays }}</span>
                    <span class="pill-price">{{ bike.preise.day7 | number:'1.0-0' }} €</span>
                  </div>
                  <div class="price-pill" *ngIf="bike.preise.day14">
                    <span class="pill-duration">14 {{ t().bikeRentalDays }}</span>
                    <span class="pill-price">{{ bike.preise.day14 | number:'1.0-0' }} €</span>
                  </div>
                  <div class="price-pill" *ngIf="bike.preise.day30">
                    <span class="pill-duration">30 {{ t().bikeRentalDays }}</span>
                    <span class="pill-price">{{ bike.preise.day30 | number:'1.0-0' }} €</span>
                  </div>
                </div>
                <button class="btn-book btn-anfragen" (click)="$event.stopPropagation(); openBookingModal(bike)">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                  {{ t().bikeRentalBookBtn }}
                </button>
              </div>
            </div>
          </div>
        </section>

        <!-- Bike Detail Overlay -->
        <div class="detail-overlay" *ngIf="bikeDetailOpen()" (click)="closeBikeDetail()">
          <div class="detail-box" (click)="$event.stopPropagation()">

            <!-- Close -->
            <button class="detail-close" (click)="closeBikeDetail()">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>

            <div class="detail-inner" *ngIf="detailBike()">

              <!-- Gallery -->
              <div class="detail-gallery">
                <div class="detail-main-img">
                  <img
                    *ngIf="detailBike()!.images.length > 0"
                    [src]="getImageUrl(detailBike()!.images[detailImageIndex()].filePath)"
                    [alt]="detailBike()!.marke + ' ' + detailBike()!.modell"
                  />
                  <div class="detail-img-placeholder" *ngIf="detailBike()!.images.length === 0">
                    <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2">
                      <circle cx="5.5" cy="17.5" r="3.5"/><circle cx="18.5" cy="17.5" r="3.5"/>
                      <path d="M15 6a1 1 0 100-2 1 1 0 000 2zM12 17.5V14l-3-3 4-3 2 3h3"/>
                    </svg>
                  </div>
                  <!-- Arrows -->
                  <button class="gallery-arrow gallery-prev" *ngIf="detailBike()!.images.length > 1" (click)="detailPrevImage()">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M15 18l-6-6 6-6"/></svg>
                  </button>
                  <button class="gallery-arrow gallery-next" *ngIf="detailBike()!.images.length > 1" (click)="detailNextImage()">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M9 18l6-6-6-6"/></svg>
                  </button>
                  <!-- Counter -->
                  <div class="gallery-counter" *ngIf="detailBike()!.images.length > 1">
                    {{ detailImageIndex() + 1 }} / {{ detailBike()!.images.length }}
                  </div>
                </div>

                <!-- Thumbnails -->
                <div class="detail-thumbs" *ngIf="detailBike()!.images.length > 1">
                  <button
                    *ngFor="let img of detailBike()!.images; let i = index"
                    class="detail-thumb"
                    [class.active]="i === detailImageIndex()"
                    (click)="detailImageIndex.set(i)"
                  >
                    <img [src]="getImageUrl(img.filePath)" [alt]="'Foto ' + (i+1)" />
                  </button>
                </div>
              </div>

              <!-- Info -->
              <div class="detail-info">
                <div class="detail-badge" *ngIf="detailBike()!.fahrradtyp">{{ detailBike()!.fahrradtyp }}</div>
                <h2 class="detail-name">{{ detailBike()!.marke }} {{ detailBike()!.modell }}</h2>

                <div class="detail-specs">
                  <div class="spec-item" *ngIf="detailBike()!.rahmengroesse">
                    <span class="spec-label">Rahmen</span>
                    <span class="spec-value">{{ detailBike()!.rahmengroesse }}</span>
                  </div>
                  <div class="spec-item" *ngIf="detailBike()!.reifengroesse">
                    <span class="spec-label">Reifen</span>
                    <span class="spec-value">{{ detailBike()!.reifengroesse }}"</span>
                  </div>
                  <div class="spec-item" *ngIf="detailBike()!.farbe">
                    <span class="spec-label">Farbe</span>
                    <span class="spec-value">{{ detailBike()!.farbe }}</span>
                  </div>
                  <div class="spec-item" *ngIf="detailBike()!.art">
                    <span class="spec-label">Art</span>
                    <span class="spec-value">{{ detailBike()!.art }}</span>
                  </div>
                </div>

                <p class="detail-desc" *ngIf="detailBike()!.beschreibung">{{ detailBike()!.beschreibung }}</p>

                <!-- Prices -->
                <div class="detail-prices">
                  <div class="detail-price-row" *ngIf="detailBike()!.preise.day1">
                    <span>1 {{ t().bikeRentalDay }}</span>
                    <strong>{{ detailBike()!.preise.day1 | number:'1.0-0' }} €</strong>
                  </div>
                  <div class="detail-price-row" *ngIf="detailBike()!.preise.day3">
                    <span>3 {{ t().bikeRentalDays }}</span>
                    <strong>{{ detailBike()!.preise.day3 | number:'1.0-0' }} €</strong>
                  </div>
                  <div class="detail-price-row featured" *ngIf="detailBike()!.preise.day7">
                    <span>7 {{ t().bikeRentalDays }}</span>
                    <strong>{{ detailBike()!.preise.day7 | number:'1.0-0' }} €</strong>
                  </div>
                  <div class="detail-price-row" *ngIf="detailBike()!.preise.day14">
                    <span>14 {{ t().bikeRentalDays }}</span>
                    <strong>{{ detailBike()!.preise.day14 | number:'1.0-0' }} €</strong>
                  </div>
                  <div class="detail-price-row" *ngIf="detailBike()!.preise.day30">
                    <span>30 {{ t().bikeRentalDays }}</span>
                    <strong>{{ detailBike()!.preise.day30 | number:'1.0-0' }} €</strong>
                  </div>
                  <div class="detail-price-row per-day" *ngIf="detailBike()!.preise.perDayFrom10">
                    <span>Ab 10 {{ t().bikeRentalDays }}</span>
                    <strong>{{ detailBike()!.preise.perDayFrom10 | number:'1.0-0' }} € / {{ t().bikeRentalDay }}</strong>
                  </div>
                </div>

                <button class="btn-book btn-anfragen detail-book-btn" (click)="openBookingFromDetail()">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                  {{ t().bikeRentalBookBtn }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Booking Modal -->
        <div class="modal-overlay" *ngIf="modalOpen()" (click)="closeModal()">
          <div class="modal-box" (click)="$event.stopPropagation()">

            <!-- Header -->
            <div class="modal-header">
              <div class="modal-bike-info" *ngIf="selectedBike()">
                <div class="modal-bike-img">
                  <img *ngIf="selectedBike()!.images.length > 0" [src]="getImageUrl(selectedBike()!.images[0].filePath)" [alt]="selectedBike()!.marke" />
                  <svg *ngIf="selectedBike()!.images.length === 0" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="18.5" cy="17.5" r="3.5"/><path d="M15 6a1 1 0 100-2 1 1 0 000 2zM12 17.5V14l-3-3 4-3 2 3h2"/></svg>
                </div>
                <div>
                  <div class="modal-bike-name">{{ selectedBike()!.marke }} {{ selectedBike()!.modell }}</div>
                  <div class="modal-bike-meta">
                    <span *ngIf="selectedBike()!.rahmengroesse">{{ selectedBike()!.rahmengroesse }}</span>
                    <span *ngIf="selectedBike()!.farbe">{{ selectedBike()!.farbe }}</span>
                  </div>
                </div>
              </div>
              <button class="modal-close" (click)="closeModal()">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <!-- Success state -->
            <div class="modal-success" *ngIf="bookingSuccess()">
              <div class="success-icon">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
              </div>
              <h3>Buchungsanfrage gesendet!</h3>
              <p>Wir haben Ihre Anfrage erhalten und melden uns so schnell wie möglich. Eine Bestätigung wurde an <strong>{{ bookingForm.email }}</strong> gesendet.</p>
              <div class="success-booking-nr">
                Buchungsnummer: <strong>{{ confirmedBookingNr() }}</strong>
              </div>
              <button class="btn-close-success" (click)="closeModal()">Schließen</button>
            </div>

            <!-- Form -->
            <div class="modal-form" *ngIf="!bookingSuccess()">
              <h3 class="modal-title">Mietanfrage stellen</h3>

              <!-- Custom Calendar -->
              <div class="booking-calendar">
                <div class="bc-header">
                  <button type="button" class="bc-nav" (click)="prevMonth()">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M15 18l-6-6 6-6"/></svg>
                  </button>
                  <span class="bc-month-title">{{ calMonthLabel() }}</span>
                  <button type="button" class="bc-nav" (click)="nextMonth()">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M9 18l6-6-6-6"/></svg>
                  </button>
                </div>
                <div class="bc-weekdays">
                  <span>Mo</span><span>Di</span><span>Mi</span><span>Do</span><span>Fr</span><span>Sa</span><span>So</span>
                </div>
                <div class="bc-grid">
                  <div *ngFor="let day of calendarDays()"
                       class="bc-cell"
                       [class.bc-empty]="!day"
                       [class.bc-past]="day && isPast(day)"
                       [class.bc-busy]="day && !isPast(day) && isDayBusy(day)"
                       [class.bc-today]="day && isToday(day)"
                       [class.bc-start]="day && isStart(day)"
                       [class.bc-end]="day && isEnd(day)"
                       [class.bc-range]="day && isInRange(day)"
                       [class.bc-clickable]="day && !isPast(day) && !isDayBusy(day)"
                       (click)="day && !isPast(day) && !isDayBusy(day) && onCalDayClick(day)">
                    <span *ngIf="day">{{ day.getDate() }}</span>
                  </div>
                </div>
                <div class="bc-legend">
                  <span class="bc-legend-item"><span class="bc-leg-dot bc-leg-busy"></span>Belegt</span>
                  <span class="bc-legend-item"><span class="bc-leg-dot bc-leg-sel"></span>Ausgewählt</span>
                </div>
                <div class="bc-info" *ngIf="calendarStart()">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  <span *ngIf="!calendarEnd()">{{ formatCalDay(calendarStart()!) }} → Enddatum wählen</span>
                  <span *ngIf="calendarEnd()">{{ formatCalDay(calendarStart()!) }} – {{ formatCalDay(calendarEnd()!) }}</span>
                </div>
              </div>

              <!-- Price Preview -->
              <div class="price-preview" *ngIf="calculatedDays() > 0 && calculatedPrice() !== null">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
                <span>{{ calculatedDays() }} Tage · geschätzter Preis:</span>
                <strong>{{ calculatedPrice() | number:'1.0-0' }} €</strong>
              </div>
              <div class="price-preview warn" *ngIf="calculatedDays() > 0 && calculatedPrice() === null">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                <span>{{ calculatedDays() }} Tage · Preis auf Anfrage</span>
              </div>

              <!-- Name row -->
              <div class="form-row">
                <div class="form-field">
                  <label>Vorname *</label>
                  <input type="text" [(ngModel)]="bookingForm.vorname" placeholder="Max" />
                </div>
                <div class="form-field">
                  <label>Nachname *</label>
                  <input type="text" [(ngModel)]="bookingForm.nachname" placeholder="Mustermann" />
                </div>
              </div>

              <!-- Email + Phone -->
              <div class="form-row">
                <div class="form-field">
                  <label>E-Mail *</label>
                  <input type="email" [(ngModel)]="bookingForm.email" placeholder="max&#64;example.com" />
                </div>
                <div class="form-field">
                  <label>Telefon</label>
                  <input type="tel" [(ngModel)]="bookingForm.telefon" placeholder="+49 ..." />
                </div>
              </div>

              <!-- Language -->
              <div class="form-field">
                <label>Kommunikationssprache</label>
                <div class="lang-toggle">
                  <button type="button" [class.active]="bookingForm.sprache === 'de'" (click)="bookingForm.sprache = 'de'">Deutsch</button>
                  <button type="button" [class.active]="bookingForm.sprache === 'en'" (click)="bookingForm.sprache = 'en'">English</button>
                </div>
              </div>

              <!-- Notes -->
              <div class="form-field">
                <label>Anmerkungen (optional)</label>
                <textarea [(ngModel)]="bookingForm.notizen" rows="2" placeholder="Besondere Wünsche, Fragen..."></textarea>
              </div>

              <!-- Error -->
              <div class="form-error" *ngIf="bookingError()">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                {{ bookingError() }}
              </div>

              <!-- Submit -->
              <button class="btn-submit" (click)="submitBooking()" [disabled]="bookingSubmitting()">
                <svg *ngIf="!bookingSubmitting()" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                <div *ngIf="bookingSubmitting()" class="submit-spinner"></div>
                {{ bookingSubmitting() ? 'Wird gesendet...' : 'Anfrage senden' }}
              </button>

              <p class="modal-note">Nach Eingang Ihrer Anfrage erhalten Sie eine Bestätigungs-E-Mail. Die endgültige Buchung erfolgt nach Bestätigung durch unser Team.</p>
            </div>
          </div>
        </div>

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
    </div>
  `,
  styles: [
    `
      .page-header {
        padding: 7rem 0 3rem;
        background: var(--color-bg);
        border-bottom: 1px solid var(--color-border);
      }

      .label {
        display: block;
        font-size: 0.75rem;
        font-weight: 600;
        letter-spacing: 0.15em;
        text-transform: uppercase;
        color: var(--color-accent);
        margin-bottom: 0.75rem;
      }

      .page-header h1 {
        font-size: clamp(1.75rem, 4vw, 2.5rem);
        font-weight: 800;
        color: var(--color-text);
        margin: 0;
        letter-spacing: -0.02em;
      }

      .rental-body {
        padding-top: 3rem;
        padding-bottom: 4rem;
      }

      /* ── Hero Intro ── */
      .hero-intro {
        display: grid;
        grid-template-columns: 1fr 280px;
        gap: 3rem;
        align-items: center;
        margin-bottom: 4rem;
      }

      .intro-badge {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 1rem;
        background: rgba(255, 87, 34, 0.1);
        border: 1px solid rgba(255, 87, 34, 0.2);
        border-radius: 50px;
        color: var(--color-accent);
        font-size: 0.82rem;
        font-weight: 600;
        margin-bottom: 1.5rem;
      }

      .intro-badge svg {
        color: var(--color-accent);
      }

      .intro-text {
        font-size: 1.05rem;
        line-height: 1.85;
        color: var(--color-text-secondary);
        margin: 0;
        max-width: 560px;
      }

      .intro-visual {
        position: relative;
      }

      .visual-card {
        position: relative;
        background: linear-gradient(
          135deg,
          var(--color-surface) 0%,
          rgba(255, 87, 34, 0.05) 100%
        );
        border: 1px solid var(--color-border);
        border-radius: 20px;
        padding: 2.5rem 2rem;
        text-align: center;
        overflow: hidden;
      }

      .visual-card::before {
        content: '';
        position: absolute;
        top: -50%;
        right: -50%;
        width: 200%;
        height: 200%;
        background: radial-gradient(
          circle,
          rgba(255, 87, 34, 0.08) 0%,
          transparent 50%
        );
        pointer-events: none;
      }

      .visual-price {
        position: relative;
        z-index: 1;
        font-size: 3.5rem;
        font-weight: 900;
        color: var(--color-accent);
        letter-spacing: -0.05em;
        line-height: 1;
        margin-bottom: 0.5rem;
      }

      .visual-content {
        position: relative;
        z-index: 1;
      }

      .visual-tagline {
        font-size: 0.95rem;
        font-weight: 500;
        color: var(--color-text-secondary);
        margin: 0;
      }

      /* ── Prices Section ── */
      .prices-section {
        margin-bottom: 3.5rem;
      }

      .section-header {
        margin-bottom: 1.5rem;
      }

      .section-label {
        display: block;
        font-size: 0.75rem;
        font-weight: 700;
        letter-spacing: 0.15em;
        text-transform: uppercase;
        color: var(--color-accent);
      }

      .prices-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1.25rem;
      }

      .price-card {
        background: var(--color-surface);
        border: 1px solid var(--color-border);
        border-radius: 16px;
        padding: 1.75rem 1.25rem;
        text-align: center;
        transition:
          border-color 0.3s,
          transform 0.3s;
      }

      .price-card:hover {
        border-color: var(--color-accent);
        transform: translateY(-2px);
      }

      .price-card.featured {
        border-color: var(--color-accent);
        background: linear-gradient(
          135deg,
          var(--color-surface) 0%,
          rgba(255, 87, 34, 0.06) 100%
        );
      }

      .price-card.deal {
        border-color: rgba(255, 152, 0, 0.6);
        background: linear-gradient(
          135deg,
          var(--color-surface) 0%,
          rgba(255, 152, 0, 0.08) 100%
        );
      }

      .price-card.popular .price-label {
        color: var(--color-accent);
      }

      .price-icon {
        width: 44px;
        height: 44px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 10px;
        background: rgba(255, 87, 34, 0.1);
        color: var(--color-accent);
        margin: 0 auto 1rem;
      }

      .price-duration {
        display: block;
        font-size: 2rem;
        font-weight: 800;
        color: var(--color-text);
        line-height: 1;
        margin-bottom: 0.3rem;
        letter-spacing: -0.02em;
      }

      .price-duration.small {
        font-size: 1.15rem;
        font-weight: 700;
        letter-spacing: -0.01em;
      }

      .price-card.featured .price-duration {
        color: var(--color-accent);
      }

      .price-amount {
        font-size: 0.9rem;
        font-weight: 600;
        color: var(--color-text-secondary);
      }

      .price-label {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 0.2rem 0.6rem;
        border-radius: 999px;
        font-size: 0.7rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: var(--color-text-secondary);
        background: rgba(255, 255, 255, 0.04);
        margin-bottom: 0.6rem;
      }

      /* ── Info Cards ── */
      .info-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 1.5rem;
        margin-bottom: 2rem;
      }

      .info-card {
        background: var(--color-surface);
        border: 1px solid var(--color-border);
        border-radius: 16px;
        padding: 2rem 1.5rem;
      }

      .info-icon {
        width: 44px;
        height: 44px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 1rem;
      }

      .deposit-icon {
        background: rgba(255, 193, 7, 0.15);
        color: #d4a017;
      }

      .included-icon {
        background: rgba(40, 167, 69, 0.12);
        color: #28a745;
      }

      .info-card h3 {
        font-size: 0.85rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--color-text-secondary);
        margin: 0 0 0.75rem;
      }

      .info-card p {
        font-size: 0.92rem;
        color: var(--color-text);
        line-height: 1.75;
        margin: 0;
      }

      .included-list {
        list-style: none;
        padding: 0;
        margin: 0 0 0.75rem;
        display: flex;
        flex-direction: column;
        gap: 0.6rem;
      }

      .included-list li {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.95rem;
        font-weight: 600;
        color: var(--color-text);
      }

      .included-list li svg {
        color: #28a745;
        flex-shrink: 0;
      }

      .included-note {
        font-style: italic;
        font-size: 0.85rem !important;
        color: var(--color-text-secondary) !important;
      }

      .bike-img-count {
        position: absolute;
        bottom: 10px;
        right: 10px;
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 3px 8px;
        background: rgba(0,0,0,0.6);
        color: #fff;
        border-radius: 999px;
        font-size: 0.72rem;
        font-weight: 600;
        backdrop-filter: blur(4px);
      }

      /* ── Bike Detail Overlay ── */
      .detail-overlay {
        position: fixed; inset: 0; z-index: 8900;
        background: rgba(0,0,0,0.75); backdrop-filter: blur(6px);
        display: flex; align-items: center; justify-content: center;
        padding: 1rem; animation: fadeOverlay 0.2s ease;
      }

      .detail-box {
        position: relative;
        background: var(--color-surface); border: 1px solid var(--color-border);
        border-radius: 22px; width: 100%; max-width: 900px;
        max-height: 92vh; overflow-y: auto;
        animation: slideUp 0.25s ease;
        box-shadow: 0 30px 80px rgba(0,0,0,0.5);
      }

      .detail-close {
        position: absolute; top: 14px; right: 14px; z-index: 10;
        background: rgba(0,0,0,0.35); border: none; border-radius: 50%;
        width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;
        cursor: pointer; color: #fff; transition: background 0.15s;
      }
      .detail-close:hover { background: rgba(0,0,0,0.6); }

      .detail-inner {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 0;
      }

      /* Gallery */
      .detail-gallery {
        display: flex; flex-direction: column; gap: 10px;
        padding: 20px 16px 20px 20px;
        border-right: 1px solid var(--color-border);
      }

      .detail-main-img {
        position: relative;
        width: 100%; aspect-ratio: 4/3;
        border-radius: 14px; overflow: hidden;
        background: var(--color-bg);
      }

      .detail-main-img img {
        width: 100%; height: 100%; object-fit: cover;
        transition: opacity 0.2s;
      }

      .detail-img-placeholder {
        width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;
        color: var(--color-text-secondary); opacity: 0.3;
      }

      .gallery-arrow {
        position: absolute; top: 50%; transform: translateY(-50%);
        background: rgba(0,0,0,0.5); color: #fff; border: none; border-radius: 50%;
        width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;
        cursor: pointer; transition: background 0.15s; backdrop-filter: blur(4px);
      }
      .gallery-arrow:hover { background: rgba(0,0,0,0.8); }
      .gallery-prev { left: 10px; }
      .gallery-next { right: 10px; }

      .gallery-counter {
        position: absolute; bottom: 10px; left: 50%; transform: translateX(-50%);
        background: rgba(0,0,0,0.55); color: #fff; font-size: 0.72rem; font-weight: 600;
        padding: 3px 10px; border-radius: 999px; backdrop-filter: blur(4px);
      }

      .detail-thumbs {
        display: flex; gap: 8px; flex-wrap: wrap;
      }

      .detail-thumb {
        width: 60px; height: 60px; border-radius: 8px; overflow: hidden;
        border: 2px solid transparent; cursor: pointer; padding: 0;
        background: var(--color-bg); transition: border-color 0.15s;
        flex-shrink: 0;
      }
      .detail-thumb.active { border-color: var(--color-accent); }
      .detail-thumb:hover { border-color: rgba(255,87,34,0.5); }
      .detail-thumb img { width: 100%; height: 100%; object-fit: cover; }

      /* Info Panel */
      .detail-info {
        padding: 24px 24px 28px 20px;
        display: flex; flex-direction: column; gap: 14px;
        overflow-y: auto;
      }

      .detail-badge {
        display: inline-flex; align-items: center;
        padding: 3px 12px; border-radius: 999px;
        background: rgba(255,87,34,0.12); color: var(--color-accent);
        font-size: 0.72rem; font-weight: 700; text-transform: uppercase;
        letter-spacing: 0.08em; align-self: flex-start;
      }

      .detail-name {
        font-size: 1.4rem; font-weight: 800; color: var(--color-text);
        margin: 0; letter-spacing: -0.02em; line-height: 1.2;
      }

      .detail-specs {
        display: grid; grid-template-columns: 1fr 1fr; gap: 8px;
      }

      .spec-item {
        display: flex; flex-direction: column; gap: 2px;
        padding: 8px 12px; border-radius: 10px;
        background: rgba(255,255,255,0.04); border: 1px solid var(--color-border);
      }

      .spec-label {
        font-size: 0.68rem; font-weight: 700; text-transform: uppercase;
        letter-spacing: 0.08em; color: var(--color-text-secondary);
      }

      .spec-value {
        font-size: 0.9rem; font-weight: 600; color: var(--color-text);
      }

      .detail-desc {
        font-size: 0.9rem; color: var(--color-text-secondary);
        line-height: 1.7; margin: 0;
      }

      .detail-prices {
        display: flex; flex-direction: column; gap: 0;
        border: 1px solid var(--color-border); border-radius: 12px; overflow: hidden;
      }

      .detail-price-row {
        display: flex; align-items: center; justify-content: space-between;
        padding: 9px 14px; font-size: 0.88rem; color: var(--color-text);
        border-bottom: 1px solid var(--color-border);
        transition: background 0.15s;
      }
      .detail-price-row:last-child { border-bottom: none; }
      .detail-price-row:hover { background: rgba(255,255,255,0.03); }
      .detail-price-row span { color: var(--color-text-secondary); }
      .detail-price-row strong { font-weight: 700; }
      .detail-price-row.featured { background: rgba(255,87,34,0.06); }
      .detail-price-row.featured span { color: var(--color-accent); }
      .detail-price-row.featured strong { color: var(--color-accent); font-size: 1rem; }
      .detail-price-row.per-day span { font-style: italic; }

      .detail-book-btn { margin-top: 4px; }

      @media (max-width: 700px) {
        .detail-inner { grid-template-columns: 1fr; }
        .detail-gallery { border-right: none; border-bottom: 1px solid var(--color-border); padding: 16px; }
        .detail-info { padding: 16px; }
        .detail-name { font-size: 1.2rem; }
      }

      /* ── Note Banner ── */
      .note-banner {
        display: flex;
        gap: 0.75rem;
        align-items: flex-start;
        padding: 1.25rem 1.5rem;
        background: var(--color-surface);
        border: 1px solid var(--color-border);
        border-left: 4px solid var(--color-accent);
        border-radius: 0 12px 12px 0;
        margin-bottom: 3rem;
      }

      .note-banner svg {
        flex-shrink: 0;
        margin-top: 2px;
        color: var(--color-accent);
      }

      .note-banner strong {
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
        display: flex;
        align-items: center;
        gap: 1.25rem;
        padding: 1.5rem 2rem;
        background: var(--color-surface);
        border: 1px solid var(--color-border);
        border-radius: 16px;
        text-decoration: none;
        transition:
          border-color 0.3s,
          transform 0.3s;
      }

      .whatsapp-card:hover {
        border-color: #25d366;
        transform: translateY(-2px);
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
        margin-bottom: 3.5rem;
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
        background: linear-gradient(90deg, var(--color-surface) 25%, var(--color-border) 50%, var(--color-surface) 75%);
        background-size: 200% 100%;
        animation: shimmer 1.5s infinite;
      }

      @keyframes shimmer {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
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

      .bikes-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 1.5rem;
      }

      .bike-card {
        background: var(--color-surface);
        border: 1px solid var(--color-border);
        border-radius: 16px;
        overflow: hidden;
        transition: border-color 0.3s, transform 0.3s, box-shadow 0.3s;
        cursor: pointer;
      }

      .bike-card:hover {
        border-color: var(--color-accent);
        transform: translateY(-3px);
        box-shadow: 0 12px 30px rgba(0, 0, 0, 0.2);
      }

      .bike-img-wrap {
        position: relative;
        height: 200px;
        overflow: hidden;
        background: var(--color-bg);
      }

      .bike-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.4s;
      }

      .bike-card:hover .bike-img {
        transform: scale(1.04);
      }

      .bike-img-placeholder {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--color-text-secondary);
        opacity: 0.3;
      }

      .bike-type-badge {
        position: absolute;
        top: 12px;
        left: 12px;
        padding: 0.25rem 0.7rem;
        background: rgba(0, 0, 0, 0.65);
        color: #fff;
        border-radius: 999px;
        font-size: 0.72rem;
        font-weight: 600;
        letter-spacing: 0.06em;
        backdrop-filter: blur(4px);
      }

      .bike-info {
        padding: 1.25rem 1.25rem 1.5rem;
      }

      .bike-name {
        font-size: 1.05rem;
        font-weight: 700;
        color: var(--color-text);
        margin-bottom: 0.35rem;
      }

      .bike-meta {
        display: flex;
        flex-wrap: wrap;
        gap: 0.4rem;
        margin-bottom: 0.75rem;
      }

      .bike-meta span {
        font-size: 0.75rem;
        font-weight: 500;
        color: var(--color-text-secondary);
        background: rgba(255,255,255,0.05);
        border: 1px solid var(--color-border);
        border-radius: 999px;
        padding: 0.15rem 0.55rem;
      }

      .bike-desc {
        font-size: 0.85rem;
        color: var(--color-text-secondary);
        line-height: 1.6;
        margin: 0 0 0.9rem;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      .bike-prices {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        margin-bottom: 1rem;
      }

      .price-pill {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 0.4rem 0.7rem;
        background: rgba(255,255,255,0.04);
        border: 1px solid var(--color-border);
        border-radius: 10px;
        min-width: 56px;
      }

      .price-pill.featured {
        border-color: var(--color-accent);
        background: rgba(255, 87, 34, 0.08);
      }

      .pill-duration {
        font-size: 0.68rem;
        font-weight: 600;
        color: var(--color-text-secondary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .price-pill.featured .pill-duration {
        color: var(--color-accent);
      }

      .pill-price {
        font-size: 0.92rem;
        font-weight: 800;
        color: var(--color-text);
        margin-top: 1px;
      }

      .price-pill.featured .pill-price {
        color: var(--color-accent);
      }

      .btn-book {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.65rem 1.25rem;
        border-radius: 10px;
        font-size: 0.88rem;
        font-weight: 700;
        transition: background 0.2s, transform 0.2s;
        width: 100%;
        justify-content: center;
        cursor: pointer;
        border: none;
      }

      .btn-anfragen {
        background: var(--color-accent);
        color: #fff;
      }

      .btn-anfragen:hover {
        opacity: 0.88;
        transform: translateY(-1px);
      }

      /* ── Booking Modal ── */
      .modal-overlay {
        position: fixed; inset: 0; z-index: 9000;
        background: rgba(0,0,0,0.65); backdrop-filter: blur(4px);
        display: flex; align-items: center; justify-content: center;
        padding: 1rem; animation: fadeOverlay 0.2s ease;
      }
      @keyframes fadeOverlay { from { opacity: 0; } to { opacity: 1; } }

      .modal-box {
        background: var(--color-surface); border: 1px solid var(--color-border);
        border-radius: 20px; width: 100%; max-width: 520px;
        max-height: 92vh; overflow-y: auto;
        animation: slideUp 0.25s ease;
        box-shadow: 0 24px 60px rgba(0,0,0,0.35);
      }
      @keyframes slideUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }

      .modal-header {
        display: flex; align-items: center; justify-content: space-between;
        padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--color-border);
        gap: 1rem;
      }
      .modal-bike-info { display: flex; align-items: center; gap: 12px; }
      .modal-bike-img {
        width: 52px; height: 52px; border-radius: 10px; overflow: hidden;
        background: var(--color-bg); display: flex; align-items: center; justify-content: center;
        flex-shrink: 0; border: 1px solid var(--color-border);
      }
      .modal-bike-img img { width: 100%; height: 100%; object-fit: cover; }
      .modal-bike-img svg { opacity: 0.4; }
      .modal-bike-name { font-size: 0.95rem; font-weight: 700; color: var(--color-text); }
      .modal-bike-meta { display: flex; gap: 6px; margin-top: 3px; }
      .modal-bike-meta span {
        font-size: 0.72rem; padding: 1px 7px; border-radius: 999px;
        background: rgba(255,255,255,0.05); border: 1px solid var(--color-border);
        color: var(--color-text-secondary);
      }
      .modal-close {
        background: none; border: none; cursor: pointer; color: var(--color-text-secondary);
        padding: 6px; border-radius: 8px; display: flex; transition: background 0.15s;
        flex-shrink: 0;
      }
      .modal-close:hover { background: rgba(255,255,255,0.06); color: var(--color-text); }

      .modal-form { padding: 1.5rem; display: flex; flex-direction: column; gap: 1rem; }
      .modal-title { margin: 0 0 0.5rem; font-size: 1.1rem; font-weight: 800; color: var(--color-text); }

      .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
      .form-field { display: flex; flex-direction: column; gap: 5px; }
      .form-field label {
        font-size: 0.75rem; font-weight: 600; text-transform: uppercase;
        letter-spacing: 0.06em; color: var(--color-text-secondary);
      }
      .form-field input, .form-field textarea, .form-field select {
        padding: 10px 12px; border: 1.5px solid var(--color-border);
        border-radius: 10px; background: var(--color-bg); color: var(--color-text);
        font-size: 0.9rem; transition: border-color 0.2s; resize: vertical;
      }
      .form-field input:focus, .form-field textarea:focus {
        outline: none; border-color: var(--color-accent);
        box-shadow: 0 0 0 3px rgba(255,87,34,0.1);
      }

      .price-preview {
        display: flex; align-items: center; gap: 8px;
        padding: 10px 14px; border-radius: 10px;
        background: rgba(255,87,34,0.08); border: 1px solid rgba(255,87,34,0.2);
        font-size: 0.88rem; color: var(--color-text);
      }
      .price-preview svg { color: var(--color-accent); flex-shrink: 0; }
      .price-preview strong { color: var(--color-accent); font-size: 1rem; margin-left: auto; }
      .price-preview.warn { background: rgba(245,158,11,0.08); border-color: rgba(245,158,11,0.2); }
      .price-preview.warn svg { color: #f59e0b; }

      .lang-toggle { display: flex; gap: 8px; }
      .lang-toggle button {
        padding: 7px 18px; border-radius: 8px; border: 1.5px solid var(--color-border);
        background: transparent; color: var(--color-text-secondary); font-size: 0.85rem;
        font-weight: 600; cursor: pointer; transition: all 0.15s;
      }
      .lang-toggle button.active {
        background: var(--color-accent); border-color: var(--color-accent); color: #fff;
      }

      .form-error {
        display: flex; align-items: center; gap: 8px; padding: 10px 14px;
        border-radius: 10px; background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.2);
        font-size: 0.85rem; color: #ef4444;
      }

      .btn-submit {
        display: flex; align-items: center; justify-content: center; gap: 8px;
        width: 100%; padding: 13px; border-radius: 12px;
        background: var(--color-accent); color: #fff; border: none;
        font-size: 0.95rem; font-weight: 700; cursor: pointer; transition: opacity 0.2s;
        margin-top: 4px;
      }
      .btn-submit:hover:not(:disabled) { opacity: 0.88; }
      .btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }
      .submit-spinner {
        width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.4);
        border-top-color: #fff; border-radius: 50%; animation: spin 0.7s linear infinite;
      }
      @keyframes spin { to { transform: rotate(360deg); } }

      /* ── Booking Calendar ── */
      .booking-calendar {
        border: 1.5px solid var(--color-border);
        border-radius: 12px;
        overflow: hidden;
        background: var(--color-bg);
      }

      .bc-header {
        display: flex; align-items: center; justify-content: space-between;
        padding: 10px 14px;
        background: rgba(255,255,255,0.03);
        border-bottom: 1px solid var(--color-border);
      }

      .bc-month-title {
        font-size: 0.88rem; font-weight: 700; color: var(--color-text);
        text-transform: capitalize;
      }

      .bc-nav {
        background: none; border: none; cursor: pointer;
        color: var(--color-text-secondary); padding: 4px 8px;
        border-radius: 6px; display: flex; transition: all 0.15s;
      }
      .bc-nav:hover { background: rgba(255,255,255,0.08); color: var(--color-text); }

      .bc-weekdays {
        display: grid; grid-template-columns: repeat(7, 1fr);
        padding: 6px 10px 2px;
      }
      .bc-weekdays span {
        text-align: center; font-size: 0.67rem; font-weight: 700;
        text-transform: uppercase; letter-spacing: 0.06em;
        color: var(--color-text-secondary); padding: 4px 0;
      }

      .bc-grid {
        display: grid; grid-template-columns: repeat(7, 1fr);
        padding: 4px 10px 10px; gap: 2px;
      }

      .bc-cell {
        aspect-ratio: 1; display: flex; align-items: center; justify-content: center;
        border-radius: 8px; font-size: 0.82rem; font-weight: 500;
        color: var(--color-text); transition: all 0.12s; position: relative;
        user-select: none;
      }

      .bc-empty { pointer-events: none; }
      .bc-clickable { cursor: pointer; }
      .bc-clickable:hover:not(.bc-start):not(.bc-end) { background: rgba(255,255,255,0.08); }

      .bc-past { opacity: 0.28; pointer-events: none; }

      .bc-busy {
        background: rgba(239, 68, 68, 0.15);
        color: #f87171;
        cursor: not-allowed;
      }

      .bc-today::after {
        content: ''; position: absolute;
        bottom: 3px; left: 50%; transform: translateX(-50%);
        width: 4px; height: 4px; border-radius: 50%;
        background: var(--color-accent);
      }

      .bc-start, .bc-end {
        background: var(--color-accent) !important;
        color: #fff !important;
        font-weight: 700;
      }

      .bc-range {
        background: rgba(255, 87, 34, 0.18);
        border-radius: 0;
      }

      .bc-legend {
        display: flex; gap: 16px; padding: 6px 14px 8px;
        border-top: 1px solid var(--color-border);
      }

      .bc-legend-item {
        display: flex; align-items: center; gap: 5px;
        font-size: 0.7rem; color: var(--color-text-secondary);
      }

      .bc-leg-dot {
        width: 10px; height: 10px; border-radius: 3px; flex-shrink: 0;
      }
      .bc-leg-busy { background: rgba(239, 68, 68, 0.4); }
      .bc-leg-sel { background: var(--color-accent); }

      .bc-info {
        display: flex; align-items: center; gap: 7px;
        padding: 8px 14px;
        background: rgba(255, 87, 34, 0.08);
        border-top: 1px solid rgba(255, 87, 34, 0.2);
        font-size: 0.82rem; color: var(--color-text);
      }
      .bc-info svg { color: var(--color-accent); flex-shrink: 0; }

      .modal-note {
        font-size: 0.78rem; color: var(--color-text-secondary); line-height: 1.6;
        text-align: center; margin: 0;
      }

      .modal-success {
        padding: 2.5rem 2rem; text-align: center; display: flex;
        flex-direction: column; align-items: center; gap: 12px;
      }
      .success-icon {
        width: 64px; height: 64px; border-radius: 50%;
        background: rgba(16,185,129,0.12); color: #10b981;
        display: flex; align-items: center; justify-content: center;
      }
      .modal-success h3 { margin: 0; font-size: 1.2rem; font-weight: 800; color: var(--color-text); }
      .modal-success p { margin: 0; font-size: 0.9rem; color: var(--color-text-secondary); line-height: 1.6; max-width: 360px; }
      .success-booking-nr {
        font-size: 0.88rem; padding: 8px 20px; border-radius: 8px;
        background: rgba(16,185,129,0.08); border: 1px solid rgba(16,185,129,0.2);
        color: var(--color-text);
      }
      .btn-close-success {
        margin-top: 8px; padding: 10px 28px; border-radius: 10px;
        background: var(--color-accent); color: #fff; border: none;
        font-weight: 700; cursor: pointer; font-size: 0.9rem;
      }

      @media (max-width: 480px) {
        .form-row { grid-template-columns: 1fr; }
        .modal-box { border-radius: 16px; }
      }

      /* ── CTA ── */
      .rental-cta {
        display: flex;
        align-items: center;
        gap: 2rem;
        padding-top: 2rem;
        border-top: 1px solid var(--color-border);
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
        .hero-intro {
          grid-template-columns: 1fr;
          gap: 2rem;
        }

        .intro-visual {
          order: -1;
          max-width: 280px;
        }

        .prices-grid {
          grid-template-columns: repeat(2, 1fr);
        }
      }

      @media (max-width: 768px) {
        .page-header {
          padding: 6rem 0 2rem;
        }

        .hero-intro {
          margin-bottom: 3rem;
        }

        .info-grid {
          grid-template-columns: 1fr;
        }

        .rental-cta {
          flex-direction: column;
          align-items: flex-start;
          gap: 1rem;
        }
      }

      @media (max-width: 480px) {
        .prices-grid {
          grid-template-columns: 1fr 1fr;
          gap: 0.75rem;
        }

        .price-card {
          padding: 1.25rem 1rem;
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

  t = this.translationService.translations;
  lang = this.translationService.currentLanguage;

  bikes = signal<PublicRentalBicycle[]>([]);
  bikesLoading = signal(true);

  // Bike detail overlay
  bikeDetailOpen = signal(false);
  detailBike = signal<PublicRentalBicycle | null>(null);
  detailImageIndex = signal(0);

  // Modal state
  modalOpen = signal(false);
  selectedBike = signal<PublicRentalBicycle | null>(null);
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
  busyPeriods = signal<{ start: Date; end: Date }[]>([]);
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

  ngOnInit(): void {
    const t = this.t();
    this.titleService.setTitle(t.bikeRentalMetaTitle);
    this.metaService.updateTag({ name: 'description', content: t.bikeRentalMetaDescription });
    this.apiService.getRentableBikes().subscribe({
      next: (bikes) => { this.bikes.set(bikes); this.bikesLoading.set(false); },
      error: () => this.bikesLoading.set(false),
    });
  }

  openBikeDetail(bike: PublicRentalBicycle): void {
    this.detailBike.set(bike);
    this.detailImageIndex.set(0);
    this.bikeDetailOpen.set(true);
    document.body.style.overflow = 'hidden';
  }

  closeBikeDetail(): void {
    this.bikeDetailOpen.set(false);
    document.body.style.overflow = '';
  }

  detailNextImage(): void {
    const bike = this.detailBike();
    if (!bike || bike.images.length === 0) return;
    this.detailImageIndex.set((this.detailImageIndex() + 1) % bike.images.length);
  }

  detailPrevImage(): void {
    const bike = this.detailBike();
    if (!bike || bike.images.length === 0) return;
    this.detailImageIndex.set((this.detailImageIndex() - 1 + bike.images.length) % bike.images.length);
  }

  openBookingFromDetail(): void {
    const bike = this.detailBike();
    if (!bike) return;
    this.closeBikeDetail();
    this.openBookingModal(bike);
  }

  openBookingModal(bike: PublicRentalBicycle): void {
    this.selectedBike.set(bike);
    this.bookingSuccess.set(false);
    this.bookingError.set(null);
    this.calculatedDays.set(0);
    this.calculatedPrice.set(null);
    this.bookingForm = {
      startDatum: '', endDatum: '', vorname: '', nachname: '',
      email: '', telefon: '', sprache: 'de', notizen: '',
    };
    this.calendarStart.set(null);
    this.calendarEnd.set(null);
    this.calendarCurrentDate.set(new Date());
    this.busyPeriods.set([]);
    this.apiService.getBusyPeriods(bike.id).subscribe({
      next: (periods) => {
        this.busyPeriods.set(periods.map(p => {
          const toLocal = (s: string) => { const d = new Date(s); return new Date(d.getFullYear(), d.getMonth(), d.getDate()); };
          return { start: toLocal(p.start), end: toLocal(p.end) };
        }));
      },
      error: () => {},
    });
    this.modalOpen.set(true);
    document.body.style.overflow = 'hidden';
  }

  closeModal(): void {
    this.modalOpen.set(false);
    document.body.style.overflow = '';
  }

  onDatesChange(): void {
    this.bookingError.set(null);
    const { startDatum, endDatum } = this.bookingForm;
    if (!startDatum || !endDatum) { this.calculatedDays.set(0); this.calculatedPrice.set(null); return; }
    const days = Math.floor((new Date(endDatum).getTime() - new Date(startDatum).getTime()) / 86400000) + 1;
    if (days <= 0) { this.calculatedDays.set(0); this.calculatedPrice.set(null); return; }
    this.calculatedDays.set(days);
    const bike = this.selectedBike();
    if (!bike) { this.calculatedPrice.set(null); return; }
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
    this.calendarCurrentDate.set(new Date(d.getFullYear(), d.getMonth() - 1, 1));
  }

  nextMonth(): void {
    const d = this.calendarCurrentDate();
    this.calendarCurrentDate.set(new Date(d.getFullYear(), d.getMonth() + 1, 1));
  }

  isDayBusy(date: Date): boolean {
    const t = date.getTime();
    return this.busyPeriods().some(p => t >= p.start.getTime() && t <= p.end.getTime());
  }

  isPast(date: Date): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  }

  isToday(date: Date): boolean {
    const now = new Date();
    return date.getFullYear() === now.getFullYear() &&
           date.getMonth() === now.getMonth() &&
           date.getDate() === now.getDate();
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
        p => p.start.getTime() <= date.getTime() && p.end.getTime() >= s.getTime()
      );
      if (hasBusy) {
        this.calendarStart.set(date);
        this.calendarEnd.set(null);
        this.bookingForm.startDatum = this.toIsoDate(date);
        this.bookingForm.endDatum = '';
        this.bookingError.set('Dieser Zeitraum enthält bereits gebuchte Tage. Bitte wählen Sie einen anderen Zeitraum.');
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
    return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  submitBooking(): void {
    const f = this.bookingForm;
    if (!f.startDatum || !f.endDatum) {
      this.bookingError.set('Bitte wählen Sie einen Zeitraum aus.'); return;
    }
    if (new Date(f.endDatum) < new Date(f.startDatum)) {
      this.bookingError.set('Das Enddatum darf nicht vor dem Startdatum liegen.'); return;
    }
    if (!f.vorname.trim() || !f.nachname.trim()) {
      this.bookingError.set('Bitte geben Sie Ihren vollständigen Namen ein.'); return;
    }
    if (!f.email.trim() || !f.email.includes('@')) {
      this.bookingError.set('Bitte geben Sie eine gültige E-Mail-Adresse ein.'); return;
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
        const msg = err?.error?.error || 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.';
        this.bookingError.set(msg);
        this.bookingSubmitting.set(false);
      },
    });
  }

  getWhatsappLink(): string {
    return 'https://wa.me/4915566300011';
  }

  getImageUrl(path: string): string {
    const base = environment.apiUrl.replace('/api/public', '').replace(/\/$/, '');
    const p = path.startsWith('/') ? path : `/${path}`;
    return `${base}${p}`;
  }
}
