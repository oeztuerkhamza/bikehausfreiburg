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
          (click)="onBikeCardClick(bike)"
        >
          <!-- Bewusst schlank: Foto, Name, Größe, Startpreis und der Knopf zum
               Hinzufügen. Darunter hing früher ein Detailfeld mit großem Foto
               und der ganzen Preisstaffel — beim Zusammenstellen einer Miete
               wird das nicht gebraucht, es kostete nur einen Klick pro Rad.
               Gesucht wird weiterhin über alle Felder, auch die hier nicht
               angezeigten — siehe filterBikes(). -->
          <div class="bike-main-row">
            <div class="bike-thumb">
              <img
                *ngIf="getListImage(bike) as listImage; else noThumb"
                [src]="getImageUrl(listImage.filePath)"
                [alt]="bike.marke + ' ' + bike.modell"
                loading="lazy"
              />
              <ng-template #noThumb>
                <span class="thumb-empty">🚲</span>
              </ng-template>
            </div>
            <span class="bike-brand">{{ bike.marke }} {{ bike.modell }}</span>
            <span class="bike-size" *ngIf="bike.rahmengroesse">
              Size {{ bike.rahmengroesse }}
            </span>
            <div
              class="start-price"
              *ngIf="getStartingPrice(bike) as startPrice"
            >
              ab {{ startPrice | number: '1.0-0' }} €
            </div>
            <!-- Nur wo die Auswahl bestätigt werden muss (Mietvertrag): sonst
                 wählt der Klick auf die Zeile das Rad direkt aus. -->
            <button
              *ngIf="requireConfirmSelection"
              type="button"
              class="btn btn-primary row-add-btn"
              (click)="addBike(bike, $event)"
              [disabled]="addingBikeId === bike.id"
            >
              {{ addingBikeId === bike.id ? '...' : 'Ekle' }}
            </button>
          </div>
        </div>

        <p *ngIf="filteredBikes.length === 0" class="empty">
          {{ t.noAvailableBikes }}
        </p>
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
      /* Mit Vorschaubild ist eine Zeile ~64px hoch — Höhe angehoben, damit
         weiterhin mehrere Räder gleichzeitig sichtbar sind. */
      .bike-list {
        max-height: 420px;
        overflow-y: auto;
        border: 1px solid var(--border-light, #eee);
        border-radius: 8px;
        background: var(--bg-secondary, #fafafa);
      }
      .bike-list.compact-list {
        max-height: 380px;
      }
      .bike-item {
        padding: 8px 12px;
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
      .bike-main-row {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .bike-thumb {
        flex: 0 0 auto;
        width: 64px;
        height: 48px;
        border-radius: 6px;
        overflow: hidden;
        background: var(--bg-secondary, #f1f5f9);
        border: 1px solid var(--border-light, #e5e7eb);
        display: grid;
        place-items: center;
      }
      .bike-thumb img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .thumb-empty {
        font-size: 1.1rem;
        opacity: 0.4;
      }
      .bike-brand {
        flex: 1 1 auto;
        min-width: 0;
        font-weight: 600;
        color: var(--text-primary, #1a1a2e);
        overflow-wrap: anywhere;
      }
      .bike-size {
        flex: 0 0 auto;
        border: 1px solid var(--border-light, #e5e7eb);
        border-radius: 999px;
        padding: 2px 8px;
        font-size: 0.75rem;
        color: var(--text-secondary, #64748b);
        white-space: nowrap;
      }
      .start-price {
        flex: 0 0 auto;
        font-size: 0.85rem;
        font-weight: 700;
        color: #059669;
        white-space: nowrap;
      }
      .empty {
        padding: 24px;
        text-align: center;
        color: var(--text-muted, #888);
      }
      /* Textblock darf schrumpfen, damit lange Namen umbrechen statt zu
         überlaufen (sonst kippt das ganze Panel horizontal). */
      /* Grid-Spalten dürfen schrumpfen (min-width:auto würde sonst überlaufen). */
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
      /* Der Knopf sitzt am rechten Rand der Zeile und bleibt dort auch, wenn
         Name oder Größe lang werden — deshalb kein Schrumpfen. */
      .row-add-btn {
        flex: 0 0 auto;
        margin-left: auto;
        min-width: 72px;
        padding: 6px 14px;
        font-size: 0.85rem;
      }
      @media (max-width: 900px) {
        .row-add-btn {
          min-width: 64px;
          padding: 6px 10px;
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
  /** Id des Rades, dessen Stammdaten gerade nachgeladen werden (Knopf sperren). */
  addingBikeId: number | null = null;
  /** Für welches vorgegebene Rad die vollen Stammdaten schon geholt wurden. */
  private detailsLoadedForId: number | null = null;
  searchTerm = '';
  searchError = '';
  selectedBrand = '';
  selectedArt = '';
  selectedFrameSize = '';
  selectedWheelSize = '';

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
    this.filteredBikes = this.sortAlphabetically(this.bikes);
    this.ensureSelectedBikeDetails();
  }

  ngOnChanges() {
    this.filterBikes();
    this.ensureSelectedBikeDetails();
  }

  /**
   * Ein von außen vorgegebenes Rad (etwa beim Bearbeiten eines bestehenden
   * Mietvertrags) stammt aus einer Sammelabfrage und trägt Fotos und
   * Preisstaffel nicht vollständig. Einmal nachladen und nach oben melden,
   * damit das Formular mit denselben Daten rechnet wie nach einem "Ekle".
   * Vorher tat das das Detailfeld beim Öffnen; das Feld ist weg, die Aufgabe
   * bleibt.
   *
   * `detailsLoadedForId` verhindert die Endlosschleife: das Melden nach oben
   * löst wieder ngOnChanges aus.
   */
  private ensureSelectedBikeDetails() {
    const selected = this.selectedBike;
    if (!selected || this.detailsLoadedForId === selected.id) return;

    this.detailsLoadedForId = selected.id;
    this.bicycleService.getById(selected.id).subscribe({
      next: (fullBike) => {
        if (this.selectedBike?.id !== fullBike.id) return;
        this.selectedBike = fullBike;
        this.selectedBikeChange.emit(fullBike);
      },
      error: () => {
        // Dann bleibt es bei den Listendaten.
      },
    });
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

    this.filteredBikes = this.sortAlphabetically(this.filteredBikes);
  }

  /**
   * Alphabetisch nach Marke, dann Modell, zuletzt nach Bestandsnummer.
   *
   * Die Bestandsnummer steckt vorne in der Marke ("39 - Ideal", "E14 - IDEAL")
   * und muss beim Vergleich weg: als Text sortiert sie 1, 10, 11, …, 2 und
   * reißt damit dieselbe Marke auseinander. Sie bleibt aber als letztes
   * Kriterium erhalten, damit gleiche Modelle als 36, 37, 38 erscheinen und
   * nicht in Zufallsreihenfolge. Sortiert wird hier in der Liste — die
   * Reihenfolge vom Server hängt an der Verfügbarkeitsabfrage, und im
   * Bearbeiten-Modus werden Räder nachträglich angehängt.
   */
  private sortAlphabetically(list: Bicycle[]): Bicycle[] {
    return [...list].sort(
      (a, b) =>
        this.brandSortKey(a.marke).localeCompare(this.brandSortKey(b.marke), 'de') ||
        (a.modell || '').localeCompare(b.modell || '', 'de', {
          sensitivity: 'base',
        }) ||
        this.stockNumber(a) - this.stockNumber(b),
    );
  }

  /** Marke ohne vorangestellte Bestandsnummer, klein geschrieben. */
  private brandSortKey(marke: string | undefined): string {
    return (marke || '')
      .replace(/^\s*[A-Za-z]?\d+\s*[-–]\s*/, '')
      .trim()
      .toLowerCase();
  }

  /** Bestandsnummer aus der Marke; fällt auf Lagernummer bzw. Id zurück. */
  private stockNumber(bike: Bicycle): number {
    const match = /^\s*[A-Za-z]?(\d+)/.exec(bike.marke || '');
    if (match) return Number(match[1]);
    return bike.lagernummer ?? bike.id;
  }

  onBikeCardClick(bike: Bicycle) {
    // Wo die Auswahl bestätigt werden muss, wählt der Klick auf die Zeile
    // nichts aus — dafür ist der "Ekle"-Knopf da. Sonst wäre ein Rad mit einem
    // versehentlichen Klick im Mietvertrag.
    if (this.requireConfirmSelection) return;
    this.selectBike(bike);
  }

  /**
   * Rad aus der Zeile heraus übernehmen.
   *
   * Lädt vorher die vollen Stammdaten nach: die Liste kommt aus einer
   * Sammelabfrage und trägt z.B. Fotos und Preisstaffel nicht vollständig. Vor
   * dem Umbau tat das Detailfeld dasselbe, bevor sein Knopf das Rad übernahm —
   * ohne diesen Schritt käme im Mietvertrag ein Rad ohne Preise an.
   */
  addBike(bike: Bicycle, event: Event) {
    event.stopPropagation();
    if (this.addingBikeId === bike.id) return;

    this.addingBikeId = bike.id;
    this.bicycleService.getById(bike.id).subscribe({
      next: (fullBike) => {
        this.addingBikeId = null;
        this.detailsLoadedForId = fullBike.id;
        this.selectBike(fullBike);
      },
      error: () => {
        // Nachladen fehlgeschlagen: dann eben mit den Listendaten, das ist
        // besser als ein Knopf, der nichts tut.
        this.addingBikeId = null;
        this.selectBike(bike);
      },
    });
  }

  getBikeArt(bike: Bicycle): string {
    return bike.art || bike.fahrradtyp || '';
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

  /** Vorschaubild für die Zeile: das erste Foto in Sortierreihenfolge. */
  getListImage(bike: Bicycle) {
    return (
      [...(bike.images || [])].sort(
        (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0),
      )[0] ?? null
    );
  }

  getImageUrl(path: string): string {
    const normalizedPath = path.startsWith('/') ? path.substring(1) : path;
    return `${environment.apiUrl}/public/gallery-image/${normalizedPath}`;
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
