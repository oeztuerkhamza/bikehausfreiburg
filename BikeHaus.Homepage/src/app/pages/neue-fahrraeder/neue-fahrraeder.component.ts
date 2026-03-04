import {
  Component,
  inject,
  OnInit,
  OnDestroy,
  signal,
  computed,
} from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { TranslationService } from '../../services/translation.service';
import { ApiService } from '../../services/api.service';
import { NeueBikeCardComponent } from '../../components/neue-bike-card/neue-bike-card.component';
import { NeueFahrrad, NeueFahrradCategory } from '../../models/models';
import { environment } from '../../../environments/environment';

type SortOption = 'newest' | 'price-asc' | 'price-desc' | 'az';

@Component({
  selector: 'app-neue-fahrraeder',
  standalone: true,
  imports: [CommonModule, RouterModule, NeueBikeCardComponent, FormsModule],
  template: `
    <div class="showroom-page">
      <!-- Header -->
      <header class="page-header">
        <div class="container">
          <span class="section-label">{{ t().neueFahrraeder }}</span>
          <h1>{{ t().neueFahrraederTitle }}</h1>
          <p class="header-sub" *ngIf="!loading()">
            {{ filteredBikes().length }} {{ t().neueFahrraederSub }}
          </p>
        </div>
      </header>

      <div class="container shop-layout">
        <!-- ====== Sidebar (Desktop) ====== -->
        <aside class="sidebar" [class.open]="sidebarOpen()">
          <button class="sidebar-close" (click)="closeSidebar()">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>

          <!-- Search -->
          <div class="sidebar-search">
            <svg class="s-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              type="search"
              [placeholder]="t().searchPlaceholder"
              [value]="searchQuery()"
              (input)="onSearch($event)"
              class="s-input"
            />
          </div>

          <!-- ══════ KATEGORIE ══════ -->
          <div class="sidebar-section" *ngIf="categories().length > 0">
            <h3 class="filter-heading">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" />
              </svg>
              {{ t().filterCategory }}
            </h3>
            <div class="checkbox-group">
              <label
                class="checkbox-item"
                *ngFor="let cat of categories()"
                [class.active]="selectedCategory() === cat.name"
              >
                <input
                  type="checkbox"
                  [checked]="selectedCategory() === cat.name"
                  (change)="toggleCategory(cat.name)"
                />
                <span class="check-box"></span>
                <span>{{ translateCategory(cat.name) }}</span>
                <span class="filter-count">{{ cat.count }}</span>
              </label>
            </div>
          </div>

          <hr class="sidebar-divider" *ngIf="categories().length > 0" />

          <!-- ══════ PREIS ══════ -->
          <div class="sidebar-section">
            <h3 class="filter-heading">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
              </svg>
              {{ t().priceRange }}
            </h3>
            <div class="price-inputs">
              <div class="price-field">
                <span class="price-label">Min</span>
                <input type="number" placeholder="0" [value]="priceMin()" (input)="onPriceMin($event)" min="0" />
                <span class="price-unit">€</span>
              </div>
              <span class="price-separator">—</span>
              <div class="price-field">
                <span class="price-label">Max</span>
                <input type="number" placeholder="∞" [value]="priceMax()" (input)="onPriceMax($event)" min="0" />
                <span class="price-unit">€</span>
              </div>
            </div>
          </div>

          <!-- Clear Filters -->
          <button class="clear-btn" *ngIf="hasActiveFilters()" (click)="clearFilters()">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
            {{ t().clearFilters }}
          </button>
        </aside>

        <!-- Sidebar overlay (mobile) -->
        <div class="sidebar-overlay" *ngIf="sidebarOpen()" (click)="closeSidebar()"></div>

        <!-- ====== Main Content ====== -->
        <main class="main-content">
          <!-- Toolbar -->
          <div class="toolbar">
            <button class="filter-toggle" (click)="sidebarOpen.set(true)">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
              </svg>
              {{ t().filters }}
              <span class="active-badge" *ngIf="activeFilterCount() > 0">{{ activeFilterCount() }}</span>
            </button>

            <!-- Active filter pills -->
            <div class="active-filters">
              <span class="active-pill" *ngIf="selectedCategory()">
                {{ translateCategory(selectedCategory()!) }}
                <button class="pill-close" (click)="toggleCategory(selectedCategory()!)">×</button>
              </span>
              <span class="active-pill" *ngIf="priceMin() || priceMax()">
                {{ priceMin() || 0 }}€ - {{ priceMax() || '∞' }}€
                <button class="pill-close" (click)="clearPriceFilter()">×</button>
              </span>
            </div>

            <div class="toolbar-spacer"></div>

            <!-- Sort -->
            <div class="sort-wrap">
              <label class="sort-label">{{ t().sortBy }}:</label>
              <select class="sort-select" [value]="sortOption()" (change)="onSort($event)">
                <option value="newest">{{ t().sortNewest }}</option>
                <option value="price-asc">{{ t().sortPriceLow }}</option>
                <option value="price-desc">{{ t().sortPriceHigh }}</option>
                <option value="az">{{ t().sortAZ }}</option>
              </select>
            </div>

            <span class="result-count">{{ filteredBikes().length }} {{ t().bikesAvailable }}</span>
          </div>

          <!-- Mobile Search -->
          <div class="mobile-search">
            <svg class="s-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              type="search"
              [placeholder]="t().searchPlaceholder"
              [value]="searchQuery()"
              (input)="onSearch($event)"
              class="s-input"
            />
          </div>

          <!-- Skeleton Loading -->
          <div *ngIf="loading()" class="bike-grid">
            <div *ngFor="let i of skeletonCards" class="skeleton-card">
              <div class="sk-img"></div>
              <div class="sk-body">
                <div class="sk-line w60"></div>
                <div class="sk-line w40"></div>
                <div class="sk-line w30"></div>
              </div>
            </div>
          </div>

          <!-- Results -->
          <div *ngIf="!loading() && filteredBikes().length > 0" class="bike-grid">
            <app-neue-bike-card
              *ngFor="let bike of filteredBikes()"
              [bike]="bike"
            ></app-neue-bike-card>
          </div>

          <!-- Empty State -->
          <div *ngIf="!loading() && filteredBikes().length === 0" class="empty-state">
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <circle cx="5.5" cy="17.5" r="3.5" />
              <circle cx="18.5" cy="17.5" r="3.5" />
              <path d="M15 6l-4 8h6l-2 3.5" />
              <path d="M5.5 17.5L9 9h3" />
            </svg>
            <p>{{ t().neueFahrraederNoItems }}</p>
            <button class="clear-btn" *ngIf="hasActiveFilters()" (click)="clearFilters()">
              {{ t().clearFilters }}
            </button>
          </div>
        </main>
      </div>
    </div>
  `,
  styles: [
    `
      /* ═══ PAGE HEADER ═══ */
      .page-header {
        padding: 7.5rem 0 3rem;
        text-align: center;
        background: linear-gradient(
          180deg,
          rgba(255, 87, 34, 0.06) 0%,
          transparent 100%
        );
      }
      .section-label {
        display: inline-block;
        font-size: 0.72rem;
        font-weight: 700;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: var(--color-accent);
        margin-bottom: 0.75rem;
      }
      .page-header h1 {
        font-size: clamp(1.6rem, 4vw, 2.2rem);
        font-weight: 800;
        letter-spacing: -0.03em;
        margin: 0 0 0.5rem;
      }
      .header-sub {
        color: var(--color-text-secondary);
        font-size: 0.95rem;
      }

      /* ═══ LAYOUT ═══ */
      .container {
        max-width: 1280px;
        margin: 0 auto;
        padding: 0 1.5rem;
      }
      .shop-layout {
        display: grid;
        grid-template-columns: 260px 1fr;
        gap: 2rem;
        padding-top: 2rem;
        padding-bottom: 4rem;
      }

      /* ═══ SIDEBAR ═══ */
      .sidebar {
        position: sticky;
        top: 5rem;
        align-self: start;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }
      .sidebar-close {
        display: none;
        background: none;
        border: none;
        color: var(--color-text);
        cursor: pointer;
        align-self: flex-end;
        padding: 0.5rem;
      }
      .sidebar-search {
        position: relative;
      }
      .s-icon {
        position: absolute;
        left: 0.75rem;
        top: 50%;
        transform: translateY(-50%);
        color: var(--color-text-muted);
      }
      .s-input {
        width: 100%;
        background: var(--color-surface);
        border: 1px solid var(--color-border);
        border-radius: var(--border-radius);
        padding: 0.6rem 0.75rem 0.6rem 2.25rem;
        color: var(--color-text);
        font-size: 0.85rem;
        outline: none;
        transition: border-color 0.2s;
      }
      .s-input:focus {
        border-color: var(--color-accent);
      }

      .sidebar-section { padding: 0.25rem 0; }
      .filter-heading {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.78rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: var(--color-text-secondary);
        margin-bottom: 0.6rem;
      }
      .checkbox-group { display: flex; flex-direction: column; gap: 0.15rem; }
      .checkbox-item {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.45rem 0.65rem;
        border-radius: var(--border-radius);
        cursor: pointer;
        font-size: 0.85rem;
        color: var(--color-text-secondary);
        transition: all 0.2s;
      }
      .checkbox-item:hover { background: var(--color-surface); color: var(--color-text); }
      .checkbox-item.active { background: rgba(255, 87, 34, 0.08); color: var(--color-accent); }
      .checkbox-item input { display: none; }
      .check-box {
        width: 16px;
        height: 16px;
        border: 1.5px solid var(--color-border);
        border-radius: 4px;
        flex-shrink: 0;
        position: relative;
        transition: all 0.2s;
      }
      .checkbox-item.active .check-box {
        background: var(--color-accent);
        border-color: var(--color-accent);
      }
      .checkbox-item.active .check-box::after {
        content: '';
        position: absolute;
        top: 2px;
        left: 5px;
        width: 4px;
        height: 7px;
        border: solid #fff;
        border-width: 0 2px 2px 0;
        transform: rotate(45deg);
      }
      .filter-count {
        margin-left: auto;
        font-size: 0.72rem;
        color: var(--color-text-muted);
        background: var(--color-surface);
        padding: 0.1rem 0.4rem;
        border-radius: 8px;
        min-width: 1.4rem;
        text-align: center;
      }
      .sidebar-divider {
        border: none;
        border-top: 1px solid var(--color-border);
        margin: 0.25rem 0;
      }

      .price-inputs {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
      .price-field {
        flex: 1;
        display: flex;
        align-items: center;
        background: var(--color-surface);
        border: 1px solid var(--color-border);
        border-radius: var(--border-radius);
        padding: 0.4rem 0.5rem;
        gap: 0.25rem;
      }
      .price-label {
        font-size: 0.7rem;
        color: var(--color-text-muted);
        text-transform: uppercase;
        font-weight: 600;
      }
      .price-field input {
        background: none;
        border: none;
        outline: none;
        color: var(--color-text);
        font-size: 0.85rem;
        width: 100%;
        min-width: 0;
      }
      .price-unit {
        font-size: 0.85rem;
        color: var(--color-text-muted);
      }
      .price-separator {
        color: var(--color-text-muted);
        font-size: 0.85rem;
      }

      .clear-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.4rem;
        width: 100%;
        padding: 0.6rem;
        background: transparent;
        border: 1px solid var(--color-border);
        border-radius: var(--border-radius);
        color: var(--color-text-secondary);
        font-size: 0.82rem;
        cursor: pointer;
        transition: all 0.2s;
      }
      .clear-btn:hover {
        border-color: var(--color-accent);
        color: var(--color-accent);
      }

      /* ═══ TOOLBAR ═══ */
      .toolbar {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        margin-bottom: 1.5rem;
        flex-wrap: wrap;
      }
      .filter-toggle {
        display: none;
        align-items: center;
        gap: 0.4rem;
        background: var(--color-surface);
        border: 1px solid var(--color-border);
        border-radius: var(--border-radius);
        padding: 0.5rem 0.85rem;
        color: var(--color-text);
        font-size: 0.82rem;
        cursor: pointer;
      }
      .active-badge {
        background: var(--color-accent);
        color: #fff;
        font-size: 0.7rem;
        font-weight: 700;
        padding: 0.1rem 0.4rem;
        border-radius: 8px;
      }
      .active-filters { display: flex; gap: 0.4rem; flex-wrap: wrap; }
      .active-pill {
        display: flex;
        align-items: center;
        gap: 0.3rem;
        background: rgba(255, 87, 34, 0.1);
        color: var(--color-accent);
        padding: 0.3rem 0.6rem;
        border-radius: 50px;
        font-size: 0.78rem;
        font-weight: 500;
      }
      .pill-close {
        background: none;
        border: none;
        color: var(--color-accent);
        font-size: 1rem;
        cursor: pointer;
        padding: 0;
        line-height: 1;
      }
      .toolbar-spacer { flex: 1; }
      .sort-wrap {
        display: flex;
        align-items: center;
        gap: 0.4rem;
      }
      .sort-label {
        font-size: 0.78rem;
        color: var(--color-text-muted);
        white-space: nowrap;
      }
      .sort-select {
        background: var(--color-surface);
        border: 1px solid var(--color-border);
        border-radius: var(--border-radius);
        padding: 0.4rem 0.6rem;
        color: var(--color-text);
        font-size: 0.82rem;
        outline: none;
        cursor: pointer;
      }
      .result-count {
        font-size: 0.78rem;
        color: var(--color-text-muted);
        white-space: nowrap;
      }

      .mobile-search {
        display: none;
        position: relative;
        margin-bottom: 1rem;
      }

      /* ═══ GRID ═══ */
      .bike-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
        gap: 1.25rem;
      }

      /* ═══ SKELETON ═══ */
      .skeleton-card {
        background: var(--color-surface);
        border: 1px solid var(--color-border);
        border-radius: var(--border-radius-lg);
        overflow: hidden;
      }
      .sk-img {
        aspect-ratio: 4/3;
        background: linear-gradient(
          90deg,
          var(--color-bg-secondary) 25%,
          rgba(255, 255, 255, 0.04) 50%,
          var(--color-bg-secondary) 75%
        );
        background-size: 200% 100%;
        animation: shimmer 1.5s infinite;
      }
      .sk-body { padding: 1rem; display: flex; flex-direction: column; gap: 0.5rem; }
      .sk-line {
        height: 12px;
        border-radius: 6px;
        background: linear-gradient(
          90deg,
          var(--color-bg-secondary) 25%,
          rgba(255, 255, 255, 0.04) 50%,
          var(--color-bg-secondary) 75%
        );
        background-size: 200% 100%;
        animation: shimmer 1.5s infinite;
      }
      .w30 { width: 30%; }
      .w40 { width: 40%; }
      .w60 { width: 60%; }
      @keyframes shimmer {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }

      /* ═══ EMPTY STATE ═══ */
      .empty-state {
        text-align: center;
        padding: 4rem 2rem;
        color: var(--color-text-muted);
      }
      .empty-state svg { margin-bottom: 1rem; opacity: 0.4; }
      .empty-state p { font-size: 0.95rem; margin-bottom: 1rem; }
      .empty-state .clear-btn { width: auto; display: inline-flex; }

      /* ═══ MOBILE ═══ */
      @media (max-width: 900px) {
        .shop-layout {
          grid-template-columns: 1fr;
        }
        .sidebar {
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
          width: 300px;
          max-width: 85vw;
          background: var(--color-bg);
          z-index: 1001;
          padding: 1.5rem;
          transform: translateX(-100%);
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          overflow-y: auto;
        }
        .sidebar.open {
          transform: translateX(0);
        }
        .sidebar-close {
          display: block;
        }
        .sidebar-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 1000;
        }
        .filter-toggle {
          display: flex;
        }
        .mobile-search {
          display: block;
        }
      }

      @media (max-width: 600px) {
        .bike-grid {
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 0.75rem;
        }
        .sort-wrap { display: none; }
      }
    `,
  ],
})
export class NeueFahrraederComponent implements OnInit, OnDestroy {
  private apiService = inject(ApiService);
  private translationService = inject(TranslationService);
  private route = inject(ActivatedRoute);
  private title = inject(Title);
  private meta = inject(Meta);
  private document = inject(DOCUMENT);

