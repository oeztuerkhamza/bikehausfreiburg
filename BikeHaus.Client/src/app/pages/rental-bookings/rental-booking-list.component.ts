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

@Component({
  selector: 'app-rental-booking-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, PaginationComponent],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>{{ t.rentalBookings }}</h1>
      </div>

      <div class="filter-bar">
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

      <div class="table-wrap">
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
        *ngIf="paginatedResult && paginatedResult.totalCount > 0"
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

  get t() {
    return this.translationService.translations();
  }

  ngOnInit() {
    this.loadBookings();
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
