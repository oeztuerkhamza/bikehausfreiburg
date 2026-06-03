import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BicycleService } from '../../services/bicycle.service';
import { Bicycle, BusyPeriod } from '../../models/models';

interface BikeRow {
  bike: Bicycle;
  periods: BusyPeriod[];
}

interface DayCell {
  date: Date;
  iso: string;
  day: number;
  isToday: boolean;
  isWeekend: boolean;
}

interface BikeDayState {
  status: 'free' | 'rental' | 'booking';
  start?: string;
  end?: string;
}

@Component({
  selector: 'app-bicycle-calendar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>Belegungsplan</h1>
        <div class="header-actions">
          <button class="btn btn-outline" (click)="reload()" [disabled]="loading()">
            🔄 Aktualisieren
          </button>
        </div>
      </div>

      <div class="toolbar">
        <div class="month-nav">
          <button class="btn-icon" (click)="prevMonth()" aria-label="Vorheriger Monat">‹</button>
          <div class="month-label">{{ monthLabel() }}</div>
          <button class="btn-icon" (click)="nextMonth()" aria-label="Nächster Monat">›</button>
          <button class="btn btn-outline btn-sm" (click)="goToday()">Heute</button>
        </div>
        <div class="filter-bar">
          <div class="filter-group search-group">
            <input
              type="text"
              [(ngModel)]="searchText"
              placeholder="Fahrrad suchen..."
              class="filter-input search-input"
            />
            <span class="search-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>
          </div>
          <div class="legend">
            <span class="legend-item"><span class="dot dot-free"></span> Frei</span>
            <span class="legend-item"><span class="dot dot-rental"></span> Vermietet</span>
            <span class="legend-item"><span class="dot dot-booking"></span> Reserviert</span>
          </div>
        </div>
      </div>

      <div *ngIf="loading()" class="loading">Lade Belegung…</div>

      <div *ngIf="!loading() && filteredRows().length === 0" class="empty">
        Keine Mietfahrräder gefunden.
      </div>

      <div *ngIf="!loading() && filteredRows().length > 0" class="calendar-wrap">
        <div class="calendar-grid" [style.grid-template-columns]="gridTemplate()">
          <!-- Header row: bike column + day headers -->
          <div class="header-cell sticky-col sticky-top">Fahrrad</div>
          <div
            *ngFor="let d of days()"
            class="header-cell day-header sticky-top"
            [class.weekend]="d.isWeekend"
            [class.today]="d.isToday"
          >
            <div class="dow">{{ d.date | date: 'EE' }}</div>
            <div class="dom">{{ d.day }}</div>
          </div>

          <!-- One row per bike -->
          <ng-container *ngFor="let row of filteredRows()">
            <div class="bike-cell sticky-col" (click)="openBike(row.bike.id)" role="button">
              <div class="bike-title">{{ row.bike.marke }} {{ row.bike.modell }}</div>
              <div class="bike-sub">
                <span *ngIf="row.bike.rahmennummer">#{{ row.bike.rahmennummer }}</span>
                <span *ngIf="row.bike.reifengroesse">{{ row.bike.reifengroesse }}</span>
              </div>
            </div>
            <div
              *ngFor="let d of days()"
              class="day-cell"
              [class.weekend]="d.isWeekend"
              [class.today]="d.isToday"
              [class.is-rental]="stateFor(row, d).status === 'rental'"
              [class.is-booking]="stateFor(row, d).status === 'booking'"
              [title]="tooltipFor(row, d)"
            ></div>
          </ng-container>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .page {
        max-width: 1600px;
        margin: 0 auto;
        animation: fadeIn 0.4s ease;
      }
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(8px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .page-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        flex-wrap: wrap;
        gap: 12px;
      }
      .toolbar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 16px;
        flex-wrap: wrap;
        margin-bottom: 16px;
      }
      .month-nav {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .month-label {
        font-size: 1.05rem;
        font-weight: 600;
        min-width: 170px;
        text-align: center;
        color: var(--text-primary);
      }
      .btn-icon {
        width: 36px;
        height: 36px;
        border-radius: 8px;
        border: 1.5px solid var(--border-color);
        background: var(--bg-card);
        color: var(--text-primary);
        font-size: 1.4rem;
        line-height: 1;
        cursor: pointer;
        transition: all 0.15s;
      }
      .btn-icon:hover {
        border-color: var(--accent-primary);
        color: var(--accent-primary);
      }
      .btn-sm {
        padding: 6px 12px;
        font-size: 0.85rem;
      }
      .filter-bar {
        display: flex;
        gap: 16px;
        align-items: center;
        flex-wrap: wrap;
      }
      .filter-group { position: relative; }
      .search-group { min-width: 220px; }
      .filter-input {
        padding: 10px 14px;
        border: 1.5px solid var(--border-color);
        border-radius: 10px;
        background: var(--bg-card);
        color: var(--text-primary);
        font-size: 0.88rem;
      }
      .filter-input:focus {
        outline: none;
        border-color: var(--accent-primary);
      }
      .search-input { width: 100%; padding-left: 40px; }
      .search-icon {
        position: absolute;
        left: 13px;
        top: 50%;
        transform: translateY(-50%);
        color: var(--text-muted);
        pointer-events: none;
        display: flex;
      }
      .legend {
        display: flex;
        gap: 14px;
        font-size: 0.85rem;
        color: var(--text-secondary);
      }
      .legend-item {
        display: inline-flex;
        align-items: center;
        gap: 6px;
      }
      .dot {
        width: 14px;
        height: 14px;
        border-radius: 3px;
        display: inline-block;
        border: 1px solid rgba(0, 0, 0, 0.08);
      }
      .dot-free { background: var(--bg-card); }
      .dot-rental { background: #ef4444; }
      .dot-booking { background: #f59e0b; }

      .loading, .empty {
        padding: 40px;
        text-align: center;
        color: var(--text-muted);
        background: var(--bg-card);
        border-radius: 12px;
      }

      .calendar-wrap {
        background: var(--bg-card);
        border-radius: 14px;
        border: 1px solid var(--border-color);
        overflow: auto;
        max-height: calc(100vh - 240px);
      }
      .calendar-grid {
        display: grid;
        min-width: max-content;
      }
      .header-cell {
        background: var(--bg-subtle, var(--bg-card));
        border-bottom: 2px solid var(--border-color);
        padding: 8px 6px;
        font-size: 0.78rem;
        font-weight: 600;
        color: var(--text-secondary);
        text-align: center;
        user-select: none;
      }
      .sticky-top {
        position: sticky;
        top: 0;
        z-index: 2;
      }
      .sticky-col {
        position: sticky;
        left: 0;
        z-index: 1;
        background: var(--bg-subtle, var(--bg-card));
        border-right: 2px solid var(--border-color);
      }
      .header-cell.sticky-col.sticky-top {
        z-index: 3;
      }
      .day-header {
        min-width: 34px;
      }
      .day-header.weekend { background: var(--bg-hover, rgba(0, 0, 0, 0.03)); }
      .day-header.today { background: var(--accent-primary-light, rgba(99, 102, 241, 0.15)); color: var(--accent-primary); }
      .dow { font-size: 0.65rem; text-transform: uppercase; opacity: 0.65; }
      .dom { font-size: 0.9rem; }

      .bike-cell {
        padding: 10px 12px;
        border-bottom: 1px solid var(--border-color);
        min-width: 220px;
        max-width: 280px;
        cursor: pointer;
        transition: background 0.15s;
      }
      .bike-cell:hover {
        background: var(--bg-hover, rgba(0, 0, 0, 0.04));
      }
      .bike-title {
        font-weight: 600;
        font-size: 0.9rem;
        color: var(--text-primary);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .bike-sub {
        margin-top: 2px;
        font-size: 0.72rem;
        color: var(--text-muted);
        display: flex;
        gap: 8px;
      }
      .day-cell {
        min-width: 34px;
        height: 44px;
        border-bottom: 1px solid var(--border-color);
        border-right: 1px solid var(--border-color);
      }
      .day-cell.weekend { background: rgba(0, 0, 0, 0.02); }
      .day-cell.today { box-shadow: inset 0 0 0 2px var(--accent-primary); }
      .day-cell.is-rental { background: #ef4444; }
      .day-cell.is-booking { background: #f59e0b; }
      .day-cell.is-rental.weekend,
      .day-cell.is-booking.weekend { opacity: 0.95; }

      @media (max-width: 768px) {
        .toolbar { flex-direction: column; align-items: stretch; }
        .legend { font-size: 0.75rem; gap: 10px; }
        .bike-cell { min-width: 160px; }
      }
    `,
  ],
})
export class BicycleCalendarComponent implements OnInit {
  private bicycleService = inject(BicycleService);
  private router = inject(Router);

  loading = signal(true);
  rows = signal<BikeRow[]>([]);
  cursor = signal<Date>(new Date());
  searchText = '';

  days = computed<DayCell[]>(() => {
    const cur = this.cursor();
    const year = cur.getFullYear();
    const month = cur.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();
    const todayKey = this.toIso(today);
    const cells: DayCell[] = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      const dow = date.getDay();
      cells.push({
        date,
        iso: this.toIso(date),
        day: d,
        isToday: this.toIso(date) === todayKey,
        isWeekend: dow === 0 || dow === 6,
      });
    }
    return cells;
  });

  monthLabel = computed(() => {
    const cur = this.cursor();
    return cur.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' });
  });

  gridTemplate = computed(() => {
    const n = this.days().length;
    return `minmax(220px, 280px) repeat(${n}, minmax(34px, 1fr))`;
  });

  filteredRows = computed<BikeRow[]>(() => {
    const term = this.searchText.trim().toLowerCase();
    const rows = this.rows();
    if (!term) return rows;
    return rows.filter((r) =>
      [r.bike.marke, r.bike.modell, r.bike.rahmennummer, r.bike.farbe]
        .filter(Boolean)
        .some((v) => v!.toLowerCase().includes(term)),
    );
  });

  ngOnInit(): void {
    this.reload();
  }

  reload(): void {
    this.loading.set(true);
    this.bicycleService.getAll().subscribe({
      next: (all) => {
        const bikes = all.filter((b) => b.isRentable);
        if (bikes.length === 0) {
          this.rows.set([]);
          this.loading.set(false);
          return;
        }
        this.bicycleService.getBusyPeriodsBatch(bikes.map((b) => b.id)).subscribe({
          next: (periodsMap) => {
            const rows: BikeRow[] = bikes.map((bike) => ({
              bike,
              periods: periodsMap[bike.id] ?? [],
            }));
            rows.sort((a, b) =>
              `${a.bike.marke} ${a.bike.modell}`.localeCompare(
                `${b.bike.marke} ${b.bike.modell}`,
              ),
            );
            this.rows.set(rows);
            this.loading.set(false);
          },
          error: () => this.loading.set(false),
        });
      },
      error: () => this.loading.set(false),
    });
  }

  prevMonth(): void {
    const cur = this.cursor();
    this.cursor.set(new Date(cur.getFullYear(), cur.getMonth() - 1, 1));
  }

  nextMonth(): void {
    const cur = this.cursor();
    this.cursor.set(new Date(cur.getFullYear(), cur.getMonth() + 1, 1));
  }

  goToday(): void {
    const t = new Date();
    this.cursor.set(new Date(t.getFullYear(), t.getMonth(), 1));
  }

  openBike(id: number): void {
    this.router.navigate(['/bicycles', id]);
  }

  stateFor(row: BikeRow, day: DayCell): BikeDayState {
    for (const p of row.periods) {
      const start = p.start.substring(0, 10);
      const end = p.end.substring(0, 10);
      if (day.iso >= start && day.iso <= end) {
        return { status: p.type, start, end };
      }
    }
    return { status: 'free' };
  }

  tooltipFor(row: BikeRow, day: DayCell): string {
    const state = this.stateFor(row, day);
    const dateStr = day.date.toLocaleDateString('de-DE');
    if (state.status === 'free') return `${dateStr} – Frei`;
    const label = state.status === 'rental' ? 'Vermietet' : 'Reserviert';
    return `${dateStr} – ${label} (${state.start} – ${state.end})`;
  }

  private toIso(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
}