  t = this.translationService.translations;
  lang = this.translationService.currentLanguage;

  bikes = signal<NeueFahrrad[]>([]);
  categories = signal<NeueFahrradCategory[]>([]);
  loading = signal(true);

  searchQuery = signal('');
  selectedCategory = signal<string | null>(null);
  priceMin = signal<number | null>(null);
  priceMax = signal<number | null>(null);
  sortOption = signal<SortOption>('newest');
  sidebarOpen = signal(false);

  skeletonCards = Array(6);

  filteredBikes = computed(() => {
    let items = this.bikes();
    const query = this.searchQuery().toLowerCase();
    const cat = this.selectedCategory();
    const pMin = this.priceMin();
    const pMax = this.priceMax();

    if (query) {
      items = items.filter(
        (b) =>
          b.titel.toLowerCase().includes(query) ||
          (b.beschreibung?.toLowerCase().includes(query)) ||
          (b.marke?.toLowerCase().includes(query)) ||
          (b.modell?.toLowerCase().includes(query)) ||
          (b.kategorie?.toLowerCase().includes(query)),
      );
    }

    if (cat) {
      items = items.filter((b) => b.kategorie === cat);
    }

    if (pMin != null) {
      items = items.filter((b) => b.preis >= pMin);
    }

    if (pMax != null) {
      items = items.filter((b) => b.preis <= pMax);
    }

    // Sort
    const sort = this.sortOption();
    switch (sort) {
      case 'newest':
        items = [...items].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
        break;
      case 'price-asc':
        items = [...items].sort((a, b) => (a.preis || 0) - (b.preis || 0));
        break;
      case 'price-desc':
        items = [...items].sort((a, b) => (b.preis || 0) - (a.preis || 0));
        break;
      case 'az':
        items = [...items].sort((a, b) => a.titel.localeCompare(b.titel));
        break;
    }

    return items;
  });

