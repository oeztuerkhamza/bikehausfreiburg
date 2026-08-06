import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { BicycleService } from '../../services/bicycle.service';
import { Bicycle } from '../../models/models';
import { environment } from '../../../environments/environment';
import { calculateRentalPrice } from '../../utils/rental-pricing';

/**
 * Verfügbarkeitssuche für den Verleih.
 *
 * Beantwortet die Frage "welche Mietfahrräder sind in diesem Zeitraum frei?" —
 * gedacht für den Laden, wenn ein Kunde anruft. Die Belegungslogik liegt bewusst
 * im Backend (`/bicycles/available-for-period`): dort werden aktive Mietverträge
 * UND bestätigte Online-Buchungen berücksichtigt, Zubehör-Pseudoräder gefiltert
 * und Kinderräder als Pool-Anzeigen immer als frei behandelt.
 *
 * Suche und Filter laufen rein clientseitig auf dem Ergebnis — die Trefferzahl
 * ist klein (Verleihbestand), das spart Requests beim Tippen.
 */
@Component({
  selector: 'app-rental-availability',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1>Verfügbarkeit</h1>
          <p class="page-subtitle">
            Welche Mietfahrräder sind in einem Zeitraum frei?
          </p>
        </div>
        <a routerLink="/rentals/new" class="btn btn-primary">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Neuer Mietvertrag
        </a>
      </div>

      <!-- Zeitraum -->
      <div class="date-bar">
        <div class="date-field">
          <label for="start">Von</label>
          <input
            id="start"
            type="date"
            class="filter-input"
            [(ngModel)]="startDate"
            (change)="onDatesChange()"
          />
        </div>
        <div class="date-field">
          <label for="end">Bis</label>
          <input
            id="end"
            type="date"
            class="filter-input"
            [(ngModel)]="endDate"
            (change)="onDatesChange()"
          />
        </div>
        <div class="days-badge" *ngIf="days() > 0">
          {{ days() }} {{ days() === 1 ? 'Tag' : 'Tage' }}
        </div>
        <!-- Setzen die Dauer ab dem gewählten Startdatum. -->
        <div class="quick-picks">
          <button class="chip" (click)="quickPick(1)">1 Tag</button>
          <button class="chip" (click)="quickPick(2)">2 Tage</button>
          <button class="chip" (click)="quickPick(3)">3 Tage</button>
          <button class="chip" (click)="quickPick(7)">1 Woche</button>
          <button class="chip" (click)="quickWeekend()">Wochenende</button>
        </div>
      </div>

      <p class="date-error" *ngIf="dateError()">⚠️ {{ dateError() }}</p>

      <!-- Suche + Filter -->
      <div class="filters">
        <div class="search-group">
          <input
            type="text"
            class="filter-input search-input"
            [(ngModel)]="searchText"
            placeholder="Suchen…"
          />
          <span class="search-icon">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>
        </div>

        <!-- Kurze Platzhalter statt "Alle Rahmengrößen": die langen Labels
             haben die Selects auf schmalen Displays aus dem Layout gedrückt. -->
        <div class="filter-grid">
          <select
            class="filter-input"
            aria-label="Typ"
            [class.set]="filterTyp"
            [(ngModel)]="filterTyp"
          >
            <option value="">Typ</option>
            <option *ngFor="let o of typOptions()" [value]="o">{{ o }}</option>
          </select>

          <select
            class="filter-input"
            aria-label="Marke"
            [class.set]="filterMarke"
            [(ngModel)]="filterMarke"
          >
            <option value="">Marke</option>
            <option *ngFor="let o of markeOptions()" [value]="o">{{ o }}</option>
          </select>

          <select
            class="filter-input"
            aria-label="Rahmengröße"
            [class.set]="filterRahmen"
            [(ngModel)]="filterRahmen"
          >
            <option value="">Rahmen</option>
            <option *ngFor="let o of rahmenOptions()" [value]="o">{{ o }}</option>
          </select>

          <select
            class="filter-input"
            aria-label="Reifengröße"
            [class.set]="filterReifen"
            [(ngModel)]="filterReifen"
          >
            <option value="">Reifen</option>
            <option *ngFor="let o of reifenOptions()" [value]="o">
              {{ o }}"
            </option>
          </select>
        </div>

        <button
          class="btn-reset"
          *ngIf="hasActiveFilters()"
          (click)="resetFilters()"
        >
          ✕ Filter zurücksetzen
        </button>
      </div>

      <!-- Zusammenfassung -->
      <div class="summary" *ngIf="!loading() && !error()">
        <strong>{{ filtered().length }}</strong>
        von {{ bikes().length }} freien Rädern
        <span *ngIf="hasActiveFilters()">(gefiltert)</span>
      </div>

      <!-- Zustände -->
      <div class="state-box" *ngIf="loading()">
        <div class="spinner"></div>
        <p>Verfügbarkeit wird geprüft…</p>
      </div>

      <div class="state-box error" *ngIf="error()">
        <p>{{ error() }}</p>
        <button class="btn btn-primary" (click)="load()">Erneut versuchen</button>
      </div>

      <div
        class="state-box"
        *ngIf="!loading() && !error() && filtered().length === 0"
      >
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.2"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="8" y1="12" x2="16" y2="12" />
        </svg>
        <p *ngIf="bikes().length === 0">
          In diesem Zeitraum ist kein Mietfahrrad frei.
        </p>
        <p *ngIf="bikes().length > 0">
          Kein Treffer für diese Filter.
        </p>
      </div>

      <!-- Ergebnis -->
      <div class="bike-grid" *ngIf="!loading() && !error()">
        <!-- Die ganze Karte schaltet die Auswahl um — hier wird ausgewählt,
             nicht bearbeitet. -->
        <div
          class="bike-card"
          *ngFor="let b of filtered()"
          [class.selected]="isSelected(b.id)"
          role="button"
          tabindex="0"
          [attr.aria-pressed]="isSelected(b.id)"
          (click)="toggleSelect(b.id)"
          (keydown.enter)="toggleSelect(b.id)"
          (keydown.space)="$event.preventDefault(); toggleSelect(b.id)"
        >
          <!-- Rein visuell: der Klick wird von der Karte behandelt. -->
          <div class="pick" [class.on]="isSelected(b.id)" aria-hidden="true">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="3.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>

          <div class="card-img">
            <img
              *ngIf="b.images?.length"
              [src]="getImageUrl(b.images![0].filePath)"
              [alt]="b.marke + ' ' + b.modell"
              loading="lazy"
            />
            <div class="img-placeholder" *ngIf="!b.images?.length">🚲</div>
          </div>

          <div class="card-body">
            <div class="card-title">{{ b.marke }} {{ b.modell }}</div>

            <div class="badges">
              <span class="badge" *ngIf="b.fahrradtyp">{{ b.fahrradtyp }}</span>
              <!-- "Size" wie im Rad-Auswahlfeld des Mietvertrags, damit beide
                   Stellen dasselbe Wort benutzen. -->
              <span class="badge" *ngIf="b.rahmengroesse">
                Size {{ b.rahmengroesse }}
              </span>
              <span class="badge" *ngIf="b.reifengroesse">
                {{ b.reifengroesse }}"
              </span>
              <!-- Die eigentliche Frage bei der Auswahl: passt das Rad zum
                   Gast? Ohne gepflegte Körpergröße fällt das Badge weg. -->
              <span class="badge badge-height" *ngIf="riderHeight(b)">
                für {{ riderHeight(b) }}
              </span>
              <span class="badge" *ngIf="b.farbe">{{ b.farbe }}</span>
            </div>

            <!-- Rahmennummer stand hier mit, war bei der Auswahl aber nie die
                 Frage: sie identifiziert das Rad erst bei der Übergabe. -->
            <div class="meta" *ngIf="b.lagernummer">
              <span>Lager-Nr. {{ b.lagernummer }}</span>
            </div>

            <div class="price-row">
              <div class="price" *ngIf="priceFor(b) !== null">
                {{ priceFor(b) | number: '1.2-2' }} €
                <small>/ {{ days() }} {{ days() === 1 ? 'Tag' : 'Tage' }}</small>
              </div>
              <div class="price muted" *ngIf="priceFor(b) === null">
                Kein Preis hinterlegt
              </div>
              <div class="kaution" *ngIf="b.kaution">
                Kaution {{ b.kaution | number: '1.2-2' }} €
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Sammelaktion für mehrere Räder -->
    <div class="select-bar" *ngIf="selectedCount() > 0">
      <span class="sel-count">
        <strong>{{ selectedCount() }}</strong>
        {{ selectedCount() === 1 ? 'Rad' : 'Räder' }} ausgewählt
      </span>
      <button class="sel-clear" (click)="clearSelection()">Aufheben</button>
      <button
        class="sel-rent"
        (click)="rentSelected()"
        [disabled]="days() <= 0"
      >
        Vermieten →
      </button>
    </div>
  `,
  styles: [
    `
      .page {
        animation: fadeIn 0.3s ease;
      }
      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(6px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      .page-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 16px;
        flex-wrap: wrap;
        margin-bottom: 20px;
      }
      h1 {
        margin: 0;
        font-size: 1.5rem;
        font-weight: 800;
        color: var(--text-primary);
      }
      .page-subtitle {
        margin: 4px 0 0;
        color: var(--text-secondary);
        font-size: 0.88rem;
      }
      .date-bar {
        display: flex;
        gap: 14px;
        align-items: flex-end;
        flex-wrap: wrap;
        padding: 14px 16px;
        background: var(--bg-card);
        border: 1.5px solid var(--border-color);
        border-radius: 12px;
        margin-bottom: 14px;
      }
      .date-field {
        display: flex;
        flex-direction: column;
        gap: 5px;
      }
      .date-field label {
        font-size: 0.75rem;
        font-weight: 700;
        color: var(--text-secondary);
        text-transform: uppercase;
        letter-spacing: 0.4px;
      }
      .days-badge {
        padding: 9px 14px;
        border-radius: 999px;
        background: var(--accent-primary);
        color: #fff;
        font-weight: 700;
        font-size: 0.85rem;
      }
      .quick-picks {
        display: flex;
        gap: 6px;
        flex-wrap: wrap;
        margin-left: auto;
      }
      .chip {
        border: 1.5px solid var(--border-color);
        background: transparent;
        color: var(--text-secondary);
        border-radius: 999px;
        padding: 7px 12px;
        font-size: 0.8rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.15s;
      }
      .chip:hover {
        border-color: var(--accent-primary);
        color: var(--accent-primary);
      }
      .date-error {
        color: var(--accent-danger, #ef4444);
        font-size: 0.85rem;
        margin: 0 0 12px;
      }
      /* Kompakte, mitwachsende Filterzeile: Suche oben, darunter ein Raster,
         das je nach Breite 2–4 Selects nebeneinander legt. */
      .filters {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-bottom: 16px;
      }
      .search-group {
        position: relative;
        width: 100%;
        max-width: 360px;
      }
      .filter-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(112px, 1fr));
        gap: 8px;
        max-width: 640px;
      }
      .filter-input {
        min-width: 0;
        padding: 9px 11px;
        border: 1.5px solid var(--border-color);
        border-radius: 9px;
        background: var(--bg-card);
        color: var(--text-primary);
        font-size: 0.85rem;
        transition: all 0.2s;
      }
      /* Gesetzte Filter heben sich ab, weil der Platzhalter nur "Typ"/"Rahmen"
         heißt und sonst nicht erkennbar wäre, ob gefiltert wird. */
      select.filter-input.set {
        border-color: var(--accent-primary);
        color: var(--accent-primary);
        font-weight: 600;
      }
      .search-input {
        width: 100%;
        padding-right: 36px;
      }
      .filter-input:focus {
        outline: none;
        border-color: var(--accent-primary);
        box-shadow: 0 0 0 3px
          var(--accent-primary-light, rgba(99, 102, 241, 0.08));
      }
      .search-icon {
        position: absolute;
        right: 12px;
        top: 50%;
        transform: translateY(-50%);
        color: var(--text-secondary);
        pointer-events: none;
      }
      .btn-reset {
        border: none;
        background: transparent;
        color: var(--accent-primary);
        font-size: 0.83rem;
        font-weight: 600;
        cursor: pointer;
        text-decoration: underline;
      }
      .summary {
        color: var(--text-secondary);
        font-size: 0.9rem;
        margin-bottom: 14px;
      }
      .summary strong {
        color: var(--text-primary);
        font-size: 1.05rem;
      }
      .state-box {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
        padding: 56px 20px;
        color: var(--text-secondary);
        text-align: center;
      }
      .state-box.error {
        color: var(--accent-danger, #ef4444);
      }
      .spinner {
        width: 30px;
        height: 30px;
        border-radius: 50%;
        border: 3px solid var(--border-color);
        border-top-color: var(--accent-primary);
        animation: spin 0.7s linear infinite;
      }
      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }
      .bike-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 16px;
      }
      .bike-card {
        position: relative;
        background: var(--bg-card);
        border: 1.5px solid var(--border-color);
        border-radius: 12px;
        overflow: hidden;
        transition: all 0.2s;
        cursor: pointer;
        user-select: none;
      }
      .bike-card:focus-visible {
        outline: 2px solid var(--accent-primary);
        outline-offset: 2px;
      }
      .bike-card:hover {
        border-color: var(--accent-primary);
        transform: translateY(-2px);
        box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08);
      }
      .bike-card.selected {
        border-color: var(--accent-primary);
        box-shadow: 0 0 0 2px var(--accent-primary) inset;
      }
      .pick {
        position: absolute;
        top: 8px;
        left: 8px;
        z-index: 2;
        width: 26px;
        height: 26px;
        border-radius: 7px;
        border: 2px solid #fff;
        background: rgba(15, 23, 42, 0.45);
        color: transparent;
        display: grid;
        place-items: center;
        pointer-events: none;
        backdrop-filter: blur(2px);
        transition: all 0.15s;
      }
      .pick.on {
        background: var(--accent-primary);
        border-color: var(--accent-primary);
        color: #fff;
      }
      .select-bar {
        position: fixed;
        left: 50%;
        bottom: 20px;
        transform: translateX(-50%);
        z-index: 60;
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 10px 14px;
        border-radius: 999px;
        background: var(--text-primary);
        color: var(--bg-card);
        box-shadow: 0 8px 26px rgba(0, 0, 0, 0.28);
        max-width: calc(100vw - 24px);
      }
      .sel-count {
        font-size: 0.86rem;
        white-space: nowrap;
      }
      .sel-count strong {
        font-size: 1rem;
      }
      .sel-clear {
        border: none;
        background: transparent;
        color: inherit;
        opacity: 0.7;
        font-size: 0.82rem;
        cursor: pointer;
        text-decoration: underline;
      }
      .sel-rent {
        border: none;
        border-radius: 999px;
        background: var(--accent-primary);
        color: #fff;
        font-weight: 700;
        font-size: 0.86rem;
        padding: 8px 16px;
        cursor: pointer;
        white-space: nowrap;
      }
      .sel-rent:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      .card-img {
        display: block;
        aspect-ratio: 4 / 3;
        background: var(--bg-hover, rgba(127, 127, 127, 0.08));
      }
      .card-img img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .img-placeholder {
        width: 100%;
        height: 100%;
        display: grid;
        place-items: center;
        font-size: 2.4rem;
        opacity: 0.35;
      }
      .card-body {
        padding: 12px 14px 14px;
      }
      .card-title {
        font-weight: 700;
        color: var(--text-primary);
        font-size: 0.98rem;
        margin-bottom: 8px;
      }
      .badges {
        display: flex;
        gap: 5px;
        flex-wrap: wrap;
        margin-bottom: 8px;
      }
      .badge {
        font-size: 0.72rem;
        font-weight: 600;
        padding: 3px 8px;
        border-radius: 6px;
        background: var(--bg-hover, rgba(127, 127, 127, 0.1));
        color: var(--text-secondary);
      }
      .meta {
        font-size: 0.76rem;
        color: var(--text-secondary);
        margin-bottom: 10px;
      }
      .price-row {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        gap: 8px;
        border-top: 1px solid var(--border-color);
        padding-top: 10px;
      }
      .price {
        font-weight: 800;
        color: var(--accent-primary);
        font-size: 1.05rem;
      }
      .price small {
        font-weight: 500;
        color: var(--text-secondary);
        font-size: 0.72rem;
      }
      .price.muted {
        color: var(--text-secondary);
        font-size: 0.8rem;
        font-weight: 600;
      }
      .kaution {
        font-size: 0.74rem;
        color: var(--text-secondary);
      }
      @media (max-width: 640px) {
        .date-bar {
          padding: 12px;
          gap: 10px;
        }
        .date-field {
          flex: 1 1 42%;
        }
        .quick-picks {
          margin-left: 0;
          width: 100%;
          overflow-x: auto;
          flex-wrap: nowrap;
          padding-bottom: 2px;
        }
        .quick-picks .chip {
          flex: 0 0 auto;
        }
        .search-group {
          max-width: none;
        }
        .bike-grid {
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          gap: 12px;
        }
        .card-body {
          padding: 10px 11px 12px;
        }
      }
    `,
  ],
})
export class RentalAvailabilityComponent implements OnInit {
  private bicycleService = inject(BicycleService);
  private router = inject(Router);

  startDate = '';
  endDate = '';
  searchText = '';
  filterTyp = '';
  filterMarke = '';
  filterRahmen = '';
  filterReifen = '';

  bikes = signal<Bicycle[]>([]);
  loading = signal(false);
  error = signal('');
  dateError = signal('');

  ngOnInit(): void {
    const today = new Date();
    this.startDate = this.toInput(today);
    this.endDate = this.toInput(today);
    this.load();
  }

  // Suche/Filter sind einfache Getter statt computed(): ngModel schreibt auf
  // normale Felder, und bei dieser Ergebnisgröße ist eine Neuauswertung pro
  // Change-Detection-Lauf unkritisch — das spart Signal-Boilerplate.
  days(): number {
    return this.diffDays(this.startDate, this.endDate);
  }

  private diffDays(start: string, end: string): number {
    if (!start || !end) return 0;
    const s = new Date(start);
    const e = new Date(end);
    if (isNaN(s.getTime()) || isNaN(e.getTime())) return 0;
    const diff = Math.round((e.getTime() - s.getTime()) / 86400000);
    return Math.max(0, diff + 1);
  }

  private toInput(d: Date): string {
    const p = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
  }

  onDatesChange(): void {
    if (!this.startDate || !this.endDate) return;
    if (new Date(this.endDate) < new Date(this.startDate)) {
      this.dateError.set('Das Enddatum liegt vor dem Startdatum.');
      this.bikes.set([]);
      return;
    }
    this.dateError.set('');
    this.load();
  }

  quickPick(dayCount: number): void {
    const start = this.startDate ? new Date(this.startDate) : new Date();
    const end = new Date(start);
    end.setDate(start.getDate() + dayCount - 1);
    this.startDate = this.toInput(start);
    this.endDate = this.toInput(end);
    this.onDatesChange();
  }

  /** Nächstes Wochenende (Sa–So). */
  quickWeekend(): void {
    const today = new Date();
    const sat = new Date(today);
    const daysUntilSat = (6 - today.getDay() + 7) % 7;
    sat.setDate(today.getDate() + daysUntilSat);
    const sun = new Date(sat);
    sun.setDate(sat.getDate() + 1);
    this.startDate = this.toInput(sat);
    this.endDate = this.toInput(sun);
    this.onDatesChange();
  }

  // ── Laden ──
  load(): void {
    if (!this.startDate || !this.endDate) return;
    this.loading.set(true);
    this.error.set('');
    this.bicycleService
      .getAvailableForPeriod(this.startDate, this.endDate)
      .subscribe({
        next: (list) => {
          this.bikes.set(list ?? []);
          // Zeitraum geändert → vorher gewählte Räder können jetzt belegt sein.
          // Nur noch verfügbare Auswahl behalten, sonst landet ein belegtes Rad
          // im Mietvertrag.
          const stillFree = new Set((list ?? []).map((b) => b.id));
          for (const id of [...this.selected]) {
            if (!stillFree.has(id)) this.selected.delete(id);
          }
          this.loading.set(false);
        },
        error: (err) => {
          console.error('Verfügbarkeit laden fehlgeschlagen:', err);
          this.error.set('Verfügbarkeit konnte nicht geladen werden.');
          this.loading.set(false);
        },
      });
  }

  // ── Filteroptionen (aus dem Ergebnis abgeleitet) ──
  private distinct(pick: (b: Bicycle) => string | undefined): string[] {
    const set = new Set<string>();
    for (const b of this.bikes()) {
      const v = pick(b);
      if (v && v.trim()) set.add(v.trim());
    }
    return [...set].sort((a, b) => a.localeCompare(b, 'de'));
  }

  typOptions(): string[] {
    return this.distinct((b) => b.fahrradtyp);
  }
  markeOptions(): string[] {
    return this.distinct((b) => b.marke);
  }
  rahmenOptions(): string[] {
    return this.distinct((b) => b.rahmengroesse);
  }
  reifenOptions(): string[] {
    return this.distinct((b) => b.reifengroesse);
  }

  hasActiveFilters(): boolean {
    return !!(
      this.searchText.trim() ||
      this.filterTyp ||
      this.filterMarke ||
      this.filterRahmen ||
      this.filterReifen
    );
  }

  resetFilters(): void {
    this.searchText = '';
    this.filterTyp = '';
    this.filterMarke = '';
    this.filterRahmen = '';
    this.filterReifen = '';
  }

  filtered(): Bicycle[] {
    const term = this.searchText.trim().toLowerCase();

    return this.bikes().filter((b) => {
      if (this.filterTyp && b.fahrradtyp !== this.filterTyp) return false;
      if (this.filterMarke && b.marke !== this.filterMarke) return false;
      if (this.filterRahmen && b.rahmengroesse !== this.filterRahmen)
        return false;
      if (this.filterReifen && b.reifengroesse !== this.filterReifen)
        return false;

      if (!term) return true;
      const haystack = [
        b.marke,
        b.modell,
        b.rahmennummer,
        b.lagernummer?.toString(),
        b.farbe,
        b.fahrradtyp,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(term);
    });
  }

  /**
   * Empfohlene Körpergröße als kurzer Text ("165–180 cm"). Ist nur eine Grenze
   * gepflegt, wird daraus "ab 165 cm" bzw. "bis 180 cm"; ohne Angabe leer,
   * dann fällt das Badge auf der Karte weg. Gleiche Darstellung wie im
   * Buchungsablauf der Homepage.
   */
  riderHeight(bike: Bicycle): string {
    const from = bike.koerpergroesseVonCm ?? null;
    const to = bike.koerpergroesseBisCm ?? null;
    if (from && to) return `${from}–${to} cm`;
    if (from) return `ab ${from} cm`;
    if (to) return `bis ${to} cm`;
    return '';
  }

  // ── Preis für den gewählten Zeitraum (gemeinsame Logik, nicht neu erfunden) ──
  priceFor(bike: Bicycle): number | null {
    const d = this.days();
    if (d <= 0) return null;
    return calculateRentalPrice(bike, d).total;
  }

  // ── Mehrfachauswahl ──
  private selected = new Set<number>();

  isSelected(id: number): boolean {
    return this.selected.has(id);
  }
  selectedCount(): number {
    return this.selected.size;
  }
  toggleSelect(id: number): void {
    if (!this.selected.delete(id)) this.selected.add(id);
  }
  clearSelection(): void {
    this.selected.clear();
  }

  /**
   * Direkt in den Mietvertrag: Räder und Zeitraum sind hier schon gewählt, das
   * Formular liest sie aus den Query-Params und wählt die Räder selbst aus.
   */
  rentSelected(): void {
    const ids = [...this.selected];
    if (this.days() <= 0 || ids.length === 0) return;
    this.router.navigate(['/rentals/new'], {
      queryParams: {
        // Das Formular versteht beide Formen; die Einzahl bleibt für einen
        // sprechenden Link bei nur einem Rad.
        ...(ids.length === 1
          ? { bicycleId: ids[0] }
          : { bicycleIds: ids.join(',') }),
        start: this.startDate,
        end: this.endDate,
      },
    });
  }

  getImageUrl(path: string): string {
    return `${environment.apiUrl}/public/gallery-image/${path}`;
  }
}
