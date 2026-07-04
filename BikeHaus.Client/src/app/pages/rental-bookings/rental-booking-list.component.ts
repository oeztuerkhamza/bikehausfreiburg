import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { RentalBookingService } from '../../services/rental-booking.service';
import {
  RentalService,
  RentalCalendarItem,
} from '../../services/rental.service';
import { NotificationService } from '../../services/notification.service';
import { DialogService } from '../../services/dialog.service';
import { TranslationService } from '../../services/translation.service';
import {
  PaginatedResult,
  RentalBookingList,
  RentalBookingStatus,
} from '../../models/models';
import { PaginationComponent } from '../../components/pagination/pagination.component';

interface CalDay {
  date: Date;
  isToday: boolean;
}

/**
 * Unified calendar entry — either an online booking (Mietanfrage) or a
 * formal rental contract (Mietvertrag created in the client). Both are shown
 * in the calendar view; the list view still shows bookings only.
 */
interface CalItem {
  kind: 'booking' | 'rental';
  id: number;
  number: string; // Buchungs-/Mietvertrag-Nr.
  customerName: string;
  bikeInfo: string;
  hasEBike: boolean;
  isPending: boolean; // dashed style (only pending bookings)
  startDatum: string;
  endDatum: string;
}

/** One calendar entry rendered as a bar across the visible week. */
interface CalBar {
  item: CalItem;
  colStart: number; // 1-based grid column
  colEnd: number; // inclusive
  continuesLeft: boolean;
  continuesRight: boolean;
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

      <!-- ── Calendar view (weekly) ── -->
      <div *ngIf="viewMode === 'calendar'" class="cal-wrap">
        <div class="cal-toolbar">
          <div class="cal-nav">
            <button type="button" class="cal-nav-btn" (click)="calPrev()">
              ‹
            </button>
            <div class="cal-month-label">{{ calWeekLabel }}</div>
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

        <div class="cal-weekhead">
          <div
            *ngFor="let day of calDays"
            class="cal-wh-day"
            [class.is-today]="day.isToday"
          >
            <span class="wh-name">{{ weekdayShort(day.date) }}</span>
            <span class="wh-num">{{ day.date | date: 'dd.MM.' }}</span>
          </div>
        </div>

        <div class="cal-lanes" *ngIf="calBars.length > 0">
          <div
            *ngIf="todayCol >= 0"
            class="cal-today-col"
            [style.left]="'calc(' + todayCol + ' * 100% / 7)'"
          ></div>
          <a
            *ngFor="let bar of calBars; let i = index"
            class="cal-bar"
            [class.ebike]="bar.item.hasEBike"
            [class.pending]="bar.item.isPending"
            [class.rental]="bar.item.kind === 'rental'"
            [class.cont-left]="bar.continuesLeft"
            [class.cont-right]="bar.continuesRight"
            [style.grid-column]="bar.colStart + ' / ' + (bar.colEnd + 1)"
            [style.grid-row]="i + 1"
            [routerLink]="
              bar.item.kind === 'rental'
                ? ['/rentals', bar.item.id]
                : ['/rental-bookings', bar.item.id]
            "
            [title]="
              bar.item.number +
              ' · ' +
              bar.item.customerName +
              ' · ' +
              bar.item.bikeInfo +
              ' · ' +
              (bar.item.startDatum | date: 'dd.MM.') +
              '–' +
              (bar.item.endDatum | date: 'dd.MM.yyyy')
            "
          >
            <span class="bar-label">
              <strong>{{ bar.item.customerName }}</strong>
              <span class="bar-bike">· {{ bar.item.bikeInfo }}</span>
            </span>
          </a>
        </div>

