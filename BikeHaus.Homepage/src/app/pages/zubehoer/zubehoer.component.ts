import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Meta, Title } from '@angular/platform-browser';
import { ApiService } from '../../services/api.service';
import { TranslationService } from '../../services/translation.service';
import { HomepageAccessory } from '../../models/models';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-zubehoer',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <section class="accessories-page">
      <!-- Hero -->
      <div class="hero">
        <div class="hero-content">
          <span class="breadcrumb">
            <a [routerLink]="['/', lang()]">{{ t().home }}</a> /
            {{ t().accessoriesTitle }}
          </span>
          <h1>{{ t().accessoriesTitle }}</h1>
          <p>{{ t().accessoriesSub }}</p>
        </div>
      </div>

      <!-- Toolbar -->
      <div class="container">
        <div class="toolbar">
          <div class="search-box">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              [placeholder]="t().searchPlaceholder"
              [ngModel]="searchQuery()"
              (ngModelChange)="searchQuery.set($event)"
            />
          </div>
          <div class="category-filter">
            <button
              class="cat-btn"
              [class.active]="selectedCategory() === ''"
              (click)="selectedCategory.set('')"
            >
              {{ t().accessoriesAllCategories }}
            </button>
            <button
              *ngFor="let cat of categories()"
              class="cat-btn"
              [class.active]="selectedCategory() === cat"
              (click)="selectedCategory.set(cat)"
            >
              {{ cat }}
            </button>
          </div>
        </div>

        <!-- Loading -->
        <div *ngIf="loading()" class="loading">
          <div class="skeleton-grid">
            <div class="skeleton-card" *ngFor="let s of [1, 2, 3, 4, 5, 6]">
              <div class="skeleton-image"></div>
              <div class="skeleton-body">
                <div class="skeleton-line w60"></div>
                <div class="skeleton-line w40"></div>
                <div class="skeleton-line w30"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div
          *ngIf="!loading() && filteredItems().length === 0"
          class="empty-state"
        >
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
          <p>{{ t().accessoriesNoItems }}</p>
        </div>

        <!-- Grid -->
        <div
          class="accessories-grid"
          *ngIf="!loading() && filteredItems().length > 0"
        >
          <div
            class="accessory-card"
            *ngFor="let item of filteredItems()"
            [routerLink]="['/', lang(), 'zubehoer', item.id]"
          >
            <div class="card-image">
              <img
                *ngIf="item.images.length > 0"
                [src]="getImageUrl(item.images[0].filePath)"
                [alt]="item.titel"
                loading="lazy"
                (error)="onImageError($event)"
              />
              <div *ngIf="item.images.length === 0" class="no-image">
                <svg
                  width="40"
                  height="40"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.5"
                >
                  <path
                    d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"
                  />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
              </div>
              <span class="category-tag" *ngIf="item.kategorie">{{
                item.kategorie
              }}</span>
              <span class="image-count" *ngIf="item.images.length > 1">
                {{ item.images.length }}
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path
                    d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"
                  />
                </svg>
              </span>
              <div class="hover-overlay">
                <span>{{ t().accessoriesViewDetails }}</span>
              </div>
            </div>
            <div class="card-body">
              <h3>{{ item.titel }}</h3>
              <p class="brand" *ngIf="item.marke">{{ item.marke }}</p>
              <div class="price">
                {{
                  item.preis > 0
                    ? (item.preis | number: '1.2-2') + ' €'
                    : t().accessoriesPriceOnRequest
                }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [
    `
      .accessories-page {
        min-height: 100vh;
        background: var(--color-bg);
      }

      /* ── Hero / Page Header ── */
      .hero {
        padding: 7rem 0 3rem;
        background: var(--color-bg);
        border-bottom: 1px solid var(--color-border);
        text-align: center;
      }

      .hero-content {
        max-width: var(--max-width, 1280px);
        margin: 0 auto;
        padding: 0 clamp(1rem, 4vw, 2rem);
      }

      .breadcrumb {
        font-size: 0.75rem;
        font-weight: 600;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: var(--color-text-secondary);
        margin-bottom: 0.75rem;
        display: block;
      }

      .breadcrumb a {
        color: var(--color-accent);
        text-decoration: none;
        transition: color 0.2s;
      }

      .breadcrumb a:hover {
        color: var(--color-accent-hover);
      }

      .hero h1 {
        font-size: clamp(1.75rem, 4vw, 2.5rem);
        font-weight: 800;
        color: var(--color-text);
        margin: 0 0 0.5rem;
        letter-spacing: -0.02em;
      }

      .hero p {
        font-size: 1rem;
        color: var(--color-text-secondary);
        margin: 0;
      }

      /* ── Container ── */
      .container {
        max-width: var(--max-width, 1280px);
        margin: 0 auto;
        padding: 2rem clamp(1rem, 4vw, 2rem) 4rem;
      }

      /* ── Toolbar ── */
      .toolbar {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        margin-bottom: 2rem;
      }

      .search-box {
        display: flex;
        align-items: center;
        gap: 0.625rem;
        background: var(--color-surface);
        border: 1px solid var(--color-border);
        border-radius: 10px;
        padding: 0.6rem 1rem;
        max-width: 400px;
        transition: border-color 0.2s;
      }

      .search-box:focus-within {
        border-color: var(--color-accent);
      }

      .search-box svg {
        color: var(--color-text-muted);
        flex-shrink: 0;
      }

      .search-box input {
        border: none;
        outline: none;
        background: transparent;
        font-size: 0.85rem;
        color: var(--color-text);
        width: 100%;
      }

      .search-box input::placeholder {
        color: var(--color-text-muted);
      }

      /* ── Category Filter ── */
      .category-filter {
        display: flex;
        gap: 0.5rem;
        flex-wrap: wrap;
      }

      .cat-btn {
        padding: 0.45rem 1rem;
        border: 1px solid var(--color-border);
        border-radius: 50px;
        background: var(--color-surface);
        font-size: 0.85rem;
        font-weight: 500;
        color: var(--color-text-secondary);
        cursor: pointer;
        transition: all 0.2s;
      }

      .cat-btn:hover {
        border-color: var(--color-accent);
        color: var(--color-accent);
      }

      .cat-btn.active {
        background: var(--color-accent);
        border-color: var(--color-accent);
        color: #fff;
      }

      /* ── Loading Skeleton ── */
      .loading {
        padding: 1.25rem 0;
      }

      .skeleton-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 1.25rem;
      }

      .skeleton-card {
        background: var(--color-surface);
        border-radius: 16px;
        overflow: hidden;
        border: 1px solid var(--color-border);
      }

      .skeleton-image {
        height: 220px;
        background: linear-gradient(
          90deg,
          var(--color-surface) 25%,
          var(--color-surface-hover) 50%,
          var(--color-surface) 75%
        );
        background-size: 200% 100%;
        animation: shimmer 1.5s infinite;
      }

      .skeleton-body {
        padding: 1rem;
      }

      .skeleton-line {
        height: 14px;
        background: var(--color-surface-hover);
        border-radius: 4px;
        margin-bottom: 0.625rem;
      }

      .w60 { width: 60%; }
      .w40 { width: 40%; }
      .w30 { width: 30%; }

      @keyframes shimmer {
        0% { background-position: -200% 0; }
        100% { background-position: 200% 0; }
      }

      /* ── Empty State ── */
      .empty-state {
        text-align: center;
        padding: 5rem 1.25rem;
        color: var(--color-text-muted);
      }

      .empty-state svg {
        margin-bottom: 1rem;
        opacity: 0.4;
      }

      .empty-state p {
        font-size: 1.05rem;
        color: var(--color-text-secondary);
      }

      /* ── Accessories Grid ── */
      .accessories-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 1.25rem;
      }

      .accessory-card {
        background: var(--color-surface);
        border-radius: 16px;
        overflow: hidden;
        border: 1px solid var(--color-border);
        cursor: pointer;
        transition: border-color 0.3s, transform 0.3s;
        text-decoration: none;
        color: inherit;
      }

      .accessory-card:hover {
        border-color: var(--color-accent);
        transform: translateY(-4px);
      }

      /* ── Card Image ── */
      .card-image {
        position: relative;
        height: 240px;
        background: var(--color-bg-secondary);
        overflow: hidden;
      }

      .card-image img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.4s ease;
      }

      .accessory-card:hover .card-image img {
        transform: scale(1.05);
      }

      .no-image {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
        color: var(--color-text-muted);
      }

      .category-tag {
        position: absolute;
        top: 12px;
        left: 12px;
        padding: 4px 12px;
        background: var(--color-accent);
        color: #fff;
        border-radius: 50px;
        font-size: 0.72rem;
        font-weight: 700;
        letter-spacing: 0.04em;
      }

      .image-count {
        position: absolute;
        bottom: 12px;
        right: 12px;
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 4px 8px;
        background: rgba(0, 0, 0, 0.6);
        color: #fff;
        border-radius: 6px;
        font-size: 0.75rem;
        font-weight: 600;
      }

      .hover-overlay {
        position: absolute;
        inset: 0;
        background: rgba(0, 0, 0, 0.45);
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: opacity 0.3s;
      }

      .accessory-card:hover .hover-overlay {
        opacity: 1;
      }

      .hover-overlay span {
        padding: 0.5rem 1.25rem;
        background: var(--color-accent);
        color: #fff;
        border-radius: 50px;
        font-weight: 600;
        font-size: 0.85rem;
      }

      /* ── Card Body ── */
      .card-body {
        padding: 1.125rem;
      }

      .card-body h3 {
        font-size: 1rem;
        font-weight: 700;
        color: var(--color-text);
        margin: 0 0 0.375rem;
        line-height: 1.3;
      }

      .brand {
        font-size: 0.82rem;
        color: var(--color-text-secondary);
        margin: 0 0 0.625rem;
      }

      .price {
        font-size: 1.15rem;
        font-weight: 800;
        color: var(--color-accent);
      }

      /* ── Responsive ── */
      @media (max-width: 768px) {
        .hero {
          padding: 6rem 0 2rem;
        }

        .container {
          padding: 1.5rem clamp(1rem, 4vw, 2rem) 3rem;
        }

        .accessories-grid {
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 1rem;
        }

        .card-image {
          height: 200px;
        }
      }

      @media (max-width: 480px) {
        .accessories-grid {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class ZubehoerComponent implements OnInit {
  private api = inject(ApiService);
  private translationService = inject(TranslationService);
  private titleService = inject(Title);
  private metaService = inject(Meta);

  t = this.translationService.translations;
  lang = this.translationService.currentLanguage;

  loading = signal(true);
  items = signal<HomepageAccessory[]>([]);
  searchQuery = signal('');
  selectedCategory = signal('');

  categories = computed(() => {
    const cats = this.items()
      .map((i) => i.kategorie)
      .filter(Boolean) as string[];
    return [...new Set(cats)].sort();
  });

  filteredItems = computed(() => {
    let result = this.items();
    const query = this.searchQuery().toLowerCase();
    const category = this.selectedCategory();

    if (query) {
      result = result.filter(
        (i) =>
          i.titel.toLowerCase().includes(query) ||
          i.marke?.toLowerCase().includes(query) ||
          i.beschreibung?.toLowerCase().includes(query),
      );
    }

    if (category) {
      result = result.filter((i) => i.kategorie === category);
    }

    return result;
  });

  ngOnInit() {
    const t = this.t();
    this.titleService.setTitle(t.accessoriesMetaTitle);
    this.metaService.updateTag({
      name: 'description',
      content: t.accessoriesMetaDescription,
    });

    this.api.getHomepageAccessories().subscribe({
      next: (items) => {
        this.items.set(items);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  getImageUrl(path: string): string {
    return `${environment.apiUrl.replace('/api/public', '')}${path}`;
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
  }
}
