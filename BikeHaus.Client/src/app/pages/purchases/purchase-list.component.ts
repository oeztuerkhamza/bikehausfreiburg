import {
  Component,
  OnInit,
  inject,
  HostListener,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { PurchaseService } from '../../services/purchase.service';
import { ExcelExportService } from '../../services/excel-export.service';
import { TranslationService } from '../../services/translation.service';
import { NotificationService } from '../../services/notification.service';
import { DialogService } from '../../services/dialog.service';
import { PurchaseList, PaginatedResult } from '../../models/models';
import { PaginationComponent } from '../../components/pagination/pagination.component';

@Component({
  selector: 'app-purchase-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, PaginationComponent],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>{{ t.purchases }}</h1>
        <div class="header-actions">
          <button class="btn btn-outline" (click)="exportExcel()">
            📥 {{ t.excelExport }}
          </button>
          <a routerLink="/purchases/new" class="btn btn-primary"
            >+ {{ t.newPurchase }}</a
          >
        </div>
      </div>

      <!-- Filter Bar -->
      <div class="filters">
        <input
          type="text"
          [(ngModel)]="searchText"
          (input)="onSearch()"
          [placeholder]="t.searchPlaceholder"
          class="search-input"
        />
        <button
          class="btn btn-outline filter-toggle"
          [class.active]="showFilters"
          (click)="showFilters = !showFilters"
        >
          🔽 {{ t.filters }}
          <span class="filter-badge" *ngIf="activeFilterCount > 0">{{
            activeFilterCount
          }}</span>
        </button>
        <button
          *ngIf="activeFilterCount > 0"
          class="btn btn-outline btn-clear"
          (click)="clearFilters()"
        >
          ✕ {{ t.clearFilters }}
        </button>
      </div>

      <!-- Advanced Filters Row -->
      <div class="filter-row" *ngIf="showFilters">
        <div class="filter-item">
          <label>{{ t.paymentMethod }}</label>
          <select [(ngModel)]="filterPayment" (change)="onFilterChange()">
            <option value="">{{ t.all }}</option>
            <option value="Bar">{{ t.cash }}</option>
            <option value="Karte">{{ t.bankTransfer }}</option>
            <option value="PayPal">{{ t.paypal }}</option>
          </select>
        </div>
        <div class="filter-item">
          <label>{{ t.bicycleType }}</label>
          <select [(ngModel)]="filterFahrradtyp" (change)="onFilterChange()">
            <option value="">{{ t.all }}</option>
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
          />
        </div>
        <div class="filter-item">
          <label>{{ t.color }}</label>
          <input
            type="text"
            [(ngModel)]="filterFarbe"
            (input)="onFilterChange()"
            [placeholder]="t.filterByColor"
          />
        </div>
      </div>

      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>{{ t.receiptNo }}</th>
              <th>{{ t.stockNo }}</th>
              <th>{{ t.bicycle }}</th>
              <th>{{ t.seller }}</th>
              <th>{{ t.price }}</th>
              <th>{{ t.sellingPrice }}</th>
              <th>{{ t.paymentMethod }}</th>
              <th>{{ t.date }}</th>
              <th style="width: 50px;"></th>
            </tr>
          </thead>
          <tbody>
            <tr
              *ngFor="let p of paginatedResult?.items"
              class="clickable-row"
              (click)="toggleMenu($event, p)"
            >
              <td class="mono">{{ p.belegNummer }}</td>
              <td class="mono">{{ p.stokNo || '–' }}</td>
              <td>{{ p.bikeInfo }}</td>
              <td>{{ p.sellerName }}</td>
              <td>{{ p.preis | number: '1.2-2' }} €</td>
              <td>
                <span *ngIf="p.verkaufspreisVorschlag" class="planned-price">
                  {{ p.verkaufspreisVorschlag | number: '1.2-2' }} €
                </span>
                <span *ngIf="!p.verkaufspreisVorschlag" class="no-price"
                  >–</span
                >
              </td>
              <td>
                <span class="badge" [ngClass]="'badge-' + p.zahlungsart">
                  {{ getPaymentLabel(p.zahlungsart) }}
                </span>
              </td>
              <td>{{ p.kaufdatum | date: 'dd.MM.yyyy' }}</td>
              <td class="actions-cell">
                <span class="action-icon">⋮</span>
                <div
                  *ngIf="activeMenuId === p.id"
                  class="popup-menu"
                  (click)="$event.stopPropagation()"
                >
                  <button class="popup-item" (click)="printPdf(p)">
                    <span class="popup-icon">🖨️</span>
                    {{ t.printDocument }}
                  </button>
                  <button class="popup-item" (click)="goToEdit(p)">
                    <span class="popup-icon">✏️</span>
                    {{ t.editDocument }}
                  </button>
                  <button class="popup-item" (click)="previewPdf(p)">
                    <span class="popup-icon">👁️</span>
                    {{ t.preview }}
                  </button>
                  <button class="popup-item" (click)="downloadPdf(p)">
                    <span class="popup-icon">⬇️</span>
                    {{ t.download }}
                  </button>
                  <div class="popup-divider"></div>
                  <button
                    class="popup-item popup-item-danger"
                    (click)="deletePurchase(p)"
                  >
                    <span class="popup-icon">🗑️</span>
                    {{ t.delete }}
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <p *ngIf="paginatedResult?.items?.length === 0" class="empty">
          {{ t.noPurchases }}
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
        align-items: center;
        flex-wrap: wrap;
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
        transition: all 0.2s;
      }
      .search-input:focus {
        outline: none;
        border-color: var(--accent-primary, #6366f1);
        box-shadow: 0 0 0 3px
          var(--accent-primary-light, rgba(99, 102, 241, 0.1));
      }
      .filter-toggle {
        position: relative;
      }
      .filter-toggle.active {
        border-color: var(--accent-primary, #6366f1);
        color: var(--accent-primary, #6366f1);
        background: var(--accent-primary-light, rgba(99, 102, 241, 0.06));
      }
      .filter-badge {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 18px;
        height: 18px;
        padding: 0 5px;
        background: var(--accent-primary, #6366f1);
        color: white;
        border-radius: 50px;
        font-size: 0.7rem;
        font-weight: 700;
        margin-left: 6px;
      }
      .btn-clear {
        color: var(--accent-danger, #ef4444);
        border-color: var(--accent-danger, #ef4444);
      }
      .btn-clear:hover {
        background: var(--accent-danger-light, rgba(239, 68, 68, 0.08));
      }
      .filter-row {
        display: flex;
        gap: 12px;
        margin-bottom: 18px;
        flex-wrap: wrap;
        padding: 16px;
        background: var(--bg-card, #fff);
        border: 1.5px solid var(--border-light, #e2e8f0);
        border-radius: var(--radius-lg, 14px);
        animation: slideIn 0.2s ease;
      }
      @keyframes slideIn {
        from {
          opacity: 0;
          transform: translateY(-4px);
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
        min-width: 140px;
        flex: 1;
      }
      .filter-item label {
        font-size: 0.72rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.03em;
        color: var(--text-secondary, #64748b);
      }
      .filter-item select,
      .filter-item input {
        padding: 8px 10px;
        border: 1.5px solid var(--border-light, #e2e8f0);
        border-radius: var(--radius-md, 10px);
        font-size: 0.85rem;
        background: var(--bg-card, #fff);
        color: var(--text-primary);
        transition: all 0.2s;
      }
      .filter-item select:focus,
      .filter-item input:focus {
        outline: none;
        border-color: var(--accent-primary, #6366f1);
        box-shadow: 0 0 0 3px
          var(--accent-primary-light, rgba(99, 102, 241, 0.1));
      }
      .table-container {
        background: var(--bg-card);
        border-radius: var(--radius-lg, 14px);
        border: 1px solid var(--border-light);
        padding: 0;
        box-shadow: var(--shadow-sm);
        overflow: visible;
      }
      table {
        width: 100%;
        min-width: 1050px;
        border-collapse: collapse;
        table-layout: fixed;
      }
      th {
        text-align: left;
        padding: 12px 16px;
        background: var(--table-stripe, #f8fafc);
        border-bottom: 1px solid var(--border-light);
        font-size: 0.75rem;
        font-weight: 600;
        color: var(--text-secondary, #64748b);
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
        width: 140px;
      } /* Bisiklet */
      th:nth-child(4) {
        width: 150px;
      } /* Satıcı */
      th:nth-child(5) {
        width: 90px;
      } /* Fiyat */
      th:nth-child(6) {
        width: 90px;
      } /* Satış Fiyatı */
      th:nth-child(7) {
        width: 100px;
      } /* Ödeme */
      th:nth-child(8) {
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
      .empty {
        text-align: center;
        color: var(--text-secondary, #64748b);
        padding: 48px;
        font-size: 0.9rem;
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
      .planned-price {
        color: var(--accent-primary);
        font-weight: 600;
        font-variant-numeric: tabular-nums;
      }
      .no-price {
        color: var(--text-secondary, #94a3b8);
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
export class PurchaseListComponent implements OnInit {
  private purchaseService = inject(PurchaseService);
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

  paginatedResult: PaginatedResult<PurchaseList> | null = null;
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
    this.purchaseService
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

  downloadPdf(p: PurchaseList) {
    this.closeMenu();
    this.purchaseService.downloadKaufbeleg(p.id).subscribe((blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Kaufbeleg_${p.belegNummer}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    });
  }

  previewPdf(p: PurchaseList) {
    this.closeMenu();
    this.purchaseService.downloadKaufbeleg(p.id).subscribe((blob) => {
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
    });
  }

  printPdf(p: PurchaseList) {
    this.closeMenu();
    this.purchaseService.downloadKaufbeleg(p.id).subscribe((blob) => {
      const url = window.URL.createObjectURL(blob);
      const printWindow = window.open(url, '_blank');
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print();
        };
      }
    });
  }

  toggleMenu(event: MouseEvent, p: PurchaseList) {
    event.stopPropagation();
    this.activeMenuId = this.activeMenuId === p.id ? null : p.id;
  }

  closeMenu() {
    this.activeMenuId = null;
  }

  goToEdit(p: PurchaseList) {
    this.closeMenu();
    this.router.navigate(['/purchases/edit', p.id]);
  }

  exportExcel() {
    this.excelExportService.exportToExcel(
      this.paginatedResult?.items || [],
      this.t.purchases,
      [
        { key: 'belegNummer', header: this.t.receiptNo },
        { key: 'bikeInfo', header: this.t.bicycle },
        { key: 'sellerName', header: this.t.seller },
        { key: 'preis', header: `${this.t.price} (€)` },
        { key: 'verkaufspreisVorschlag', header: `${this.t.sellingPrice} (€)` },
        { key: 'zahlungsart', header: this.t.paymentMethod },
        { key: 'kaufdatum', header: this.t.date },
      ],
    );
  }

  deletePurchase(p: PurchaseList) {
    this.closeMenu();
    this.dialogService
      .danger(
        this.t.delete,
        `${this.t.deleteConfirmPurchase} (${p.belegNummer})`,
      )
      .then((confirmed) => {
        if (confirmed) {
          this.purchaseService.delete(p.id).subscribe({
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
