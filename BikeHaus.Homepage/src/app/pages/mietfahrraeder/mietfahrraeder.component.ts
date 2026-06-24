import {
  Component,
  computed,
  inject,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { ApiService } from '../../services/api.service';
import { TranslationService } from '../../services/translation.service';
import { PublicRentalBicycle } from '../../models/models';
import { AvailabilityCalendarComponent } from '../../components/availability-calendar/availability-calendar.component';
import { environment } from '../../../environments/environment';

type SortOption = 'price-asc' | 'price-desc' | 'az' | 'newest';

@Component({
  selector: 'app-mietfahrraeder',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, AvailabilityCalendarComponent],
  template: `
    <div class="catalog-page">
      <header class="page-header">
        <div class="container">
          <span class="section-label">{{ t().rentalCatalogLabel }}</span>
          <h1>{{ t().rentalCatalogTitle }}</h1>
          <p class="header-sub" *ngIf="!loading()">
            {{ filteredBikes().length }} {{ t().rentalCatalogSub }}
          </p>
          <p class="header-intro">{{ t().rentalCatalogIntro }}</p>
        </div>
      </header>

      <div class="container shop-layout">
        <!-- Sidebar Filters -->
        <aside class="sidebar" [class.open]="sidebarOpen()">
          <button class="sidebar-close" (click)="sidebarOpen.set(false)" aria-label="Close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>

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
              [attr.aria-label]="t().searchPlaceholder"
            />
          </div>

          <!-- Brand -->
          <div class="sidebar-section" *ngIf="availableBrands().length > 0">
            <h3 class="filter-heading">{{ t().rentalCatalogFilterBrand }}</h3>
            <div class="checkbox-group">
              <label
                class="checkbox-item"
                *ngFor="let b of availableBrands()"
                [class.active]="selectedBrands().includes(b.value)"
              >
                <input
                  type="checkbox"
                  [checked]="selectedBrands().includes(b.value)"
                  (change)="toggleBrand(b.value)"
                />
                <span class="check-box"></span>
                <span>{{ b.value }}</span>
                <span class="filter-count">{{ b.count }}</span>
              </label>
            </div>
          </div>

          <hr class="sidebar-divider" *ngIf="availableBrands().length > 0" />

          <!-- Bike Type -->
          <div class="sidebar-section" *ngIf="availableTypes().length > 0">
            <h3 class="filter-heading">{{ t().rentalCatalogFilterType }}</h3>
            <div class="checkbox-group">
              <label
                class="checkbox-item"
                *ngFor="let ty of availableTypes()"
                [class.active]="selectedTypes().includes(ty.value)"
              >
                <input
                  type="checkbox"
                  [checked]="selectedTypes().includes(ty.value)"
                  (change)="toggleType(ty.value)"
                />
                <span class="check-box"></span>
                <span>{{ ty.value }}</span>
                <span class="filter-count">{{ ty.count }}</span>
              </label>
            </div>
          </div>

          <hr class="sidebar-divider" *ngIf="availableTypes().length > 0" />

          <!-- Tire size -->
          <div class="sidebar-section" *ngIf="availableTireSizes().length > 0">
            <h3 class="filter-heading">{{ t().filterTireSize }}</h3>
            <div class="checkbox-group">
              <label
                class="checkbox-item"
                *ngFor="let s of availableTireSizes()"
                [class.active]="selectedTireSizes().includes(s.value)"
              >
                <input
                  type="checkbox"
                  [checked]="selectedTireSizes().includes(s.value)"
                  (change)="toggleTireSize(s.value)"
                />
                <span class="check-box"></span>
                <span>{{ s.value }}</span>
                <span class="filter-count">{{ s.count }}</span>
              </label>
            </div>
          </div>

          <hr class="sidebar-divider" *ngIf="availableTireSizes().length > 0" />

          <!-- Frame size -->
          <div class="sidebar-section" *ngIf="availableFrameSizes().length > 0">
            <h3 class="filter-heading">{{ t().filterFrameSize }}</h3>
            <div class="checkbox-group">
              <label
                class="checkbox-item"
                *ngFor="let s of availableFrameSizes()"
                [class.active]="selectedFrameSizes().includes(s.value)"
              >
                <input
                  type="checkbox"
                  [checked]="selectedFrameSizes().includes(s.value)"
                  (change)="toggleFrameSize(s.value)"
                />
                <span class="check-box"></span>
                <span>{{ s.value }}</span>
                <span class="filter-count">{{ s.count }}</span>
              </label>
            </div>
          </div>

          <hr class="sidebar-divider" *ngIf="availableFrameSizes().length > 0" />

          <!-- Max daily price -->
          <div class="sidebar-section">
            <h3 class="filter-heading">{{ t().rentalCatalogPriceMaxDaily }}</h3>
            <input
              type="number"
              class="price-input"
              [value]="maxDailyPrice() ?? ''"
              (input)="onMaxPrice($event)"
              min="0"
              placeholder="∞"
            />
          </div>

          <button
            class="clear-btn"
            *ngIf="hasActiveFilters()"
            (click)="clearFilters()"
            type="button"
          >
            {{ t().clearFilters }}
          </button>
        </aside>

        <div class="sidebar-overlay" *ngIf="sidebarOpen()" (click)="sidebarOpen.set(false)"></div>

        <main class="main-content">
          <div class="toolbar">
            <button
              class="filter-toggle"
              (click)="sidebarOpen.set(true)"
              type="button"
              [attr.aria-label]="t().filters"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
              </svg>
              {{ t().filters }}
              <span class="active-badge" *ngIf="activeFilterCount() > 0">{{ activeFilterCount() }}</span>
            </button>
            <div class="toolbar-spacer"></div>
            <button
              class="filter-toggle"
              type="button"
              (click)="dateFilterOpen.set(!dateFilterOpen())"
            >
              📅 {{ dateBtnLabel() }}
              <span class="active-badge" *ngIf="filterStart && filterEnd">✓</span>
            </button>
            <div class="sort-wrap">
              <label class="sort-label" for="rental-sort">{{ t().sortBy }}:</label>
              <select
                id="rental-sort"
                class="sort-select"
                [value]="sortOption()"
                (change)="onSort($event)"
              >
                <option value="price-asc">{{ t().sortPriceLow }}</option>
                <option value="price-desc">{{ t().sortPriceHigh }}</option>
                <option value="az">{{ t().sortAZ }}</option>
              </select>
            </div>
            <span class="result-count">
              {{ filteredBikes().length }} {{ t().rentalCatalogSub }}
            </span>
          </div>

          <!-- Date-range availability filter panel -->
          <div
            class="date-panel"
            *ngIf="dateFilterOpen()"
            style="
              max-width: 380px;
              margin: 0 0 1.25rem auto;
              background: rgba(255, 255, 255, 0.02);
              border: 1px solid rgba(255, 255, 255, 0.08);
              border-radius: 16px;
              padding: 0.85rem;
            "
          >
            <app-availability-calendar
              [start]="filterStart"
              [end]="filterEnd"
              (rangeChange)="onFilterRange($event)"
            ></app-availability-calendar>
            <div
              style="
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 0.5rem;
                margin-top: 0.6rem;
              "
            >
              <span
                style="font-size: 0.8rem; color: rgba(255, 255, 255, 0.6)"
                *ngIf="availLoading()"
                >…</span
              >
              <span
                style="font-size: 0.8rem; color: rgba(255, 255, 255, 0.6)"
                *ngIf="!availLoading() && availableIds() !== null"
                >{{ filteredBikes().length }} {{ t().rentalCatalogSub }}</span
              >
              <button
                type="button"
                *ngIf="filterStart || filterEnd"
                (click)="clearDateFilter()"
                style="
                  background: none;
                  border: 1px solid rgba(255, 255, 255, 0.18);
                  color: inherit;
                  border-radius: 10px;
                  padding: 0.4rem 0.8rem;
                  cursor: pointer;
                  font-size: 0.82rem;
                "
              >
                {{ clearDatesLabel() }}
              </button>
            </div>
          </div>

          <!-- Skeleton -->
          <div *ngIf="loading()" class="bike-grid">
            <div *ngFor="let i of skeletonCards" class="skeleton-card">
              <div class="sk-img"></div>
              <div class="sk-body">
                <div class="sk-line l"></div>
                <div class="sk-line s"></div>
              </div>
            </div>
          </div>

          <!-- Grid -->
          <div *ngIf="!loading()" class="bike-grid" [class.has-results]="filteredBikes().length > 0">
            <a
              *ngFor="let bike of filteredBikes(); let i = index"
              [routerLink]="['/' + lang(), detailSlug(), bike.id]"
              [queryParams]="dateQueryParams()"
              class="bike-card"
            >
              <div class="card-img-wrap">
                <img
                  *ngIf="bike.images.length > 0"
                  [src]="getImageUrl(bike.images[0].filePath)"
                  [alt]="bikeAlt(bike)"
                  [loading]="i < 4 ? 'eager' : 'lazy'"
                  [attr.fetchpriority]="i === 0 ? 'high' : null"
                  width="400"
                  height="300"
                />
                <div *ngIf="bike.images.length === 0" class="no-img">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                </div>
                <span *ngIf="bike.fahrradtyp" class="type-badge">{{ bike.fahrradtyp }}</span>
              </div>
              <div class="card-body">
                <h2 class="card-title">{{ bike.marke }} {{ bike.modell }}</h2>
                <div class="card-specs">
                  <div *ngIf="bike.rahmengroesse" class="spec-row">
                    <span class="spec-label">Rahmengröße (Size)</span>
                    <span class="spec-value">{{ bike.rahmengroesse }}</span>
                  </div>
                  <div *ngIf="bike.reifengroesse" class="spec-row">
                    <span class="spec-label">Reifengröße (Zoll)</span>
                    <span class="spec-value">{{ bike.reifengroesse }}"</span>
                  </div>
                </div>
                <div class="card-price">
                  <span class="price-from">{{ t().rentalCatalogFrom }}</span>
                  <span class="price-value">{{ minDailyPrice(bike) }}€</span>
                  <span class="price-per">{{ t().rentalCatalogPerDay }}</span>
                </div>
                <span class="card-cta">{{ t().rentalCatalogViewDetail }} →</span>
              </div>
            </a>
          </div>

          <!-- Empty -->
          <div *ngIf="!loading() && filteredBikes().length === 0" class="no-results">
            <h3>{{ t().rentalCatalogNoBikes }}</h3>
            <button
              type="button"
              class="btn-secondary reset-btn"
              *ngIf="hasActiveFilters()"
              (click)="clearFilters()"
            >
              {{ t().clearFilters }}
            </button>
          </div>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .catalog-page {
      min-height: 60vh;
      background:
        radial-gradient(circle at top, rgba(255, 87, 34, 0.08), transparent 32%),
        var(--color-bg);
    }

    .page-header {
      position: relative;
      padding: 7.5rem 0 3rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }
    .page-header .container { max-width: 920px; }
    .section-label {
      display: block;
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: var(--color-accent);
      margin-bottom: 1rem;
    }
    .page-header h1 {
      font-size: clamp(2.3rem, 5vw, 4.25rem);
      font-weight: 800;
      color: var(--color-text);
      margin: 0 0 0.9rem;
      letter-spacing: -0.04em;
      line-height: 1;
      max-width: 14ch;
    }
    .header-sub {
      display: inline-flex;
      align-items: center;
      gap: 0.55rem;
      padding: 0.6rem 1rem;
      font-size: 0.9rem;
      color: rgba(255, 255, 255, 0.74);
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 999px;
      margin-bottom: 1.25rem;
    }
    .header-intro {
      color: var(--color-text-muted);
      max-width: 70ch;
      line-height: 1.6;
      font-size: 0.98rem;
      margin: 0;
    }

    .shop-layout {
      display: grid;
      grid-template-columns: 280px minmax(0, 1fr);
      gap: 1.5rem;
      padding-top: 2.25rem;
      padding-bottom: 4rem;
      align-items: start;
    }

    .sidebar {
      position: sticky;
      top: 5rem;
      padding: 1.35rem;
      background:
        linear-gradient(180deg, rgba(255, 255, 255, 0.045), rgba(255, 255, 255, 0.015)),
        var(--color-surface);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 24px;
      max-height: calc(100vh - 6rem);
      overflow-y: auto;
    }
    .sidebar-close { display: none; }

    .sidebar-search { position: relative; margin-bottom: 1.25rem; }
    .s-icon {
      position: absolute; left: 0.75rem; top: 50%;
      transform: translateY(-50%); color: var(--color-text-muted);
      pointer-events: none;
    }
    .s-input {
      width: 100%;
      padding: 0.8rem 0.9rem 0.8rem 2.35rem;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 14px;
      background: rgba(9, 11, 15, 0.72);
      color: var(--color-text);
      font-size: 0.85rem;
      outline: none;
    }
    .s-input:focus { border-color: var(--color-accent); }

    .sidebar-divider {
      border: none;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      margin: 1rem 0;
    }
    .sidebar-section { margin-bottom: 0.5rem; }
    .filter-heading {
      font-size: 0.72rem;
      font-weight: 700;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: var(--color-text-muted);
      margin: 0 0 0.85rem;
    }

    .checkbox-group { display: flex; flex-direction: column; gap: 0.4rem; }
    .checkbox-item {
      position: relative;
      display: flex; align-items: center; gap: 0.55rem;
      padding: 0.4rem 0.5rem;
      border-radius: 10px;
      cursor: pointer;
      font-size: 0.88rem;
      color: var(--color-text);
      transition: background 0.15s;
    }
    .checkbox-item:hover { background: rgba(255, 255, 255, 0.03); }
    .checkbox-item.active { background: rgba(255, 87, 34, 0.1); color: var(--color-accent); }
    .checkbox-item input { display: none; }
    .check-box {
      width: 16px; height: 16px;
      border: 1.5px solid rgba(255, 255, 255, 0.2);
      border-radius: 4px;
      flex-shrink: 0;
      position: relative;
    }
    .checkbox-item.active .check-box {
      background: var(--color-accent);
      border-color: var(--color-accent);
    }
    .checkbox-item.active .check-box::after {
      content: '';
      position: absolute; top: 1px; left: 4px;
      width: 4px; height: 8px;
      border: solid #fff;
      border-width: 0 2px 2px 0;
      transform: rotate(45deg);
    }
    .filter-count {
      margin-left: auto;
      font-size: 0.72rem;
      color: var(--color-text-muted);
    }

    .price-input {
      width: 100%;
      padding: 0.65rem 0.8rem;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 10px;
      background: rgba(9, 11, 15, 0.72);
      color: var(--color-text);
      font-size: 0.9rem;
    }
    .price-input:focus { outline: none; border-color: var(--color-accent); }

    .clear-btn {
      margin-top: 1rem;
      width: 100%;
      padding: 0.65rem 1rem;
      background: transparent;
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 12px;
      color: var(--color-text);
      font-size: 0.85rem;
      cursor: pointer;
      transition: all 0.15s;
    }
    .clear-btn:hover { border-color: var(--color-accent); color: var(--color-accent); }

    .toolbar {
      display: flex; align-items: center; gap: 0.85rem;
      flex-wrap: wrap;
      margin-bottom: 1.5rem;
    }
    .filter-toggle {
      display: none;
      align-items: center; gap: 0.4rem;
      padding: 0.55rem 0.95rem;
      background: var(--color-surface);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 999px;
      color: var(--color-text);
      cursor: pointer;
      font-size: 0.85rem;
    }
    .active-badge {
      background: var(--color-accent);
      color: #fff;
      padding: 0.1rem 0.5rem;
      border-radius: 999px;
      font-size: 0.72rem;
      font-weight: 700;
    }
    .toolbar-spacer { flex: 1; }
    .sort-wrap { display: flex; align-items: center; gap: 0.55rem; }
    .sort-label { color: var(--color-text-muted); font-size: 0.85rem; }
    .sort-select {
      padding: 0.5rem 0.9rem;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 10px;
      background: var(--color-surface);
      color: var(--color-text);
      font-size: 0.85rem;
      cursor: pointer;
    }
    .result-count {
      color: var(--color-text-muted);
      font-size: 0.85rem;
    }

    .bike-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1.5rem;
    }
    .bike-card {
      display: block;
      background: var(--color-surface);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 18px;
      overflow: hidden;
      text-decoration: none;
      color: inherit;
      transition: transform 0.2s, border-color 0.2s, box-shadow 0.2s;
    }
    .bike-card:hover {
      transform: translateY(-3px);
      border-color: rgba(255, 87, 34, 0.4);
      box-shadow: 0 14px 36px rgba(0, 0, 0, 0.25);
    }
    .card-img-wrap {
      position: relative;
      aspect-ratio: 4/3;
      background: rgba(255, 255, 255, 0.02);
      overflow: hidden;
    }
    .card-img-wrap img {
      width: 100%; height: 100%;
      object-fit: cover;
      display: block;
    }
    .no-img {
      width: 100%; height: 100%;
      display: flex; align-items: center; justify-content: center;
      color: var(--color-text-muted);
    }
    .type-badge {
      position: absolute;
      top: 0.8rem; left: 0.8rem;
      background: rgba(9, 11, 15, 0.78);
      backdrop-filter: blur(8px);
      padding: 0.3rem 0.7rem;
      border-radius: 999px;
      font-size: 0.72rem;
      letter-spacing: 0.04em;
      color: #fff;
    }
    .card-body { padding: 1rem 1.1rem 1.2rem; }
    .card-title {
      font-size: 1.05rem;
      font-weight: 700;
      margin: 0 0 0.35rem;
      color: var(--color-text);
      line-height: 1.25;
    }
    .card-specs {
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
      margin-bottom: 0.6rem;
    }
    .spec-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.8rem;
      padding: 0.15rem 0;
      border-bottom: 1px solid var(--color-border, rgba(0,0,0,0.06));
    }
    .spec-label {
      color: var(--color-text-muted);
    }
    .spec-value {
      font-weight: 600;
      color: var(--color-text);
    }
    .card-price {
      display: flex; align-items: baseline; gap: 0.3rem;
      margin-bottom: 0.5rem;
    }
    .price-from {
      font-size: 0.72rem;
      color: var(--color-text-muted);
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }
    .price-value {
      font-size: 1.25rem;
      font-weight: 800;
      color: var(--color-accent);
    }
    .price-per {
      font-size: 0.78rem;
      color: var(--color-text-muted);
    }
    .card-cta {
      display: inline-block;
      font-size: 0.82rem;
      font-weight: 600;
      color: var(--color-accent);
    }

    .skeleton-card {
      background: var(--color-surface);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 18px;
      overflow: hidden;
    }
    .sk-img { aspect-ratio: 4/3; background: rgba(255, 255, 255, 0.05); }
    .sk-body { padding: 1rem; }
    .sk-line {
      height: 12px;
      background: rgba(255, 255, 255, 0.07);
      border-radius: 999px;
      margin-bottom: 0.5rem;
    }
    .sk-line.l { width: 70%; }
    .sk-line.s { width: 40%; }

    .no-results {
      grid-column: 1 / -1;
      padding: 4rem 1rem;
      text-align: center;
      color: var(--color-text-muted);
    }
    .reset-btn {
      margin-top: 1rem;
      padding: 0.7rem 1.4rem;
      background: var(--color-accent);
      color: #fff;
      border: none;
      border-radius: 999px;
      cursor: pointer;
      font-weight: 600;
    }

    .sidebar-overlay { display: none; }

    @media (max-width: 880px) {
      .shop-layout {
        grid-template-columns: 1fr;
        padding-top: 1.5rem;
      }
      .sidebar {
        position: fixed;
        top: 0; left: 0;
        width: min(320px, 88vw);
        height: 100vh;
        max-height: 100vh;
        border-radius: 0;
        z-index: 1000;
        transform: translateX(-100%);
        transition: transform 0.25s;
      }
      .sidebar.open { transform: translateX(0); }
      .sidebar-close {
        display: inline-flex;
        position: absolute;
        top: 1rem; right: 1rem;
        background: transparent;
        border: none;
        color: var(--color-text);
        cursor: pointer;
        padding: 0.4rem;
      }
      .sidebar-overlay {
        display: block;
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.6);
        z-index: 999;
      }
      .filter-toggle { display: inline-flex; }
      .page-header { padding: 5rem 0 2rem; }
      .bike-grid { grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 1rem; }
    }
  `],
})
export class MietfahrraederComponent implements OnInit, OnDestroy {
  private apiService = inject(ApiService);
  private translationService = inject(TranslationService);
  private titleService = inject(Title);
  private metaService = inject(Meta);
  private document = inject(DOCUMENT);

