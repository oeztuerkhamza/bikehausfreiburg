import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ReservationService } from '../../services/reservation.service';
import { TranslationService } from '../../services/translation.service';
import { ReservationList, ReservationStatus } from '../../models/models';

@Component({
  selector: 'app-reservation-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>{{ t.reservations }}</h1>
        <a routerLink="/reservations/new" class="btn btn-primary"
          >+ {{ t.newReservation }}</a
        >
      </div>

      <!-- Filter Bar -->
      <div class="filter-bar">
        <div class="filter-group search-group">
          <input
            type="text"
            [(ngModel)]="searchText"
            (ngModelChange)="applyFilters()"
            [placeholder]="t.searchPlaceholder"
            class="filter-input search-input"
          />
          <span class="search-icon">🔍</span>
        </div>
        <div class="filter-group">
          <select
            [(ngModel)]="filterStatus"
            (ngModelChange)="applyFilters()"
            class="filter-input"
          >
            <option value="">Alle Status</option>
            <option value="Active">{{ t.active }}</option>
            <option value="Expired">{{ t.expired }}</option>
            <option value="Cancelled">{{ t.cancelled }}</option>
            <option value="Converted">{{ t.converted }}</option>
          </select>
        </div>
        <span
          class="result-count"
          *ngIf="filteredReservations.length !== reservations.length"
        >
          {{ filteredReservations.length }} / {{ reservations.length }}
        </span>
      </div>

      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>{{ t.reservationNumber }}</th>
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
            <tr
              *ngIf="
                filteredReservations.length === 0 && reservations.length > 0
              "
            >
              <td
                colspan="8"
                style="text-align:center;padding:32px;color:var(--text-muted);"
              >
                {{ t.noResults }}
              </td>
            </tr>
            <tr *ngIf="reservations.length === 0">
              <td
                colspan="8"
                style="text-align:center;padding:32px;color:var(--text-muted);"
              >
                {{ t.noReservations }}
              </td>
            </tr>
            <tr
              *ngFor="let r of filteredReservations"
              [class.expired-row]="r.isExpired && r.status === 'Active'"
            >
              <td class="mono">{{ r.reservierungsNummer }}</td>
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
        padding: 24px;
        max-width: 1400px;
        margin: 0 auto;
      }

      .page-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;
      }

      .page-header h1 {
        font-size: 1.75rem;
        font-weight: 600;
        color: var(--text);
      }

      .filter-bar {
        display: flex;
        gap: 12px;
        margin-bottom: 20px;
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
        border: 1px solid var(--border);
        border-radius: 8px;
        background: var(--card);
        color: var(--text);
        font-size: 0.9rem;
        transition: border-color 0.2s;
      }

      .filter-input:focus {
        outline: none;
        border-color: var(--primary);
      }

      .search-input {
        width: 100%;
        padding-left: 36px;
      }

      .search-icon {
        position: absolute;
        left: 12px;
        top: 50%;
        transform: translateY(-50%);
        opacity: 0.5;
      }

      select.filter-input {
        min-width: 160px;
        cursor: pointer;
      }

      .result-count {
        font-size: 0.85rem;
        color: var(--text-muted);
        padding: 8px 12px;
        background: var(--bg);
        border-radius: 6px;
      }

      .table-wrap {
        overflow-x: auto;
        background: var(--card);
        border-radius: 12px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
      }

      table {
        width: 100%;
        border-collapse: collapse;
      }

      th,
      td {
        text-align: left;
        padding: 14px 16px;
        border-bottom: 1px solid var(--border);
      }

      th {
        font-weight: 600;
        font-size: 0.8rem;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        color: var(--text-muted);
        background: var(--bg);
      }

      td {
        font-size: 0.9rem;
        color: var(--text);
      }

      .mono {
        font-family: monospace;
        font-size: 0.85rem;
      }

      .expired-row {
        background: rgba(239, 68, 68, 0.05);
      }

      .expired-date {
        color: #ef4444;
        font-weight: 600;
      }

      .expired-badge {
        display: inline-block;
        background: #ef4444;
        color: white;
        border-radius: 50%;
        width: 18px;
        height: 18px;
        text-align: center;
        font-size: 0.75rem;
        font-weight: bold;
        margin-left: 6px;
        line-height: 18px;
      }

      .status-badge {
        display: inline-block;
        padding: 4px 10px;
        border-radius: 12px;
        font-size: 0.75rem;
        font-weight: 600;
        text-transform: uppercase;
      }

      .status-active {
        background: rgba(34, 197, 94, 0.1);
        color: #16a34a;
      }

      .status-expired {
        background: rgba(239, 68, 68, 0.1);
        color: #dc2626;
      }

      .status-cancelled {
        background: rgba(156, 163, 175, 0.2);
        color: #6b7280;
      }

      .status-converted {
        background: rgba(59, 130, 246, 0.1);
        color: #2563eb;
      }

      .actions-cell {
        display: flex;
        gap: 6px;
      }

      .btn {
        padding: 8px 16px;
        border-radius: 8px;
        font-weight: 500;
        font-size: 0.9rem;
        cursor: pointer;
        border: none;
        transition: all 0.2s;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        text-decoration: none;
      }

      .btn-primary {
        background: var(--primary);
        color: white;
      }

      .btn-primary:hover {
        opacity: 0.9;
      }

      .btn-sm {
        padding: 6px 10px;
        font-size: 0.8rem;
        background: var(--bg);
        color: var(--text);
      }

      .btn-sm:hover {
        background: var(--border);
      }

      .btn-danger {
        background: #fee2e2;
        color: #dc2626;
      }

      .btn-danger:hover {
        background: #fecaca;
      }

      .btn-warning {
        background: #fef3c7;
        color: #d97706;
      }

      .btn-warning:hover {
        background: #fde68a;
      }

      .btn-success {
        background: #dcfce7;
        color: #16a34a;
      }

      .btn-success:hover {
        background: #bbf7d0;
      }

      /* Modal */
      .modal-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
      }

      .modal {
        background: var(--card);
        border-radius: 12px;
        width: 90%;
        max-width: 400px;
        overflow: hidden;
      }

      .modal-header {
        padding: 16px 20px;
        border-bottom: 1px solid var(--border);
      }

      .modal-header h3 {
        margin: 0;
        font-size: 1.1rem;
        font-weight: 600;
      }

      .modal-body {
        padding: 20px;
      }

      .modal-body p {
        margin: 0 0 12px 0;
        color: var(--text);
      }

      .delete-info {
        background: var(--bg);
        padding: 12px;
        border-radius: 8px;
        font-size: 0.9rem;
      }

      .modal-footer {
        padding: 16px 20px;
        border-top: 1px solid var(--border);
        display: flex;
        justify-content: flex-end;
        gap: 12px;
      }
    `,
  ],
})
export class ReservationListComponent implements OnInit {
  private reservationService = inject(ReservationService);
  private translationService = inject(TranslationService);

  reservations: ReservationList[] = [];
  filteredReservations: ReservationList[] = [];

  searchText = '';
  filterStatus = '';

  showDeleteModal = false;
  selectedReservation: ReservationList | null = null;

  get t() {
    return this.translationService.translations();
  }

  ngOnInit() {
    this.loadReservations();
  }

  loadReservations() {
    this.reservationService.getAll().subscribe({
      next: (data) => {
        this.reservations = data;
        this.applyFilters();
      },
      error: (err) => console.error('Error loading reservations:', err),
    });
  }

  applyFilters() {
    let result = [...this.reservations];

    // Search filter
    if (this.searchText.trim()) {
      const search = this.searchText.toLowerCase();
      result = result.filter(
        (r) =>
          r.reservierungsNummer.toLowerCase().includes(search) ||
          r.bikeInfo.toLowerCase().includes(search) ||
          r.customerName.toLowerCase().includes(search),
      );
    }

    // Status filter
    if (this.filterStatus) {
      result = result.filter((r) => r.status === this.filterStatus);
    }

    this.filteredReservations = result;
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
    if (confirm(this.t.cancelReservation + '?')) {
      this.reservationService.cancel(reservation.id).subscribe({
        next: () => this.loadReservations(),
        error: (err) => console.error('Error cancelling reservation:', err),
      });
    }
  }

  confirmDelete(reservation: ReservationList) {
    this.selectedReservation = reservation;
    this.showDeleteModal = true;
  }

  deleteReservation() {
    if (!this.selectedReservation) return;

    this.reservationService.delete(this.selectedReservation.id).subscribe({
      next: () => {
        this.showDeleteModal = false;
        this.selectedReservation = null;
        this.loadReservations();
      },
      error: (err) => console.error('Error deleting reservation:', err),
    });
  }
}
