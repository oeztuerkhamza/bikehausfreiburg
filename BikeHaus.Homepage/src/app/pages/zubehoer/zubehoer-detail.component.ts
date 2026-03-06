import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { TranslationService } from '../../services/translation.service';
import { HomepageAccessory } from '../../models/models';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-zubehoer-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="detail-page" *ngIf="item()">
      <div class="container">
        <div class="breadcrumb">
          <a [routerLink]="['/', lang()]">{{ t().home }}</a> /
          <a [routerLink]="['/', lang(), 'zubehoer']">{{
            t().accessoriesTitle
          }}</a>
          / {{ item()!.titel }}
        </div>

        <div class="detail-layout">
          <!-- Gallery -->
          <div class="gallery">
            <div class="main-image" *ngIf="item()!.images.length > 0">
              <img
                [src]="
                  getImageUrl(item()!.images[currentImageIndex()].filePath)
                "
                [alt]="item()!.titel"
                (error)="onImageError($event)"
              />
              <button
                class="nav-btn prev"
                *ngIf="item()!.images.length > 1"
                (click)="prevImage()"
              >
                ‹
              </button>
              <button
                class="nav-btn next"
                *ngIf="item()!.images.length > 1"
                (click)="nextImage()"
              >
                ›
              </button>
              <span class="image-counter" *ngIf="item()!.images.length > 1">
                {{ currentImageIndex() + 1 }} / {{ item()!.images.length }}
              </span>
            </div>
            <div class="no-image-large" *ngIf="item()!.images.length === 0">
              <svg
                width="64"
                height="64"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1"
              >
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
            </div>
            <div class="thumbnails" *ngIf="item()!.images.length > 1">
              <div
                class="thumb"
                *ngFor="let img of item()!.images; let i = index"
                [class.active]="i === currentImageIndex()"
                (click)="currentImageIndex.set(i)"
              >
                <img
                  [src]="getImageUrl(img.filePath)"
                  [alt]="item()!.titel"
                  loading="lazy"
                />
              </div>
            </div>
          </div>

          <!-- Info -->
          <div class="info">
            <span class="category-badge" *ngIf="item()!.kategorie">{{
              item()!.kategorie
            }}</span>
            <h1>{{ item()!.titel }}</h1>
            <p class="brand" *ngIf="item()!.marke">{{ item()!.marke }}</p>
            <div class="price-block">
              {{
                item()!.preis > 0
                  ? (item()!.preis | number: '1.2-2') + ' €'
                  : t().accessoriesPriceOnRequest
              }}
            </div>
            <div class="description" *ngIf="item()!.beschreibung">
              <p>{{ item()!.beschreibung }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <div *ngIf="loading()" class="loading-page">
      <div class="spinner"></div>
    </div>

    <div *ngIf="!loading() && !item()" class="not-found">
      <p>Nicht gefunden</p>
      <a [routerLink]="['/', lang(), 'zubehoer']" class="back-link">
        ← {{ t().accessoriesTitle }}
      </a>
    </div>
  `,
  styles: [
    `
      .detail-page {
        min-height: 100vh;
        background: var(--color-bg);
        padding-top: 90px;
      }

      .container {
        max-width: 1100px;
        margin: 0 auto;
        padding: 1.5rem clamp(1rem, 4vw, 2rem) 4rem;
      }

      .breadcrumb {
        font-size: 0.82rem;
        color: var(--color-text-secondary);
        margin-bottom: 1.5rem;
        letter-spacing: 0.02em;
      }

      .breadcrumb a {
        color: var(--color-accent);
        text-decoration: none;
        transition: color 0.2s;
      }

      .breadcrumb a:hover {
        color: var(--color-accent-hover);
      }

      .detail-layout {
        display: grid;
        grid-template-columns: 1.2fr 1fr;
        gap: 2.5rem;
        align-items: start;
      }

      .gallery {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }

      .main-image {
        position: relative;
        aspect-ratio: 4/3;
        border-radius: 16px;
        overflow: hidden;
        background: var(--color-surface);
        border: 1px solid var(--color-border);
      }

      .main-image img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .nav-btn {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: rgba(0, 0, 0, 0.6);
        border: 1px solid var(--color-border);
        cursor: pointer;
        font-size: 1.5rem;
        color: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
      }

      .nav-btn:hover {
        background: var(--color-accent);
        border-color: var(--color-accent);
        transform: translateY(-50%) scale(1.05);
      }

      .prev {
        left: 12px;
      }
      .next {
        right: 12px;
      }

      .image-counter {
        position: absolute;
        bottom: 12px;
        right: 12px;
        padding: 4px 10px;
        background: rgba(0, 0, 0, 0.6);
        color: #fff;
        border-radius: 6px;
        font-size: 0.8rem;
        font-weight: 600;
      }

      .no-image-large {
        aspect-ratio: 4/3;
        border-radius: 16px;
        background: var(--color-surface);
        border: 1px solid var(--color-border);
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--color-text-muted);
      }

      .thumbnails {
        display: flex;
        gap: 0.5rem;
        overflow-x: auto;
      }

      .thumb {
        width: 72px;
        height: 72px;
        border-radius: 10px;
        overflow: hidden;
        cursor: pointer;
        border: 2px solid var(--color-border);
        flex-shrink: 0;
        transition: border-color 0.2s;
      }

      .thumb.active {
        border-color: var(--color-accent);
      }

      .thumb:hover {
        border-color: var(--color-accent-hover);
      }

      .thumb img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .info {
        padding-top: 0.5rem;
      }

      .category-badge {
        display: inline-block;
        padding: 5px 14px;
        background: var(--color-accent-subtle);
        color: var(--color-accent);
        border-radius: 50px;
        font-size: 0.82rem;
        font-weight: 600;
        margin-bottom: 0.75rem;
      }

      .info h1 {
        font-size: 1.8rem;
        font-weight: 800;
        color: var(--color-text);
        margin: 0 0 0.5rem;
        line-height: 1.25;
        letter-spacing: -0.02em;
      }

      .brand {
        font-size: 1rem;
        color: var(--color-text-secondary);
        margin: 0 0 1rem;
      }

      .price-block {
        font-size: 1.6rem;
        font-weight: 800;
        color: var(--color-accent);
        margin-bottom: 1.5rem;
        padding: 1rem 0;
        border-top: 1px solid var(--color-border);
        border-bottom: 1px solid var(--color-border);
      }

      .description {
        margin-top: 1.25rem;
      }

      .description p {
        font-size: 0.95rem;
        color: var(--color-text-secondary);
        line-height: 1.7;
        white-space: pre-wrap;
      }

      .loading-page {
        display: flex;
        justify-content: center;
        padding: 7.5rem 0;
      }

      .spinner {
        width: 40px;
        height: 40px;
        border: 3px solid var(--color-border);
        border-top-color: var(--color-accent);
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
      }

      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }

      .not-found {
        text-align: center;
        padding: 7.5rem 1.25rem;
        color: var(--color-text-secondary);
      }

      .back-link {
        color: var(--color-accent);
        text-decoration: none;
        font-weight: 600;
        transition: color 0.2s;
      }

      .back-link:hover {
        color: var(--color-accent-hover);
      }

      @media (max-width: 768px) {
        .detail-layout {
          grid-template-columns: 1fr;
          gap: 1.5rem;
        }

        .info h1 {
          font-size: 1.4rem;
        }

        .price-block {
          font-size: 1.3rem;
        }
      }
    `,
  ],
})
export class ZubehoerDetailComponent implements OnInit {
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);
  private translationService = inject(TranslationService);

  t = this.translationService.translations;
  lang = this.translationService.currentLanguage;

  loading = signal(true);
  item = signal<HomepageAccessory | null>(null);
  currentImageIndex = signal(0);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.api.getHomepageAccessoryById(+id).subscribe({
        next: (item) => {
          this.item.set(item);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
        },
      });
    }
  }

  getImageUrl(path: string): string {
    return `${environment.apiUrl.replace('/api/public', '')}${path}`;
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
  }

  prevImage() {
    const item = this.item();
    if (!item) return;
    const idx = this.currentImageIndex();
    this.currentImageIndex.set(idx === 0 ? item.images.length - 1 : idx - 1);
  }

  nextImage() {
    const item = this.item();
    if (!item) return;
    const idx = this.currentImageIndex();
    this.currentImageIndex.set(idx === item.images.length - 1 ? 0 : idx + 1);
  }
}
