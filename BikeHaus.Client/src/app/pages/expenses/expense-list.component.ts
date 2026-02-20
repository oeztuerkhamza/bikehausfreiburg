import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  ExpenseService,
  Expense,
  ExpenseCreate,
} from '../../services/expense.service';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-expense-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="expense-page">
      <div class="page-header">
        <h1>{{ t.expenses }}</h1>
        <button class="btn-primary" (click)="showForm = true; resetForm()">
          + {{ t.newExpense }}
        </button>
      </div>

      <!-- Search -->
      <div class="search-bar">
        <input
          type="text"
          [placeholder]="t.searchExpensePlaceholder"
          [(ngModel)]="searchQuery"
          (input)="onSearch()"
        />
      </div>

      <!-- Stats Summary -->
      <div class="expense-summary" *ngIf="expenses.length > 0">
        <div class="summary-item">
          <span class="label">{{ t.total }}:</span>
          <span class="value">{{ getTotalAmount() | currency: 'EUR' }}</span>
        </div>
        <div class="summary-item">
          <span class="label">{{ t.expenseCount }}:</span>
          <span class="value">{{ filteredExpenses.length }}</span>
        </div>
      </div>

      <!-- Form Modal -->
      <div class="modal-overlay" *ngIf="showForm" (click)="showForm = false">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <h2>{{ editingExpense ? t.editExpense : t.newExpense }}</h2>
          <div class="form-grid">
            <div class="form-group full-width">
              <label>{{ t.designation }} *</label>
              <input
                type="text"
                [(ngModel)]="form.bezeichnung"
                [placeholder]="t.expenseNamePlaceholder"
              />
            </div>
            <div class="form-group">
              <label>{{ t.category }}</label>
              <select [(ngModel)]="form.kategorie">
                <option [ngValue]="null">{{ t.selectOption }}</option>
                <option value="Zubehör">Zubehör</option>
                <option value="Werkzeug">Werkzeug</option>
                <option value="Büro">Büro</option>
                <option value="Miete">Miete</option>
                <option value="Versicherung">Versicherung</option>
                <option value="Marketing">Marketing</option>
                <option value="Sonstiges">Sonstiges</option>
              </select>
            </div>
            <div class="form-group">
              <label>{{ t.price }} (€) *</label>
              <input
                type="number"
                [(ngModel)]="form.betrag"
                step="0.01"
                min="0"
              />
            </div>
            <div class="form-group">
              <label>{{ t.date }} *</label>
              <input type="date" [(ngModel)]="form.datum" />
            </div>
            <div class="form-group">
              <label>{{ t.supplier }}</label>
              <input
                type="text"
                [(ngModel)]="form.lieferant"
                [placeholder]="t.supplierPlaceholder"
              />
            </div>
            <div class="form-group">
              <label>{{ t.receiptNo }}</label>
              <input type="text" [(ngModel)]="form.belegNummer" />
            </div>
            <div class="form-group full-width">
              <label>{{ t.notes }}</label>
              <textarea [(ngModel)]="form.notizen" rows="3"></textarea>
            </div>
          </div>
          <div class="form-actions">
            <button class="btn-secondary" (click)="showForm = false">
              {{ t.cancel }}
            </button>
            <button
              class="btn-primary"
              (click)="saveExpense()"
              [disabled]="saving"
            >
              {{ saving ? t.saving : t.save }}
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
        <div class="modal-content small" (click)="$event.stopPropagation()">
          <h2>{{ t.confirm }}</h2>
          <p>{{ t.deleteConfirmExpense }}</p>
          <div class="form-actions">
            <button class="btn-secondary" (click)="deleteTarget = null">
              {{ t.cancel }}
            </button>
            <button class="btn-danger" (click)="confirmDelete()">
              {{ t.delete }}
            </button>
          </div>
        </div>
      </div>

      <!-- Expense List -->
      <div class="table-wrapper" *ngIf="filteredExpenses.length > 0">
        <table>
          <thead>
            <tr>
              <th>{{ t.date }}</th>
              <th>{{ t.designation }}</th>
              <th>{{ t.category }}</th>
              <th>{{ t.price }}</th>
              <th>{{ t.supplier }}</th>
              <th>{{ t.receiptNo }}</th>
              <th>{{ t.actions }}</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let expense of filteredExpenses">
              <td>{{ formatDate(expense.datum) }}</td>
              <td class="name-cell">{{ expense.bezeichnung }}</td>
              <td>
                <span class="badge" *ngIf="expense.kategorie">{{
                  expense.kategorie
                }}</span>
              </td>
              <td class="amount-cell">
                {{ expense.betrag | currency: 'EUR' }}
              </td>
              <td>{{ expense.lieferant || '–' }}</td>
              <td>{{ expense.belegNummer || '–' }}</td>
              <td class="actions-cell">
                <button
                  class="btn-icon edit"
                  (click)="startEdit(expense)"
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
                    <path
                      d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
                    />
                    <path
                      d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
                    />
                  </svg>
                </button>
                <button
                  class="btn-icon delete"
                  (click)="deleteTarget = expense"
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
                    <path
                      d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
                    />
                  </svg>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- No Data -->
      <div class="no-data" *ngIf="!loading && filteredExpenses.length === 0">
        <p>{{ t.noExpenses }}</p>
      </div>

      <!-- Loading -->
      <div class="loading" *ngIf="loading">
        <p>{{ t.loading }}</p>
      </div>
    </div>
  `,
  styles: [
    `
      .expense-page {
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

      .expense-summary {
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
        color: var(--accent-danger, #ef4444);
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
      .name-cell {
        font-weight: 600;
        color: var(--text-primary);
      }
      .amount-cell {
        font-weight: 700;
        color: var(--accent-danger, #ef4444);
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
        .expense-summary {
          flex-direction: column;
          gap: 12px;
        }
      }
    `,
  ],
})
export class ExpenseListComponent implements OnInit {
  private translationService = inject(TranslationService);
  get t() {
    return this.translationService.translations();
  }

  expenses: Expense[] = [];
  filteredExpenses: Expense[] = [];
  searchQuery = '';
  showForm = false;
  editingExpense: Expense | null = null;
  deleteTarget: Expense | null = null;
  loading = false;
  saving = false;

  form: ExpenseCreate = {
    bezeichnung: '',
    kategorie: null,
    betrag: 0,
    datum: new Date().toISOString().split('T')[0],
    lieferant: null,
    belegNummer: null,
    notizen: null,
  };

  constructor(private readonly expenseService: ExpenseService) {}

  ngOnInit() {
    this.loadExpenses();
  }

  loadExpenses() {
    this.loading = true;
    this.expenseService.getAll().subscribe({
      next: (data) => {
        this.expenses = data;
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
      this.filteredExpenses = [...this.expenses];
    } else {
      const q = this.searchQuery.toLowerCase();
      this.filteredExpenses = this.expenses.filter(
        (e) =>
          e.bezeichnung.toLowerCase().includes(q) ||
          (e.kategorie && e.kategorie.toLowerCase().includes(q)) ||
          (e.lieferant && e.lieferant.toLowerCase().includes(q)) ||
          (e.belegNummer && e.belegNummer.toLowerCase().includes(q)),
      );
    }
  }

  resetForm() {
    this.editingExpense = null;
    this.form = {
      bezeichnung: '',
      kategorie: null,
      betrag: 0,
      datum: new Date().toISOString().split('T')[0],
      lieferant: null,
      belegNummer: null,
      notizen: null,
    };
  }

  startEdit(expense: Expense) {
    this.editingExpense = expense;
    this.form = {
      bezeichnung: expense.bezeichnung,
      kategorie: expense.kategorie,
      betrag: expense.betrag,
      datum: expense.datum.split('T')[0],
      lieferant: expense.lieferant,
      belegNummer: expense.belegNummer,
      notizen: expense.notizen,
    };
    this.showForm = true;
  }

  saveExpense() {
    if (!this.form.bezeichnung || this.form.betrag <= 0) return;
    this.saving = true;

    const payload: ExpenseCreate = {
      ...this.form,
      datum: new Date(this.form.datum).toISOString(),
    };

    const request$ = this.editingExpense
      ? this.expenseService.update(this.editingExpense.id, payload)
      : this.expenseService.create(payload);

    request$.subscribe({
      next: () => {
        this.showForm = false;
        this.saving = false;
        this.loadExpenses();
      },
      error: () => {
        this.saving = false;
      },
    });
  }

  confirmDelete() {
    if (!this.deleteTarget) return;
    this.expenseService.delete(this.deleteTarget.id).subscribe({
      next: () => {
        this.deleteTarget = null;
        this.loadExpenses();
      },
    });
  }

  getTotalAmount(): number {
    return this.filteredExpenses.reduce((sum, e) => sum + e.betrag, 0);
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
