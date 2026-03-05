import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NeueFahrrad } from '../../models/models';
import { TranslationService } from '../../services/translation.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-neue-bike-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <a
      [routerLink]="['/' + lang(), 'neue-fahrraeder', bike.id]"
      class="card"
      role="article"
    >
      <figure class="card-media">
        <img
          *ngIf="bike.images.length"
          [src]="getImageUrl(bike.images[0].filePath)"
          [alt]="bike.titel + ' — Bike Haus Freiburg'"
          loading="lazy"
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

        <!-- Condition Badge -->
        <span class="card-condition is-new">{{ t().conditionNew }}</span>

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
        <div class="card-footer">
          <span
            class="card-price"
            *ngIf="bike.preisText || bike.preis; else noPrice"
          >
            {{ bike.preisText || (bike.preis | number: '1.0-0') + ' €' }}
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
        background: var(--color-surface);
        border: 1px solid var(--color-border);
        border-radius: var(--border-radius-lg);
        overflow: hidden;
        text-decoration: none;
        color: var(--color-text);
        transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .card:hover {
        border-color: var(--color-border-hover);
        transform: translateY(-4px);
        box-shadow: 0 16px 48px rgba(0, 0, 0, 0.35);
      }

      .card-media {
        position: relative;
        aspect-ratio: 4/3;
        background: var(--color-bg-secondary);
        overflow: hidden;
        margin: 0;
      }

      .card-media img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .card:hover .card-media img {
        transform: scale(1.05);
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
        background: rgba(0, 0, 0, 0.4);
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
        background: #fff;
        color: #0a0a0a;
        font-size: 0.8rem;
        font-weight: 700;
        padding: 0.5rem 1.25rem;
        border-radius: 50px;
        letter-spacing: 0.02em;
        transform: translateY(8px);
        transition: transform 0.3s;
      }

      .card:hover .view-label {
        transform: translateY(0);
      }

      .card-tag {
        position: absolute;
        top: 0.65rem;
        left: 0.65rem;
        background: rgba(255, 87, 34, 0.9);
        backdrop-filter: blur(8px);
        color: #fff;
        font-size: 0.68rem;
        font-weight: 700;
        padding: 0.25rem 0.6rem;
        border-radius: 6px;
        letter-spacing: 0.04em;
        text-transform: uppercase;
        z-index: 1;
      }

      .card-condition {
        position: absolute;
        top: 0.65rem;
        right: 0.65rem;
        background: rgba(76, 175, 80, 0.9);
        backdrop-filter: blur(8px);
        color: #fff;
        font-size: 0.65rem;
        font-weight: 700;
        padding: 0.2rem 0.55rem;
        border-radius: 6px;
        letter-spacing: 0.04em;
        text-transform: uppercase;
        z-index: 1;
      }

      .card-count {
        position: absolute;
        bottom: 0.65rem;
        right: 0.65rem;
        background: rgba(0, 0, 0, 0.7);
        backdrop-filter: blur(8px);
        color: #fff;
        font-size: 0.72rem;
        font-weight: 600;
        padding: 0.25rem 0.55rem;
        border-radius: 6px;
        display: flex;
        align-items: center;
        gap: 0.3rem;
        z-index: 1;
      }

      .card-body {
        padding: 1rem 1.15rem 1.15rem;
        flex: 1;
        display: flex;
        flex-direction: column;
      }

      .card-title {
        font-size: 0.92rem;
        font-weight: 600;
        margin: 0 0 0.3rem;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        line-height: 1.4;
        letter-spacing: -0.01em;
      }

      .card-meta {
        display: flex;
        align-items: center;
        gap: 0.35rem;
        font-size: 0.78rem;
        color: var(--color-text-muted);
        margin: 0 0 0.65rem;
      }

      .card-meta svg {
        flex-shrink: 0;
        opacity: 0.7;
      }

      .card-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: auto;
        padding-top: 0.75rem;
        border-top: 1px solid var(--color-border);
      }

      .card-price {
        font-weight: 800;
        color: var(--color-accent);
        font-size: 1.05rem;
        letter-spacing: -0.02em;
      }

      .card-price.subtle {
        color: var(--color-text-muted);
        font-size: 0.82rem;
        font-weight: 500;
      }

      .card-arrow {
        color: var(--color-text-muted);
        transition: all 0.3s;
        display: flex;
      }

      .card:hover .card-arrow {
        color: var(--color-accent);
        transform: translateX(4px);
      }

      .card-warranty {
        display: flex;
        align-items: center;
        gap: 0.4rem;
        margin-top: 0.65rem;
        padding: 0.45rem 0.7rem;
        background: linear-gradient(
          135deg,
          rgba(34, 197, 94, 0.12),
          rgba(34, 197, 94, 0.06)
        );
        border: 1px solid rgba(34, 197, 94, 0.25);
        border-radius: 6px;
        font-size: 0.75rem;
        font-weight: 700;
        color: var(--color-success);
      }
    `,
  ],
})
export class NeueBikeCardComponent {
  @Input({ required: true }) bike!: NeueFahrrad;

  private translationService = inject(TranslationService);
  t = this.translationService.translations;
  lang = this.translationService.currentLanguage;

  private static readonly HIDDEN_CAT = /kleinanzeigen|freiburg/i;

  get displayCategory(): string | null {
    const cat = this.bike.kategorie;
    if (!cat || NeueBikeCardComponent.HIDDEN_CAT.test(cat)) return null;
    return this.translateCategory(cat);
  }

  private translateCategory(category: string): string {
    const t = this.t();
    const map: Record<string, string> = {
      'Damen-Fahrr\u00e4der': t.catDamen,
      'Herren-Fahrr\u00e4der': t.catHerren,
      'Kinder-Fahrr\u00e4der': t.catKinder,
      'E-Bikes': t.catEBike,
      'Trekkingr\u00e4der': t.catTrekking,
      Mountainbikes: t.catMountain,
      'Cityr\u00e4der': t.catCity,
      'Rennr\u00e4der': t.catRennrad,
      'Sonstige Fahrr\u00e4der': t.catSonstige,
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
