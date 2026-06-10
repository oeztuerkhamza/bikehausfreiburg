import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { RentalBookingService } from '../../services/rental-booking.service';
import { NotificationService } from '../../services/notification.service';
import { DialogService } from '../../services/dialog.service';
import { TranslationService } from '../../services/translation.service';
import {
  PaginatedResult,
  RentalBookingList,
  RentalBookingStatus,
} from '../../models/models';
import { PaginationComponent } from '../../components/pagination/pagination.component';

interface CalChip {
  booking: RentalBookingList;
  isStart: boolean;
  isEnd: boolean;
  showLabel: boolean;
}

interface CalDay {
  date: Date;
  inMonth: boolean;
  isToday: boolean;
  chips: CalChip[];
}

@Component({
  selector: 'app-rental-booking-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, PaginationComponent],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>{{ t.rentalBookings }}</h1>
        <div class="view-toggle">
          <button
            type="button"
            [class.active]="viewMode === 'list'"
            (click)="setViewMode('list')"
          >
            {{ t.rentalBookingViewList }}
          </button>
          <button
            type="button"
            [class.active]="viewMode === 'calendar'"
            (click)="setViewMode('calendar')"
          >
            {{ t.rentalBookingViewCalendar }}
          </button>
        </div>
      </div>

      <!-- ── Calendar view ── -->
      <div *ngIf="viewMode === 'calendar'" class="cal-wrap">
        <div class="cal-toolbar">
          <div class="cal-nav">
            <button type="button" class="cal-nav-btn" (click)="calPrev()">
              ‹
            </button>
            <div class="cal-month-label">{{ calMonthLabel }}</div>
            <button type="button" class="cal-nav-btn" (click)="calNext()">
              ›
            </button>
            <button type="button" class="cal-today-btn" (click)="calToday()">
              {{ t.rentalBookingCalToday }}
            </button>
          </div>
          <div class="cal-legend">
            <span class="legend-item">
              <span class="legend-dot dot-bike"></span>
              {{ t.rentalBookingCalLegendBike }}
            </span>
            <span class="legend-item">
              <span class="legend-dot dot-ebike"></span>
              {{ t.rentalBookingCalLegendEBike }}
            </span>
            <span class="legend-item legend-note">
              {{ t.rentalBookingCalLegendPending }}
            </span>
          </div>
        </div>

        <div class="cal-weekdays">
          <div *ngFor="let w of calWeekdays" class="cal-weekday">{{ w }}</div>
        </div>

        <div class="cal-grid">
          <div
            *ngFor="let day of calDays"
            class="cal-day"
            [class.other-month]="!day.inMonth"
            [class.is-today]="day.isToday"
          >
            <div class="cal-day-num">{{ day.date.getDate() }}</div>
            <a
              *ngFor="let chip of day.chips"
              class="cal-chip"
              [class.ebike]="chip.booking.hasEBike"
              [class.pending]="chip.booking.status === BookingStatus.Pending"
              [class.chip-start]="chip.isStart"
              [class.chip-end]="chip.isEnd"
              [routerLink]="['/rental-bookings', chip.booking.id]"
              [title]="
                chip.booking.buchungsNummer +
                ' · ' +
                chip.booking.customerName +
                ' · ' +
                chip.booking.bikeInfo
              "
            >
              <span *ngIf="chip.showLabel" class="chip-label">
                {{ chip.booking.customerName }}
              </span>
            </a>
          </div>
        </div>

        <div *ngIf="calBookings.length === 0" class="cal-empty">
          {{ t.rentalBookingCalEmpty }}
        </div>
      </div>

      <!-- ── List view ── -->
      <div *ngIf="viewMode === 'list'" class="filter-bar">
        <div class="filter-group search-group">
          <input
            type="text"
            [(ngModel)]="searchText"
            (input)="onSearch()"
            [placeholder]="t.rentalBookingSearchPlaceholder"
            class="filter-input search-input"
          />
          <span class="search-icon"
            ><svg
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
        <div class="filter-group">
          <select
            [(ngModel)]="filterStatus"
            (change)="onFilterChange()"
            class="filter-input"
          >
            <option value="">{{ t.all }}</option>
            <option value="Pending">{{ t.rentalBookingPending }}</option>
            <option value="Approved">{{ t.rentalBookingApproved }}</option>
            <option value="Cancelled">{{ t.rentalBookingCancelled }}</option>
          </select>
        </div>
      </div>

      <div *ngIf="viewMode === 'list'" class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>{{ t.rentalBookingNumber }}</th>
              <th>{{ t.bicycle }}</th>
              <th>{{ t.customer }}</th>
              <th>{{ t.from }}</th>
              <th>{{ t.to }}</th>
              <th>{{ t.total }}</th>
              <th>{{ t.status }}</th>
              <th>{{ t.actions }}</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngIf="paginatedResult?.items?.length === 0">
              <td colspan="8" class="empty">{{ t.rentalBookingNoItems }}</td>
            </tr>
            <tr *ngFor="let booking of paginatedResult?.items">
              <td class="mono">{{ booking.buchungsNummer }}</td>
              <td>{{ booking.bikeInfo }}</td>
              <td>{{ booking.customerName }}</td>
              <td>{{ booking.startDatum | date: 'dd.MM.yyyy' }}</td>
              <td>{{ booking.endDatum | date: 'dd.MM.yyyy' }}</td>
              <td>{{ booking.gesamtpreis | number: '1.2-2' }} €</td>
              <td>
                <span
                  class="status-badge"
                  [class]="getStatusClass(booking.status)"
                >
                  {{ getStatusText(booking.status) }}
                </span>
              </td>
              <td class="actions">
                <a
                  [routerLink]="['/rental-bookings', booking.id]"
                  class="btn btn-sm btn-outline"
                >
                  {{ t.details }}
                </a>
                <button
                  class="btn btn-sm btn-primary"
                  (click)="approveBooking(booking)"
                  *ngIf="booking.status === BookingStatus.Pending"
                >
                  {{ t.rentalBookingApprove }}
                </button>
                <button
                  class="btn btn-sm btn-danger"
                  (click)="cancelBooking(booking)"
                  *ngIf="booking.status !== BookingStatus.Cancelled"
                >
                  {{ t.rentalBookingCancel }}
                </button>
                <button
                  class="btn btn-sm btn-delete"
                  (click)="deleteBooking(booking)"
                  title="{{ t.delete }}"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                    <path d="M10 11v6M14 11v6"/>
                    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                  </svg>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <app-pagination
        *ngIf="viewMode === 'list' && paginatedResult && paginatedResult.totalCount > 0"
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
  styles: [
    `
      .page {
        max-width: 1400px;
        margin: 0 auto;
        overflow-x: hidden;
        animation: fadeIn 0.4s ease;
      }
      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(8px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      .page-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;
        flex-wrap: wrap;
        gap: 12px;
      }
      .filter-bar {
        display: flex;
        gap: 12px;
        margin-bottom: 18px;
        flex-wrap: wrap;
        align-items: center;
      }
      .filter-group {
        position: relative;
      }
      .search-group {
        flex: 1;
        min-width: 200px;
        max-width: 350px;
      }
      .filter-input {
        padding: 10px 14px;
        border: 1.5px solid var(--border-color);
        border-radius: var(--radius-md, 10px);
        background: var(--bg-card);
        color: var(--text-primary);
        font-size: 0.88rem;
        transition: all 0.2s;
      }
      .filter-input:focus {
        outline: none;
        border-color: var(--accent-primary);
        box-shadow: 0 0 0 3px
          var(--accent-primary-light, rgba(99, 102, 241, 0.08));
      }
      .search-input {
        width: 100%;
        padding-left: 40px;
      }
      .search-icon {
        position: absolute;
        left: 13px;
        top: 50%;
        transform: translateY(-50%);
        color: var(--text-muted);
        pointer-events: none;
        display: flex;
      }
      select.filter-input {
        min-width: 160px;
        cursor: pointer;
      }
      .table-wrap {
        overflow-x: auto;
        background: var(--bg-card);
        border-radius: var(--radius-lg, 14px);
        border: 1px solid var(--border-light);
      }
      table {
        width: 100%;
        border-collapse: collapse;
      }
      th {
        text-align: left;
        padding: 10px 12px;
        background: var(--table-stripe, #f8fafc);
        font-size: 0.75rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        color: var(--text-secondary, #64748b);
        border-bottom: 1.5px solid var(--border-light, #e2e8f0);
      }
      td {
        padding: 10px 12px;
        font-size: 0.9rem;
        color: var(--text-primary);
        border-bottom: 1px solid var(--border-light, #e2e8f0);
      }
      tr:hover td {
        background: var(--table-hover, #f1f5f9);
      }
      .empty {
        text-align: center;
        color: var(--text-secondary, #64748b);
        padding: 40px 20px;
      }
      .actions {
        display: flex;
        gap: 6px;
        flex-wrap: wrap;
      }
      .status-badge {
        display: inline-block;
        padding: 4px 11px;
        border-radius: 50px;
        font-size: 0.75rem;
        font-weight: 600;
        letter-spacing: 0.02em;
      }
      .status-badge.pending {
        background: rgba(245, 158, 11, 0.08);
        color: #b45309;
      }
      .status-badge.approved {
        background: rgba(16, 185, 129, 0.08);
        color: #10b981;
      }
      .status-badge.cancelled {
        background: rgba(239, 68, 68, 0.08);
        color: #ef4444;
      }
      .btn {
        padding: 6px 12px;
        border-radius: var(--radius-md, 10px);
        font-weight: 600;
        font-size: 0.82rem;
        cursor: pointer;
        border: 1.5px solid transparent;
        transition: all 0.15s;
        text-decoration: none;
        color: var(--text-primary);
        background: var(--bg-primary, #fff);
      }
      .btn-outline {
        border-color: var(--border-light, #e2e8f0);
      }
      .btn-outline:hover {
        border-color: var(--accent-primary, #6366f1);
        color: var(--accent-primary, #6366f1);
      }
      .btn-primary {
        background: var(--accent-primary, #6366f1);
        color: #fff;
        border-color: var(--accent-primary, #6366f1);
      }
      .btn-primary:hover {
        opacity: 0.9;
      }
      .btn-danger {
        background: var(--accent-danger, #ef4444);
        color: #fff;
        border-color: var(--accent-danger, #ef4444);
      }
      .btn-delete {
        background: transparent;
        color: var(--text-secondary, #64748b);
        border-color: var(--border-light, #e2e8f0);
        padding: 5px 8px;
        display: inline-flex;
        align-items: center;
      }
      .btn-delete:hover {
        background: rgba(239, 68, 68, 0.08);
        color: #ef4444;
        border-color: #ef4444;
      }
      .mono {
        font-family:
          ui-monospace, SFMono-Regular, SFMono-Regular, Menlo, Monaco, Consolas,
          'Liberation Mono', 'Courier New', monospace;
      }

      /* ── View toggle ── */
      .view-toggle {
        display: inline-flex;
        border: 1.5px solid var(--border-light, #e2e8f0);
        border-radius: var(--radius-md, 10px);
        overflow: hidden;
      }
      .view-toggle button {
        padding: 8px 16px;
        border: none;
        background: var(--bg-card, #fff);
        color: var(--text-secondary, #64748b);
        font-size: 0.85rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.15s;
      }
      .view-toggle button.active {
        background: var(--accent-primary, #6366f1);
        color: #fff;
      }

      /* ── Calendar ── */
      .cal-wrap {
        background: var(--bg-card, #fff);
        border: 1px solid var(--border-light, #e2e8f0);
        border-radius: var(--radius-lg, 14px);
        padding: 16px;
      }
      .cal-toolbar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 12px;
        margin-bottom: 14px;
      }
      .cal-nav {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .cal-nav-btn {
        width: 34px;
        height: 34px;
        border: 1.5px solid var(--border-light, #e2e8f0);
        border-radius: 8px;
        background: var(--bg-card, #fff);
        color: var(--text-primary);
        font-size: 1.2rem;
        line-height: 1;
        cursor: pointer;
      }
      .cal-nav-btn:hover {
        border-color: var(--accent-primary, #6366f1);
        color: var(--accent-primary, #6366f1);
      }
      .cal-month-label {
        min-width: 150px;
        text-align: center;
        font-weight: 700;
        font-size: 1.02rem;
        color: var(--text-primary);
        text-transform: capitalize;
      }
      .cal-today-btn {
        padding: 7px 13px;
        border: 1.5px solid var(--border-light, #e2e8f0);
        border-radius: 8px;
        background: var(--bg-card, #fff);
        color: var(--text-secondary, #64748b);
        font-size: 0.82rem;
        font-weight: 600;
        cursor: pointer;
      }
      .cal-today-btn:hover {
        border-color: var(--accent-primary, #6366f1);
        color: var(--accent-primary, #6366f1);
      }
      .cal-legend {
        display: flex;
        align-items: center;
        gap: 14px;
        flex-wrap: wrap;
        font-size: 0.8rem;
        color: var(--text-secondary, #64748b);
      }
      .legend-item {
        display: inline-flex;
        align-items: center;
        gap: 6px;
      }
      .legend-dot {
        width: 12px;
        height: 12px;
        border-radius: 4px;
        display: inline-block;
      }
      .dot-bike {
        background: #3b82f6;
      }
      .dot-ebike {
        background: #f59e0b;
      }
      .legend-note {
        font-style: italic;
      }
      .cal-weekdays {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: 4px;
        margin-bottom: 4px;
      }
      .cal-weekday {
        text-align: center;
        font-size: 0.72rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        color: var(--text-secondary, #64748b);
        padding: 4px 0;
      }
      .cal-grid {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: 4px;
      }
      .cal-day {
        min-height: 96px;
        border: 1px solid var(--border-light, #e2e8f0);
        border-radius: 8px;
        padding: 4px;
        display: flex;
        flex-direction: column;
        gap: 2px;
        background: var(--bg-primary, #fff);
        overflow: hidden;
      }
      .cal-day.other-month {
        opacity: 0.42;
      }
      .cal-day.is-today {
        border-color: var(--accent-primary, #6366f1);
        box-shadow: 0 0 0 1px var(--accent-primary, #6366f1) inset;
      }
      .cal-day-num {
        font-size: 0.75rem;
        font-weight: 700;
        color: var(--text-secondary, #64748b);
        padding: 1px 3px;
      }
      .cal-day.is-today .cal-day-num {
        color: var(--accent-primary, #6366f1);
      }
      .cal-chip {
        display: block;
        height: 18px;
        line-height: 14px;
        font-size: 0.7rem;
        font-weight: 600;
        color: #fff;
        background: #3b82f6;
        border: 2px solid #3b82f6;
        border-radius: 0;
        margin: 0 -4px;
        padding: 0 4px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        text-decoration: none;
        cursor: pointer;
      }
      .cal-chip.ebike {
        background: #f59e0b;
        border-color: #f59e0b;
      }
      /* pending = dashed outline instead of solid fill */
      .cal-chip.pending {
        background: rgba(59, 130, 246, 0.12);
        border-style: dashed;
        color: #3b82f6;
      }
      .cal-chip.pending.ebike {
        background: rgba(245, 158, 11, 0.14);
        border-color: #f59e0b;
        color: #b45309;
      }
      .cal-chip.chip-start {
        border-top-left-radius: 9px;
        border-bottom-left-radius: 9px;
        margin-left: 0;
      }
      .cal-chip.chip-end {
        border-top-right-radius: 9px;
        border-bottom-right-radius: 9px;
        margin-right: 0;
      }
      .cal-chip:hover {
        filter: brightness(1.08);
      }
      .chip-label {
        pointer-events: none;
      }
      .cal-empty {
        text-align: center;
        color: var(--text-secondary, #64748b);
        padding: 24px 0 8px;
      }
      @media (max-width: 700px) {
        .cal-day {
          min-height: 64px;
          padding: 3px 2px;
        }
        .chip-label {
          display: none;
        }
        .cal-chip {
          height: 10px;
        }
        .cal-month-label {
          min-width: 110px;
          font-size: 0.92rem;
        }
      }
    `,
  ],
})
export class RentalBookingListComponent implements OnInit {
  private service = inject(RentalBookingService);
  private notificationService = inject(NotificationService);
  private dialogService = inject(DialogService);
  private translationService = inject(TranslationService);
  paginatedResult: PaginatedResult<RentalBookingList> | null = null;
  currentPage = 1;
  pageSize = 20;
  filterStatus = '';
  searchText = '';

