import {
  Component,
  EventEmitter,
  Input,
  Output,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslationService } from '../../services/translation.service';

export interface CalendarBusyPeriod {
  start: string; // ISO date or YYYY-MM-DD
  end: string;
  type?: string;
}

/**
 * Mobile-friendly month calendar for picking a rental date range.
 *
 * - Closed days (Sundays + Baden-Württemberg holidays) and any day inside a
 *   `busyPeriods` entry are disabled and cannot be selected.
 * - Two-way bindable via [(start)] / [(end)] ("YYYY-MM-DD"); also emits
 *   (rangeChange) whenever the selection changes.
 * - Picking an end date that would span a closed/busy day restarts the range
 *   at the clicked day instead (so a selected range is always bookable).
 *
 * Mirrors the date logic of the booking flow's step-1 calendar so behaviour is
 * consistent across the site.
 */
@Component({
  selector: 'app-availability-calendar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="cal">
      <div class="cal-head">
        <button
          type="button"
          class="cal-nav"
          (click)="prevMonth()"
          [attr.aria-label]="'<'"
        >
          ‹
        </button>
        <span class="cal-month">{{ monthLabel() }}</span>
        <button
          type="button"
          class="cal-nav"
          (click)="nextMonth()"
          [attr.aria-label]="'>'"
        >
          ›
        </button>
      </div>

      <div class="cal-grid cal-dow">
        <span *ngFor="let w of weekdayLabels()">{{ w }}</span>
      </div>

      <div class="cal-grid">
        <ng-container *ngFor="let week of weeks()">
          <ng-container *ngFor="let day of week">
            <span *ngIf="!day" class="cal-cell empty"></span>
            <button
              *ngIf="day"
              type="button"
              class="cal-cell"
              [class.is-start]="isStart(day)"
              [class.is-end]="isEnd(day)"
              [class.in-range]="inRange(day)"
              [class.is-today]="isToday(day)"
              [class.is-closed]="isClosed(day)"
              [class.is-busy]="isBusy(day)"
              [disabled]="!isSelectable(day)"
              (click)="onDayClick(day)"
            >
              {{ day.getDate() }}
            </button>
          </ng-container>
        </ng-container>
      </div>

      <div class="cal-legend">
        <span class="lg"><span class="dot free"></span>{{ legendFree }}</span>
        <span class="lg"><span class="dot busy"></span>{{ legendBusy }}</span>
        <span class="lg"><span class="dot sel"></span>{{ legendSelected }}</span>
      </div>
    </div>
  `,
  styles: [
    `
      .cal {
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 16px;
        padding: 0.85rem;
        user-select: none;
      }
      .cal-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 0.6rem;
      }
      .cal-month {
        font-weight: 700;
        font-size: 0.98rem;
        text-transform: capitalize;
      }
      .cal-nav {
        width: 38px;
        height: 38px;
        border-radius: 10px;
        border: 1px solid rgba(255, 255, 255, 0.14);
        background: rgba(255, 255, 255, 0.04);
        color: var(--color-text, #fff);
        font-size: 1.3rem;
        line-height: 1;
        cursor: pointer;
      }
      .cal-nav:hover {
        background: rgba(255, 255, 255, 0.1);
      }
      .cal-grid {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: 4px;
      }
      .cal-dow {
        margin-bottom: 4px;
      }
      .cal-dow span {
        text-align: center;
        font-size: 0.68rem;
        font-weight: 700;
        color: rgba(255, 255, 255, 0.45);
        text-transform: uppercase;
        padding: 2px 0;
      }
      .cal-cell {
        aspect-ratio: 1;
        min-height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        border: none;
        border-radius: 10px;
        background: rgba(255, 255, 255, 0.05);
        color: var(--color-text, #fff);
        font-size: 0.9rem;
        font-weight: 600;
        cursor: pointer;
        transition:
          background 0.15s,
          color 0.15s;
      }
      .cal-cell.empty {
        background: transparent;
        cursor: default;
      }
      .cal-cell:hover:not(:disabled) {
        background: rgba(255, 87, 34, 0.25);
      }
      .cal-cell:disabled {
        cursor: not-allowed;
      }
      .cal-cell.is-today {
        outline: 1.5px solid rgba(255, 255, 255, 0.35);
        outline-offset: -1.5px;
      }
      .cal-cell.is-closed {
        color: rgba(255, 255, 255, 0.28);
        background: rgba(255, 255, 255, 0.02);
        text-decoration: line-through;
      }
      .cal-cell.is-busy {
        color: rgba(255, 255, 255, 0.4);
        background: rgba(239, 68, 68, 0.22);
        text-decoration: line-through;
      }
      .cal-cell.in-range {
        background: rgba(255, 87, 34, 0.28);
        border-radius: 4px;
      }
      .cal-cell.is-start,
      .cal-cell.is-end {
        background: #ff5722;
        color: #fff;
      }
      .cal-legend {
        display: flex;
        gap: 1rem;
        flex-wrap: wrap;
        margin-top: 0.7rem;
        font-size: 0.72rem;
        color: rgba(255, 255, 255, 0.6);
      }
      .lg {
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
      }
      .dot {
        width: 11px;
        height: 11px;
        border-radius: 3px;
        display: inline-block;
      }
      .dot.free {
        background: rgba(255, 255, 255, 0.18);
      }
      .dot.busy {
        background: rgba(239, 68, 68, 0.7);
      }
      .dot.sel {
        background: #ff5722;
      }
    `,
  ],
})
export class AvailabilityCalendarComponent {
  private translationService = inject(TranslationService);
  lang = this.translationService.currentLanguage;

  private static readonly LEGEND: Record<string, [string, string, string]> = {
    de: ['Frei', 'Belegt', 'Ausgewählt'],
    en: ['Available', 'Booked', 'Selected'],
    fr: ['Disponible', 'Réservé', 'Sélectionné'],
    tr: ['Müsait', 'Dolu', 'Seçili'],
  };
  private legend(): [string, string, string] {
    return AvailabilityCalendarComponent.LEGEND[this.lang()] ?? AvailabilityCalendarComponent.LEGEND['en'];
  }
  get legendFree(): string {
    return this.legend()[0];
  }
  get legendBusy(): string {
    return this.legend()[1];
  }
  get legendSelected(): string {
    return this.legend()[2];
  }

  @Input() start = '';
  @Input() end = '';
  @Input() set busyPeriods(value: CalendarBusyPeriod[] | null | undefined) {
    this._busyKeys = this.expandBusyKeys(value ?? []);
  }

  @Output() startChange = new EventEmitter<string>();
  @Output() endChange = new EventEmitter<string>();
  @Output() rangeChange = new EventEmitter<{ start: string; end: string }>();

  private _busyKeys = new Set<string>();
  calendarMonth = signal(new Date(new Date().getFullYear(), new Date().getMonth(), 1));

  // ── Labels ──
  monthLabel(): string {
    return new Intl.DateTimeFormat(this.lang(), {
      month: 'long',
      year: 'numeric',
    }).format(this.calendarMonth());
  }

  weekdayLabels(): string[] {
    const monday = new Date(2024, 0, 1); // a Monday
    return Array.from({ length: 7 }, (_, i) =>
      new Intl.DateTimeFormat(this.lang(), { weekday: 'short' }).format(
        new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i),
      ),
    );
  }

  weeks(): Array<Array<Date | null>> {
    const month = this.calendarMonth();
    const year = month.getFullYear();
    const m = month.getMonth();
    const offset = (new Date(year, m, 1).getDay() + 6) % 7; // Monday-first
    const daysInMonth = new Date(year, m + 1, 0).getDate();
    const cells: Array<Date | null> = [];
    for (let i = 0; i < offset; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, m, d));
    while (cells.length % 7 !== 0) cells.push(null);
    const out: Array<Array<Date | null>> = [];
    for (let i = 0; i < cells.length; i += 7) out.push(cells.slice(i, i + 7));
    return out;
  }

  prevMonth(): void {
    const m = this.calendarMonth();
    this.calendarMonth.set(new Date(m.getFullYear(), m.getMonth() - 1, 1));
  }

  nextMonth(): void {
    const m = this.calendarMonth();
    this.calendarMonth.set(new Date(m.getFullYear(), m.getMonth() + 1, 1));
  }

  // ── State checks ──
  isStart(d: Date): boolean {
    return this.start === this.key(d);
  }
  isEnd(d: Date): boolean {
    return this.end === this.key(d);
  }
  inRange(d: Date): boolean {
    if (!this.start || !this.end) return false;
    const k = this.key(d);
    return k > this.start && k < this.end;
  }
  isToday(d: Date): boolean {
    const t = new Date();
    return (
      d.getFullYear() === t.getFullYear() &&
      d.getMonth() === t.getMonth() &&
      d.getDate() === t.getDate()
    );
  }
  isBusy(d: Date): boolean {
    return this._busyKeys.has(this.key(d));
  }
  isClosed(d: Date): boolean {
    if (d.getDay() === 0) return true;
    return this.bwHolidays(d.getFullYear()).has(this.key(d));
  }
  isSelectable(d: Date): boolean {
    const today = new Date();
    const min = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return d >= min && !this.isClosed(d) && !this.isBusy(d);
  }

  onDayClick(d: Date): void {
    if (!this.isSelectable(d)) return;
    const key = this.key(d);

    // Start a new range when: nothing picked yet, a full range exists, the click
    // is before the current start, OR the span would cross a closed/busy day.
    if (
      !this.start ||
      (this.start && this.end) ||
      key < this.start ||
      this.spanHasBlockedDay(this.start, key)
    ) {
      this.start = key;
      this.end = '';
      this.startChange.emit(this.start);
      this.endChange.emit(this.end);
      this.rangeChange.emit({ start: this.start, end: this.end });
      return;
    }

    this.end = key;
    this.endChange.emit(this.end);
    this.rangeChange.emit({ start: this.start, end: this.end });
  }

  // ── helpers ──
  private key(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  /** true if any day in (startKey..endKey] is closed or busy. */
  private spanHasBlockedDay(startKey: string, endKey: string): boolean {
    const cur = new Date(`${startKey}T00:00:00`);
    const end = new Date(`${endKey}T00:00:00`);
    cur.setDate(cur.getDate() + 1);
    while (cur <= end) {
      if (this.isClosed(cur) || this.isBusy(cur)) return true;
      cur.setDate(cur.getDate() + 1);
    }
    return false;
  }

  private expandBusyKeys(periods: CalendarBusyPeriod[]): Set<string> {
    const keys = new Set<string>();
    for (const p of periods) {
      if (!p?.start || !p?.end) continue;
      const start = new Date(p.start);
      const end = new Date(p.end);
      if (isNaN(start.getTime()) || isNaN(end.getTime())) continue;
      const cur = new Date(start.getFullYear(), start.getMonth(), start.getDate());
      const last = new Date(end.getFullYear(), end.getMonth(), end.getDate());
      let guard = 0;
      while (cur <= last && guard++ < 1000) {
        keys.add(this.key(cur));
        cur.setDate(cur.getDate() + 1);
      }
    }
    return keys;
  }

  // ── Baden-Württemberg public holidays (same set as the booking flow) ──
  private holidayCache = new Map<number, Set<string>>();
  private bwHolidays(year: number): Set<string> {
    if (this.holidayCache.has(year)) return this.holidayCache.get(year)!;
    const fmt = (d: Date) => this.key(d);
    const add = (d: Date, days: number) =>
      new Date(d.getFullYear(), d.getMonth(), d.getDate() + days);
    const easter = this.easter(year);
    const set = new Set<string>([
      fmt(new Date(year, 0, 1)),
      fmt(new Date(year, 0, 6)),
      fmt(new Date(year, 4, 1)),
      fmt(new Date(year, 9, 3)),
      fmt(new Date(year, 10, 1)),
      fmt(new Date(year, 11, 25)),
      fmt(new Date(year, 11, 26)),
      fmt(add(easter, -2)),
      fmt(easter),
      fmt(add(easter, 1)),
      fmt(add(easter, 39)),
      fmt(add(easter, 49)),
      fmt(add(easter, 50)),
      fmt(add(easter, 60)),
    ]);
    this.holidayCache.set(year, set);
    return set;
  }

  private easter(year: number): Date {
    const a = year % 19;
    const b = Math.floor(year / 100);
    const c = year % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const month = Math.floor((h + l - 7 * m + 114) / 31) - 1;
    const day = ((h + l - 7 * m + 114) % 31) + 1;
    return new Date(year, month, day);
  }
}