  hasActiveFilters = computed(
    () =>
      !!this.selectedCategory() ||
      !!this.searchQuery() ||
      this.priceMin() != null ||
      this.priceMax() != null,
  );

  activeFilterCount = computed(() => {
    let count = 0;
    if (this.selectedCategory()) count++;
    if (this.priceMin() != null || this.priceMax() != null) count++;
    return count;
  });

  ngOnInit(): void {
    this.loadData();
    this.setSeo();
  }

  ngOnDestroy(): void {}

  private loadData(): void {
    this.apiService.getNeueFahrraeder().subscribe({
      next: (data) => {
        this.bikes.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });

    this.apiService.getNeueFahrraederCategories().subscribe({
      next: (cats) => this.categories.set(cats),
    });
  }

  private setSeo(): void {
    const t = this.t();
    this.title.setTitle(t.neueFahrraederMetaTitle);
    this.meta.updateTag({
      name: 'description',
      content: t.neueFahrraederMetaDescription,
    });
  }

  onSearch(event: Event): void {
    this.searchQuery.set((event.target as HTMLInputElement).value);
  }

  toggleCategory(name: string): void {
    this.selectedCategory.set(
      this.selectedCategory() === name ? null : name,
    );
  }

  onPriceMin(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.priceMin.set(val ? parseInt(val, 10) : null);
  }

  onPriceMax(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.priceMax.set(val ? parseInt(val, 10) : null);
  }

  onSort(event: Event): void {
    this.sortOption.set((event.target as HTMLSelectElement).value as SortOption);
  }

  clearFilters(): void {
    this.selectedCategory.set(null);
    this.searchQuery.set('');
    this.priceMin.set(null);
    this.priceMax.set(null);
  }

  clearPriceFilter(): void {
    this.priceMin.set(null);
    this.priceMax.set(null);
  }

  closeSidebar(): void {
    this.sidebarOpen.set(false);
  }

  translateCategory(category: string): string {
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
}