  BookingStatus = RentalBookingStatus;

  // ── Calendar state ──
  viewMode: 'list' | 'calendar' =
    (localStorage.getItem('rental-bookings-view') as 'list' | 'calendar') ||
    'list';
  calMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  calBookings: RentalBookingList[] = [];
  calDays: CalDay[] = [];

  get t() {
    return this.translationService.translations();
  }

  private get locale(): string {
    return this.translationService.currentLanguage() === 'tr'
      ? 'tr-TR'
      : 'de-DE';
  }

  get calMonthLabel(): string {
    return new Intl.DateTimeFormat(this.locale, {
      month: 'long',
      year: 'numeric',
    }).format(this.calMonth);
  }

  get calWeekdays(): string[] {
    const monday = new Date(2024, 0, 1); // a Monday
    return Array.from({ length: 7 }, (_, i) =>
      new Intl.DateTimeFormat(this.locale, { weekday: 'short' }).format(
        new Date(2024, 0, 1 + i),
      ),
    );
  }

  ngOnInit() {
    this.loadBookings();
    if (this.viewMode === 'calendar') this.loadCalendar();
  }

  setViewMode(mode: 'list' | 'calendar') {
    this.viewMode = mode;
    localStorage.setItem('rental-bookings-view', mode);
    if (mode === 'calendar') this.loadCalendar();
  }

