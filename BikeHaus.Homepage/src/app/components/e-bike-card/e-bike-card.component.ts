import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { EBike } from '../../models/models';
import { TranslationService } from '../../services/translation.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-e-bike-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <a
      [routerLink]="['/' + lang(), 'e-bikes', bike.id]"
      class="card"
      role="article"
    >
      <figure class="card-media">
        <img
          *ngIf="bike.images.length"
          [src]="getImageUrl(bike.images[0].filePath)"
          [alt]="bike.titel + ' — Bike Haus Freiburg'"
          loading="lazy"
          width="400"
          height="300"
          (error)="onImageError($event)"
        />
        <div *ngIf="!bike.images.length" class="card-placeholder">
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
            <path d="M15 6l-4 8h6l-2 3.5" />
            <path d="M5.5 17.5L9 9h3" />
          </svg>
        </div>

        <!-- Category Tag -->
        <span *ngIf="displayCategory" class="card-tag">{{
          displayCategory
        }}</span>

        <!-- E-Bike Badge -->
        <span class="card-condition is-ebike">⚡ E-Bike</span>

        <!-- Angebot Badge -->
        <span *ngIf="bike.angebot && bike.angebot > 0" class="card-angebot"
          >ANGEBOT</span
        >

        <!-- Image Count -->
        <span *ngIf="bike.images && bike.images.length > 1" class="card-count">
          <svg
            width="10"
            height="10"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
          {{ bike.images.length }}
        </span>

        <!-- Hover overlay -->
        <div class="card-overlay">
          <span class="view-label">{{ t().viewDetails }}</span>
        </div>
      </figure>

      <div class="card-body">
        <h3 class="card-title">{{ bike.titel }}</h3>
        <p *ngIf="bike.marke" class="card-meta">
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"
            />
            <line x1="7" y1="7" x2="7.01" y2="7" />
          </svg>
          {{ bike.marke }}{{ bike.modell ? ' ' + bike.modell : '' }}
        </p>

        <!-- E-Bike spec chips -->
        <div
          class="card-specs"
          *ngIf="bike.motorMarke || bike.akkuKapazitaetWh || bike.reichweiteKm"
        >
          <span *ngIf="bike.motorMarke" class="spec-chip">{{
            bike.motorMarke
          }}</span>
          <span *ngIf="bike.akkuKapazitaetWh" class="spec-chip"
            >{{ bike.akkuKapazitaetWh }} Wh</span
          >
          <span *ngIf="bike.reichweiteKm" class="spec-chip"
            >{{ bike.reichweiteKm }} km</span
          >
        </div>

        <div class="card-footer">
          <span
            class="card-price"
            *ngIf="bike.preisText || bike.preis; else noPrice"
          >
            <ng-container
              *ngIf="bike.angebot && bike.angebot > 0; else normalPrice"
            >
              <span class="price-old"
                >{{ bike.preis | number: '1.0-0' }} €</span
              >
              <span class="price-new"
                >{{ bike.preis - bike.angebot | number: '1.0-0' }} €</span
              >
            </ng-container>
            <ng-template #normalPrice>
              {{ bike.preisText || (bike.preis | number: '1.0-0') + ' €' }}
            </ng-template>
          </span>
          <ng-template #noPrice>
            <span class="card-price subtle">{{ t().priceOnRequest }}</span>
          </ng-template>
          <span class="card-arrow">
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
          </span>
        </div>
        <div class="card-warranty">
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          {{ t().neueFahrraederWarranty }}
        </div>
      </div>
    </a>
  `,
  styles: [
    `
      .card {
        display: flex;
        flex-direction: column;
        position: relative;
        background:
          linear-gradient(180deg, rgba(255, 255, 255, 0.045), rgba(255, 255, 255, 0.015)),
          var(--color-surface);
        border: 1px solid rgba(255, 255, 255, 0.09);
        border-radius: 22px;
        overflow: hidden;
        text-decoration: none;
        color: var(--color-text);
        transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
        box-shadow: 0 16px 44px rgba(0, 0, 0, 0.18);
      }

      .card::before {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(135deg, rgba(255, 255, 255, 0.06), transparent 38%);
        pointer-events: none;
        opacity: 0.8;
      }

      .card:hover {
        border-color: rgba(255, 255, 255, 0.2);
        transform: translateY(-6px);
        box-shadow: 0 24px 54px rgba(0, 0, 0, 0.26);
      }

      .card-media {
        position: relative;
        aspect-ratio: 1.08;
        background: var(--color-bg-secondary);
        overflow: hidden;
        margin: 0;
      }

      .card-media::after {
        content: '';
        position: absolute;
        inset: auto 0 0 0;
        height: 55%;
        background: linear-gradient(180deg, transparent, rgba(4, 6, 12, 0.42));
        pointer-events: none;
      }

      .card-media img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .card:hover .card-media img {
        transform: scale(1.08);
      }

      .card-placeholder {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--color-text-muted);
      }

      .card-overlay {
        position: absolute;
        inset: 0;
        background: radial-gradient(circle at center, rgba(255, 87, 34, 0.14), rgba(0, 0, 0, 0.46));
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: opacity 0.3s;
      }

      .card:hover .card-overlay {
        opacity: 1;
      }

      .view-label {
        background: rgba(255, 255, 255, 0.92);
        color: #0a0a0a;
        font-size: 0.8rem;
        font-weight: 700;
        padding: 0.6rem 1.3rem;
        border-radius: 50px;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        transform: translateY(8px);
        transition: transform 0.3s;
      }

      .card:hover .view-label {
        transform: translateY(0);
      }

      .card-tag {
        position: absolute;
        top: 0.85rem;
        left: 0.85rem;
        background: rgba(6, 10, 15, 0.7);
        backdrop-filter: blur(12px);
        color: #fff;
        font-size: 0.64rem;
        font-weight: 700;
        padding: 0.34rem 0.7rem;
        border-radius: 999px;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        z-index: 1;
        border: 1px solid rgba(255, 255, 255, 0.12);
      }

      .card-condition {
        position: absolute;
        top: 0.85rem;
        right: 0.85rem;
        backdrop-filter: blur(12px);
        color: #fff;
        font-size: 0.65rem;
        font-weight: 700;
        padding: 0.3rem 0.62rem;
        border-radius: 999px;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        z-index: 1;
        border: 1px solid rgba(255, 255, 255, 0.12);
      }

      .card-condition.is-ebike {
        background: rgba(16, 185, 129, 0.9);
      }

      .card-count {
        position: absolute;
        bottom: 0.85rem;
        right: 0.85rem;
        background: rgba(6, 10, 15, 0.72);
        backdrop-filter: blur(12px);
        color: #fff;
        font-size: 0.72rem;
        font-weight: 600;
        padding: 0.28rem 0.58rem;
        border-radius: 999px;
        display: flex;
        align-items: center;
        gap: 0.3rem;
        z-index: 1;
        border: 1px solid rgba(255, 255, 255, 0.12);
      }

      .card-body {
        position: relative;
        padding: 1.15rem 1.2rem 1.2rem;
        flex: 1;
        display: flex;
        flex-direction: column;
      }

      .card-title {
        font-size: 1rem;
        font-weight: 700;
        margin: 0 0 0.4rem;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        line-height: 1.35;
        letter-spacing: -0.02em;
      }

      .card-meta {
        display: flex;
        align-items: center;
        gap: 0.35rem;
        font-size: 0.8rem;
        color: rgba(255, 255, 255, 0.56);
        margin: 0 0 0.6rem;
      }

      .card-meta svg {
        flex-shrink: 0;
        opacity: 0.7;
      }

      .card-specs {
        display: flex;
        flex-wrap: wrap;
        gap: 0.35rem;
        margin: 0 0 0.6rem;
      }

      .spec-chip {
        font-size: 0.68rem;
        font-weight: 600;
        padding: 0.22rem 0.55rem;
        border-radius: 999px;
        background: rgba(16, 185, 129, 0.1);
        border: 1px solid rgba(16, 185, 129, 0.22);
        color: var(--color-success);
        letter-spacing: 0.02em;
      }

      .card-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: auto;
        padding-top: 0.9rem;
        border-top: 1px solid rgba(255, 255, 255, 0.08);
      }

      .card-price {
        font-weight: 800;
        color: var(--color-accent);
        font-size: 1.1rem;
        letter-spacing: -0.03em;
      }

      .card-price.subtle {
        color: var(--color-text-muted);
        font-size: 0.82rem;
        font-weight: 500;
      }

      .price-old {
        text-decoration: line-through;
        color: var(--color-text-muted);
        font-weight: 500;
        font-size: 0.85rem;
        margin-right: 6px;
      }

      .price-new {
        color: #ef4444;
        font-weight: 800;
        font-size: 1.05rem;
      }

      .card-angebot {
        position: absolute;
        bottom: 0.85rem;
        left: 0.85rem;
        background: rgba(239, 68, 68, 0.92);
        backdrop-filter: blur(12px);
        color: #fff;
        font-size: 0.65rem;
        font-weight: 700;
        padding: 0.3rem 0.62rem;
        border-radius: 999px;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        z-index: 1;
        border: 1px solid rgba(255, 255, 255, 0.12);
      }

      .card-arrow {
        color: rgba(255, 255, 255, 0.44);
        transition: all 0.3s;
        display: flex;
      }

      .card:hover .card-arrow {
        color: var(--color-accent);
        transform: translateX(6px);
      }

      .card-warranty {
        display: flex;
        align-items: center;
        gap: 0.4rem;
        margin-top: 0.85rem;
        padding: 0.65rem 0.85rem;
        background: linear-gradient(
          135deg,
          rgba(34, 197, 94, 0.12),
          rgba(34, 197, 94, 0.04)
        );
        border: 1px solid rgba(34, 197, 94, 0.2);
        border-radius: 999px;
        font-size: 0.75rem;
        font-weight: 700;
        color: var(--color-success);
      }
    `,
  ],
})
export class EBikeCardComponent {
  @Input({ required: true }) bike!: EBike;

  private translationService = inject(TranslationService);
  t = this.translationService.translations;
  lang = this.translationService.currentLanguage;

  private static readonly HIDDEN_CAT = /kleinanzeigen|freiburg/i;

  get displayCategory(): string | null {
    const cat = this.bike.kategorie;
    if (!cat || EBikeCardComponent.HIDDEN_CAT.test(cat)) return null;
    return this.translateCategory(cat);
  }

  private translateCategory(category: string): string {
    const t = this.t();
    const map: Record<string, string> = {
      'Damen-Fahrräder': t.catDamen,
      'Herren-Fahrräder': t.catHerren,
      'Kinder-Fahrräder': t.catKinder,
      'E-Bikes': t.catEBike,
      'Trekkingräder': t.catTrekking,
      Mountainbikes: t.catMountain,
      'Cityräder': t.catCity,
      'Rennräder': t.catRennrad,
      'Sonstige Fahrräder': t.catSonstige,
    };
    return map[category] || category;
  }

  getImageUrl(path: string): string {
    return `${environment.apiUrl.replace('/api/public', '')}${path}`;
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
  }
}
