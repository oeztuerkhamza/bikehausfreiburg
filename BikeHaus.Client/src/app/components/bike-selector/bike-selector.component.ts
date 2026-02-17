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
              placeholder="ID"
              class="id-input"
              (keyup.enter)="searchById()"
            />
            <button
              type="button"
              class="btn btn-sm btn-outline"
              (click)="searchById()"
            >
              ID suchen
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
            <span class="bike-id">#{{ bike.id }}</span>
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
        border: 1px solid #ddd;
        border-radius: 6px;
        font-size: 0.95rem;
      }
      .id-search {
        display: flex;
        gap: 6px;
      }
      .id-input {
        width: 80px;
        padding: 10px 12px;
        border: 1px solid #ddd;
        border-radius: 6px;
        font-size: 0.95rem;
      }
      .error-text {
        color: #dc3545;
        font-size: 0.85rem;
      }
      .bike-list {
        max-height: 300px;
        overflow-y: auto;
        border: 1px solid #eee;
        border-radius: 8px;
        background: #fafafa;
      }
      .bike-item {
        padding: 12px 16px;
        border-bottom: 1px solid #eee;
        cursor: pointer;
        transition: background 0.15s;
      }
      .bike-item:last-child {
        border-bottom: none;
      }
      .bike-item:hover {
        background: #f0f7ff;
      }
      .bike-item.selected {
        background: #e3f2fd;
        border-left: 3px solid #2196f3;
      }
      .bike-main {
        display: flex;
        gap: 12px;
        align-items: center;
        margin-bottom: 4px;
      }
      .bike-id {
        font-size: 0.8rem;
        color: #888;
        font-weight: 600;
      }
      .bike-brand {
        font-weight: 600;
        color: #1a1a2e;
      }
      .bike-frame {
        font-family: monospace;
        font-size: 0.85rem;
        color: #555;
      }
      .bike-details {
        display: flex;
        gap: 16px;
        font-size: 0.85rem;
        color: #666;
        padding-left: 40px;
      }
      .empty {
        padding: 24px;
        text-align: center;
        color: #888;
      }
      .selected-preview {
        background: #e8f5e9;
        border-radius: 8px;
        padding: 12px 16px;
      }
      .selected-preview h4 {
        margin: 0 0 8px;
        font-size: 0.9rem;
        color: #2e7d32;
      }
      .preview-content {
        display: flex;
        flex-direction: column;
        gap: 4px;
        font-size: 0.9rem;
      }
    `,
  ],
})
export class BikeSelectorComponent implements OnInit, OnChanges {
  @Input() bikes: Bicycle[] = [];
  @Input() selectedBike: Bicycle | null = null;
  @Output() selectedBikeChange = new EventEmitter<Bicycle | null>();
  @Output() bikeSelected = new EventEmitter<Bicycle>();

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
        b.rahmennummer.toLowerCase().includes(term) ||
        b.farbe.toLowerCase().includes(term) ||
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
    const id = Number.parseInt(this.searchId, 10);
    if (!id || Number.isNaN(id)) {
      this.searchError = 'Bitte eine gültige ID eingeben.';
      return;
    }

    // Check if already in list
    const existing = this.bikes.find((b) => b.id === id);
    if (existing) {
      this.selectBike(existing);
      this.searchId = '';
      this.searchTerm = '';
      this.filterBikes();
      return;
    }

    // Fetch from server
    this.bicycleService.getById(id).subscribe({
      next: (bike) => {
        if (bike.status === BikeStatus.Sold) {
          this.searchError = `Fahrrad #${id} ist bereits verkauft.`;
        } else {
          this.bikes.push(bike);
          this.selectBike(bike);
          this.searchId = '';
          this.filterBikes();
        }
      },
      error: () => {
        this.searchError = `Fahrrad mit ID ${id} nicht gefunden.`;
      },
    });
  }
}