  t = this.translationService.translations;
  lang = this.translationService.currentLanguage;

  bikes = signal<PublicRentalBicycle[]>([]);
  loading = signal(true);
  sidebarOpen = signal(false);
  skeletonCards = Array(6).fill(0);

  searchQuery = signal<string>('');
  sortOption = signal<SortOption>('price-asc');
  selectedBrands = signal<string[]>([]);
  selectedTypes = signal<string[]>([]);
  selectedTireSizes = signal<string[]>([]);
  selectedFrameSizes = signal<string[]>([]);
  maxDailyPrice = signal<number | null>(null);

  // ── Date-range availability filter (toolbar) ──
  dateFilterOpen = signal(false);
  filterStart = '';
  filterEnd = '';
  availableIds = signal<Set<number> | null>(null); // null = no date filter active
  availLoading = signal(false);

  private itemListSchemaElement: HTMLScriptElement | null = null;

  availableBrands = computed(() => this.countBy(this.bikes(), (b) => b.marke));
  availableTypes = computed(() =>
    this.countBy(this.bikes(), (b) => b.fahrradtyp || b.art || ''),
  );
  availableTireSizes = computed(() =>
    this.countBy(this.bikes(), (b) => b.reifengroesse || ''),
  );
  availableFrameSizes = computed(() =>
    this.countBy(this.bikes(), (b) => b.rahmengroesse || ''),
  );

