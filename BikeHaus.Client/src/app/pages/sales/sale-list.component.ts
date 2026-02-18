import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { SaleService } from '../../services/sale.service';
import { ExcelExportService } from '../../services/excel-export.service';
import { TranslationService } from '../../services/translation.service';
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
            📥 Excel Export
          </button>
          <a routerLink="/sales/new" class="btn btn-primary"
            >+ {{ t.newSale }}</a
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
          <span class="search-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></span>
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

      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>{{ t.receiptNo }}</th>
              <th>Stok Nr.</th>
              <th>{{ t.bicycle }}</th>
              <th>{{ t.buyer }}</th>
              <th>{{ t.price }}</th>
              <th>{{ t.paymentMethod }}</th>
              <th>{{ t.date }}</th>
              <th>{{ t.actions }}</th>
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
            <tr *ngFor="let s of paginatedResult?.items">
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
              <td class="actions">
                <a
                  class="btn btn-sm btn-outline"
                  [routerLink]="['/sales/edit', s.id]"
                >
                  ✎
                </a>
                <button
                  class="btn btn-sm btn-outline"
                  (click)="downloadPdf(s.id, s.belegNummer)"
                >
                  PDF
                </button>
                <button
                  class="btn btn-sm btn-danger"
                  (click)="deleteSale(s.id)"
                >
                  ×
                </button>
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
        from { opacity: 0; transform: translateY(8px); }
        to { opacity: 1; transform: translateY(0); }
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
        box-shadow: 0 0 0 3px var(--accent-primary-light, rgba(99,102,241,0.08));
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
      .table-wrap {
        background: var(--bg-card);
        border-radius: var(--radius-lg, 14px);
        border: 1px solid var(--border-light);
        overflow: auto;
        box-shadow: var(--shadow-sm);
      }
      table {
        width: 100%;
        border-collapse: collapse;
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
        background: var(--accent-primary-light, rgba(99,102,241,0.08));
        padding: 2px 8px;
        border-radius: 6px;
        font-weight: 600;
      }
      .actions {
        display: flex;
        gap: 6px;
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
        background: var(--accent-success-light, rgba(16,185,129,0.08));
        color: var(--accent-success, #10b981);
      }
      .badge-Ueberweisung {
        background: rgba(59,130,246,0.08);
        color: #3b82f6;
      }
      .badge-PayPal {
        background: var(--accent-warning-light, rgba(245,158,11,0.08));
        color: var(--accent-warning, #f59e0b);
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
export class SaleListComponent implements OnInit {
  private saleService = inject(SaleService);
  private excelExportService = inject(ExcelExportService);
  private translationService = inject(TranslationService);

  paginatedResult: PaginatedResult<SaleList> | null = null;
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
    this.saleService
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

  downloadPdf(id: number, belegNr: string) {
    this.saleService.downloadVerkaufsbeleg(id).subscribe((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Verkaufsbeleg_${belegNr}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    });
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

  deleteSale(id: number) {
    if (confirm(this.t.deleteConfirmSale)) {
      this.saleService.delete(id).subscribe({
        next: () => this.load(),
        error: (err) => alert(err.error?.error || this.t.deleteError),
      });
    }
  }
}
