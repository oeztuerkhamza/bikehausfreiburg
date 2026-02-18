import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ReturnService } from '../../services/return.service';
import { ReturnList, ReturnReason } from '../../models/models';

@Component({
  selector: 'app-return-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>Rückgaben</h1>
        <a routerLink="/returns/new" class="btn btn-primary">+ Neue Rückgabe</a>
      </div>

      <!-- Filter Bar -->
      <div class="filter-bar">
        <div class="filter-group search-group">
          <input
            type="text"
            [(ngModel)]="searchText"
            (ngModelChange)="applyFilters()"
            placeholder="Suche nach Beleg-Nr., Fahrrad, Kunde..."
            class="filter-input search-input"
          />
          <span class="search-icon">🔍</span>
        </div>
        <div class="filter-group">
          <select
            [(ngModel)]="filterReason"
            (ngModelChange)="applyFilters()"
            class="filter-input"
          >
            <option value="">Alle Gründe</option>
            <option value="Defekt">Defekt</option>
            <option value="Garantie">Garantie</option>
            <option value="NichtWieErwartet">Nicht wie erwartet</option>
            <option value="Sonstiges">Sonstiges</option>
          </select>
        </div>
        <div class="filter-group">
          <select
            [(ngModel)]="filterDate"
            (ngModelChange)="applyFilters()"
            class="filter-input"
          >
            <option value="">Alle Daten</option>
            <option value="today">Heute</option>
            <option value="week">Diese Woche</option>
            <option value="month">Diesen Monat</option>
            <option value="year">Dieses Jahr</option>
          </select>
        </div>
        <span
          class="result-count"
          *ngIf="filteredReturns.length !== returns.length"
        >
          {{ filteredReturns.length }} / {{ returns.length }}
        </span>
      </div>

      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Beleg-Nr.</th>
              <th>Org. Verkauf</th>
              <th>Fahrrad</th>
              <th>Kunde</th>
              <th>Datum</th>
              <th>Grund</th>
              <th>Erstattung</th>
              <th>Aktionen</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngIf="filteredReturns.length === 0">
              <td
                colspan="8"
                style="text-align:center;padding:32px;color:#999;"
              >
                Keine Rückgaben gefunden
              </td>
            </tr>
            <tr *ngFor="let r of filteredReturns">
              <td>{{ r.belegNummer }}</td>
              <td>{{ r.originalSaleBelegNummer }}</td>
              <td>{{ r.bikeInfo }}</td>
              <td>{{ r.customerName }}</td>
              <td>{{ r.rueckgabedatum | date: 'dd.MM.yyyy' }}</td>
              <td>
                <span class="badge" [class]="getBadgeClass(r.grund)">{{
                  getReasonLabel(r.grund)
                }}</span>
              </td>
              <td>{{ r.erstattungsbetrag | number: '1.2-2' }} €</td>
              <td class="actions">
                <button
                  class="btn btn-sm btn-outline"
                  (click)="downloadPdf(r.id, r.belegNummer)"
                >
                  PDF
                </button>
                <button class="btn btn-sm btn-danger" (click)="delete(r.id)">
                  Löschen
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
        max-width: 1100px;
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
        min-width: 200px;
      }
      .filter-input {
        padding: 10px 14px;
        border: 1px solid var(--border-color, #ddd);
        border-radius: 6px;
        font-size: 0.9rem;
        background: var(--input-bg, #fff);
        color: var(--text-color, #333);
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
      .result-count {
        font-size: 0.85rem;
        color: var(--text-secondary, #666);
        padding: 8px 12px;
        background: var(--card-bg, #f5f5f5);
        border-radius: 6px;
      }
      .table-wrap {
        background: var(--card-bg, #fff);
        border-radius: 10px;
        overflow: auto;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
      }
      table {
        width: 100%;
        border-collapse: collapse;
      }
      th {
        text-align: left;
        padding: 12px 14px;
        font-size: 0.8rem;
        color: var(--text-secondary, #777);
        border-bottom: 2px solid var(--border-color, #eee);
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      td {
        padding: 12px 14px;
        border-bottom: 1px solid var(--border-color, #f0f0f0);
        font-size: 0.92rem;
      }
      .actions {
        display: flex;
        gap: 6px;
      }
      .btn-sm {
        padding: 4px 10px;
        font-size: 0.8rem;
      }
      .badge {
        padding: 3px 8px;
        border-radius: 4px;
        font-size: 0.75rem;
        font-weight: 500;
      }
      .badge-defekt {
        background: #fee2e2;
        color: #dc2626;
      }
      .badge-garantie {
        background: #fef3c7;
        color: #d97706;
      }
      .badge-nicht-erwartet {
        background: #dbeafe;
        color: #2563eb;
      }
      .badge-sonstiges {
        background: #e5e7eb;
        color: #6b7280;
      }
    `,
  ],
})
export class ReturnListComponent implements OnInit {
  returns: ReturnList[] = [];
  filteredReturns: ReturnList[] = [];
  searchText = '';
  filterReason = '';
  filterDate = '';

  constructor(private returnService: ReturnService) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.returnService.getAll().subscribe((r) => {
      this.returns = r;
      this.applyFilters();
    });
  }

  applyFilters() {
    let result = [...this.returns];

    // Search filter
    if (this.searchText.trim()) {
      const search = this.searchText.toLowerCase();
      result = result.filter(
        (r) =>
          r.belegNummer.toLowerCase().includes(search) ||
          r.originalSaleBelegNummer.toLowerCase().includes(search) ||
          r.bikeInfo.toLowerCase().includes(search) ||
          r.customerName.toLowerCase().includes(search),
      );
    }

    // Reason filter
    if (this.filterReason) {
      result = result.filter((r) => r.grund === this.filterReason);
    }

    // Date filter
    if (this.filterDate) {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      result = result.filter((r) => {
        const date = new Date(r.rueckgabedatum);
        switch (this.filterDate) {
          case 'today':
            return date >= today;
          case 'week':
            const weekAgo = new Date(today);
            weekAgo.setDate(weekAgo.getDate() - 7);
            return date >= weekAgo;
          case 'month':
            const monthAgo = new Date(today);
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            return date >= monthAgo;
          case 'year':
            const yearAgo = new Date(today);
            yearAgo.setFullYear(yearAgo.getFullYear() - 1);
            return date >= yearAgo;
          default:
            return true;
        }
      });
    }

    this.filteredReturns = result;
  }

  getReasonLabel(reason: ReturnReason): string {
    const labels: Record<ReturnReason, string> = {
      [ReturnReason.Defekt]: 'Defekt',
      [ReturnReason.Garantie]: 'Garantie',
      [ReturnReason.NichtWieErwartet]: 'Nicht wie erwartet',
      [ReturnReason.Sonstiges]: 'Sonstiges',
    };
    return labels[reason] || reason;
  }

  getBadgeClass(reason: ReturnReason): string {
    const classes: Record<ReturnReason, string> = {
      [ReturnReason.Defekt]: 'badge-defekt',
      [ReturnReason.Garantie]: 'badge-garantie',
      [ReturnReason.NichtWieErwartet]: 'badge-nicht-erwartet',
      [ReturnReason.Sonstiges]: 'badge-sonstiges',
    };
    return classes[reason] || '';
  }

  downloadPdf(id: number, belegNr: string) {
    this.returnService.downloadRueckgabebeleg(id).subscribe((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Rueckgabebeleg_${belegNr}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  delete(id: number) {
    if (confirm('Rückgabe wirklich löschen?')) {
      this.returnService.delete(id).subscribe({
        next: () => this.load(),
        error: (err) =>
          alert(err.error?.error || 'Fehler beim Löschen der Rückgabe'),
      });
    }
  }
}
