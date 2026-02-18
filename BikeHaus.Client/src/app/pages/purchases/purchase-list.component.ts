import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PurchaseService } from '../../services/purchase.service';
import { ExcelExportService } from '../../services/excel-export.service';
import { TranslationService } from '../../services/translation.service';
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
            [(ngModel)]="filterPayment"
            (change)="onFilterChange()"
            class="filter-input"
          >
            <option value="">{{ t.allPaymentMethods }}</option>
            <option value="Bar">{{ t.cash }}</option>
            <option value="Ueberweisung">{{ t.bankTransfer }}</option>
            <option value="PayPal">{{ t.paypal }}</option>
          </select>
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
              <th>{{ t.actions }}</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let p of paginatedResult?.items">
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
              <td class="actions">
                <a
                  class="btn btn-sm btn-outline"
                  [routerLink]="['/purchases/edit', p.id]"
                >
                  ✎
                </a>
                <button class="btn btn-sm btn-outline" (click)="downloadPdf(p)">
                  PDF
                </button>
                <button
                  class="btn btn-sm btn-danger"
                  (click)="deletePurchase(p)"
                >
                  ×
                </button>
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
        min-width: 220px;
      }
      .filter-input {
        padding: 10px 14px;
        border: 1.5px solid var(--border-light, #e2e8f0);
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
        color: var(--text-secondary, #64748b);
        pointer-events: none;
        display: flex;
      }
      .table-container {
        background: var(--bg-card);
        border-radius: var(--radius-lg, 14px);
        border: 1px solid var(--border-light);
        padding: 0;
        box-shadow: var(--shadow-sm);
        overflow-x: auto;
      }
      table {
        width: 100%;
        border-collapse: collapse;
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
      }
      td {
        padding: 11px 16px;
        border-bottom: 1px solid var(--border-light);
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
      .actions {
        display: flex;
        gap: 6px;
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
      .badge-Ueberweisung {
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
        .filter-bar {
          flex-direction: column;
        }
        .search-group {
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

  paginatedResult: PaginatedResult<PurchaseList> | null = null;
  searchText = '';
  filterPayment = '';
  currentPage = 1;
  pageSize = 20;

  get t() {
    return this.translationService.translations();
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

  getPaymentLabel(method: string): string {
    switch (method) {
      case 'Bar':
        return this.t.cash;
      case 'Ueberweisung':
        return this.t.bankTransfer;
      case 'PayPal':
        return this.t.paypal;
      default:
        return method;
    }
  }

  downloadPdf(p: PurchaseList) {
    this.purchaseService.downloadKaufbeleg(p.id).subscribe((blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Kaufbeleg_${p.belegNummer}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    });
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
    if (confirm(`${this.t.deleteConfirmPurchase} (${p.belegNummer})`)) {
      this.purchaseService.delete(p.id).subscribe({
        next: () => this.load(),
        error: (err) => alert(err.error?.error || this.t.deleteError),
      });
    }
  }
}
