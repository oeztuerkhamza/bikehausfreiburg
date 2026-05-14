import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnInit,
  OnChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Bicycle } from '../../models/models';
import { BicycleService } from '../../services/bicycle.service';
import { TranslationService } from '../../services/translation.service';
import { environment } from '../../../environments/environment';
import { getConfiguredRentalPriceLines } from '../../utils/rental-pricing';

@Component({
  selector: 'app-bike-selector',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="bike-selector">
      <div class="selector-header">
        <div class="search-box">
          <input
            type="text"
            [(ngModel)]="searchTerm"
            (input)="filterBikes()"
            [placeholder]="t.bikeSelectorPlaceholder"
            class="search-input"
          />
        </div>

        <div class="filters" *ngIf="enableAdvancedFilters">
          <select
            class="filter-select"
            [(ngModel)]="selectedBrand"
            (ngModelChange)="filterBikes()"
          >
            <option value="">Marke (alle)</option>
            <option *ngFor="let item of brandOptions" [value]="item">
              {{ item }}
            </option>
          </select>

          <select
            class="filter-select"
            [(ngModel)]="selectedArt"
            (ngModelChange)="filterBikes()"
          >
            <option value="">Fahrrad Art (alle)</option>
            <option *ngFor="let item of artOptions" [value]="item">
              {{ item }}
            </option>
          </select>

          <select
            class="filter-select"
            [(ngModel)]="selectedFrameSize"
            (ngModelChange)="filterBikes()"
          >
            <option value="">Size (alle)</option>
            <option *ngFor="let item of frameSizeOptions" [value]="item">
              {{ item }}
            </option>
          </select>

          <select
            class="filter-select"
            [(ngModel)]="selectedWheelSize"
            (ngModelChange)="filterBikes()"
          >
            <option value="">Reifen Größe (alle)</option>
            <option *ngFor="let item of wheelSizeOptions" [value]="item">
              {{ item }}
            </option>
          </select>
        </div>

        <small *ngIf="searchError" class="error-text">{{ searchError }}</small>
      </div>

      <div class="bike-list" [class.compact-list]="!enableAdvancedFilters">
        <div
          *ngFor="let bike of filteredBikes"
          class="bike-item"
          [class.selected]="selectedBike?.id === bike.id"
          [class.active-detail]="activeBike?.id === bike.id"
          (click)="onBikeCardClick(bike)"
        >
          <div class="bike-main-row">
            <div class="bike-main">
              <span class="bike-id">#{{ bike.id }}</span>
              <span class="bike-brand">{{ bike.marke }} {{ bike.modell }}</span>
              <span class="bike-frame" *ngIf="bike.rahmennummer">{{
                bike.rahmennummer
              }}</span>
            </div>
            <div
              class="start-price"
              *ngIf="getStartingPrice(bike) as startPrice"
            >
              ab {{ startPrice | number: '1.0-0' }} €
            </div>
          </div>

          <div class="bike-details">
            <span class="chip" *ngIf="bike.marke">{{ bike.marke }}</span>
            <span class="chip" *ngIf="getBikeArt(bike)">{{
              getBikeArt(bike)
            }}</span>
            <span class="chip" *ngIf="bike.rahmengroesse"
              >Size {{ bike.rahmengroesse }}</span
            >
            <span class="chip" *ngIf="bike.reifengroesse"
              >{{ bike.reifengroesse }}"</span
            >
          </div>
        </div>

        <p *ngIf="filteredBikes.length === 0" class="empty">
          {{ t.noAvailableBikes }}
        </p>
      </div>

      <div class="bike-detail-panel" *ngIf="activeBike">
        <div class="detail-header">
          <div>
            <h4>{{ activeBike.marke }} {{ activeBike.modell }}</h4>
            <p>
              <span *ngIf="getBikeArt(activeBike)">{{
                getBikeArt(activeBike)
              }}</span>
              <span *ngIf="activeBike.rahmengroesse">
                · Size {{ activeBike.rahmengroesse }}</span
              >
              <span *ngIf="activeBike.reifengroesse">
                · {{ activeBike.reifengroesse }}"</span
              >
            </p>
          </div>

          <button
            type="button"
            class="btn btn-primary add-btn"
            (click)="confirmActiveBikeSelection()"
            [disabled]="activeBikeLoading"
          >
            Ekle
          </button>
        </div>

        <div class="detail-loading" *ngIf="activeBikeLoading">
          Detaylar yukleniyor...
        </div>

        <div class="detail-grid" *ngIf="!activeBikeLoading">
          <div class="photo-column">
            <div
              class="main-photo"
              *ngIf="getMainImage(activeBike) as mainImage; else noImage"
            >
              <img
                [src]="getImageUrl(mainImage.filePath)"
                [alt]="activeBike.marke + ' ' + activeBike.modell"
              />
            </div>
            <ng-template #noImage>
              <div class="photo-placeholder">Foto yok</div>
            </ng-template>

            <div class="thumbs" *ngIf="getBikeImages(activeBike).length > 1">
              <button
                type="button"
                class="thumb"
                *ngFor="let img of getBikeImages(activeBike); let i = index"
                [class.active]="selectedImageIndex[activeBike.id] === i"
                (click)="selectImage(activeBike.id, i)"
              >
                <img [src]="getImageUrl(img.filePath)" alt="bike" />
              </button>
            </div>
          </div>

          <div class="price-column">
            <h5>Gunluk fiyatlar</h5>
            <div
              class="price-lines"
              *ngIf="getPriceLines(activeBike).length > 0; else noPricing"
            >
              <div
                class="price-line"
                *ngFor="let line of getPriceLines(activeBike)"
              >
                <span>{{ line.label }}</span>
                <strong>{{ line.price | number: '1.0-0' }} €</strong>
              </div>
              <div
                class="price-line"
                *ngIf="activeBike.rentalPriceAdditionalDayAfter7 != null"
              >
                <span>Ab Tag 8 (+1)</span>
                <strong
                  >{{
                    activeBike.rentalPriceAdditionalDayAfter7 | number: '1.0-0'
                  }}
                  €</strong
                >
              </div>
            </div>

            <ng-template #noPricing>
              <div class="no-prices">Bu bisiklet icin fiyat tanimi yok.</div>
            </ng-template>
          </div>
        </div>
      </div>

      <div class="quick-add-row" *ngIf="allowQuickAdd">
        <button
          type="button"
          class="btn btn-outline quick-add-btn"
          (click)="onQuickAdd()"
        >
          ➕ {{ t.quickAddBike }}
        </button>
      </div>

      <div class="selected-preview" *ngIf="selectedBike">
        <h4>{{ t.selectedColon }}</h4>
        <div class="preview-content">
          <strong>{{ selectedBike.marke }} {{ selectedBike.modell }}</strong>
          <span>{{ t.frameColon }} {{ selectedBike.rahmennummer }}</span>
          <span
            >{{ t.colorColon }} {{ selectedBike.farbe }} | {{ t.wheelsColon }}
            {{ selectedBike.reifengroesse }}</span
          >
          <span *ngIf="selectedBike.fahrradtyp"
            >{{ t.typeColon }} {{ selectedBike.fahrradtyp }}</span
          >
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .bike-selector {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .selector-header {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .search-box {
        display: flex;
        gap: 12px;
        flex-wrap: wrap;
      }
      .search-input {
        flex: 1;
        min-width: 200px;
        padding: 10px 12px;
        border: 1px solid var(--border-color, #ddd);
        border-radius: 6px;
        font-size: 0.95rem;
        background: var(--bg-input, #fff);
        color: var(--text-primary, #1e293b);
      }
      .filters {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        gap: 8px;
      }
      .filter-select {
        padding: 9px 10px;
        border: 1px solid var(--border-color, #ddd);
        border-radius: 6px;
        background: var(--bg-input, #fff);
        color: var(--text-primary, #1e293b);
        font-size: 0.88rem;
      }
      .error-text {
        color: var(--accent-danger, #dc3545);
        font-size: 0.85rem;
      }
      .bike-list {
        max-height: 320px;
        overflow-y: auto;
        border: 1px solid var(--border-light, #eee);
        border-radius: 8px;
        background: var(--bg-secondary, #fafafa);
      }
      .bike-list.compact-list {
        max-height: 260px;
      }
      .bike-item {
        padding: 12px 16px;
        border-bottom: 1px solid var(--border-light, #eee);
        cursor: pointer;
        transition:
          background 0.15s,
          border-color 0.15s;
        color: var(--text-primary, #1e293b);
        border-left: 3px solid transparent;
      }
      .bike-item:last-child {
        border-bottom: none;
      }
      .bike-item:hover {
        background: var(--accent-primary-light, #f0f7ff);
      }
      .bike-item.selected {
        background: var(--accent-primary-light, #e3f2fd);
        border-left: 3px solid var(--accent-primary, #2196f3);
      }
      .bike-item.active-detail {
        border-left-color: #0ea5e9;
      }
      .bike-main-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 8px;
      }
      .bike-main {
        display: flex;
        gap: 12px;
        align-items: center;
        margin-bottom: 4px;
        flex-wrap: wrap;
      }
      .bike-id {
        font-size: 0.8rem;
        color: var(--text-muted, #888);
        font-weight: 600;
      }
      .bike-brand {
        font-weight: 600;
        color: var(--text-primary, #1a1a2e);
      }
      .bike-frame {
        font-family: monospace;
        font-size: 0.85rem;
        color: var(--text-secondary, #555);
      }
      .start-price {
        font-size: 0.8rem;
        font-weight: 700;
        color: #059669;
      }
      .bike-details {
        display: flex;
        gap: 8px;
        font-size: 0.85rem;
        color: var(--text-secondary, #666);
        padding-left: 0;
        flex-wrap: wrap;
      }
      .chip {
        display: inline-flex;
        align-items: center;
        border: 1px solid var(--border-light, #e5e7eb);
        border-radius: 999px;
        font-size: 0.75rem;
        padding: 2px 8px;
      }
      .empty {
        padding: 24px;
        text-align: center;
        color: var(--text-muted, #888);
      }
      .bike-detail-panel {
        border: 1px solid var(--border-light, #e5e7eb);
        border-radius: 10px;
        padding: 12px;
        background: var(--bg-secondary, #fafafa);
      }
      .detail-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 12px;
        margin-bottom: 10px;
      }
      .detail-header h4 {
        margin: 0;
        font-size: 1rem;
      }
      .detail-header p {
        margin: 3px 0 0;
        font-size: 0.85rem;
        color: var(--text-secondary, #555);
      }
      .detail-loading {
        font-size: 0.88rem;
        color: var(--text-secondary, #555);
      }
      .detail-grid {
        display: grid;
        grid-template-columns: 1.2fr 1fr;
        gap: 12px;
      }
      .photo-column {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .main-photo {
        border-radius: 8px;
        overflow: hidden;
        border: 1px solid var(--border-light, #e5e7eb);
        background: #f1f5f9;
        aspect-ratio: 16/10;
      }
      .main-photo img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .photo-placeholder {
        min-height: 180px;
        display: grid;
        place-items: center;
        color: var(--text-muted, #888);
        border: 1px dashed var(--border-color, #cbd5e1);
        border-radius: 8px;
      }
      .thumbs {
        display: flex;
        gap: 6px;
        overflow-x: auto;
      }
      .thumb {
        border: 2px solid transparent;
        border-radius: 6px;
        padding: 0;
        overflow: hidden;
        width: 72px;
        height: 54px;
        cursor: pointer;
        background: transparent;
      }
      .thumb.active {
        border-color: var(--accent-primary, #2563eb);
      }
      .thumb img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .price-column h5 {
        margin: 0 0 8px;
        font-size: 0.9rem;
      }
      .price-lines {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .price-line {
        display: flex;
        align-items: center;
        justify-content: space-between;
        border: 1px solid var(--border-light, #e5e7eb);
        border-radius: 8px;
        padding: 7px 10px;
        font-size: 0.85rem;
        background: #fff;
      }
      .price-line strong {
        color: #0f766e;
      }
      .no-prices {
        font-size: 0.85rem;
        color: var(--text-muted, #888);
      }
      .selected-preview {
        background: var(--bg-success, #e8f5e9);
        border-radius: 8px;
        padding: 12px 16px;
        border: 1px solid var(--border-success, #a5d6a7);
      }
      .selected-preview h4 {
        margin: 0 0 8px;
        font-size: 0.9rem;
        color: var(--text-success, #2e7d32);
      }
      .preview-content {
        display: flex;
        flex-direction: column;
        gap: 4px;
        font-size: 0.9rem;
        color: var(--text-primary, #1a1a2e);
      }
      .preview-content strong {
        color: var(--text-primary, #1a1a2e);
      }
      .quick-add-row {
        margin-top: 12px;
        text-align: center;
      }
      .quick-add-btn {
        width: 100%;
        padding: 12px;
        border-style: dashed;
        color: var(--accent-primary, #6366f1);
      }
      .quick-add-btn:hover {
        background: var(--accent-primary-light, rgba(99, 102, 241, 0.1));
      }
      @media (max-width: 900px) {
        .detail-grid {
          grid-template-columns: 1fr;
        }
        .add-btn {
          min-width: 90px;
        }
      }
    `,
  ],
})
export class BikeSelectorComponent implements OnInit, OnChanges {
  @Input() bikes: Bicycle[] = [];
  @Input() selectedBike: Bicycle | null = null;
  @Input() allowQuickAdd = false;
  @Input() enableAdvancedFilters = false;
  @Input() requireConfirmSelection = false;
  @Output() selectedBikeChange = new EventEmitter<Bicycle | null>();
  @Output() bikeSelected = new EventEmitter<Bicycle>();
  @Output() quickAddRequested = new EventEmitter<void>();

  filteredBikes: Bicycle[] = [];
  activeBike: Bicycle | null = null;
  activeBikeLoading = false;
  searchTerm = '';
  searchError = '';
  selectedBrand = '';
  selectedArt = '';
  selectedFrameSize = '';
  selectedWheelSize = '';
  selectedImageIndex: Record<number, number> = {};

  constructor(
    private readonly bicycleService: BicycleService,
    private readonly translationService: TranslationService,
  ) {}

  get t() {
    return this.translationService.translations();
  }

  get brandOptions(): string[] {
    return this.uniqueSorted(this.bikes.map((b) => b.marke));
  }

  get artOptions(): string[] {
    return this.uniqueSorted(this.bikes.map((b) => this.getBikeArt(b)));
  }

  get frameSizeOptions(): string[] {
    return this.uniqueSorted(this.bikes.map((b) => b.rahmengroesse || ''));
  }

  get wheelSizeOptions(): string[] {
    return this.uniqueSorted(this.bikes.map((b) => b.reifengroesse || ''));
  }

  ngOnInit() {
    this.filteredBikes = this.bikes;
    if (this.selectedBike) {
      this.activeBike = this.selectedBike;
      this.ensureActiveBikeDetails(this.selectedBike);
    }
  }

  ngOnChanges() {
    this.filterBikes();
    if (this.selectedBike && !this.activeBike) {
      this.activeBike = this.selectedBike;
      this.ensureActiveBikeDetails(this.selectedBike);
    }
  }

  filterBikes() {
    const term = this.searchTerm.toLowerCase();

    this.filteredBikes = this.bikes.filter(
      (b) =>
        (b.marke || '').toLowerCase().includes(term) ||
        (b.modell || '').toLowerCase().includes(term) ||
        (b.rahmennummer || '').toLowerCase().includes(term) ||
        (b.farbe || '').toLowerCase().includes(term) ||
        (b.fahrradtyp || '').toLowerCase().includes(term) ||
        (b.art || '').toLowerCase().includes(term),
    );

    if (this.selectedBrand) {
      this.filteredBikes = this.filteredBikes.filter(
        (b) => b.marke === this.selectedBrand,
      );
    }

    if (this.selectedArt) {
      this.filteredBikes = this.filteredBikes.filter(
        (b) => this.getBikeArt(b) === this.selectedArt,
      );
    }

    if (this.selectedFrameSize) {
      this.filteredBikes = this.filteredBikes.filter(
        (b) => (b.rahmengroesse || '') === this.selectedFrameSize,
      );
    }

    if (this.selectedWheelSize) {
      this.filteredBikes = this.filteredBikes.filter(
        (b) => (b.reifengroesse || '') === this.selectedWheelSize,
      );
    }

    if (
      this.activeBike &&
      !this.filteredBikes.some((item) => item.id === this.activeBike?.id)
    ) {
      this.activeBike = null;
      this.activeBikeLoading = false;
    }
  }

  onBikeCardClick(bike: Bicycle) {
    this.activeBike = bike;

    if (this.requireConfirmSelection) {
      this.ensureActiveBikeDetails(bike);
      return;
    }

    this.selectBike(bike);
  }

  confirmActiveBikeSelection() {
    if (!this.activeBike) return;
    this.selectBike(this.activeBike);
  }

  private ensureActiveBikeDetails(bike: Bicycle) {
    this.activeBikeLoading = true;
    this.bicycleService.getById(bike.id).subscribe({
      next: (fullBike) => {
        this.activeBike = fullBike;
        if (this.selectedBike?.id === fullBike.id) {
          this.selectedBike = fullBike;
          this.selectedBikeChange.emit(fullBike);
        }
        if (this.selectedImageIndex[fullBike.id] == null) {
          this.selectedImageIndex[fullBike.id] = 0;
        }
        this.activeBikeLoading = false;
      },
      error: () => {
        if (this.selectedImageIndex[bike.id] == null) {
          this.selectedImageIndex[bike.id] = 0;
        }
        this.activeBikeLoading = false;
      },
    });
  }

  getBikeArt(bike: Bicycle): string {
    return bike.art || bike.fahrradtyp || '';
  }

  getPriceLines(bike: Bicycle) {
    return getConfiguredRentalPriceLines(bike);
  }

  getStartingPrice(bike: Bicycle): number | null {
    const values = [
      bike.rentalPriceDay1,
      bike.rentalPriceDay2,
      bike.rentalPriceDay3,
      bike.rentalPriceDay4,
      bike.rentalPriceDay5,
      bike.rentalPriceDay6,
      bike.rentalPriceDay7,
      bike.rentalPriceAdditionalDayAfter7,
    ].filter((value): value is number => value != null);

    if (values.length === 0) return null;
    return Math.min(...values);
  }

  getBikeImages(bike: Bicycle) {
    return [...(bike.images || [])].sort(
      (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0),
    );
  }

  getMainImage(bike: Bicycle) {
    const images = this.getBikeImages(bike);
    if (images.length === 0) return null;

    const index = this.selectedImageIndex[bike.id] ?? 0;
    return images[Math.max(0, Math.min(index, images.length - 1))];
  }

  selectImage(bikeId: number, index: number) {
    this.selectedImageIndex[bikeId] = index;
  }

  getImageUrl(path: string): string {
    const baseUrl = environment.apiUrl.replace('/api', '');
    const normalizedPath = path.startsWith('/') ? path.substring(1) : path;
    return `${baseUrl}/${normalizedPath}`;
  }

  private uniqueSorted(values: string[]): string[] {
    return Array.from(new Set(values.filter((item) => !!item))).sort((a, b) =>
      a.localeCompare(b, 'de'),
    );
  }

  selectBike(bike: Bicycle) {
    this.selectedBike = bike;
    this.selectedBikeChange.emit(bike);
    this.bikeSelected.emit(bike);
    this.searchError = '';
  }

  onQuickAdd() {
    this.quickAddRequested.emit();
  }
}
