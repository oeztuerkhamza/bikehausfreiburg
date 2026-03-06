import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  InvoiceService,
  Invoice,
  InvoiceCreate,
} from '../../services/invoice.service';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-invoice-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="invoice-page">
      <div class="page-header">
        <h1>{{ t.invoices }}</h1>
        <button class="btn-primary" (click)="openNewForm()">
          + {{ t.newInvoice }}
        </button>
      </div>

      <div class="search-bar">
        <input
          type="text"
          [placeholder]="t.searchInvoicePlaceholder"
          [(ngModel)]="searchQuery"
          (input)="onSearch()"
        />
      </div>

      <div class="invoice-summary">
        <div class="summary-item">
          <span class="label">{{ t.invoiceCount }}</span>
          <span class="value">{{ filteredInvoices.length }}</span>
        </div>
        <div class="summary-item">
          <span class="label">{{ t.invoiceTotal }}</span>
          <span class="value total">
            {{ getTotal() | currency: 'EUR' }}
          </span>
        </div>
      </div>

      <div class="table-wrapper" *ngIf="!loading">
        <table *ngIf="filteredInvoices.length > 0">
          <thead>
            <tr>
              <th>{{ t.invoiceNumber }}</th>
              <th>{{ t.date }}</th>
              <th>{{ t.designation }}</th>
              <th>{{ t.category }}</th>
              <th>{{ t.customerName }}</th>
              <th>{{ t.price }}</th>
              <th>{{ t.actions }}</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let inv of filteredInvoices">
              <td class="number-cell">{{ inv.rechnungsNummer }}</td>
              <td>{{ formatDate(inv.datum) }}</td>
              <td class="name-cell">{{ inv.bezeichnung }}</td>
              <td>
                <span class="badge" *ngIf="inv.kategorie">{{
                  inv.kategorie
                }}</span>
              </td>
              <td>{{ inv.kundenName || '–' }}</td>
              <td class="amount-cell">
                {{ inv.betrag | currency: 'EUR' }}
              </td>
              <td class="actions-cell">
                <button
                  class="btn-icon pdf"
                  (click)="downloadPdf(inv)"
                  title="{{ t.download }}"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <polyline points="10 9 9 9 8 9" />
                  </svg>
                </button>
                <button
                  class="btn-icon edit"
                  (click)="startEdit(inv)"
                  title="{{ t.edit }}"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </button>
                <button
                  class="btn-icon delete"
                  (click)="confirmDelete(inv)"
                  title="{{ t.delete }}"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        <div class="no-data" *ngIf="filteredInvoices.length === 0">
          {{ t.noInvoices }}
        </div>
      </div>

      <div class="loading" *ngIf="loading">{{ t.loading }}...</div>

      <!-- Form Modal -->
      <div class="modal-overlay" *ngIf="showForm" (click)="closeForm()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <h2>{{ editingInvoice ? t.editInvoice : t.newInvoice }}</h2>
          <div class="form-grid">
            <div class="form-group" *ngIf="editingInvoice">
              <label>{{ t.invoiceNumber }}</label>
              <input type="text" [(ngModel)]="form.rechnungsNummer" readonly />
            </div>
            <div class="form-group">
              <label>{{ t.date }} *</label>
              <input type="date" [(ngModel)]="form.datum" required />
            </div>
            <div class="form-group">
              <label>{{ t.designation }} *</label>
              <input
                type="text"
                [(ngModel)]="form.bezeichnung"
                placeholder="z.B. Fahrradreparatur"
              />
            </div>
            <div class="form-group">
              <label>{{ t.price }} *</label>
              <input
                type="number"
                [(ngModel)]="form.betrag"
                step="0.01"
                min="0"
              />
            </div>
            <div class="form-group">
              <label>{{ t.category }}</label>
              <select [(ngModel)]="form.kategorie">
                <option [ngValue]="null">–</option>
                <option value="Reparatur">Reparatur</option>
                <option value="Zubehör">Zubehör</option>
                <option value="Dienstleistung">Dienstleistung</option>
                <option value="Sonstiges">Sonstiges</option>
              </select>
            </div>
            <div class="form-group">
              <label>{{ t.customerName }}</label>
              <input type="text" [(ngModel)]="form.kundenName" />
            </div>
            <div class="form-group full-width">
              <label>{{ t.customerAddress }}</label>
              <input type="text" [(ngModel)]="form.kundenAdresse" />
            </div>
            <div class="form-group full-width">
              <label>{{ t.notes }}</label>
              <textarea [(ngModel)]="form.notizen" rows="3"></textarea>
            </div>
          </div>
          <div class="form-actions">
            <button class="btn-secondary" (click)="closeForm()">
              {{ t.cancel }}
            </button>
            <button
              class="btn-primary"
              (click)="saveInvoice()"
              [disabled]="saving"
            >
              {{ saving ? t.saving + '...' : t.save }}
            </button>
          </div>
        </div>
      </div>

      <!-- Delete Confirm Modal -->
      <div
        class="modal-overlay"
        *ngIf="deleteTarget"
        (click)="deleteTarget = null"
      >
        <div
          class="modal-content small"
          (click)="$event.stopPropagation()"
        >
          <h2>{{ t.delete }}</h2>
          <p>{{ t.deleteConfirmInvoice }}</p>
          <div class="form-actions">
            <button class="btn-secondary" (click)="deleteTarget = null">
              {{ t.cancel }}
            </button>
            <button class="btn-danger" (click)="deleteInvoice()">
              {{ t.delete }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .invoice-page {
        max-width: 1200px;
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
        margin-bottom: 20px;
      }
      .page-header h1 {
        font-size: 1.5rem;
        font-weight: 800;
        color: var(--text-primary);
        margin: 0;
      }

      .btn-primary {
        padding: 10px 20px;
        background: var(--accent-primary, #6366f1);
        color: #fff;
        border: none;
        border-radius: var(--radius-md, 10px);
        cursor: pointer;
        font-weight: 600;
        font-size: 0.88rem;
        transition: var(--transition-fast);
      }
      .btn-primary:hover {
        background: var(--accent-primary-hover, #4f46e5);
      }
      .btn-primary:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
      .btn-secondary {
        padding: 10px 20px;
        background: var(--bg-secondary, #f8fafc);
        color: var(--text-primary);
        border: 1.5px solid var(--border-light, #e2e8f0);
        border-radius: var(--radius-md, 10px);
        cursor: pointer;
        font-weight: 600;
        font-size: 0.88rem;
      }
      .btn-danger {
        padding: 10px 20px;
        background: var(--accent-danger, #ef4444);
        color: #fff;
        border: none;
        border-radius: var(--radius-md, 10px);
        cursor: pointer;
        font-weight: 600;
        font-size: 0.88rem;
      }

      .search-bar {
        margin-bottom: 16px;
      }
      .search-bar input {
        width: 100%;
        padding: 11px 16px;
        border: 1.5px solid var(--border-light, #e2e8f0);
        border-radius: var(--radius-md, 10px);
        font-size: 0.92rem;
        background: var(--bg-card, #fff);
        color: var(--text-primary);
        box-sizing: border-box;
      }
      .search-bar input:focus {
        outline: none;
        border-color: var(--accent-primary, #6366f1);
        box-shadow: 0 0 0 3px
          var(--accent-primary-light, rgba(99, 102, 241, 0.1));
      }

      .invoice-summary {
        display: flex;
        gap: 24px;
        margin-bottom: 20px;
        padding: 16px 20px;
        background: var(--bg-card, #fff);
        border-radius: var(--radius-lg, 14px);
        border: 1.5px solid var(--border-light, #e2e8f0);
        box-shadow: var(--shadow-sm);
      }
      .summary-item {
        display: flex;
        gap: 8px;
        align-items: center;
      }
      .summary-item .label {
        font-size: 0.82rem;
        font-weight: 600;
        color: var(--text-secondary, #64748b);
        text-transform: uppercase;
        letter-spacing: 0.03em;
      }
      .summary-item .value {
        font-size: 1.1rem;
        font-weight: 800;
        color: var(--accent-primary, #6366f1);
      }
      .summary-item .value.total {
        color: var(--accent-success, #10b981);
      }

      /* Modal */
      .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
      }
      .modal-content {
        background: var(--bg-card, #fff);
        border-radius: var(--radius-lg, 14px);
        padding: 28px;
        width: 90%;
        max-width: 600px;
        max-height: 90vh;
        overflow-y: auto;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
      }
      .modal-content.small {
        max-width: 400px;
      }
      .modal-content h2 {
        margin: 0 0 20px;
        font-size: 1.2rem;
        font-weight: 700;
        color: var(--text-primary);
      }
      .modal-content p {
        color: var(--text-secondary);
        margin-bottom: 20px;
      }

      .form-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
        margin-bottom: 24px;
      }
      .form-group {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .form-group.full-width {
        grid-column: 1 / -1;
      }
      .form-group label {
        font-size: 0.82rem;
        font-weight: 600;
        color: var(--text-secondary, #64748b);
        text-transform: uppercase;
        letter-spacing: 0.03em;
      }
      .form-group input,
      .form-group select,
      .form-group textarea {
        padding: 10px 14px;
        border: 1.5px solid var(--border-light, #e2e8f0);
        border-radius: var(--radius-md, 10px);
        font-size: 0.92rem;
        background: var(--bg-card, #fff);
        color: var(--text-primary);
        transition: var(--transition-fast);
      }
      .form-group input:focus,
      .form-group select:focus,
      .form-group textarea:focus {
        outline: none;
        border-color: var(--accent-primary, #6366f1);
        box-shadow: 0 0 0 3px
          var(--accent-primary-light, rgba(99, 102, 241, 0.1));
      }
      .form-group textarea {
        resize: vertical;
        font-family: inherit;
      }

      .form-actions {
        display: flex;
        gap: 12px;
        justify-content: flex-end;
      }

      /* Table */
      .table-wrapper {
        background: var(--bg-card, #fff);
        border-radius: var(--radius-lg, 14px);
        border: 1.5px solid var(--border-light, #e2e8f0);
        box-shadow: var(--shadow-sm);
        overflow-x: auto;
      }
      table {
        width: 100%;
        border-collapse: collapse;
      }
      th,
      td {
        padding: 12px 14px;
        text-align: left;
        border-bottom: 1px solid var(--border-light, #e2e8f0);
      }
      th {
        background: var(--table-stripe, #f8fafc);
        font-weight: 600;
        font-size: 0.78rem;
        color: var(--text-secondary, #64748b);
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }
      tr:hover {
        background: var(--table-hover, #f1f5f9);
      }
      .number-cell {
        font-weight: 700;
        color: var(--accent-primary, #6366f1);
        font-variant-numeric: tabular-nums;
      }
      .name-cell {
        font-weight: 600;
        color: var(--text-primary);
      }
      .amount-cell {
        font-weight: 700;
        color: var(--accent-success, #10b981);
      }

      .badge {
        display: inline-block;
        padding: 3px 10px;
        border-radius: 20px;
        font-size: 0.78rem;
        font-weight: 600;
        background: var(--accent-primary-light, rgba(99, 102, 241, 0.08));
        color: var(--accent-primary, #6366f1);
      }

      .actions-cell {
        display: flex;
        gap: 8px;
      }
      .btn-icon {
        width: 32px;
        height: 32px;
        border: 1.5px solid var(--border-light, #e2e8f0);
        border-radius: var(--radius-sm, 8px);
        background: var(--bg-card, #fff);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: var(--transition-fast);
        color: var(--text-secondary, #64748b);
      }
      .btn-icon.pdf:hover {
        border-color: var(--accent-success, #10b981);
        color: var(--accent-success, #10b981);
        background: rgba(16, 185, 129, 0.06);
      }
      .btn-icon.edit:hover {
        border-color: var(--accent-primary, #6366f1);
        color: var(--accent-primary, #6366f1);
        background: var(--accent-primary-light, rgba(99, 102, 241, 0.06));
      }
      .btn-icon.delete:hover {
        border-color: var(--accent-danger, #ef4444);
        color: var(--accent-danger, #ef4444);
        background: rgba(239, 68, 68, 0.06);
      }

      .no-data {
        text-align: center;
        padding: 60px 20px;
        color: var(--text-secondary, #94a3b8);
      }
      .loading {
        text-align: center;
        padding: 40px;
        color: var(--text-secondary, #64748b);
      }

      @media (max-width: 768px) {
        .form-grid {
          grid-template-columns: 1fr;
        }
        .invoice-summary {
          flex-direction: column;
          gap: 12px;
        }
      }
    `,
  ],
})
export class InvoiceListComponent implements OnInit {
  private translationService = inject(TranslationService);
  get t() {
    return this.translationService.translations();
  }

  invoices: Invoice[] = [];
  filteredInvoices: Invoice[] = [];
  searchQuery = '';
  showForm = false;
  editingInvoice: Invoice | null = null;
  deleteTarget: Invoice | null = null;
  loading = false;
  saving = false;

  form: InvoiceCreate = {
    rechnungsNummer: null,
    datum: new Date().toISOString().split('T')[0],
    betrag: 0,
    bezeichnung: '',
    kategorie: null,
    kundenName: null,
    kundenAdresse: null,
    notizen: null,
  };

  constructor(private readonly invoiceService: InvoiceService) {}

  ngOnInit() {
    this.loadInvoices();
  }

  loadInvoices() {
    this.loading = true;
    this.invoiceService.getAll().subscribe({
      next: (data) => {
        this.invoices = data;
        this.applyFilter();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  onSearch() {
    this.applyFilter();
  }

  applyFilter() {
    if (!this.searchQuery.trim()) {
      this.filteredInvoices = [...this.invoices];
    } else {
      const q = this.searchQuery.toLowerCase();
      this.filteredInvoices = this.invoices.filter(
        (inv) =>
          inv.rechnungsNummer.toLowerCase().includes(q) ||
          inv.bezeichnung.toLowerCase().includes(q) ||
          (inv.kategorie && inv.kategorie.toLowerCase().includes(q)) ||
          (inv.kundenName && inv.kundenName.toLowerCase().includes(q)),
      );
    }
  }

  getTotal(): number {
    return this.filteredInvoices.reduce((sum, inv) => sum + inv.betrag, 0);
  }

  openNewForm() {
    this.editingInvoice = null;
    this.form = {
      rechnungsNummer: null,
      datum: new Date().toISOString().split('T')[0],
      betrag: 0,
      bezeichnung: '',
      kategorie: null,
      kundenName: null,
      kundenAdresse: null,
      notizen: null,
    };
    this.showForm = true;
  }

  startEdit(inv: Invoice) {
    this.editingInvoice = inv;
    this.form = {
      rechnungsNummer: inv.rechnungsNummer,
      datum: inv.datum.split('T')[0],
      betrag: inv.betrag,
      bezeichnung: inv.bezeichnung,
      kategorie: inv.kategorie,
      kundenName: inv.kundenName,
      kundenAdresse: inv.kundenAdresse,
      notizen: inv.notizen,
    };
    this.showForm = true;
  }

  closeForm() {
    this.showForm = false;
    this.editingInvoice = null;
  }

  saveInvoice() {
    if (!this.form.bezeichnung || !this.form.datum || this.form.betrag <= 0) {
      return;
    }
    this.saving = true;

    if (this.editingInvoice) {
      this.invoiceService
        .update(this.editingInvoice.id, this.form)
        .subscribe({
          next: () => {
            this.saving = false;
            this.closeForm();
            this.loadInvoices();
          },
          error: () => {
            this.saving = false;
          },
        });
    } else {
      this.invoiceService.create(this.form).subscribe({
        next: () => {
          this.saving = false;
          this.closeForm();
          this.loadInvoices();
        },
        error: () => {
          this.saving = false;
        },
      });
    }
  }

  confirmDelete(inv: Invoice) {
    this.deleteTarget = inv;
  }

  deleteInvoice() {
    if (!this.deleteTarget) return;
    this.invoiceService.delete(this.deleteTarget.id).subscribe({
      next: () => {
        this.deleteTarget = null;
        this.loadInvoices();
      },
    });
  }

  downloadPdf(inv: Invoice) {
    this.invoiceService.downloadPdf(inv.id).subscribe((blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Rechnung-${inv.rechnungsNummer}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    });
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }
}
