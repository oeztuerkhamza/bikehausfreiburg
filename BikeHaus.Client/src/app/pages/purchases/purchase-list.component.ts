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
            📥 Excel Export
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
          <span class="search-icon">🔍</span>
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
              <th>Stok Nr.</th>
              <th>{{ t.bicycle }}</th>
              <th>{{ t.seller }}</th>
              <th>{{ t.price }}</th>
              <th>VK-Preis</th>
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
        max-width: 1200px;
        margin: 0 auto;
      }
      .page-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
      }
      .header-actions {
        display: flex;
        gap: 10px;
        align-items: center;
      }
      .filter-bar {
        display: flex;
        gap: 12px;
        margin-bottom: 16px;
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
        padding: 9px 12px;
        border: 1px solid var(--border-color);
        border-radius: 8px;
        font-size: 0.9rem;
        background: var(--bg-card);
        color: var(--text-primary);
        transition: border-color 0.2s;
        width: 100%;
      }
      .filter-input:focus {
        outline: none;
        border-color: var(--accent-primary);
        box-shadow: 0 0 0 3px rgba(67, 97, 238, 0.1);
      }
      .search-input {
        padding-left: 36px;
      }
      .search-icon {
        position: absolute;
        left: 10px;
        top: 50%;
        transform: translateY(-50%);
        font-size: 0.9rem;
        pointer-events: none;
      }
      .result-count {
        font-size: 0.85rem;
        color: var(--text-muted);
        white-space: nowrap;
      }
      .table-container {
        background: var(--bg-card);
        border-radius: 10px;
        padding: 16px;
        box-shadow: var(--shadow-sm);
        overflow-x: auto;
      }
      table {
        width: 100%;
        border-collapse: collapse;
      }
      th {
        text-align: left;
        padding: 10px 8px;
        border-bottom: 2px solid var(--border-light);
        font-size: 0.85rem;
        color: var(--text-muted);
        text-transform: uppercase;
        letter-spacing: 0.3px;
      }
      td {
        padding: 10px 8px;
        border-bottom: 1px solid var(--border-light);
      }
      .mono {
        font-family: monospace;
      }
      .actions {
        display: flex;
        gap: 6px;
      }
      .empty {
        text-align: center;
        color: var(--text-muted);
        padding: 40px;
      }
      .badge {
        display: inline-block;
        padding: 3px 10px;
        border-radius: 12px;
        font-size: 0.78rem;
        font-weight: 500;
      }
      .badge-Bar {
        background: #e8f5e9;
        color: #2e7d32;
      }
      .badge-Ueberweisung {
        background: #e3f2fd;
        color: #1565c0;
      }
      .badge-PayPal {
        background: #fff3e0;
        color: #e65100;
      }
      .planned-price {
        color: var(--accent-primary, #4361ee);
        font-weight: 500;
      }
      .no-price {
        color: var(--text-muted, #999);
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
      'Ankauefe',
      [
        { key: 'belegNummer', header: 'Beleg-Nr.' },
        { key: 'bikeInfo', header: 'Fahrrad' },
        { key: 'sellerName', header: 'Verkäufer' },
        { key: 'preis', header: 'Preis (€)' },
        { key: 'verkaufspreisVorschlag', header: 'VK-Preis (€)' },
        { key: 'zahlungsart', header: 'Zahlungsart' },
        { key: 'kaufdatum', header: 'Kaufdatum' },
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