        <div *ngIf="calBars.length === 0" class="cal-empty">
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
      /* week header: 7 day columns */
      .cal-weekhead {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        border-bottom: 1.5px solid var(--border-light, #e2e8f0);
        margin-bottom: 8px;
      }
      .cal-wh-day {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1px;
        padding: 6px 2px 8px;
        border-radius: 8px 8px 0 0;
      }
      .cal-wh-day.is-today {
        background: var(--accent-primary-light, rgba(99, 102, 241, 0.08));
      }
      .wh-name {
        font-size: 0.72rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        color: var(--text-secondary, #64748b);
      }
      .cal-wh-day.is-today .wh-name,
      .cal-wh-day.is-today .wh-num {
        color: var(--accent-primary, #6366f1);
      }
      .wh-num {
        font-size: 0.92rem;
        font-weight: 700;
        color: var(--text-primary);
      }

      /* lanes: one row per booking, bars span their day columns */
      .cal-lanes {
        position: relative;
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        grid-auto-rows: 34px;
        row-gap: 6px;
        padding: 6px 0 10px;
        /* vertical day separators */
        background-image: repeating-linear-gradient(
          to right,
          transparent 0,
          transparent calc(100% / 7 - 1px),
          var(--border-light, #e2e8f0) calc(100% / 7 - 1px),
          var(--border-light, #e2e8f0) calc(100% / 7)
        );
        min-height: 120px;
      }
      .cal-today-col {
        position: absolute;
        top: 0;
        bottom: 0;
        width: calc(100% / 7);
        background: var(--accent-primary-light, rgba(99, 102, 241, 0.06));
        pointer-events: none;
      }
      .cal-bar {
        display: flex;
        align-items: center;
        height: 28px;
        margin: 0 3px;
        padding: 0 10px;
        border-radius: 8px;
        background: #3b82f6;
        border: 2px solid #3b82f6;
        color: #fff;
        font-size: 0.8rem;
        white-space: nowrap;
        overflow: hidden;
        text-decoration: none;
        cursor: pointer;
        z-index: 1;
      }
      .cal-bar .bar-label {
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .cal-bar .bar-bike {
        opacity: 0.85;
        font-weight: 400;
      }
      .cal-bar.ebike {
        background: #f59e0b;
        border-color: #f59e0b;
      }
      /* pending = dashed outline instead of solid fill */
      .cal-bar.pending {
        background: rgba(59, 130, 246, 0.1);
        border-style: dashed;
        color: #2563eb;
      }
      .cal-bar.pending .bar-bike {
        opacity: 0.75;
      }
      .cal-bar.pending.ebike {
        background: rgba(245, 158, 11, 0.12);
        border-color: #f59e0b;
        color: #b45309;
      }
      /* formal rental contract (Mietvertrag) — white left marker to tell it
         apart from an online booking of the same bike type */
      .cal-bar.rental {
        box-shadow: inset 3px 0 0 rgba(255, 255, 255, 0.75);
      }
      /* booking continues beyond the visible week */
      .cal-bar.cont-left {
        border-top-left-radius: 0;
        border-bottom-left-radius: 0;
        border-left-style: dotted;
        margin-left: 0;
      }
      .cal-bar.cont-right {
        border-top-right-radius: 0;
        border-bottom-right-radius: 0;
        border-right-style: dotted;
        margin-right: 0;
      }
      .cal-bar:hover {
        filter: brightness(1.06);
      }
      .cal-empty {
        text-align: center;
        color: var(--text-secondary, #64748b);
        padding: 24px 0 8px;
      }
      @media (max-width: 700px) {
        .cal-month-label {
          min-width: 120px;
          font-size: 0.92rem;
        }
        .cal-lanes {
          grid-auto-rows: 30px;
        }
        .cal-bar {
          font-size: 0.7rem;
          padding: 0 6px;
          height: 24px;
          margin: 0 1px;
        }
        .wh-num {
          font-size: 0.78rem;
        }
        .wh-name {
          font-size: 0.62rem;
        }
      }
    `,
  ],
})
export class RentalBookingListComponent implements OnInit {
  private service = inject(RentalBookingService);
  private rentalService = inject(RentalService);
  private notificationService = inject(NotificationService);
  private dialogService = inject(DialogService);
  private translationService = inject(TranslationService);
  paginatedResult: PaginatedResult<RentalBookingList> | null = null;
  currentPage = 1;
  pageSize = 1000;
  filterStatus = '';
  searchText = '';

  BookingStatus = RentalBookingStatus;

  // ── Calendar state (weekly view) ──
  viewMode: 'list' | 'calendar' =
    (localStorage.getItem('rental-bookings-view') as 'list' | 'calendar') ||
    'list';
  calWeekStart = this.mondayOf(new Date());
  calItems: CalItem[] = [];
  calDays: CalDay[] = [];
  calBars: CalBar[] = [];
  todayCol = -1;

  get t() {
    return this.translationService.translations();
  }

  private get locale(): string {
    return this.translationService.currentLanguage() === 'tr'
      ? 'tr-TR'
      : 'de-DE';
  }

  get calWeekLabel(): string {
    const end = this.addDays(this.calWeekStart, 6);
    const fmt = (d: Date) =>
      `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.`;
    return `${fmt(this.calWeekStart)} – ${fmt(end)}${end.getFullYear()}`;
  }

  weekdayShort(date: Date): string {
    return new Intl.DateTimeFormat(this.locale, { weekday: 'short' }).format(
      date,
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
    this.calWeekStart = this.addDays(this.calWeekStart, -7);
    this.loadCalendar();
  }

  calNext() {
    this.calWeekStart = this.addDays(this.calWeekStart, 7);
    this.loadCalendar();
  }

  calToday() {
    this.calWeekStart = this.mondayOf(new Date());
    this.loadCalendar();
  }

  loadCalendar() {
    const weekEnd = this.addDays(this.calWeekStart, 6);
    const from = this.toIso(this.calWeekStart);
    const to = this.toIso(weekEnd);
    // Calendar merges online bookings (Mietanfragen) with formal rental
    // contracts (Mietverträge) so both show up on the timeline.
    forkJoin({
      bookings: this.service.getCalendar(from, to),
      rentals: this.rentalService.getCalendar(from, to),
    }).subscribe({
      next: ({ bookings, rentals }) => {
        const bookingItems = bookings.map((b) => this.bookingToItem(b));
        // A booking converted into a Mietvertrag exists as BOTH an approved
        // booking and a rental (no DB link between them). Skip the rental if a
        // booking with the same customer + date range is already shown, so
        // converted rentals aren't duplicated — but rentals created directly in
        // the client (no matching booking) still appear.
        const bookingKeys = new Set(
          bookingItems.map((i) => this.calItemKey(i)),
        );
        const rentalItems = rentals
          .map((r) => this.rentalToItem(r))
          .filter((i) => !bookingKeys.has(this.calItemKey(i)));
        this.calItems = [...bookingItems, ...rentalItems];
        this.buildCalendar();
      },
      error: () => {
        this.notificationService.error(this.t.saveError);
      },
    });
  }

  private bookingToItem(b: RentalBookingList): CalItem {
    return {
      kind: 'booking',
      id: b.id,
      number: b.buchungsNummer,
      customerName: b.customerName,
      bikeInfo: b.bikeInfo,
      hasEBike: b.hasEBike,
      isPending: b.status === RentalBookingStatus.Pending,
      startDatum: b.startDatum,
      endDatum: b.endDatum,
    };
  }

  /** Dedup key: same customer + same date range = likely the same rental. */
  private calItemKey(i: CalItem): string {
    const name = i.customerName.trim().toLowerCase();
    return `${name}|${this.toIso(this.dateOnly(i.startDatum))}|${this.toIso(this.dateOnly(i.endDatum))}`;
  }

  private rentalToItem(r: RentalCalendarItem): CalItem {
    return {
      kind: 'rental',
      id: r.id,
      number: r.mietvertragNummer,
      customerName: r.customerName,
      bikeInfo: r.bikeInfo,
      hasEBike: r.hasEBike,
      isPending: false,
      startDatum: r.startDatum,
      endDatum: r.endDatum,
    };
  }

  private buildCalendar() {
    const weekStart = this.calWeekStart;
    const weekEnd = this.addDays(weekStart, 6);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    this.calDays = Array.from({ length: 7 }, (_, i) => {
      const date = this.addDays(weekStart, i);
      return { date, isToday: date.getTime() === today.getTime() };
    });
    this.todayCol = this.calDays.findIndex((d) => d.isToday);

    const sorted = [...this.calItems].sort(
      (a, b) =>
        new Date(a.startDatum).getTime() - new Date(b.startDatum).getTime() ||
        a.id - b.id,
    );

    // One lane per entry: a continuous bar clamped to the visible week.
    this.calBars = sorted
      .map((item) => {
        const start = this.dateOnly(item.startDatum);
        const end = this.dateOnly(item.endDatum);
        if (end < weekStart || start > weekEnd) return null;
        const clampedStart = start < weekStart ? weekStart : start;
        const clampedEnd = end > weekEnd ? weekEnd : end;
        return {
          item,
          colStart: this.dayDiff(weekStart, clampedStart) + 1,
          colEnd: this.dayDiff(weekStart, clampedEnd) + 1,
          continuesLeft: start < weekStart,
          continuesRight: end > weekEnd,
        };
      })
      .filter((b): b is CalBar => b !== null);
  }

  private mondayOf(date: Date): Date {
    const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    return this.addDays(d, -((d.getDay() + 6) % 7));
  }

  private addDays(date: Date, days: number): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
  }

  private dayDiff(a: Date, b: Date): number {
    return Math.round((b.getTime() - a.getTime()) / 86400000);
  }

  private toIso(date: Date): string {
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${date.getFullYear()}-${m}-${d}`;
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
