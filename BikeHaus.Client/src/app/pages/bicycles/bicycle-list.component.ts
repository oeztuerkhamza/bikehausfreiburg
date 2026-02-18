import { Component, OnInit, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { BicycleService } from '../../services/bicycle.service';
import { ExcelExportService } from '../../services/excel-export.service';
import { Bicycle, BikeStatus, PaginatedResult } from '../../models/models';
import { PaginationComponent } from '../../components/pagination/pagination.component';

@Component({
  selector: 'app-bicycle-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, PaginationComponent],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>Fahrräder</h1>
        <div class="header-actions">
          <button class="btn btn-outline" (click)="exportExcel()">
            📥 Excel Export
          </button>
          <a routerLink="/purchases/new" class="btn btn-primary"
            >+ Neuer Ankauf</a
          >
        </div>
      </div>

      <div class="filters">
        <input
          type="text"
          placeholder="Suche nach Marke, Modell, Rahmennummer..."
          [(ngModel)]="searchTerm"
          (input)="onSearch()"
          class="search-input"
        />
        <select
          [(ngModel)]="statusFilter"
          (change)="onFilterChange()"
          class="filter-select"
        >
          <option value="">Alle Status</option>
          <option value="Available">Verfügbar</option>
          <option value="Sold">Verkauft</option>
          <option value="Reserved">Reserviert</option>
        </select>
      </div>

      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Nr.</th>
              <th>Marke</th>
              <th>Modell</th>
              <th>Rahmennummer</th>
              <th>Zustand</th>
              <th>Status</th>
              <th class="actions-col">Aktionen</th>
            </tr>
          </thead>
          <tbody>
            <tr
              *ngFor="let b of paginatedResult?.items"
              class="clickable-row"
              (click)="toggleMenu($event, b)"
            >
              <td class="mono">{{ b.stokNo || '–' }}</td>
              <td>{{ b.marke }}</td>
              <td>{{ b.modell }}</td>
              <td class="mono">{{ b.rahmennummer }}</td>
              <td>
                <span
                  class="badge"
                  [class]="'badge-' + b.zustand.toLowerCase()"
                >
                  {{ b.zustand }}
                </span>
              </td>
              <td>
                <span class="badge" [class]="'badge-' + b.status.toLowerCase()">
                  {{ statusLabel(b.status) }}
                </span>
              </td>
              <td class="actions-cell">
                <span class="action-icon">⋮</span>
                <!-- Popup Menu -->
                <div
                  *ngIf="activeMenuId === b.id"
                  class="popup-menu"
                  (click)="$event.stopPropagation()"
                >
                  <button class="popup-item" (click)="goToDetail(b)">
                    <span class="popup-icon">🔍</span>
                    Details
                  </button>
                  <button
                    *ngIf="b.status === 'Available'"
                    class="popup-item popup-item-primary"
                    (click)="goToSale(b)"
                  >
                    <span class="popup-icon">💰</span>
                    Verkaufen
                  </button>
                  <button
                    *ngIf="b.status === 'Available'"
                    class="popup-item popup-item-reserve"
                    (click)="goToReservation(b)"
                  >
                    <span class="popup-icon">📋</span>
                    Reservieren
                  </button>
                  <div class="popup-divider"></div>
                  <button
                    class="popup-item popup-item-danger"
                    (click)="deleteBicycle(b)"
                  >
                    <span class="popup-icon">🗑️</span>
                    Löschen
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <p *ngIf="paginatedResult?.items?.length === 0" class="empty">
          Keine Fahrräder gefunden
        </p>

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
    </div>
  `,
  styles: [
    `
      .page {
        max-width: 1200px;
        margin: 0 auto;
        animation: fadeIn 0.4s ease;
      }
      .page-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 22px;
      }
      .page-header h1 {
        font-size: 1.5rem;
        font-weight: 800;
        color: var(--text-primary);
      }
      .header-actions {
        display: flex;
        gap: 10px;
        align-items: center;
      }
      .filters {
        display: flex;
        gap: 12px;
        margin-bottom: 18px;
        flex-wrap: wrap;
        align-items: center;
      }
      .search-input {
        flex: 1;
        min-width: 250px;
        padding: 10px 14px;
        border: 1.5px solid var(--border-light, #e2e8f0);
        border-radius: var(--radius-md, 10px);
        font-size: 0.92rem;
        background: var(--bg-card, #fff);
        color: var(--text-primary);
        transition: var(--transition-fast);
      }
      .search-input:focus {
        outline: none;
        border-color: var(--accent-primary, #6366f1);
        box-shadow: 0 0 0 3px
          var(--accent-primary-light, rgba(99, 102, 241, 0.1));
      }
      .filter-select {
        padding: 10px 14px;
        border: 1.5px solid var(--border-light, #e2e8f0);
        border-radius: var(--radius-md, 10px);
        background: var(--bg-card, #fff);
        color: var(--text-primary);
        font-size: 0.92rem;
        transition: var(--transition-fast);
      }
      .filter-select:focus {
        outline: none;
        border-color: var(--accent-primary, #6366f1);
        box-shadow: 0 0 0 3px
          var(--accent-primary-light, rgba(99, 102, 241, 0.1));
      }
      .table-container {
        background: var(--bg-card, #fff);
        border-radius: var(--radius-lg, 14px);
        border: 1.5px solid var(--border-light, #e2e8f0);
        overflow: visible;
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
      .clickable-row {
        cursor: pointer;
        transition: var(--transition-fast);
      }
      .clickable-row:hover td {
        background: var(--table-hover, #f1f5f9);
      }
      .mono {
        font-family: 'SF Mono', 'Consolas', monospace;
        font-size: 0.82rem;
        color: var(--accent-primary, #6366f1);
        background: var(--accent-primary-light, rgba(99, 102, 241, 0.08));
        padding: 2px 8px;
        border-radius: 6px;
        font-weight: 600;
      }
      .badge {
        padding: 4px 11px;
        border-radius: 50px;
        font-size: 0.75rem;
        font-weight: 600;
        letter-spacing: 0.02em;
      }
      .badge-available {
        background: var(--accent-success-light, rgba(16, 185, 129, 0.08));
        color: var(--accent-success, #10b981);
      }
      .badge-sold {
        background: var(--accent-danger-light, rgba(239, 68, 68, 0.08));
        color: var(--accent-danger, #ef4444);
      }
      .badge-reserved {
        background: rgba(245, 158, 11, 0.08);
        color: #f59e0b;
      }
      .badge-neu {
        background: rgba(59, 130, 246, 0.08);
        color: #3b82f6;
      }
      .badge-gebraucht {
        background: rgba(100, 116, 139, 0.08);
        color: #64748b;
      }
      .actions-col {
        width: 80px;
        text-align: center;
      }
      .actions-cell {
        position: relative;
        text-align: center;
      }
      .action-icon {
        font-size: 1.3rem;
        color: var(--text-secondary, #64748b);
        cursor: pointer;
        padding: 4px 8px;
        border-radius: var(--radius-sm, 6px);
        transition: var(--transition-fast);
      }
      .action-icon:hover {
        background: var(--table-hover, #f1f5f9);
        color: var(--accent-primary, #6366f1);
      }
      .popup-menu {
        position: absolute;
        top: 100%;
        right: 0;
        z-index: 9999;
        min-width: 170px;
        background: var(--bg-card, #fff);
        border: 1.5px solid var(--border-light, #e2e8f0);
        border-radius: var(--radius-lg, 14px);
        box-shadow: var(--shadow-lg);
        padding: 6px 0;
        animation: fadeIn 0.15s ease;
      }
      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(-4px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      .popup-item {
        display: flex;
        align-items: center;
        gap: 10px;
        width: 100%;
        padding: 9px 14px;
        border: none;
        background: none;
        cursor: pointer;
        font-size: 0.88rem;
        font-weight: 500;
        color: var(--text-primary);
        text-align: left;
        transition: var(--transition-fast);
        border-radius: 0;
      }
      .popup-item:hover {
        background: var(--table-hover, #f1f5f9);
      }
      .popup-item-primary {
        color: var(--accent-success, #10b981);
      }
      .popup-item-primary:hover {
        background: var(--accent-success-light, rgba(16, 185, 129, 0.08));
      }
      .popup-item-reserve {
        color: #3b82f6;
      }
      .popup-item-reserve:hover {
        background: rgba(59, 130, 246, 0.08);
      }
      .popup-item-danger {
        color: var(--accent-danger, #ef4444);
      }
      .popup-item-danger:hover {
        background: var(--accent-danger-light, rgba(239, 68, 68, 0.08));
      }
      .popup-icon {
        font-size: 1rem;
      }
      .popup-divider {
        height: 1px;
        background: var(--border-light, #e2e8f0);
        margin: 4px 0;
      }
      .empty {
        text-align: center;
        color: var(--text-secondary, #64748b);
        padding: 48px 20px;
        font-size: 0.95rem;
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
        gap: 6px;
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
        background: var(--bg-card, #fff);
        color: var(--text-primary);
        border: 1.5px solid var(--border-light, #e2e8f0);
      }
      .btn-outline:hover {
        border-color: var(--accent-primary, #6366f1);
        color: var(--accent-primary, #6366f1);
        background: var(--accent-primary-light, rgba(99, 102, 241, 0.06));
      }
    `,
  ],
})
export class BicycleListComponent implements OnInit {
  paginatedResult: PaginatedResult<Bicycle> | null = null;
  searchTerm = '';
  statusFilter = '';
  activeMenuId: number | null = null;
  currentPage = 1;
  pageSize = 20;

  constructor(
    private bicycleService: BicycleService,
    private router: Router,
    private elementRef: ElementRef,
    private excelExportService: ExcelExportService,
  ) {}

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    // Close menu when clicking outside
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.activeMenuId = null;
    }
  }

  ngOnInit() {
    this.load();
  }

  load() {
    this.bicycleService
      .getPaginated(
        this.currentPage,
        this.pageSize,
        this.statusFilter || undefined,
        this.searchTerm || undefined,
      )
      .subscribe((data) => {
        this.paginatedResult = data;
      });
  }

  onSearch() {
    this.currentPage = 1;
    this.load();
  }

  onFilterChange() {
    this.currentPage = 1;
    this.load();
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.load();
  }

  onPageSizeChange(size: number) {
    this.pageSize = size;
    this.currentPage = 1;
    this.load();
  }

  statusLabel(s: BikeStatus): string {
    const map: Record<string, string> = {
      Available: 'Verfügbar',
      Sold: 'Verkauft',
      Reserved: 'Reserviert',
    };
    return map[s] || s;
  }

  toggleMenu(event: MouseEvent, bicycle: Bicycle) {
    event.stopPropagation();
    this.activeMenuId = this.activeMenuId === bicycle.id ? null : bicycle.id;
  }

  closeMenu() {
    this.activeMenuId = null;
  }

  goToDetail(b: Bicycle) {
    this.closeMenu();
    this.router.navigate(['/bicycles', b.id]);
  }

  goToSale(b: Bicycle) {
    this.closeMenu();
    this.router.navigate(['/sales/new'], { queryParams: { bicycleId: b.id } });
  }

  goToReservation(b: Bicycle) {
    this.closeMenu();
    this.router.navigate(['/reservations/new'], {
      queryParams: { bicycleId: b.id },
    });
  }

  exportExcel() {
    const data = this.paginatedResult?.items || [];
    this.excelExportService.exportToExcel(data, 'Fahrraeder', [
      { key: 'stokNo', header: 'Nr.' },
      { key: 'marke', header: 'Marke' },
      { key: 'modell', header: 'Modell' },
      { key: 'rahmennummer', header: 'Rahmennummer' },
      { key: 'farbe', header: 'Farbe' },
      { key: 'reifengroesse', header: 'Reifengröße' },
      { key: 'fahrradtyp', header: 'Fahrradtyp' },
      { key: 'zustand', header: 'Zustand' },
      { key: 'status', header: 'Status' },
    ]);
  }

  deleteBicycle(b: Bicycle) {
    this.closeMenu();
    if (confirm(`Fahrrad "${b.marke} ${b.modell}" wirklich löschen?`)) {
      this.bicycleService.delete(b.id).subscribe({
        next: () => this.load(),
        error: (err) => {
          const msg = err.error?.error || 'Fehler beim Löschen des Fahrrads.';
          alert(msg);
        },
      });
    }
  }
}