  calPrev() {
    this.calMonth = new Date(
      this.calMonth.getFullYear(),
      this.calMonth.getMonth() - 1,
      1,
    );
    this.loadCalendar();
  }

  calNext() {
    this.calMonth = new Date(
      this.calMonth.getFullYear(),
      this.calMonth.getMonth() + 1,
      1,
    );
    this.loadCalendar();
  }

  calToday() {
    const now = new Date();
    this.calMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    this.loadCalendar();
  }

  loadCalendar() {
    this.service
      .getCalendar(this.calMonth.getFullYear(), this.calMonth.getMonth() + 1)
      .subscribe({
        next: (items) => {
          this.calBookings = items;
          this.buildCalendar();
        },
        error: () => {
          this.notificationService.error(this.t.saveError);
        },
      });
  }

  private buildCalendar() {
    const year = this.calMonth.getFullYear();
    const month = this.calMonth.getMonth();
    const firstOfMonth = new Date(year, month, 1);
    // Monday-first grid, padded to full weeks
    const lead = (firstOfMonth.getDay() + 6) % 7;
    const gridStart = new Date(year, month, 1 - lead);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cellCount = Math.ceil((lead + daysInMonth) / 7) * 7;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sorted = [...this.calBookings].sort(
      (a, b) =>
        new Date(a.startDatum).getTime() - new Date(b.startDatum).getTime() ||
        a.id - b.id,
    );

    const days: CalDay[] = [];
    for (let i = 0; i < cellCount; i++) {
      const date = new Date(
        gridStart.getFullYear(),
        gridStart.getMonth(),
        gridStart.getDate() + i,
      );
      const chips: CalChip[] = [];
      for (const booking of sorted) {
        const start = this.dateOnly(booking.startDatum);
        const end = this.dateOnly(booking.endDatum);
        if (date < start || date > end) continue;
        const isStart = date.getTime() === start.getTime();
        chips.push({
          booking,
          isStart,
          isEnd: date.getTime() === end.getTime(),
          // label on the first day and at each week start (Monday)
          showLabel: isStart || date.getDay() === 1,
        });
      }
      days.push({
        date,
        inMonth: date.getMonth() === month,
        isToday: date.getTime() === today.getTime(),
        chips,
      });
    }
    this.calDays = days;
  }