  filteredBikes = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const brands = this.selectedBrands();
    const types = this.selectedTypes();
    const tires = this.selectedTireSizes();
    const frames = this.selectedFrameSizes();
    const maxPrice = this.maxDailyPrice();
    const avail = this.availableIds();

    let result = this.bikes().filter((b) => {
      if (avail !== null && !avail.has(b.id)) return false;
      if (query) {
        const hay = `${b.marke} ${b.modell} ${b.beschreibung || ''} ${b.fahrradtyp || ''} ${b.art || ''}`.toLowerCase();
        if (!hay.includes(query)) return false;
      }
      if (brands.length > 0 && !brands.includes(b.marke)) return false;
      if (
        types.length > 0 &&
        !types.includes(b.fahrradtyp || b.art || '')
      )
        return false;
      if (tires.length > 0 && !tires.includes(b.reifengroesse || ''))
        return false;
      if (frames.length > 0 && !frames.includes(b.rahmengroesse || ''))
        return false;
      if (maxPrice !== null) {
        const min = this.minDailyPriceValue(b);
        if (min === null || min > maxPrice) return false;
      }
      return true;
    });

    const sort = this.sortOption();
    result = [...result].sort((a, b) => {
      switch (sort) {
        case 'price-asc':
          return (this.minDailyPriceValue(a) ?? Infinity) - (this.minDailyPriceValue(b) ?? Infinity);
        case 'price-desc':
          return (this.minDailyPriceValue(b) ?? 0) - (this.minDailyPriceValue(a) ?? 0);
        case 'az':
          return `${a.marke} ${a.modell}`.localeCompare(`${b.marke} ${b.modell}`);
        default:
          return 0;
      }
    });
    return result;
  });

  hasActiveFilters = computed(
    () =>
      !!this.searchQuery() ||
      this.selectedBrands().length > 0 ||
      this.selectedTypes().length > 0 ||
      this.selectedTireSizes().length > 0 ||
      this.selectedFrameSizes().length > 0 ||
      this.maxDailyPrice() !== null,
  );

  activeFilterCount = computed(() => {
    let c = 0;
    if (this.searchQuery()) c++;
    c += this.selectedBrands().length;
    c += this.selectedTypes().length;
    c += this.selectedTireSizes().length;
    c += this.selectedFrameSizes().length;
    if (this.maxDailyPrice() !== null) c++;
    return c;
  });

  detailSlug = computed(() => {
    const l = this.lang();
    if (l === 'en') return 'rental-bikes';
    if (l === 'fr') return 'velos-de-location';
    return 'mietfahrraeder';
  });

  ngOnInit(): void {
    this.titleService.setTitle(this.t().rentalCatalogMetaTitle);
    this.metaService.updateTag({
      name: 'description',
      content: this.t().rentalCatalogMetaDescription,
    });
    this.metaService.updateTag({
      property: 'og:title',
      content: this.t().rentalCatalogMetaTitle,
    });
    this.metaService.updateTag({
      property: 'og:description',
      content: this.t().rentalCatalogMetaDescription,
    });
    this.metaService.updateTag({ property: 'og:type', content: 'website' });

    this.apiService.getRentableBikes().subscribe({
      next: (data) => {
        this.bikes.set(data);
        this.loading.set(false);
        this.addItemListSchema(data);
      },
      error: () => this.loading.set(false),
    });
  }

  ngOnDestroy(): void {
    this.removeItemListSchema();
  }

  onSearch(e: Event): void {
    this.searchQuery.set((e.target as HTMLInputElement).value);
  }

  onSort(e: Event): void {
    this.sortOption.set((e.target as HTMLSelectElement).value as SortOption);
  }

  onMaxPrice(e: Event): void {
    const v = (e.target as HTMLInputElement).value;
    const parsed = v === '' ? null : Number(v);
    this.maxDailyPrice.set(parsed !== null && !Number.isNaN(parsed) ? parsed : null);
  }

  toggleBrand(v: string): void {
    this.selectedBrands.update((arr) =>
      arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v],
    );
  }
  toggleType(v: string): void {
    this.selectedTypes.update((arr) =>
      arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v],
    );
  }
  toggleTireSize(v: string): void {
    this.selectedTireSizes.update((arr) =>
      arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v],
    );
  }
  toggleFrameSize(v: string): void {
    this.selectedFrameSizes.update((arr) =>
      arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v],
    );
  }

  clearFilters(): void {
    this.searchQuery.set('');
    this.selectedBrands.set([]);
    this.selectedTypes.set([]);
    this.selectedTireSizes.set([]);
    this.selectedFrameSizes.set([]);
    this.maxDailyPrice.set(null);
  }

  // ── Date-range availability filter ──
  onFilterRange(range: { start: string; end: string }): void {
    this.filterStart = range.start;
    this.filterEnd = range.end;
    if (range.start && range.end) {
      this.availLoading.set(true);
      this.apiService
        .getAvailableBikes(new Date(range.start), new Date(range.end))
        .subscribe({
          next: (bikes) => {
            this.availableIds.set(new Set(bikes.map((b) => b.id)));
            this.availLoading.set(false);
          },
          error: () => {
            this.availableIds.set(new Set());
            this.availLoading.set(false);
          },
        });
    } else {
      // Only a start picked so far — don't filter yet.
      this.availableIds.set(null);
    }
  }

  clearDateFilter(): void {
    this.filterStart = '';
    this.filterEnd = '';
    this.availableIds.set(null);
  }

  dateQueryParams(): Record<string, string> {
    return this.filterStart && this.filterEnd
      ? { start: this.filterStart, end: this.filterEnd }
      : {};
  }

  private dateLabels(): { pick: string; clear: string } {
    const m: Record<string, { pick: string; clear: string }> = {
      de: { pick: 'Zeitraum', clear: 'Zurücksetzen' },
      en: { pick: 'Dates', clear: 'Reset' },
      fr: { pick: 'Dates', clear: 'Réinitialiser' },
      tr: { pick: 'Tarih', clear: 'Sıfırla' },
    };
    return m[this.lang()] ?? m['en'];
  }

  dateBtnLabel(): string {
    if (this.filterStart && this.filterEnd) {
      return `${this.fmtShort(this.filterStart)} – ${this.fmtShort(this.filterEnd)}`;
    }
    return this.dateLabels().pick;
  }

  clearDatesLabel(): string {
    return this.dateLabels().clear;
  }

  private fmtShort(key: string): string {
    const parts = key.split('-'); // YYYY-MM-DD
    return parts.length === 3 ? `${parts[2]}.${parts[1]}` : key;
  }

  minDailyPrice(bike: PublicRentalBicycle): string {
    const v = this.minDailyPriceValue(bike);
    return v !== null ? v.toFixed(0) : '–';
  }

  minDailyPriceValue(bike: PublicRentalBicycle): number | null {
    const p = bike.preise;
    if (!p) return null;
    const values = [p.day1, p.day2, p.day3, p.day4, p.day5, p.day6, p.day7].filter(
      (x): x is number => typeof x === 'number' && x > 0,
    );
    if (values.length === 0) return null;
    return Math.min(...values);
  }

  bikeAlt(bike: PublicRentalBicycle): string {
    return `${bike.marke} ${bike.modell}${bike.fahrradtyp ? ' ' + bike.fahrradtyp : ''} — ${this.t().rentalCatalogLabel}`;
  }

  getImageUrl(path: string): string {
    if (!path) return '';
    if (/^https?:\/\//i.test(path)) return path;
    const base = environment.apiUrl.replace('/api/public', '').replace(/\/$/, '');
    const normalized = path.startsWith('/') ? path : `/${path}`;
    return `${base}${normalized}`;
  }

  private countBy<T>(items: T[], key: (t: T) => string): { value: string; count: number }[] {
    const map = new Map<string, number>();
    items.forEach((it) => {
      const v = key(it);
      if (!v) return;
      map.set(v, (map.get(v) || 0) + 1);
    });
    return Array.from(map.entries())
      .map(([value, count]) => ({ value, count }))
      .sort((a, b) => b.count - a.count);
  }

  private addItemListSchema(bikes: PublicRentalBicycle[]): void {
    this.removeItemListSchema();
    const slug = this.detailSlug();
    const lang = this.lang();
    const items = bikes.slice(0, 50).map((bike, idx) => {
      const minPrice = this.minDailyPriceValue(bike);
      const url = `https://bikehausfreiburg.com/${lang}/${slug}/${bike.id}`;
      const image = bike.images[0]
        ? this.getImageUrl(bike.images[0].filePath)
        : '';
      return {
        '@type': 'ListItem',
        position: idx + 1,
        item: {
          '@type': 'Product',
          name: `${bike.marke} ${bike.modell}`,
          url,
          image,
          brand: { '@type': 'Brand', name: bike.marke },
          offers: minPrice !== null
            ? {
                '@type': 'Offer',
                price: minPrice,
                priceCurrency: 'EUR',
                availability: 'https://schema.org/InStock',
                priceSpecification: {
                  '@type': 'UnitPriceSpecification',
                  price: minPrice,
                  priceCurrency: 'EUR',
                  unitCode: 'DAY',
                  referenceQuantity: { '@type': 'QuantitativeValue', value: 1, unitCode: 'DAY' },
                },
              }
            : undefined,
        },
      };
    });

    const schema = {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: this.t().rentalCatalogMetaTitle,
      description: this.t().rentalCatalogMetaDescription,
      numberOfItems: bikes.length,
      itemListElement: items,
    };

    this.itemListSchemaElement = this.document.createElement('script');
    this.itemListSchemaElement.type = 'application/ld+json';
    this.itemListSchemaElement.text = JSON.stringify(schema);
    this.document.head.appendChild(this.itemListSchemaElement);
  }

  private removeItemListSchema(): void {
    if (this.itemListSchemaElement && this.itemListSchemaElement.parentNode) {
      this.itemListSchemaElement.parentNode.removeChild(this.itemListSchemaElement);
      this.itemListSchemaElement = null;
    }
  }
}
