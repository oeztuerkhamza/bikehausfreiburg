import { Component, OnInit, inject, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { SaleService } from '../../services/sale.service';
import { ExcelExportService } from '../../services/excel-export.service';
import { TranslationService } from '../../services/translation.service';
import { NotificationService } from '../../services/notification.service';
import { DialogService } from '../../services/dialog.service';
import { SaleList, PaginatedResult } from '../../models/models';
import { PaginationComponent } from '../../components/pagination/pagination.component';

@Component({
  selector: 'app-sale-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, PaginationComponent],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>{{ t.sales }}</h1>
        <div class="header-actions">
          <button class="btn btn-outline" (click)="exportExcel()">
            📥 {{ t.excelExport }}
          </button>
          <a routerLink="/sales/new" class="btn btn-primary"
            >+ {{ t.newSale }}</a
          >
        </div>
      </div>

      <!-- Filter Bar -->
      <div class="filters">
        <div class="search-group">
          <input
            type="text"
            [(ngModel)]="searchText"
            (input)="onSearch()"
            [placeholder]="t.searchPlaceholder"
            class="filter-input search-input"
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
        <button
          class="btn btn-outline filter-toggle"
          (click)="showFilters = !showFilters"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
          >
            <polygon
              points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"
            ></polygon>
          </svg>
          {{ t.filters }}
          <span *ngIf="activeFilterCount > 0" class="filter-badge">{{
            activeFilterCount
          }}</span>
        </button>
        <button
          *ngIf="activeFilterCount > 0"
          class="btn btn-outline"
          (click)="clearFilters()"
        >
          ✕ {{ t.clearFilters }}
        </button>
      </div>

      <div class="filter-row" *ngIf="showFilters">
        <div class="filter-item">
          <label>{{ t.paymentMethod }}</label>
          <select
            [(ngModel)]="filterPayment"
            (change)="onFilterChange()"
            class="filter-input"
          >
            <option value="">{{ t.allPaymentMethods }}</option>
            <option value="Bar">{{ t.cash }}</option>
            <option value="Karte">{{ t.bankTransfer }}</option>
            <option value="PayPal">{{ t.paypal }}</option>
          </select>
        </div>
        <div class="filter-item">
          <label>{{ t.bicycleType }}</label>
          <select
            [(ngModel)]="filterFahrradtyp"
            (change)="onFilterChange()"
            class="filter-input"
          >
            <option value="">{{ t.allBicycleTypes }}</option>
            <option value="E-Bike">E-Bike</option>
            <option value="E-Trekking Pedelec">E-Trekking Pedelec</option>
            <option value="Trekking">Trekking</option>
            <option value="City">City</option>
            <option value="MTB">Mountainbike</option>
            <option value="Rennrad">Rennrad</option>
            <option value="Kinderfahrrad">Kinderfahrrad</option>
            <option value="Lastenrad">Lastenrad</option>
            <option value="Sonstige">Sonstige</option>
          </select>
        </div>
        <div class="filter-item">
          <label>{{ t.brand }}</label>
          <input
            type="text"
            [(ngModel)]="filterMarke"
            (input)="onFilterChange()"
            [placeholder]="t.filterByBrand"
            class="filter-input"
          />
        </div>
        <div class="filter-item">
          <label>{{ t.color }}</label>
          <input
            type="text"
            [(ngModel)]="filterFarbe"
            (input)="onFilterChange()"
            [placeholder]="t.filterByColor"
            class="filter-input"
          />
        </div>
      </div>

      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>{{ t.receiptNo }}</th>
              <th>{{ t.stockNo }}</th>
              <th>{{ t.bicycle }}</th>
              <th>{{ t.buyer }}</th>
              <th>{{ t.price }}</th>
              <th>{{ t.paymentMethod }}</th>
              <th>{{ t.date }}</th>
              <th style="width: 50px;"></th>
            </tr>
          </thead>
          <tbody>
            <tr *ngIf="paginatedResult?.items?.length === 0">
              <td
                colspan="8"
                style="text-align:center;padding:32px;color:var(--text-muted);"
              >
                {{ t.noSales }}
              </td>
            </tr>
            <tr
              *ngFor="let s of paginatedResult?.items"
              class="clickable-row"
              (click)="toggleMenu($event, s)"
            >
              <td class="mono">{{ s.belegNummer }}</td>
              <td class="mono">{{ s.stokNo || '–' }}</td>
              <td>{{ s.bikeInfo }}</td>
              <td>{{ s.buyerName }}</td>
              <td>{{ s.preis | number: '1.2-2' }} €</td>
              <td>
                <span class="badge" [ngClass]="'badge-' + s.zahlungsart">
                  {{ getPaymentLabel(s.zahlungsart) }}
                </span>
              </td>
              <td>{{ s.verkaufsdatum | date: 'dd.MM.yyyy' }}</td>
              <td class="actions-cell">
                <span class="action-icon">⋮</span>
                <div
                  *ngIf="activeMenuId === s.id"
                  class="popup-menu"
                  (click)="$event.stopPropagation()"
                >
                  <button class="popup-item" (click)="printPdf(s)">
                    <span class="popup-icon">🖨️</span>
                    {{ t.printDocument }}
                  </button>
                  <button class="popup-item" (click)="goToEdit(s)">
                    <span class="popup-icon">✏️</span>
                    {{ t.editDocument }}
                  </button>
                  <button class="popup-item" (click)="previewPdf(s)">
                    <span class="popup-icon">👁️</span>
                    {{ t.preview }}
                  </button>
                  <button class="popup-item" (click)="downloadPdf(s)">
                    <span class="popup-icon">⬇️</span>
                    {{ t.download }}
                  </button>
                  <div class="popup-divider"></div>
                  <button
                    class="popup-item popup-item-danger"
                    (click)="deleteSale(s)"
                  >
                    <span class="popup-icon">🗑️</span>
                    {{ t.delete }}
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

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
        max-width: 1280px;
        margin: 0 auto;
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
      .search-group {
        position: relative;
        flex: 1;
        min-width: 220px;
      }
      .filter-input {
        padding: 10px 14px;
        border: 1.5px solid var(--border-color);
        border-radius: var(--radius-md, 10px);
        font-size: 0.88rem;
        background: var(--bg-card);
        color: var(--text-primary);
        transition: all 0.2s;
        width: 100%;
      }
      .filter-input:focus {
        outline: none;
        border-color: var(--accent-primary);
        box-shadow: 0 0 0 3px
          var(--accent-primary-light, rgba(99, 102, 241, 0.08));
      }
      .search-input {
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
      .filter-toggle {
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .filter-badge {
        background: var(--accent-primary);
        color: #fff;
        font-size: 0.7rem;
        padding: 2px 7px;
        border-radius: 50px;
        font-weight: 700;
      }
      .filter-row {
        display: flex;
        gap: 16px;
        margin-bottom: 18px;
        flex-wrap: wrap;
        animation: slideDown 0.25s ease;
      }
      @keyframes slideDown {
        from {
          opacity: 0;
          transform: translateY(-8px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      .filter-item {
        display: flex;
        flex-direction: column;
        gap: 4px;
        min-width: 160px;
      }
      .filter-item label {
        font-size: 0.75rem;
        font-weight: 600;
        color: var(--text-muted);
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }
      .table-wrap {
        background: var(--bg-card);
        border-radius: var(--radius-lg, 14px);
        border: 1px solid var(--border-light);
        overflow: visible;
        box-shadow: var(--shadow-sm);
      }
      table {
        width: 100%;
        min-width: 950px;
        border-collapse: collapse;
        table-layout: fixed;
      }
      th {
        text-align: left;
        padding: 12px 16px;
        background: var(--table-stripe, #f8fafc);
        font-size: 0.75rem;
        font-weight: 600;
        color: var(--text-muted);
        border-bottom: 1px solid var(--border-light);
        text-transform: uppercase;
        letter-spacing: 0.05em;
        white-space: nowrap;
      }
      th:nth-child(1) {
        width: 110px;
      } /* Beleg No */
      th:nth-child(2) {
        width: 70px;
      } /* Stok No */
      th:nth-child(3) {
        width: 150px;
      } /* Bisiklet */
      th:nth-child(4) {
        width: 150px;
      } /* Alıcı */
      th:nth-child(5) {
        width: 90px;
      } /* Fiyat */
      th:nth-child(6) {
        width: 100px;
      } /* Ödeme */
      th:nth-child(7) {
        width: 100px;
      } /* Tarih */
      td {
        padding: 11px 16px;
        border-bottom: 1px solid var(--border-light);
        font-size: 0.88rem;
        color: var(--text-secondary);
        vertical-align: middle;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
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
      .clickable-row {
        cursor: pointer;
        transition: background 0.15s;
      }
      .clickable-row:hover td {
        background: var(--table-hover, #f1f5f9);
      }
      .actions-cell {
        position: relative;
        text-align: center;
        overflow: visible !important;
      }
      .action-icon {
        font-size: 1.2rem;
        color: var(--text-secondary);
        cursor: pointer;
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
      .popup-item-danger {
        color: var(--accent-danger, #ef4444);
      }
      .popup-item-danger:hover {
        background: var(--accent-danger-light, rgba(239, 68, 68, 0.08));
      }
      .popup-divider {
        height: 1px;
        background: var(--border-light, #e2e8f0);
        margin: 4px 0;
      }
      .popup-icon {
        font-size: 1rem;
      }
      .badge {
        display: inline-block;
        padding: 4px 11px;
        border-radius: 50px;
        font-size: 0.75rem;
        font-weight: 600;
        letter-spacing: 0.02em;
      }
      .badge-Bar {
        background: var(--accent-success-light, rgba(16, 185, 129, 0.08));
        color: var(--accent-success, #10b981);
      }
      .badge-Karte {
        background: rgba(59, 130, 246, 0.08);
        color: #3b82f6;
      }
      .badge-PayPal {
        background: var(--accent-warning-light, rgba(245, 158, 11, 0.08));
        color: var(--accent-warning, #f59e0b);
      }
      @media (max-width: 640px) {
        .filters {
          flex-direction: column;
        }
        .search-input {
          min-width: 100%;
        }
      }
    `,
  ],
})
export class SaleListComponent implements OnInit {
  private saleService = inject(SaleService);
  private excelExportService = inject(ExcelExportService);
  private translationService = inject(TranslationService);
  private notificationService = inject(NotificationService);
  private dialogService = inject(DialogService);
  private router = inject(Router);
  private elementRef = inject(ElementRef);

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.activeMenuId = null;
    }
  }

  paginatedResult: PaginatedResult<SaleList> | null = null;
  searchText = '';
  filterPayment = '';
  filterMarke = '';
  filterFahrradtyp = '';
  filterFarbe = '';
  currentPage = 1;
  pageSize = 20;
  showFilters = false;
  activeMenuId: number | null = null;

  get t() {
    return this.translationService.translations();
  }

  get activeFilterCount(): number {
    let count = 0;
    if (this.filterPayment) count++;
    if (this.filterMarke) count++;
    if (this.filterFahrradtyp) count++;
    if (this.filterFarbe) count++;
    return count;
  }

  ngOnInit() {
    this.load();
  }

  load() {
    this.saleService
      .getPaginated(
        this.currentPage,
        this.pageSize,
        this.filterPayment || undefined,
        this.searchText || undefined,
        this.filterMarke || undefined,
        this.filterFahrradtyp || undefined,
        this.filterFarbe || undefined,
      )
      .subscribe((data) => {
        this.paginatedResult = data;
      });
  }

  clearFilters() {
    this.filterPayment = '';
    this.filterMarke = '';
    this.filterFahrradtyp = '';
    this.filterFarbe = '';
    this.currentPage = 1;
    this.load();
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

  getPaymentLabel(method: string): string {
    switch (method) {
      case 'Bar':
        return this.t.cash;
      case 'Karte':
        return this.t.bankTransfer;
      case 'PayPal':
        return this.t.paypal;
      default:
        return method;
    }
  }

  downloadPdf(s: SaleList) {
    this.closeMenu();
    this.saleService.downloadVerkaufsbeleg(s.id).subscribe((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Verkaufsbeleg_${s.belegNummer}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  previewPdf(s: SaleList) {
    this.closeMenu();
    this.saleService.downloadVerkaufsbeleg(s.id).subscribe((blob) => {
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    });
  }

  printPdf(s: SaleList) {
    this.closeMenu();
    this.saleService.downloadVerkaufsbeleg(s.id).subscribe((blob) => {
      const url = URL.createObjectURL(blob);
      const printWindow = window.open(url, '_blank');
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print();
        };
      }
    });
  }

  toggleMenu(event: MouseEvent, s: SaleList) {
    event.stopPropagation();
    this.activeMenuId = this.activeMenuId === s.id ? null : s.id;
  }

  closeMenu() {
    this.activeMenuId = null;
  }

  goToEdit(s: SaleList) {
    this.closeMenu();
    this.router.navigate(['/sales/edit', s.id]);
  }

  exportExcel() {
    this.excelExportService.exportToExcel(
      this.paginatedResult?.items || [],
      'Verkaeufe',
      [
        { key: 'belegNummer', header: 'Beleg-Nr.' },
        { key: 'bikeInfo', header: 'Fahrrad' },
        { key: 'buyerName', header: 'Käufer' },
        { key: 'preis', header: 'Preis (€)' },
        { key: 'zahlungsart', header: 'Zahlungsart' },
        { key: 'verkaufsdatum', header: 'Verkaufsdatum' },
        { key: 'garantie', header: 'Garantie' },
      ],
    );
  }

  deleteSale(s: SaleList) {
    this.closeMenu();
    this.dialogService
      .danger(this.t.delete, this.t.deleteConfirmSale)
      .then((confirmed) => {
        if (confirmed) {
          this.saleService.delete(s.id).subscribe({
            next: () => {
              this.notificationService.success(
                this.t.deleteSuccess || 'Erfolgreich gelöscht',
              );
              this.load();
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
}
