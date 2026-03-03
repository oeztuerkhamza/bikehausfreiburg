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
import { BikeCardComponent } from '../../components/bike-card/bike-card.component';
import { KleinanzeigenListing } from '../../models/models';

type SortOption = 'newest' | 'price-asc' | 'price-desc' | 'az';

// Regex patterns for parsing title
const ZOLL_PATTERN = /(\d{2}(?:[.,]5)?)\s*(?:zoll|")/i;
const GEARS_PATTERN = /(\d{1,2})\s*(?:g[aä]ng|speed|gang)/i;
const SIZE_PATTERN = /(\d{2,3})\s*size/i;
const NEW_PATTERN =
  /\b(neue?[smrn]?|nagelneu|brandneu|unbenutzt|originalverpackt|\bovp\b)\b/i;
const TYP_PATTERN =
  /\b(damen|herren|männer|frauen|kinder|kids?|junge[ns]?|mädchen|boys?|girls?|unisex)\b/i;

@Component({
  selector: 'app-showroom',
  standalone: true,
  imports: [CommonModule, RouterModule, BikeCardComponent, FormsModule],
  template: `
    <div class="showroom-page">
      <!-- Header -->
      <header class="page-header">
        <div class="container">
          <span class="section-label">{{ t().showroomLabel }}</span>
          <h1>{{ t().showroomTitle }}</h1>
          <p class="header-sub" *ngIf="!loading()">
            {{ filteredListings().length }} {{ t().bikesAvailable }}
          </p>
        </div>
      </header>

      <div class="container shop-layout">
        <!-- ====== Sidebar (Desktop) ====== -->
        <aside class="sidebar" [class.open]="sidebarOpen()">
          <!-- Close button (mobile) -->
          <button class="sidebar-close" (click)="closeSidebar()">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>

          <!-- Search -->
          <div class="sidebar-search">
            <svg
              class="s-icon"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
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

          <!-- ══════ ZUSTAND ══════ -->
          <div class="sidebar-section">
            <h3 class="filter-heading">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              {{ t().filterCondition }}
            </h3>
            <div class="checkbox-group">
              <label
                class="checkbox-item"
                [class.active]="selectedZustand() === 'neu'"
              >
                <input
                  type="checkbox"
                  [checked]="selectedZustand() === 'neu'"
                  (change)="toggleZustand('neu')"
                />
                <span class="check-box"></span>
                <span>{{ t().conditionNew }}</span>
                <span class="filter-count">{{ zustandCounts().neu }}</span>
              </label>
              <label
                class="checkbox-item"
                [class.active]="selectedZustand() === 'gebraucht'"
              >
                <input
                  type="checkbox"
                  [checked]="selectedZustand() === 'gebraucht'"
                  (change)="toggleZustand('gebraucht')"
                />
                <span class="check-box"></span>
                <span>{{ t().conditionUsed }}</span>
                <span class="filter-count">{{
                  zustandCounts().gebraucht
                }}</span>
              </label>
            </div>
          </div>

          <hr class="sidebar-divider" />

          <!-- ══════ KATEGORIE ══════ -->
          <div class="sidebar-section" *ngIf="availableCategories().length > 0">
            <h3 class="filter-heading">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" />
              </svg>
              {{ t().filterCategory }}
            </h3>
            <div class="checkbox-group">
              <label
                class="checkbox-item"
                *ngFor="let cat of availableCategories()"
                [class.active]="selectedCategory() === cat.name"
              >
                <input
                  type="checkbox"
                  [checked]="selectedCategory() === cat.name"
                  (change)="toggleCategory(cat.name)"
                />
                <span class="check-box"></span>
                <span>{{ cat.name }}</span>
                <span class="filter-count">{{ cat.count }}</span>
              </label>
            </div>
          </div>

          <hr class="sidebar-divider" />

          <!-- ══════ REIFENGRÖSSE (ZOLL) ══════ -->
          <div class="sidebar-section" *ngIf="availableZoll().length > 0">
            <h3 class="filter-heading">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <circle cx="12" cy="12" r="10" />
              </svg>
              {{ t().filterTireSize }}
            </h3>
            <div class="checkbox-group">
              <label
                class="checkbox-item"
                *ngFor="let z of availableZoll()"
                [class.active]="selectedZoll().includes(z.value)"
              >
                <input
                  type="checkbox"
                  [checked]="selectedZoll().includes(z.value)"
                  (change)="toggleZoll(z.value)"
                />
                <span class="check-box"></span>
                <span>{{ z.value }}"</span>
                <span class="filter-count">{{ z.count }}</span>
              </label>
            </div>
          </div>

          <hr class="sidebar-divider" *ngIf="availableZoll().length > 0" />

          <!-- ══════ GÄNGE ══════ -->
          <div class="sidebar-section" *ngIf="availableGears().length > 0">
            <h3 class="filter-heading">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <circle cx="12" cy="12" r="3" />
                <path
                  d="M12 1v6m0 6v6m5.66-14.66l-4.24 4.24m-2.84 2.84l-4.24 4.24m14.66 0l-4.24-4.24m-2.84-2.84l-4.24-4.24"
                />
              </svg>
              {{ t().filterGears }}
            </h3>
            <div class="checkbox-group">
              <label
                class="checkbox-item"
                *ngFor="let g of availableGears()"
                [class.active]="selectedGears().includes(g.value)"
              >
                <input
                  type="checkbox"
                  [checked]="selectedGears().includes(g.value)"
                  (change)="toggleGears(g.value)"
                />
                <span class="check-box"></span>
                <span>{{ g.value }} {{ t().gearsUnit }}</span>
                <span class="filter-count">{{ g.count }}</span>
              </label>
            </div>
          </div>

          <hr class="sidebar-divider" *ngIf="availableGears().length > 0" />

          <!-- ══════ RAHMENGRÖSSE (SIZE) ══════ -->
          <div class="sidebar-section" *ngIf="availableSizes().length > 0">
            <h3 class="filter-heading">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M21 3H3v18h18V3z" />
                <path d="M3 9h18M3 15h18M9 3v18" />
              </svg>
              {{ t().filterFrameSize }}
            </h3>
            <div class="checkbox-group">
              <label
                class="checkbox-item"
                *ngFor="let s of availableSizes()"
                [class.active]="selectedSizes().includes(s.value)"
              >
                <input
                  type="checkbox"
                  [checked]="selectedSizes().includes(s.value)"
                  (change)="toggleSize(s.value)"
                />
                <span class="check-box"></span>
                <span>{{ s.value }}</span>
                <span class="filter-count">{{ s.count }}</span>
              </label>
            </div>
          </div>

          <hr class="sidebar-divider" *ngIf="availableSizes().length > 0" />

          <!-- ══════ PREIS ══════ -->
          <div class="sidebar-section">
            <h3 class="filter-heading">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
              </svg>
              {{ t().priceRange }}
            </h3>
            <div class="price-inputs">
              <div class="price-field">
                <span class="price-label">Min</span>
                <input
                  type="number"
                  placeholder="0"
                  [value]="priceMin()"
                  (input)="onPriceMin($event)"
                  min="0"
                />
                <span class="price-unit">€</span>
              </div>
              <span class="price-separator">—</span>
              <div class="price-field">
                <span class="price-label">Max</span>
                <input
                  type="number"
                  placeholder="∞"
                  [value]="priceMax()"
                  (input)="onPriceMax($event)"
                  min="0"
                />
                <span class="price-unit">€</span>
              </div>
            </div>
          </div>

          <!-- Clear Filters -->
          <button
            class="clear-btn"
            *ngIf="hasActiveFilters()"
            (click)="clearFilters()"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
            {{ t().clearFilters }}
          </button>
        </aside>

        <!-- Sidebar overlay (mobile) -->
        <div
          class="sidebar-overlay"
          *ngIf="sidebarOpen()"
          (click)="closeSidebar()"
        ></div>

        <!-- ====== Main Content ====== -->
        <main class="main-content">
          <!-- Toolbar -->
          <div class="toolbar">
            <!-- Mobile filter toggle -->
            <button class="filter-toggle" (click)="sidebarOpen.set(true)">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
              </svg>
              {{ t().filters }}
              <span class="active-badge" *ngIf="activeFilterCount() > 0">{{
                activeFilterCount()
              }}</span>
            </button>

            <!-- Active filters pills -->
            <div class="active-filters">
              <span class="active-pill" *ngIf="selectedZustand()">
                {{
                  selectedZustand() === 'neu'
                    ? t().conditionNew
                    : t().conditionUsed
                }}
                <button
                  class="pill-close"
                  (click)="toggleZustand(selectedZustand()!)"
                >
                  ×
                </button>
              </span>
              <span class="active-pill" *ngIf="selectedCategory()">
                {{ selectedCategory() }}
                <button class="pill-close" (click)="toggleCategory(selectedCategory()!)">
                  ×
                </button>
              </span>
              <span class="active-pill" *ngFor="let z of selectedZoll()">
                {{ z }}"
                <button class="pill-close" (click)="toggleZoll(z)">×</button>
              </span>
              <span class="active-pill" *ngFor="let g of selectedGears()">
                {{ g }} {{ t().gearsUnit }}
                <button class="pill-close" (click)="toggleGears(g)">×</button>
              </span>
              <span class="active-pill" *ngFor="let s of selectedSizes()">
                {{ s }}
                <button class="pill-close" (click)="toggleSize(s)">×</button>
              </span>
              <span class="active-pill" *ngIf="priceMin() || priceMax()">
                {{ priceMin() || 0 }}€ - {{ priceMax() || '∞' }}€
                <button class="pill-close" (click)="clearPriceFilter()">
                  ×
                </button>
              </span>
            </div>

            <div class="toolbar-spacer"></div>

            <!-- Sort -->
            <div class="sort-wrap">
              <label class="sort-label">{{ t().sortBy }}:</label>
              <select
                class="sort-select"
                [value]="sortOption()"
                (change)="onSort($event)"
              >
                <option value="newest">{{ t().sortNewest }}</option>
                <option value="price-asc">{{ t().sortPriceLow }}</option>
                <option value="price-desc">{{ t().sortPriceHigh }}</option>
                <option value="az">{{ t().sortAZ }}</option>
              </select>
            </div>

            <span class="result-count"
              >{{ filteredListings().length }} {{ t().bikesAvailable }}</span
            >
          </div>

          <!-- Mobile Search -->
          <div class="mobile-search">
            <svg
              class="s-icon"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
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
                <div class="sk-line l"></div>
                <div class="sk-line s"></div>
                <div class="sk-line m"></div>
              </div>
            </div>
          </div>

          <!-- Bike Grid -->
          <div
            *ngIf="!loading()"
            class="bike-grid"
            [class.has-results]="filteredListings().length > 0"
          >
            <app-bike-card
              *ngFor="let bike of filteredListings()"
              [listing]="bike"
            ></app-bike-card>
          </div>

          <!-- No Results -->
          <div
            *ngIf="!loading() && filteredListings().length === 0"
            class="no-results"
          >
            <svg
              width="56"
              height="56"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--color-text-muted)"
              stroke-width="1.2"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <h3>{{ t().noBikesFound }}</h3>
            <button
              class="btn-secondary reset-btn"
              *ngIf="hasActiveFilters()"
              (click)="clearFilters()"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
              {{ t().clearFilters }}
            </button>
          </div>

          <!-- Last Updated -->
          <footer *ngIf="lastSync()" class="last-updated">
            <p>
              {{ t().lastUpdated }}: {{ lastSync() | date: 'dd.MM.yyyy HH:mm' }}
            </p>
          </footer>
        </main>
      </div>
    </div>
  `,
  styles: [
    `
      .showroom-page {
        min-height: 60vh;
      }

      /* ── Header ── */
      .page-header {
        padding: 7rem 0 3rem;
        background: var(--color-bg);
        border-bottom: 1px solid var(--color-border);
      }

      .page-header .section-label {
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
        margin: 0 0 0.5rem;
        letter-spacing: -0.02em;
      }

      .header-sub {
        font-size: 1rem;
        color: var(--color-text-secondary);
      }

      /* ── Shop Layout ── */
      .shop-layout {
        display: grid;
        grid-template-columns: 280px 1fr;
        gap: 2rem;
        padding-top: 2rem;
        padding-bottom: 3rem;
        align-items: start;
      }

      /* ── Sidebar ── */
      .sidebar {
        position: sticky;
        top: 5rem;
        padding: 1.25rem;
        background: var(--color-surface);
        border: 1px solid var(--color-border);
        border-radius: 16px;
        max-height: calc(100vh - 6rem);
        overflow-y: auto;
      }

      .sidebar-close {
        display: none;
      }

      .sidebar-search {
        position: relative;
        margin-bottom: 1.25rem;
      }

      .s-icon {
        position: absolute;
        left: 0.75rem;
        top: 50%;
        transform: translateY(-50%);
        color: var(--color-text-muted);
        pointer-events: none;
      }

      .s-input {
        width: 100%;
        padding: 0.6rem 0.75rem 0.6rem 2.25rem;
        border: 1px solid var(--color-border);
        border-radius: 10px;
        background: var(--color-bg);
        color: var(--color-text);
        font-size: 0.85rem;
        font-family: var(--font-family);
        outline: none;
        transition: border-color 0.2s;
      }

      .s-input:focus {
        border-color: var(--color-accent);
      }
      .s-input::placeholder {
        color: var(--color-text-muted);
      }

      .sidebar-divider {
        border: none;
        border-top: 1px solid var(--color-border);
        margin: 1rem 0;
      }

      /* ── Filter Sections ── */
      .sidebar-section {
        margin-bottom: 0.5rem;
      }

      .filter-heading {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.75rem;
        font-weight: 700;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        color: var(--color-text-muted);
        margin-bottom: 0.75rem;
      }

      .filter-heading svg {
        opacity: 0.6;
      }

      /* ── Checkbox Group ── */
      .checkbox-group {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .checkbox-item {
        display: flex;
        align-items: center;
        gap: 0.6rem;
        padding: 0.45rem 0.65rem;
        border-radius: 8px;
        font-size: 0.85rem;
        color: var(--color-text-secondary);
        cursor: pointer;
        transition: all 0.2s;
      }

      .checkbox-item:hover {
        background: var(--color-surface-hover);
        color: var(--color-text);
      }

      .checkbox-item.active {
        background: rgba(255, 87, 34, 0.1);
        color: var(--color-accent);
      }

      .checkbox-item input {
        position: absolute;
        opacity: 0;
        pointer-events: none;
      }

      .check-box {
        width: 16px;
        height: 16px;
        border-radius: 4px;
        border: 2px solid var(--color-border);
        flex-shrink: 0;
        position: relative;
        transition: all 0.2s;
      }

      .checkbox-item.active .check-box {
        border-color: var(--color-accent);
        background: var(--color-accent);
      }

      .checkbox-item.active .check-box::after {
        content: '';
        position: absolute;
        top: 2px;
        left: 5px;
        width: 4px;
        height: 8px;
        border: solid #fff;
        border-width: 0 2px 2px 0;
        transform: rotate(45deg);
      }

      .filter-count {
        margin-left: auto;
        font-size: 0.75rem;
        font-weight: 600;
        color: var(--color-text-muted);
        background: var(--color-bg);
        padding: 0.15rem 0.5rem;
        border-radius: 10px;
      }

      .checkbox-item.active .filter-count {
        background: rgba(255, 87, 34, 0.15);
        color: var(--color-accent);
      }

      /* ── Price Inputs ── */
      .price-inputs {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .price-field {
        flex: 1;
        position: relative;
      }

      .price-label {
        position: absolute;
        top: -8px;
        left: 8px;
        font-size: 0.65rem;
        font-weight: 600;
        color: var(--color-text-muted);
        background: var(--color-surface);
        padding: 0 4px;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .price-field input {
        width: 100%;
        padding: 0.6rem 1.5rem 0.6rem 0.65rem;
        border: 1px solid var(--color-border);
        border-radius: 8px;
        background: var(--color-bg);
        color: var(--color-text);
        font-size: 0.85rem;
        font-family: var(--font-family);
        outline: none;
        transition: border-color 0.2s;
      }

      .price-field input:focus {
        border-color: var(--color-accent);
      }

      .price-field input::-webkit-outer-spin-button,
      .price-field input::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
      }

      .price-unit {
        position: absolute;
        right: 8px;
        top: 50%;
        transform: translateY(-50%);
        font-size: 0.8rem;
        color: var(--color-text-muted);
      }

      .price-separator {
        color: var(--color-text-muted);
        font-size: 0.9rem;
      }

      .clear-btn {
        display: flex;
        align-items: center;
        gap: 0.4rem;
        width: 100%;
        padding: 0.6rem 0.75rem;
        margin-top: 1rem;
        border: 1px solid var(--color-border);
        border-radius: 10px;
        background: transparent;
        color: var(--color-text-secondary);
        font-size: 0.82rem;
        font-family: var(--font-family);
        cursor: pointer;
        transition: all 0.2s;
      }

      .clear-btn:hover {
        border-color: var(--color-accent);
        color: var(--color-accent);
      }

      /* ── Main Content ── */
      .main-content {
        min-width: 0;
      }

      /* ── Toolbar ── */
      .toolbar {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        margin-bottom: 1.25rem;
        flex-wrap: wrap;
      }

      .filter-toggle {
        display: none;
        align-items: center;
        gap: 0.4rem;
        padding: 0.55rem 1rem;
        border: 1px solid var(--color-border);
        border-radius: 50px;
        background: var(--color-surface);
        color: var(--color-text-secondary);
        font-size: 0.85rem;
        font-family: var(--font-family);
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
      }

      .filter-toggle:hover {
        border-color: var(--color-accent);
        color: var(--color-accent);
      }

      .active-badge {
        background: var(--color-accent);
        color: #fff;
        font-size: 0.7rem;
        font-weight: 700;
        padding: 0.1rem 0.45rem;
        border-radius: 50px;
        margin-left: 0.1rem;
      }

      .active-filters {
        display: flex;
        gap: 0.4rem;
        flex-wrap: wrap;
      }

      .active-pill {
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
        background: var(--color-accent-subtle);
        color: var(--color-accent);
        font-size: 0.78rem;
        font-weight: 600;
        padding: 0.3rem 0.5rem 0.3rem 0.7rem;
        border-radius: 50px;
      }

      .pill-close {
        display: flex;
        align-items: center;
        justify-content: center;
        background: none;
        border: none;
        color: var(--color-accent);
        cursor: pointer;
        padding: 0;
        font-size: 1rem;
        line-height: 1;
        border-radius: 50%;
        transition: background 0.2s;
      }

      .pill-close:hover {
        background: rgba(255, 87, 34, 0.2);
      }

      .toolbar-spacer {
        flex: 1;
      }

      .sort-wrap {
        display: flex;
        align-items: center;
        gap: 0.4rem;
      }

      .sort-label {
        font-size: 0.82rem;
        color: var(--color-text-muted);
        white-space: nowrap;
      }

      .sort-select {
        padding: 0.45rem 0.75rem;
        border: 1px solid var(--color-border);
        border-radius: 8px;
        background: var(--color-surface);
        color: var(--color-text);
        font-size: 0.82rem;
        font-family: var(--font-family);
        outline: none;
        cursor: pointer;
        transition: border-color 0.2s;
      }

      .sort-select:focus {
        border-color: var(--color-accent);
      }

      .result-count {
        font-size: 0.82rem;
        color: var(--color-text-muted);
        white-space: nowrap;
      }

      .mobile-search {
        display: none;
      }

      /* ── Grid ── */
      .bike-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1.25rem;
      }

      /* ── Skeleton ── */
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

      /* ── No results ── */
      .no-results {
        text-align: center;
        padding: 4rem 1rem;
      }
      .no-results svg {
        margin-bottom: 1rem;
      }
      .no-results h3 {
        font-size: 1.05rem;
        font-weight: 600;
        color: var(--color-text-secondary);
        margin-bottom: 1rem;
      }

      .reset-btn {
        margin: 0 auto;
        font-size: 0.85rem;
        padding: 0.6rem 1.25rem;
      }

      /* ── Footer ── */
      .last-updated {
        text-align: center;
        padding: 1.5rem 0 0;
        font-size: 0.8rem;
        color: var(--color-text-muted);
        border-top: 1px solid var(--color-border);
        margin-top: 2.5rem;
      }

      /* ── Responsive ── */
      .sidebar-overlay {
        display: none;
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.6);
        z-index: 99;
      }

      @media (max-width: 1100px) {
        .bike-grid {
          grid-template-columns: repeat(2, 1fr);
        }
      }

      @media (max-width: 900px) {
        .shop-layout {
          grid-template-columns: 1fr;
        }

        .sidebar {
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
          width: 320px;
          max-width: 90vw;
          z-index: 100;
          border-radius: 0 16px 16px 0;
          max-height: 100vh;
          transform: translateX(-100%);
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .sidebar.open {
          transform: translateX(0);
        }

        .sidebar-close {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          background: none;
          border: none;
          color: var(--color-text-muted);
          cursor: pointer;
          padding: 0.25rem;
          margin-bottom: 0.5rem;
          margin-left: auto;
        }

        .sidebar-overlay {
          display: block;
        }
        .filter-toggle {
          display: inline-flex;
        }

        .mobile-search {
          display: block;
          position: relative;
          margin-bottom: 0.75rem;
        }

        .active-filters {
          display: none;
        }
        .result-count {
          display: none;
        }
        .bike-grid {
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
        }
      }

      @media (max-width: 520px) {
        .page-header {
          padding: 6rem 0 2rem;
        }
        .bike-grid {
          grid-template-columns: 1fr;
        }
        .toolbar {
          gap: 0.5rem;
        }
      }
    `,
  ],
})
export class ShowroomComponent implements OnInit, OnDestroy {
  private translationService = inject(TranslationService);
  private apiService = inject(ApiService);
  private route = inject(ActivatedRoute);
  private titleService = inject(Title);
  private metaService = inject(Meta);
  private document = inject(DOCUMENT);

  private itemListSchemaElement: HTMLScriptElement | null = null;

  t = this.translationService.translations;

  // Data
  allListings = signal<KleinanzeigenListing[]>([]);
  loading = signal(true);
  lastSync = signal<string | null>(null);

  // UI
  sidebarOpen = signal(false);
  skeletonCards = Array(6).fill(0);

  // Filters
  searchQuery = signal<string>('');
  sortOption = signal<SortOption>('newest');
  selectedZustand = signal<'neu' | 'gebraucht' | null>(null);
  selectedCategory = signal<string | null>(null);
  selectedZoll = signal<string[]>([]);
  selectedGears = signal<number[]>([]);
  selectedSizes = signal<string[]>([]);
  priceMin = signal<number | null>(null);
  priceMax = signal<number | null>(null);

  // Computed: parsed values from all listings
  parsedListings = computed(() => {
    return this.allListings().map((listing) => ({
      ...listing,
      parsedZoll: this.parseZoll(listing.title),
      parsedGears: this.parseGears(listing.title),
      parsedSize: this.parseSize(listing.title),
      parsedTyp: this.parseTyp(listing.title),
      isNew: this.isNew(listing.title),
    }));
  });

  // Available filter options (dynamically computed from data)
  availableZoll = computed(() => {
    const counts = new Map<string, number>();
    this.parsedListings().forEach((l) => {
      if (l.parsedZoll) {
        counts.set(l.parsedZoll, (counts.get(l.parsedZoll) || 0) + 1);
      }
    });
    return Array.from(counts.entries())
      .map(([value, count]) => ({ value, count }))
      .sort((a, b) => parseFloat(a.value) - parseFloat(b.value));
  });

  availableGears = computed(() => {
    const counts = new Map<number, number>();
    this.parsedListings().forEach((l) => {
      if (l.parsedGears) {
        counts.set(l.parsedGears, (counts.get(l.parsedGears) || 0) + 1);
      }
    });
    return Array.from(counts.entries())
      .map(([value, count]) => ({ value, count }))
      .sort((a, b) => a.value - b.value);
  });

  availableSizes = computed(() => {
    const counts = new Map<string, number>();
    this.parsedListings().forEach((l) => {
      if (l.parsedSize) {
        counts.set(l.parsedSize, (counts.get(l.parsedSize) || 0) + 1);
      }
    });
    return Array.from(counts.entries())
      .map(([value, count]) => ({ value, count }))
      .sort((a, b) => {
        const numA = parseInt(a.value);
        const numB = parseInt(b.value);
        return numA - numB;
      });
  });

  zustandCounts = computed(() => {
    let neu = 0,
      gebraucht = 0;
    this.parsedListings().forEach((l) => {
      if (l.isNew) neu++;
      else gebraucht++;
    });
    return { neu, gebraucht };
  });

  // Available categories (dynamically computed from data)
  availableCategories = computed(() => {
    const counts = new Map<string, number>();
    const hiddenPattern = /kleinanzeigen|freiburg/i;
    this.allListings().forEach((l) => {
      if (l.category && !hiddenPattern.test(l.category)) {
        counts.set(l.category, (counts.get(l.category) || 0) + 1);
      }
    });
    // Sort by count descending
    return Array.from(counts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  });

  // Filtered results
  filteredListings = computed(() => {
    let result = this.parsedListings();
    const query = this.searchQuery().toLowerCase().trim();
    const zustand = this.selectedZustand();
    const category = this.selectedCategory();
    const zollFilters = this.selectedZoll();
    const gearsFilters = this.selectedGears();
    const sizeFilters = this.selectedSizes();
    const minPrice = this.priceMin();
    const maxPrice = this.priceMax();

    // Search filter
    if (query) {
      result = result.filter(
        (l) =>
          l.title.toLowerCase().includes(query) ||
          (l.description && l.description.toLowerCase().includes(query)),
      );
    }

    // Zustand filter
    if (zustand === 'neu') {
      result = result.filter((l) => l.isNew);
    } else if (zustand === 'gebraucht') {
      result = result.filter((l) => !l.isNew);
    }

    // Category filter
    if (category) {
      result = result.filter((l) => l.category === category);
    }

    // Zoll filter
    if (zollFilters.length > 0) {
      result = result.filter(
        (l) => l.parsedZoll && zollFilters.includes(l.parsedZoll),
      );
    }

    // Gears filter
    if (gearsFilters.length > 0) {
      result = result.filter(
        (l) => l.parsedGears && gearsFilters.includes(l.parsedGears),
      );
    }

    // Size filter
    if (sizeFilters.length > 0) {
      result = result.filter(
        (l) => l.parsedSize && sizeFilters.includes(l.parsedSize),
      );
    }

    // Price filter
    if (minPrice !== null) {
      result = result.filter(
        (l) => l.price !== null && l.price !== undefined && l.price >= minPrice,
      );
    }
    if (maxPrice !== null) {
      result = result.filter(
        (l) => l.price !== null && l.price !== undefined && l.price <= maxPrice,
      );
    }

    // Sort
    const sort = this.sortOption();
    result = [...result].sort((a, b) => {
      switch (sort) {
        case 'newest':
          return (
            new Date(b.lastScrapedAt || 0).getTime() -
            new Date(a.lastScrapedAt || 0).getTime()
          );
        case 'price-asc':
          return (a.price ?? Infinity) - (b.price ?? Infinity);
        case 'price-desc':
          return (b.price ?? 0) - (a.price ?? 0);
        case 'az':
          return a.title.localeCompare(b.title, 'de');
        default:
          return 0;
      }
    });

    return result;
  });

  hasActiveFilters = computed(
    () =>
      !!this.searchQuery() ||
      this.selectedZustand() !== null ||
      this.selectedCategory() !== null ||
      this.selectedZoll().length > 0 ||
      this.selectedGears().length > 0 ||
      this.selectedSizes().length > 0 ||
      this.priceMin() !== null ||
      this.priceMax() !== null,
  );

  activeFilterCount = computed(() => {
    let count = 0;
    if (this.searchQuery()) count++;
    if (this.selectedZustand()) count++;
    if (this.selectedCategory()) count++;
    count += this.selectedZoll().length;
    count += this.selectedGears().length;
    count += this.selectedSizes().length;
    if (this.priceMin() !== null || this.priceMax() !== null) count++;
    return count;
  });

  ngOnInit(): void {
    // SEO
    this.titleService.setTitle(this.t().showroomMetaTitle);
    this.metaService.updateTag({
      name: 'description',
      content: this.t().showroomMetaDescription,
    });
    this.metaService.updateTag({
      property: 'og:title',
      content: this.t().showroomMetaTitle,
    });
    this.metaService.updateTag({
      property: 'og:description',
      content: this.t().showroomMetaDescription,
    });
    this.metaService.updateTag({
      property: 'og:url',
      content: 'https://bikehausfreiburg.com/showroom',
    });

    this.loadData();
  }

  private loadData(): void {
    this.apiService.getListings().subscribe({
      next: (data) => {
        this.allListings.set(data);
        this.loading.set(false);

        // Add ItemList Schema for SEO
        this.addItemListSchema(data);
      },
      error: () => this.loading.set(false),
    });

    this.apiService.getLastSync().subscribe({
      next: (data) => this.lastSync.set(data),
    });
  }

  private addItemListSchema(listings: KleinanzeigenListing[]): void {
    // Remove existing schema
    this.removeItemListSchema();

    // Take first 50 items for schema (Google limit)
    const items = listings.slice(0, 50).map((listing, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Product',
        name: listing.title,
        url: `https://bikehausfreiburg.com/showroom/${listing.id}`,
        image: listing.images?.[0]?.imageUrl || '',
        offers: {
          '@type': 'Offer',
          price: listing.price || 0,
          priceCurrency: 'EUR',
          availability: 'https://schema.org/InStock',
        },
      },
    }));

    const schema = {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: this.t().showroomMetaTitle,
      description: `${listings.length} ${this.t().bikesAvailable}`,
      numberOfItems: listings.length,
      itemListElement: items,
    };

    this.itemListSchemaElement = this.document.createElement('script');
    this.itemListSchemaElement.type = 'application/ld+json';
    this.itemListSchemaElement.text = JSON.stringify(schema);
    this.document.head.appendChild(this.itemListSchemaElement);
  }

  private removeItemListSchema(): void {
    if (this.itemListSchemaElement && this.itemListSchemaElement.parentNode) {
      this.itemListSchemaElement.parentNode.removeChild(
        this.itemListSchemaElement,
      );
      this.itemListSchemaElement = null;
    }
  }

  ngOnDestroy(): void {
    this.removeItemListSchema();
  }

  // Parse functions
  private parseZoll(title: string): string | null {
    const match = title.match(ZOLL_PATTERN);
    if (match) {
      return match[1].replace(',', '.');
    }
    return null;
  }

  private parseGears(title: string): number | null {
    const match = title.match(GEARS_PATTERN);
    if (match) {
      return parseInt(match[1], 10);
    }
    return null;
  }

  private parseSize(title: string): string | null {
    const match = title.match(SIZE_PATTERN);
    if (match) {
      return match[1];
    }
    return null;
  }

  private isNew(title: string): boolean {
    return NEW_PATTERN.test(title);
  }

  private parseTyp(title: string): 'damen' | 'herren' | 'kinder' | null {
    const match = title.match(TYP_PATTERN);
    if (match) {
      const typ = match[1].toLowerCase();
      if (typ === 'damen' || typ === 'frauen') return 'damen';
      if (typ === 'herren' || typ === 'männer') return 'herren';
      if (
        [
          'kinder',
          'kids',
          'kid',
          'jungen',
          'jungens',
          'junge',
          'mädchen',
          'boys',
          'boy',
          'girls',
          'girl',
        ].includes(typ)
      )
        return 'kinder';
    }
    return null;
  }

  // Event handlers
  onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchQuery.set(value);
  }

  onSort(event: Event): void {
    this.sortOption.set(
      (event.target as HTMLSelectElement).value as SortOption,
    );
  }

  toggleZustand(value: 'neu' | 'gebraucht'): void {
    if (this.selectedZustand() === value) {
      this.selectedZustand.set(null);
    } else {
      this.selectedZustand.set(value);
    }
  }

  toggleCategory(value: string): void {
    if (this.selectedCategory() === value) {
      this.selectedCategory.set(null);
    } else {
      this.selectedCategory.set(value);
    }
  }

  toggleZoll(value: string): void {
    const current = this.selectedZoll();
    if (current.includes(value)) {
      this.selectedZoll.set(current.filter((z) => z !== value));
    } else {
      this.selectedZoll.set([...current, value]);
    }
  }

  toggleGears(value: number): void {
    const current = this.selectedGears();
    if (current.includes(value)) {
      this.selectedGears.set(current.filter((g) => g !== value));
    } else {
      this.selectedGears.set([...current, value]);
    }
  }

  toggleSize(value: string): void {
    const current = this.selectedSizes();
    if (current.includes(value)) {
      this.selectedSizes.set(current.filter((s) => s !== value));
    } else {
      this.selectedSizes.set([...current, value]);
    }
  }

  onPriceMin(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.priceMin.set(value ? parseInt(value, 10) : null);
  }

  onPriceMax(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.priceMax.set(value ? parseInt(value, 10) : null);
  }

  clearPriceFilter(): void {
    this.priceMin.set(null);
    this.priceMax.set(null);
  }

  clearFilters(): void {
    this.searchQuery.set('');
    this.selectedZustand.set(null);
    this.selectedCategory.set(null);
    this.selectedZoll.set([]);
    this.selectedGears.set([]);
    this.selectedSizes.set([]);
    this.priceMin.set(null);
    this.priceMax.set(null);
    this.sortOption.set('newest');
    this.sidebarOpen.set(false);
  }

  closeSidebar(): void {
    this.sidebarOpen.set(false);
    document.body.style.overflow = '';
  }
}
