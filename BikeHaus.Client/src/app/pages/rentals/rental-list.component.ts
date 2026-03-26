import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { RentalService } from '../../services/rental.service';
import { ExcelExportService } from '../../services/excel-export.service';
import { NotificationService } from '../../services/notification.service';
import { DialogService } from '../../services/dialog.service';
import { RentalList, RentalStatus, PaginatedResult } from '../../models/models';
import { PaginationComponent } from '../../components/pagination/pagination.component';

@Component({
  selector: 'app-rental-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, PaginationComponent],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>Fahrradverleih (Miete)</h1>
        <div class="header-actions">
          <button class="btn btn-outline" (click)="exportExcel()">
            📥 Excel Export
          </button>
          <a routerLink="/rentals/new" class="btn btn-primary"
            >+ Neue Vermietung</a
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
            placeholder="Suchen..."
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
            <option value="">Alle Status</option>
            <option value="Active">Aktiv</option>
            <option value="Returned">Zurückgegeben</option>
            <option value="Cancelled">Storniert</option>
          </select>
        </div>
      </div>

      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Vertrag-Nr.</th>
              <th>Fahrrad</th>
              <th>Mieter</th>
              <th>Von</th>
              <th>Bis</th>
              <th>Miete</th>
              <th>Kaution</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngIf="paginatedResult?.items?.length === 0">
              <td
                colspan="8"
                style="text-align:center;padding:32px;color:var(--text-muted);"
              >
                Keine Vermietungen vorhanden.
              </td>
            </tr>
            <tr
              *ngFor="let r of paginatedResult?.items"
              [class.overdue-row]="r.isOverdue && r.status === 'Active'"
              class="clickable-row"
              (click)="goToDetail(r.id)"
            >
              <td class="mono">{{ r.mietvertragNummer }}</td>
              <td>{{ r.bikeInfo }}</td>
              <td>{{ r.customerName }}</td>
              <td>{{ r.startDatum | date: 'dd.MM.yyyy' }}</td>
              <td [class.overdue-date]="r.isOverdue && r.status === 'Active'">
                {{ r.endDatum | date: 'dd.MM.yyyy' }}
                <span
                  *ngIf="r.isOverdue && r.status === 'Active'"
                  class="overdue-badge"
                  >!</span
                >
              </td>
              <td>{{ r.gesamtmiete | number: '1.2-2' }} €</td>
              <td>{{ r.kaution | number: '1.2-2' }} €</td>
              <td>
                <span class="status-badge" [class]="getStatusClass(r.status)">
                  {{ getStatusText(r.status) }}
                </span>
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
      .clickable-row {
        cursor: pointer;
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
      .overdue-row {
        background: var(--accent-danger-light, rgba(239, 68, 68, 0.04));
      }
      .overdue-date {
        color: var(--accent-danger, #ef4444);
        font-weight: 600;
      }
      .overdue-badge {
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
      .status-returned {
        background: rgba(59, 130, 246, 0.08);
        color: #3b82f6;
      }
      .status-cancelled {
        background: rgba(100, 116, 139, 0.08);
        color: #64748b;
      }
      .actions-cell {
        display: flex;
        gap: 6px;
        flex-wrap: wrap;
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
      .btn-outline {
        background: transparent;
        border: 1.5px solid var(--border-color);
        color: var(--text-primary);
      }
      .btn-outline:hover {
        background: var(--bg-secondary, #f1f5f9);
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

      /* Dropdown */
      .dropdown {
        position: relative;
        display: inline-block;
      }
      .dropdown-menu {
        position: absolute;
        top: 100%;
        right: 0;
        z-index: 100;
        background: var(--bg-card, #fff);
        border: 1px solid var(--border-light);
        border-radius: var(--radius-md, 10px);
        box-shadow: var(--shadow-lg);
        min-width: 220px;
        padding: 6px 0;
        margin-top: 4px;
      }
      .dropdown-menu button {
        display: block;
        width: 100%;
        text-align: left;
        padding: 8px 16px;
        background: none;
        border: none;
        cursor: pointer;
        font-size: 0.85rem;
        color: var(--text-primary);
        transition: background 0.15s;
      }
      .dropdown-menu button:hover {
        background: var(--bg-secondary, #f1f5f9);
      }
      .dropdown-divider {
        height: 1px;
        margin: 4px 0;
        background: var(--border-light, #e2e8f0);
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
      .modal-lg {
        max-width: 900px;
        height: 85vh;
        display: flex;
        flex-direction: column;
      }
      .modal-header {
        padding: 18px 22px;
        border-bottom: 1.5px solid var(--border-light, #e2e8f0);
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .modal-header h3 {
        margin: 0;
        font-size: 1.05rem;
        font-weight: 700;
        color: var(--text-primary);
      }
      .modal-close {
        background: none;
        border: none;
        font-size: 1.2rem;
        cursor: pointer;
        color: var(--text-muted);
        padding: 4px 8px;
        border-radius: 6px;
      }
      .modal-close:hover {
        background: var(--bg-secondary);
      }
      .modal-body {
        padding: 22px;
      }
      .pdf-preview-body {
        flex: 1;
        padding: 0;
        overflow: hidden;
      }
      .pdf-iframe {
        width: 100%;
        height: 100%;
        border: none;
      }
      @keyframes scaleIn {
        from {
          transform: scale(0.95);
          opacity: 0;
        }
        to {
          transform: scale(1);
          opacity: 1;
        }
      }
    `,
  ],
})
export class RentalListComponent implements OnInit {
  private rentalService = inject(RentalService);
  private excelExportService = inject(ExcelExportService);
  private notificationService = inject(NotificationService);
  private dialogService = inject(DialogService);
  private router = inject(Router);

  paginatedResult: PaginatedResult<RentalList> | null = null;
  searchText = '';
  filterStatus = '';
  currentPage = 1;
  pageSize = 20;

  ngOnInit() {
    this.loadRentals();
  }

  goToDetail(id: number) {
    this.router.navigate(['/rentals', id]);
  }

  loadRentals() {
    this.rentalService
      .getPaginated(
        this.currentPage,
        this.pageSize,
        this.filterStatus || undefined,
        this.searchText || undefined,
      )
      .subscribe({
        next: (data) => (this.paginatedResult = data),
        error: (err) => console.error('Error loading rentals:', err),
      });
  }

  onSearch() {
    this.currentPage = 1;
    this.loadRentals();
  }

  onFilterChange() {
    this.currentPage = 1;
    this.loadRentals();
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.loadRentals();
  }

  onPageSizeChange(size: number) {
    this.pageSize = size;
    this.currentPage = 1;
    this.loadRentals();
  }

  getStatusClass(status: RentalStatus): string {
    const map: Record<string, string> = {
      Active: 'status-active',
      Returned: 'status-returned',
      Cancelled: 'status-cancelled',
    };
    return map[status] || '';
  }

  getStatusText(status: RentalStatus): string {
    const map: Record<string, string> = {
      Active: 'Aktiv',
      Returned: 'Zurückgegeben',
      Cancelled: 'Storniert',
    };
    return map[status] || status;
  }

  exportExcel() {
    this.excelExportService.exportToExcel(
      this.paginatedResult?.items || [],
      'Vermietungen',
      [
        { key: 'mietvertragNummer', header: 'Vertrag-Nr.' },
        { key: 'bikeInfo', header: 'Fahrrad' },
        { key: 'customerName', header: 'Mieter' },
        { key: 'startDatum', header: 'Von' },
        { key: 'endDatum', header: 'Bis' },
        { key: 'gesamtmiete', header: 'Miete (€)' },
        { key: 'kaution', header: 'Kaution (€)' },
        { key: 'status', header: 'Status' },
      ],
    );
  }
}