  private dateOnly(value: string): Date {
    const d = new Date(value);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  loadBookings() {
    this.service
      .getPaginated(
        this.currentPage,
        this.pageSize,
        this.filterStatus,
        this.searchText,
      )
      .subscribe({
        next: (result) => {
          this.paginatedResult = result;
        },
        error: () => {
          this.notificationService.error(this.t.saveError);
        },
      });
  }

  onSearch() {
    this.currentPage = 1;
    this.loadBookings();
  }

  onFilterChange() {
    this.currentPage = 1;
    this.loadBookings();
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.loadBookings();
  }

  onPageSizeChange(size: number) {
    this.pageSize = size;
    this.currentPage = 1;
    this.loadBookings();
  }

  getStatusClass(status: RentalBookingStatus) {
    if (status === RentalBookingStatus.Approved) return 'approved';
    if (status === RentalBookingStatus.Cancelled) return 'cancelled';
    return 'pending';
  }

  getStatusText(status: RentalBookingStatus) {
    if (status === RentalBookingStatus.Approved)
      return this.t.rentalBookingApproved;
    if (status === RentalBookingStatus.Cancelled)
      return this.t.rentalBookingCancelled;
    return this.t.rentalBookingPending;
  }

  approveBooking(booking: RentalBookingList) {
    this.dialogService
      .confirm({
        title: this.t.confirm,
        message: this.t.rentalBookingApproveConfirm,
      })
      .then((confirmed) => {
        if (!confirmed) return;
        this.service.approve(booking.id, {}).subscribe({
          next: () => {
            this.notificationService.success(this.t.saveSuccess);
            this.loadBookings();
          },
          error: (err) => {
            this.notificationService.error(
              err.error?.error || this.t.saveError,
            );
          },
        });
      });
  }

  deleteBooking(booking: RentalBookingList) {
    this.dialogService
      .danger(this.t.delete, this.t.deleteConfirmRentalBooking)
      .then((confirmed) => {
        if (!confirmed) return;
        this.service.delete(booking.id).subscribe({
          next: () => {
            this.notificationService.success(this.t.deleteSuccess);
            this.loadBookings();
          },
          error: () => {
            this.notificationService.error(this.t.saveError);
          },
        });
      });
  }

  cancelBooking(booking: RentalBookingList) {
    this.dialogService
      .danger(this.t.cancel, this.t.rentalBookingCancelConfirm)
      .then((confirmed) => {
        if (!confirmed) return;
        this.service.cancel(booking.id, {}).subscribe({
          next: () => {
            this.notificationService.success(this.t.cancelSuccess);
            this.loadBookings();
          },
          error: (err) => {
            this.notificationService.error(
              err.error?.error || this.t.saveError,
            );
          },
        });
      });
  }
}
