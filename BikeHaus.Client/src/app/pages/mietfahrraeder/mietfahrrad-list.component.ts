import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { BicycleService } from '../../services/bicycle.service';
import { NotificationService } from '../../services/notification.service';
import { DialogService } from '../../services/dialog.service';
import { TranslationService } from '../../services/translation.service';
import { Bicycle, BicycleImage, PaginatedResult } from '../../models/models';
import { PaginationComponent } from '../../components/pagination/pagination.component';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-mietfahrrad-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, PaginationComponent],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1>{{ t.mietfahrradList }}</h1>
          <p class="page-subtitle">Fahrräder für den Verleih verwalten</p>
        </div>
        <a routerLink="/mietfahrraeder/new" class="btn btn-primary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          {{ t.mietfahrradNew }}
        </a>
      </div>

      <!-- Filter Bar -->
      <div class="filter-bar">
        <div class="filter-group search-group">
          <input
            type="text"
            [(ngModel)]="searchText"
            (input)="onSearch()"
            placeholder="Marke, Modell suchen..."
            class="filter-input search-input"
          />
          <span class="search-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </span>
        </div>
        <label class="toggle-filter">
          <input type="checkbox" [(ngModel)]="showOnlyRentable" (change)="onFilterChange()" />
          <span>Nur aktive Mietfahrräder</span>
        </label>
      </div>

      <!-- Bike Grid -->
      <div class="bike-grid" *ngIf="!loading()">
        <div class="empty-state" *ngIf="paginatedResult?.items?.length === 0">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2">
            <circle cx="5.5" cy="17.5" r="3.5"/><circle cx="18.5" cy="17.5" r="3.5"/>
            <path d="M15 6a1 1 0 100-2 1 1 0 000 2zM12 17.5V14l-3-3 4-3 2 3h2"/>
          </svg>
          <p>{{ t.mietfahrradNoItems }}</p>
          <a routerLink="/mietfahrraeder/new" class="btn btn-primary btn-sm">{{ t.mietfahrradNew }}</a>
        </div>

        <div class="bike-card" *ngFor="let bike of paginatedResult?.items">
          <!-- Rentable badge -->
          <div class="rentable-badge" [class.active]="bike.isRentable">
            {{ bike.isRentable ? 'Aktiv' : 'Inaktiv' }}
          </div>

          <!-- Photos -->
          <div class="bike-photos">
            <div class="photo-main">
              <img
                *ngIf="bike.images && bike.images.length > 0"
                [src]="getImageUrl(bike.images[0].filePath)"
                [alt]="bike.marke + ' ' + bike.modell"
                class="photo-img"
              />
              <div class="photo-placeholder" *ngIf="!bike.images || bike.images.length === 0">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2">
                  <circle cx="5.5" cy="17.5" r="3.5"/><circle cx="18.5" cy="17.5" r="3.5"/>
                  <path d="M15 6a1 1 0 100-2 1 1 0 000 2zM12 17.5V14l-3-3 4-3 2 3h2"/>
                </svg>
              </div>
              <div class="photo-count" *ngIf="bike.images && bike.images.length > 1">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21 15 16 10 5 21"/>
                </svg>
                {{ bike.images.length }}
              </div>
            </div>
          </div>

          <!-- Info -->
          <div class="bike-info">
            <div class="bike-name">{{ bike.marke }} {{ bike.modell }}</div>
            <div class="bike-meta">
              <span *ngIf="bike.fahrradtyp">{{ bike.fahrradtyp }}</span>
              <span *ngIf="bike.reifengroesse">{{ bike.reifengroesse }}"</span>
              <span *ngIf="bike.farbe">{{ bike.farbe }}</span>
            </div>

            <!-- Prices -->
            <div class="bike-prices" *ngIf="bike.isRentable">
              <div class="price-pill" *ngIf="bike.rentalPriceDay1">
                <span>1T</span><strong>{{ bike.rentalPriceDay1 | number:'1.0-0' }}€</strong>
              </div>
              <div class="price-pill" *ngIf="bike.rentalPriceDay3">
                <span>3T</span><strong>{{ bike.rentalPriceDay3 | number:'1.0-0' }}€</strong>
              </div>
              <div class="price-pill featured" *ngIf="bike.rentalPriceDay7">
                <span>7T</span><strong>{{ bike.rentalPriceDay7 | number:'1.0-0' }}€</strong>
              </div>
              <div class="price-pill" *ngIf="bike.rentalPriceDay14">
                <span>14T</span><strong>{{ bike.rentalPriceDay14 | number:'1.0-0' }}€</strong>
              </div>
              <div class="price-pill" *ngIf="bike.rentalPriceDay30">
                <span>30T</span><strong>{{ bike.rentalPriceDay30 | number:'1.0-0' }}€</strong>
              </div>
            </div>
            <div class="no-prices" *ngIf="!bike.isRentable">
              Verleih deaktiviert
            </div>
          </div>

          <!-- Actions -->
          <div class="bike-actions">
            <a [routerLink]="['/mietfahrraeder/edit', bike.id]" class="btn btn-sm btn-outline">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              Bearbeiten
            </a>
            <button
              class="btn btn-sm"
              [class.btn-success]="!bike.isRentable"
              [class.btn-warning]="bike.isRentable"
              (click)="toggleRentable(bike)"
            >
              {{ bike.isRentable ? 'Deaktivieren' : 'Aktivieren' }}
            </button>
          </div>
        </div>
      </div>

      <div class="loading-state" *ngIf="loading()">
        <div class="skeleton" *ngFor="let i of [1,2,3,4,5,6]"></div>
      </div>

      <app-pagination
        *ngIf="paginatedResult && paginatedResult.totalCount > pageSize"
        [currentPage]="currentPage"
        [pageSize]="pageSize"
        [totalCount]="paginatedResult.totalCount"
        [totalPages]="paginatedResult.totalPages"
        [hasPrevious]="paginatedResult.hasPrevious"
        [hasNext]="paginatedResult.hasNext"
        (pageChange)="onPageChange($event)"
        (pageSizeChange)="onPageSizeChange($event)"
      ></app-pagination>
    </div>
  `,
  styles: [`
    .page { max-width: 1400px; margin: 0 auto; animation: fadeIn 0.3s ease; }
    @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }

    .page-header {
      display: flex; justify-content: space-between; align-items: flex-start;
      margin-bottom: 24px; flex-wrap: wrap; gap: 12px;
    }
    .page-header h1 { margin: 0 0 4px; font-size: 1.6rem; font-weight: 800; }
    .page-subtitle { margin: 0; color: var(--text-secondary); font-size: 0.88rem; }

    .filter-bar {
      display: flex; gap: 16px; margin-bottom: 20px; align-items: center; flex-wrap: wrap;
    }
    .filter-group { position: relative; }
    .search-group { flex: 1; min-width: 200px; max-width: 380px; }
    .filter-input {
      width: 100%; padding: 10px 14px; border: 1.5px solid var(--border-color);
      border-radius: 10px; background: var(--bg-card); color: var(--text-primary);
      font-size: 0.88rem; transition: all 0.2s;
    }
    .filter-input:focus { outline: none; border-color: var(--accent-primary); box-shadow: 0 0 0 3px var(--accent-primary-light, rgba(99,102,241,0.08)); }
    .search-input { padding-left: 40px; }
    .search-icon { position: absolute; left: 13px; top: 50%; transform: translateY(-50%); color: var(--text-muted); pointer-events: none; display: flex; }

    .toggle-filter {
      display: flex; align-items: center; gap: 8px; cursor: pointer;
      font-size: 0.88rem; color: var(--text-secondary); user-select: none;
    }
    .toggle-filter input { width: 16px; height: 16px; cursor: pointer; accent-color: var(--accent-primary); }

    .bike-grid {
      display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px;
    }
    .loading-state {
      display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px;
    }
    .skeleton {
      height: 320px; border-radius: 16px;
      background: linear-gradient(90deg, var(--bg-card) 25%, var(--border-light) 50%, var(--bg-card) 75%);
      background-size: 200% 100%; animation: shimmer 1.5s infinite;
    }
    @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }

    .empty-state {
      grid-column: 1/-1; display: flex; flex-direction: column; align-items: center;
      gap: 12px; padding: 4rem 2rem; text-align: center;
      background: var(--bg-card); border: 1px solid var(--border-light); border-radius: 16px;
      color: var(--text-secondary);
    }
    .empty-state svg { opacity: 0.35; }

    .bike-card {
      background: var(--bg-card); border: 1px solid var(--border-light); border-radius: 16px;
      overflow: hidden; transition: border-color 0.2s, box-shadow 0.2s; position: relative;
    }
    .bike-card:hover { border-color: var(--accent-primary); box-shadow: 0 4px 20px rgba(99,102,241,0.1); }

    .rentable-badge {
      position: absolute; top: 10px; right: 10px; z-index: 2;
      padding: 3px 10px; border-radius: 999px; font-size: 0.7rem; font-weight: 700;
      letter-spacing: 0.05em; text-transform: uppercase;
      background: rgba(239,68,68,0.12); color: #ef4444;
    }
    .rentable-badge.active { background: rgba(16,185,129,0.12); color: #10b981; }

    .bike-photos { position: relative; height: 180px; background: var(--bg-primary); overflow: hidden; }
    .photo-img { width: 100%; height: 100%; object-fit: cover; }
    .photo-placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: var(--text-muted); opacity: 0.4; }
    .photo-count {
      position: absolute; bottom: 8px; left: 8px;
      background: rgba(0,0,0,0.65); color: #fff; border-radius: 20px;
      padding: 3px 8px; font-size: 0.72rem; font-weight: 600;
      display: flex; align-items: center; gap: 4px; backdrop-filter: blur(4px);
    }

    .bike-info { padding: 14px 16px 8px; }
    .bike-name { font-size: 1rem; font-weight: 700; color: var(--text-primary); margin-bottom: 6px; }
    .bike-meta { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 10px; }
    .bike-meta span {
      font-size: 0.72rem; padding: 2px 8px; border-radius: 999px;
      background: rgba(255,255,255,0.04); border: 1px solid var(--border-light);
      color: var(--text-secondary);
    }

    .bike-prices { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 4px; }
    .price-pill {
      display: flex; flex-direction: column; align-items: center;
      padding: 4px 8px; border-radius: 8px; min-width: 44px;
      background: rgba(255,255,255,0.03); border: 1px solid var(--border-light);
    }
    .price-pill span { font-size: 0.62rem; color: var(--text-muted); text-transform: uppercase; }
    .price-pill strong { font-size: 0.82rem; color: var(--text-primary); }
    .price-pill.featured { border-color: var(--accent-primary); background: rgba(99,102,241,0.06); }
    .price-pill.featured strong { color: var(--accent-primary); }
    .no-prices { font-size: 0.8rem; color: var(--text-muted); font-style: italic; }

    .bike-actions {
      display: flex; gap: 8px; padding: 10px 16px 14px; flex-wrap: wrap;
    }

    .btn {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 8px 14px; border-radius: 10px; font-size: 0.85rem; font-weight: 600;
      cursor: pointer; border: 1.5px solid transparent; transition: all 0.15s;
      text-decoration: none; white-space: nowrap;
    }
    .btn-sm { padding: 6px 12px; font-size: 0.8rem; }
    .btn-primary { background: var(--accent-primary); color: #fff; border-color: var(--accent-primary); }
    .btn-primary:hover { opacity: 0.88; text-decoration: none; color: #fff; }
    .btn-outline { background: transparent; border-color: var(--border-color); color: var(--text-primary); }
    .btn-outline:hover { border-color: var(--accent-primary); color: var(--accent-primary); text-decoration: none; }
    .btn-success { background: rgba(16,185,129,0.1); border-color: #10b981; color: #10b981; }
    .btn-success:hover { background: rgba(16,185,129,0.2); }
    .btn-warning { background: rgba(245,158,11,0.1); border-color: #f59e0b; color: #f59e0b; }
    .btn-warning:hover { background: rgba(245,158,11,0.2); }
  `]
})
export class MietfahrradListComponent implements OnInit {
  private bicycleService = inject(BicycleService);
  private notificationService = inject(NotificationService);
  private dialogService = inject(DialogService);
  private translationService = inject(TranslationService);

  paginatedResult: PaginatedResult<Bicycle> | null = null;
  loading = signal(true);
  currentPage = 1;
  pageSize = 20;
  searchText = '';
  showOnlyRentable = false;

  get t() { return this.translationService.translations(); }

  ngOnInit() { this.loadBikes(); }

  loadBikes() {
    this.loading.set(true);
    this.bicycleService.getPaginated(
      this.currentPage,
      this.pageSize,
      undefined,
      this.searchText || undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      this.showOnlyRentable ? true : undefined,
    ).subscribe({
      next: (result) => { this.paginatedResult = result; this.loading.set(false); },
      error: () => { this.notificationService.error(this.t.saveError); this.loading.set(false); },
    });
  }

  onSearch() { this.currentPage = 1; this.loadBikes(); }
  onFilterChange() { this.currentPage = 1; this.loadBikes(); }
  onPageChange(page: number) { this.currentPage = page; this.loadBikes(); }
  onPageSizeChange(size: number) { this.pageSize = size; this.currentPage = 1; this.loadBikes(); }

  toggleRentable(bike: Bicycle) {
    const msg = bike.isRentable
      ? 'Verleih für dieses Fahrrad deaktivieren?'
      : 'Verleih für dieses Fahrrad aktivieren?';
    this.dialogService.confirm({ title: this.t.confirm, message: msg }).then(confirmed => {
      if (!confirmed) return;
      const dto = {
        marke: bike.marke,
        modell: bike.modell ?? '',
        rahmennummer: bike.rahmennummer,
        rahmengroesse: bike.rahmengroesse,
        farbe: bike.farbe,
        reifengroesse: bike.reifengroesse,
        fahrradtyp: bike.fahrradtyp,
        art: bike.art,
        beschreibung: bike.beschreibung,
        status: bike.status,
        zustand: bike.zustand,
        isRentable: !bike.isRentable,
        rentalPriceDay1: bike.rentalPriceDay1,
        rentalPriceDay3: bike.rentalPriceDay3,
        rentalPriceDay7: bike.rentalPriceDay7,
        rentalPriceDay14: bike.rentalPriceDay14,
        rentalPriceDay30: bike.rentalPriceDay30,
        rentalPricePerDayFrom10: bike.rentalPricePerDayFrom10,
      };
      this.bicycleService.update(bike.id, dto as any).subscribe({
        next: () => { this.notificationService.success(this.t.saveSuccess); this.loadBikes(); },
        error: () => this.notificationService.error(this.t.saveError),
      });
    });
  }

  getImageUrl(path: string): string {
    return `${environment.apiUrl.replace('/api', '')}/${path}`;
  }
}
