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
import { Bicycle, BikeStatus } from '../../models/models';
import { BicycleService } from '../../services/bicycle.service';

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
            placeholder="Suche nach Marke, Modell, Rahmennummer..."
            class="search-input"
          />
          <div class="id-search">
            <input
              type="text"
              [(ngModel)]="searchId"
              placeholder="Nr"
              class="id-input"
              (keyup.enter)="searchById()"
            />
            <button
              type="button"
              class="btn btn-sm btn-outline"
              (click)="searchById()"
            >
              Nr suchen
            </button>
          </div>
        </div>
        <small *ngIf="searchError" class="error-text">{{ searchError }}</small>
      </div>

      <div class="bike-list">
        <div
          *ngFor="let bike of filteredBikes"
          class="bike-item"
          [class.selected]="selectedBike?.id === bike.id"
          (click)="selectBike(bike)"
        >
          <div class="bike-main">
            <span class="bike-id">#{{ bike.stokNo || bike.id }}</span>
            <span class="bike-brand">{{ bike.marke }} {{ bike.modell }}</span>
            <span class="bike-frame">{{ bike.rahmennummer }}</span>
          </div>
          <div class="bike-details">
            <span class="bike-color">{{ bike.farbe }}</span>
            <span class="bike-type" *ngIf="bike.fahrradtyp">{{
              bike.fahrradtyp
            }}</span>
            <span class="bike-size">{{ bike.reifengroesse }}</span>
          </div>
        </div>
        <p *ngIf="filteredBikes.length === 0" class="empty">
          Keine verfügbaren Fahrräder gefunden
        </p>
      </div>

      <!-- Quick Add Button -->
      <div class="quick-add-row" *ngIf="allowQuickAdd">
        <button
          type="button"
          class="btn btn-outline quick-add-btn"
          (click)="onQuickAdd()"
        >
          ➕ Fahrrad nicht in Liste? Schnell hinzufügen
        </button>
      </div>

      <div class="selected-preview" *ngIf="selectedBike">
        <h4>Ausgewählt:</h4>
        <div class="preview-content">
          <strong>{{ selectedBike.marke }} {{ selectedBike.modell }}</strong>
          <span>Rahmen: {{ selectedBike.rahmennummer }}</span>
          <span
            >Farbe: {{ selectedBike.farbe }} | Reifen:
            {{ selectedBike.reifengroesse }}</span
          >
          <span *ngIf="selectedBike.fahrradtyp"
            >Typ: {{ selectedBike.fahrradtyp }}</span
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
      .id-search {
        display: flex;
        gap: 6px;
      }
      .id-input {
        width: 80px;
        padding: 10px 12px;
        border: 1px solid var(--border-color, #ddd);
        border-radius: 6px;
        font-size: 0.95rem;
        background: var(--bg-input, #fff);
        color: var(--text-primary, #1e293b);
      }
      .error-text {
        color: var(--accent-danger, #dc3545);
        font-size: 0.85rem;
      }
      .bike-list {
        max-height: 300px;
        overflow-y: auto;
        border: 1px solid var(--border-light, #eee);
        border-radius: 8px;
        background: var(--bg-secondary, #fafafa);
      }
      .bike-item {
        padding: 12px 16px;
        border-bottom: 1px solid var(--border-light, #eee);
        cursor: pointer;
        transition: background 0.15s;
        color: var(--text-primary, #1e293b);
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
      .bike-main {
        display: flex;
        gap: 12px;
        align-items: center;
        margin-bottom: 4px;
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
      .bike-details {
        display: flex;
        gap: 16px;
        font-size: 0.85rem;
        color: var(--text-secondary, #666);
        padding-left: 40px;
      }
      .empty {
        padding: 24px;
        text-align: center;
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
    `,
  ],
})
export class BikeSelectorComponent implements OnInit, OnChanges {
  @Input() bikes: Bicycle[] = [];
  @Input() selectedBike: Bicycle | null = null;
  @Input() allowQuickAdd = false;
  @Output() selectedBikeChange = new EventEmitter<Bicycle | null>();
  @Output() bikeSelected = new EventEmitter<Bicycle>();
  @Output() quickAddRequested = new EventEmitter<void>();

  filteredBikes: Bicycle[] = [];
  searchTerm = '';
  searchId = '';
  searchError = '';

  constructor(private readonly bicycleService: BicycleService) {}

  ngOnInit() {
    this.filteredBikes = this.bikes;
  }

  ngOnChanges() {
    this.filterBikes();
  }

  filterBikes() {
    const term = this.searchTerm.toLowerCase();
    this.filteredBikes = this.bikes.filter(
      (b) =>
        b.marke.toLowerCase().includes(term) ||
        b.modell.toLowerCase().includes(term) ||
        (b.rahmennummer && b.rahmennummer.toLowerCase().includes(term)) ||
        (b.stokNo && b.stokNo.toLowerCase().includes(term)) ||
        (b.farbe && b.farbe.toLowerCase().includes(term)) ||
        b.fahrradtyp?.toLowerCase().includes(term),
    );
  }

  selectBike(bike: Bicycle) {
    this.selectedBike = bike;
    this.selectedBikeChange.emit(bike);
    this.bikeSelected.emit(bike);
    this.searchError = '';
  }

  searchById() {
    this.searchError = '';
    const nr = this.searchId?.trim();
    if (!nr) {
      this.searchError = 'Bitte eine gültige Nr eingeben.';
      return;
    }

    // Check if already in list
    const existing = this.bikes.find((b) => b.stokNo === nr);
    if (existing) {
      this.selectBike(existing);
      this.searchId = '';
      this.searchTerm = '';
      this.filterBikes();
      return;
    }

    // Fetch from server by StokNo
    this.bicycleService.getByStokNo(nr).subscribe({
      next: (bike) => {
        if (bike.status === BikeStatus.Sold) {
          this.searchError = `Fahrrad #${nr} ist bereits verkauft.`;
        } else {
          this.bikes.push(bike);
          this.selectBike(bike);
          this.searchId = '';
          this.filterBikes();
        }
      },
      error: () => {
        this.searchError = `Fahrrad mit Nr ${nr} nicht gefunden.`;
      },
    });
  }

  onQuickAdd() {
    this.quickAddRequested.emit();
  }
}
