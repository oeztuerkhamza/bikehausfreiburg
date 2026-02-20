import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ReservationService } from '../../services/reservation.service';
import { ExcelExportService } from '../../services/excel-export.service';
import { TranslationService } from '../../services/translation.service';
import { NotificationService } from '../../services/notification.service';
import { DialogService } from '../../services/dialog.service';
import {
  ReservationList,
  ReservationStatus,
  PaginatedResult,
} from '../../models/models';
import { PaginationComponent } from '../../components/pagination/pagination.component';

@Component({
  selector: 'app-reservation-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, PaginationComponent],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>{{ t.reservations }}</h1>
        <div class="header-actions">
          <button class="btn btn-outline" (click)="exportExcel()">
            📥 Excel Export
          </button>
          <a routerLink="/reservations/new" class="btn btn-primary"
            >+ {{ t.newReservation }}</a
          >
        </div>
      </div>

      <!-- Filter Bar -->
      <div class="filter-bar">
        <div class="filter-group search-group">
          <input
            type="text"
            [(ngModel)]="searchText"
            (input)="onSearch()"
            [placeholder]="t.searchPlaceholder"
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
              <line x1="21" y1="21" x2="16.65" y2="16.65" /></svg
          ></span>
        </div>
        <div class="filter-group">
          <select
            [(ngModel)]="filterStatus"
            (change)="onFilterChange()"
            class="filter-input"
          >
            <option value="">{{ t.allStatus }}</option>
            <option value="Active">{{ t.active }}</option>
            <option value="Expired">{{ t.expired }}</option>
            <option value="Cancelled">{{ t.cancelled }}</option>
            <option value="Converted">{{ t.converted }}</option>
          </select>
        </div>
      </div>

      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>{{ t.reservationNumber }}</th>
              <th>{{ t.stockNo }}</th>
              <th>{{ t.bicycle }}</th>
              <th>{{ t.buyer }}</th>
              <th>{{ t.reservationDate }}</th>
              <th>{{ t.expirationDate }}</th>
              <th>{{ t.deposit }}</th>
              <th>{{ t.status }}</th>
              <th>{{ t.actions }}</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngIf="paginatedResult?.items?.length === 0">
              <td
                colspan="9"
                style="text-align:center;padding:32px;color:var(--text-muted);"
              >
                {{ t.noReservations }}
              </td>
            </tr>
            <tr
              *ngFor="let r of paginatedResult?.items"
              [class.expired-row]="r.isExpired && r.status === 'Active'"
            >
              <td class="mono">{{ r.reservierungsNummer }}</td>
              <td class="mono">{{ r.stokNo || '–' }}</td>
              <td>{{ r.bikeInfo }}</td>
              <td>{{ r.customerName }}</td>
              <td>{{ r.reservierungsDatum | date: 'dd.MM.yyyy' }}</td>
              <td [class.expired-date]="r.isExpired && r.status === 'Active'">
                {{ r.ablaufDatum | date: 'dd.MM.yyyy' }}
                <span
                  *ngIf="r.isExpired && r.status === 'Active'"
                  class="expired-badge"
                  >!</span
                >
              </td>
              <td>
                {{ r.anzahlung ? (r.anzahlung | number: '1.2-2') + ' €' : '-' }}
              </td>
              <td>
                <span class="status-badge" [class]="getStatusClass(r.status)">
                  {{ getStatusText(r.status) }}
                </span>
              </td>
              <td class="actions-cell">
                <a
                  *ngIf="r.status === 'Active'"
                  [routerLink]="['/reservations', r.id, 'convert']"
                  class="btn btn-sm btn-success"
                  title="{{ t.convertToSale }}"
                >
                  💰
                </a>
                <button
                  *ngIf="r.status === 'Active'"
                  class="btn btn-sm btn-warning"
                  title="{{ t.cancelReservation }}"
                  (click)="cancelReservation(r)"
                >
                  ✖
                </button>
                <a
                  [routerLink]="['/reservations', r.id]"
                  class="btn btn-sm"
                  title="{{ t.edit }}"
                >
                  👁
                </a>
                <button
                  class="btn btn-sm btn-danger"
                  title="{{ t.delete }}"
                  (click)="confirmDelete(r)"
                >
                  🗑
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

    <!-- Delete Confirmation Modal -->
    <div
      class="modal-backdrop"
      *ngIf="showDeleteModal"
      (click)="showDeleteModal = false"
    >
      <div class="modal" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>{{ t.delete }}</h3>
        </div>
        <div class="modal-body">
          <p>{{ t.deleteConfirmReservation }}</p>
          <p *ngIf="selectedReservation" class="delete-info">
            <strong>{{ selectedReservation.reservierungsNummer }}</strong> -
            {{ selectedReservation.bikeInfo }}
          </p>
        </div>
        <div class="modal-footer">
          <button class="btn" (click)="showDeleteModal = false">
            {{ t.cancel }}
          </button>
          <button class="btn btn-danger" (click)="deleteReservation()">
            {{ t.delete }}
          </button>
        </div>
      </div>
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
        overflow: visible;
      }

      .header-actions {
        display: flex;
        gap: 10px;
        align-items: center;
        flex-shrink: 0;
      }

      .header-actions .btn {
        white-space: nowrap;
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
        box-shadow: var(--shadow-sm);
      }

      table {
        width: 100%;
        border-collapse: collapse;
      }

      th,
      td {
        text-align: left;
        padding: 12px 16px;
        border-bottom: 1px solid var(--border-light);
      }

      th {
        font-weight: 600;
        font-size: 0.75rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--text-muted);
        background: var(--table-stripe, #f8fafc);
      }

      td {
        font-size: 0.88rem;
        color: var(--text-secondary);
      }

      tr:hover td {
        background: var(--table-hover, #f1f5f9);
      }

      .mono {
        font-family: 'SF Mono', 'Consolas', monospace;
        font-size: 0.82rem;
        color: var(--accent-primary);
        background: var(--accent-primary-light, rgba(99, 102, 241, 0.08));
        padding: 2px 8px;
        border-radius: 6px;
        font-weight: 600;
      }

      .expired-row {
        background: var(--accent-danger-light, rgba(239, 68, 68, 0.04));
      }

      .expired-date {
        color: var(--accent-danger, #ef4444);
        font-weight: 600;
      }

      .expired-badge {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background: var(--accent-danger, #ef4444);
        color: white;
        border-radius: 50%;
        width: 18px;
        height: 18px;
        font-size: 0.7rem;
        font-weight: 700;
        margin-left: 6px;
      }

      .status-badge {
        display: inline-block;
        padding: 4px 11px;
        border-radius: 50px;
        font-size: 0.75rem;
        font-weight: 600;
        letter-spacing: 0.02em;
      }

      .status-active {
        background: var(--accent-success-light, rgba(16, 185, 129, 0.08));
        color: var(--accent-success, #10b981);
      }

      .status-expired {
        background: var(--accent-danger-light, rgba(239, 68, 68, 0.08));
        color: var(--accent-danger, #ef4444);
      }

      .status-cancelled {
        background: rgba(100, 116, 139, 0.08);
        color: #64748b;
      }

      .status-converted {
        background: rgba(59, 130, 246, 0.08);
        color: #3b82f6;
      }

      .actions-cell {
        display: flex;
        gap: 6px;
      }

      .btn {
        padding: 8px 16px;
        border-radius: var(--radius-md, 10px);
        font-weight: 600;
        font-size: 0.85rem;
        cursor: pointer;
        border: none;
        transition: var(--transition-fast);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        text-decoration: none;
      }

      .btn-primary {
        background: var(--accent-primary, #6366f1);
        color: white;
      }

      .btn-primary:hover {
        background: var(--accent-primary-hover, #4f46e5);
        box-shadow: var(--shadow-sm);
      }

      .btn-sm {
        padding: 5px 10px;
        font-size: 0.78rem;
        background: var(--bg-secondary, #f1f5f9);
        color: var(--text-primary);
        border-radius: var(--radius-sm, 6px);
      }

      .btn-sm:hover {
        background: var(--border-light, #e2e8f0);
      }

      .btn-danger {
        background: var(--accent-danger-light, rgba(239, 68, 68, 0.08));
        color: var(--accent-danger, #ef4444);
      }

      .btn-danger:hover {
        background: rgba(239, 68, 68, 0.15);
      }

      .btn-warning {
        background: rgba(245, 158, 11, 0.08);
        color: #f59e0b;
      }

      .btn-warning:hover {
        background: rgba(245, 158, 11, 0.15);
      }

      .btn-success {
        background: var(--accent-success-light, rgba(16, 185, 129, 0.08));
        color: var(--accent-success, #10b981);
      }

      .btn-success:hover {
        background: rgba(16, 185, 129, 0.15);
      }

      /* Modal */
      .modal-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.4);
        backdrop-filter: blur(4px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        animation: fadeIn 0.2s ease;
      }

      .modal {
        background: var(--bg-card, #fff);
        border-radius: var(--radius-xl, 20px);
        width: 90%;
        max-width: 420px;
        overflow: hidden;
        box-shadow: var(--shadow-xl);
        animation: scaleIn 0.25s ease;
      }

      .modal-header {
        padding: 18px 22px;
        border-bottom: 1.5px solid var(--border-light, #e2e8f0);
      }

      .modal-header h3 {
        margin: 0;
        font-size: 1.05rem;
        font-weight: 700;
        color: var(--text-primary);
      }

      .modal-body {
        padding: 22px;
      }

      .modal-body p {
        margin: 0 0 12px 0;
        color: var(--text-secondary, #64748b);
        font-size: 0.92rem;
        line-height: 1.5;
      }

      .delete-info {
        background: var(--bg-secondary, #f8fafc);
        padding: 12px 14px;
        border-radius: var(--radius-md, 10px);
        font-size: 0.88rem;
        border: 1.5px solid var(--border-light, #e2e8f0);
      }

      .modal-footer {
        padding: 16px 22px;
        border-top: 1.5px solid var(--border-light, #e2e8f0);
        display: flex;
        justify-content: flex-end;
        gap: 10px;
      }
    `,
  ],
})
export class ReservationListComponent implements OnInit {
  private reservationService = inject(ReservationService);
  private excelExportService = inject(ExcelExportService);
  private translationService = inject(TranslationService);
  private notificationService = inject(NotificationService);
  private dialogService = inject(DialogService);

  paginatedResult: PaginatedResult<ReservationList> | null = null;
  searchText = '';
  filterStatus = '';
  currentPage = 1;
  pageSize = 20;

  showDeleteModal = false;
  selectedReservation: ReservationList | null = null;

  get t() {
    return this.translationService.translations();
  }

  ngOnInit() {
    this.loadReservations();
  }

  loadReservations() {
    this.reservationService
      .getPaginated(
        this.currentPage,
        this.pageSize,
        this.filterStatus || undefined,
        this.searchText || undefined,
      )
      .subscribe({
        next: (data) => {
          this.paginatedResult = data;
        },
        error: (err) => console.error('Error loading reservations:', err),
      });
  }

  onSearch() {
    this.currentPage = 1;
    this.loadReservations();
  }

  onFilterChange() {
    this.currentPage = 1;
    this.loadReservations();
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.loadReservations();
  }

  onPageSizeChange(size: number) {
    this.pageSize = size;
    this.currentPage = 1;
    this.loadReservations();
  }

  getStatusClass(status: ReservationStatus): string {
    const map: Record<string, string> = {
      Active: 'status-active',
      Expired: 'status-expired',
      Cancelled: 'status-cancelled',
      Converted: 'status-converted',
    };
    return map[status] || '';
  }

  getStatusText(status: ReservationStatus): string {
    const t = this.t;
    const map: Record<string, string> = {
      Active: t.active,
      Expired: t.expired,
      Cancelled: t.cancelled,
      Converted: t.converted,
    };
    return map[status] || status;
  }

  cancelReservation(reservation: ReservationList) {
    this.dialogService
      .confirm({
        title: this.t.cancelReservation,
        message: this.t.cancelReservation + '?',
        type: 'danger',
        confirmText: this.t.cancel || 'Abbrechen',
      })
      .then((confirmed) => {
        if (confirmed) {
          this.reservationService.cancel(reservation.id).subscribe({
            next: () => {
              this.notificationService.success(
                this.t.cancelSuccess || 'Erfolgreich storniert',
              );
              this.loadReservations();
            },
            error: (err) => {
              this.notificationService.error(
                err.error?.error || 'Fehler beim Stornieren',
              );
            },
          });
        }
      });
  }

  exportExcel() {
    this.excelExportService.exportToExcel(
      this.paginatedResult?.items || [],
      'Reservierungen',
      [
        { key: 'reservierungsNummer', header: 'Res.-Nr.' },
        { key: 'bikeInfo', header: 'Fahrrad' },
        { key: 'customerName', header: 'Kunde' },
        { key: 'reservierungsDatum', header: 'Reservierungsdatum' },
        { key: 'ablaufDatum', header: 'Ablaufdatum' },
        { key: 'anzahlung', header: 'Anzahlung (€)' },
        { key: 'status', header: 'Status' },
      ],
    );
  }

  confirmDelete(reservation: ReservationList) {
    this.dialogService
      .danger(
        this.t.delete,
        this.t.deleteConfirmReservation || 'Reservierung endgültig löschen?',
      )
      .then((confirmed) => {
        if (confirmed) {
          this.reservationService.delete(reservation.id).subscribe({
            next: () => {
              this.notificationService.success(
                this.t.deleteSuccess || 'Erfolgreich gelöscht',
              );
              this.loadReservations();
            },
            error: (err) => {
              this.notificationService.error(
                err.error?.error || this.t.deleteError,
              );
            },
          });
        }
      });
  }

  deleteReservation() {
    // This method is deprecated - delete is now handled in confirmDelete
  }
}
