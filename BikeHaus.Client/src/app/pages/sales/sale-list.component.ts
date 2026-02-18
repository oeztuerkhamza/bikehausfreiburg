import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { SaleService } from '../../services/sale.service';
import { TranslationService } from '../../services/translation.service';
import { SaleList } from '../../models/models';

@Component({
  selector: 'app-sale-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>{{ t.sales }}</h1>
        <a routerLink="/sales/new" class="btn btn-primary">+ {{ t.newSale }}</a>
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
            [(ngModel)]="filterPayment"
            (ngModelChange)="applyFilters()"
            class="filter-input"
          >
            <option value="">{{ t.allPaymentMethods }}</option>
            <option value="Bar">{{ t.cash }}</option>
            <option value="Ueberweisung">{{ t.bankTransfer }}</option>
            <option value="PayPal">{{ t.paypal }}</option>
          </select>
        </div>
        <div class="filter-group">
          <select
            [(ngModel)]="filterDate"
            (ngModelChange)="applyFilters()"
            class="filter-input"
          >
            <option value="">{{ t.allDates }}</option>
            <option value="today">{{ t.today }}</option>
            <option value="week">{{ t.thisWeek }}</option>
            <option value="month">{{ t.thisMonth }}</option>
            <option value="year">{{ t.thisYear }}</option>
          </select>
        </div>
<span
          class="result-count"
          *ngIf="filteredSales.length !== sales.length"
        >
          {{ filteredSales.length }} / {{ sales.length }}
        </span>
      </div>

      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>{{ t.receiptNo }}</th>
              <th>{{ t.bicycle }}</th>
              <th>{{ t.buyer }}</th>
              <th>{{ t.price }}</th>
              <th>{{ t.paymentMethod }}</th>
              <th>{{ t.date }}</th>
              <th>{{ t.actions }}</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngIf="filteredSales.length === 0 && sales.length > 0">
              <td
                colspan="7"
                style="text-align:center;padding:32px;color:var(--text-muted);"
              >
                {{ t.noResults }}
              </td>
            </tr>
            <tr *ngIf="sales.length === 0">
              <td
                colspan="7"
                style="text-align:center;padding:32px;color:var(--text-muted);"
              >
                {{ t.noSales }}
              </td>
            </tr>
            <tr *ngFor="let s of filteredSales">
              <td class="mono">{{ s.belegNummer }}</td>
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
      .table-wrap {
        background: var(--bg-card);
        border-radius: 10px;
        overflow: auto;
        box-shadow: var(--shadow-sm);
      }
      table {
        width: 100%;
        border-collapse: collapse;
      }
      th {
        text-align: left;
        padding: 12px 14px;
        font-size: 0.8rem;
        color: var(--text-muted);
        border-bottom: 2px solid var(--border-light);
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      td {
        padding: 12px 14px;
        border-bottom: 1px solid var(--border-light);
        font-size: 0.92rem;
      }
      .mono {
        font-family: monospace;
      }
      .actions {
        display: flex;
        gap: 6px;
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
  private translationService = inject(TranslationService);

  sales: SaleList[] = [];
  filteredSales: SaleList[] = [];

  searchText = '';
  filterPayment = '';
  filterDate = '';

  get t() {
    return this.translationService.translations();
  }

  ngOnInit() {
    this.load();
  }

  load() {
    this.saleService.getAll().subscribe((s) => {
      this.sales = s;
      this.applyFilters();
    });
  }

  applyFilters(): void {
    let result = [...this.sales];

    // Text search
    if (this.searchText.trim()) {
      const q = this.searchText.toLowerCase();
      result = result.filter(
        (s) =>
          s.belegNummer?.toLowerCase().includes(q) ||
          s.bikeInfo?.toLowerCase().includes(q) ||
          s.buyerName?.toLowerCase().includes(q),
      );
    }

    // Payment method filter
    if (this.filterPayment) {
      result = result.filter((s) => s.zahlungsart === this.filterPayment);
    }

    // Date filter
    if (this.filterDate) {
      const now = new Date();
      result = result.filter((s) => {
        const d = new Date(s.verkaufsdatum);
        switch (this.filterDate) {
          case 'today':
            return d.toDateString() === now.toDateString();
          case 'week': {
            const weekAgo = new Date(now);
            weekAgo.setDate(weekAgo.getDate() - 7);
            return d >= weekAgo;
          }
          case 'month':
            return (
              d.getMonth() === now.getMonth() &&
              d.getFullYear() === now.getFullYear()
            );
          case 'year':
            return d.getFullYear() === now.getFullYear();
          default:
            return true;
        }
      });
    }

    this.filteredSales = result;
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

  deleteSale(id: number) {
    if (confirm(this.t.deleteConfirmSale)) {
      this.saleService.delete(id).subscribe({
        next: () => this.load(),
        error: (err) => alert(err.error?.error || this.t.deleteError),
      });
    }
  }
}
