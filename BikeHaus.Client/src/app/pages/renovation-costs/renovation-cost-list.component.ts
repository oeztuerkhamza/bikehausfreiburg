import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslationService } from '../../services/translation.service';
import {
  RenovationCost,
  RenovationCostCreate,
  RenovationCostService,
} from '../../services/renovation-cost.service';

@Component({
  selector: 'app-renovation-cost-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1>Renovierung Kosten</h1>
          <p class="page-subtitle">Renovierungsarbeiten und Kosten verwalten</p>
        </div>
        <button class="btn btn-primary" (click)="openNew()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Neue Kosten
        </button>
      </div>

      <!-- Summary -->
      <div class="summary-bar" *ngIf="items.length > 0">
        <div class="summary-item">
          <span class="label">Einträge:</span>
          <span class="value">{{ items.length }}</span>
        </div>
        <div class="summary-item">
          <span class="label">Gesamt:</span>
          <span class="value total">{{ totalBetrag | number:'1.2-2' }} €</span>
        </div>
      </div>

      <!-- Modal Form -->
      <div class="modal-overlay" *ngIf="showForm" (click)="showForm = false">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <h2>{{ editing ? 'Eintrag bearbeiten' : 'Neue Renovierungskosten' }}</h2>
          <div class="form-grid">
            <div class="form-group">
              <label>DATUM *</label>
              <input type="date" [(ngModel)]="form.datum" />
            </div>
            <div class="form-group">
              <label>BETRAG (€) *</label>
              <input type="number" [(ngModel)]="form.betrag" min="0" step="0.01" />
            </div>
            <div class="form-group full-width">
              <label>GEMACHTE ARBEIT *</label>
              <textarea
                [(ngModel)]="form.gemachteArbeit"
                rows="3"
                placeholder="z.B. Boden verlegen, Wände streichen..."
              ></textarea>
            </div>
            <div class="form-group full-width">
              <label>NOTIZEN</label>
              <textarea [(ngModel)]="form.notizen" rows="2" placeholder="Optionale Notizen..."></textarea>
            </div>
          </div>
          <div class="modal-actions">
            <button class="btn btn-secondary" (click)="showForm = false">Abbrechen</button>
            <button class="btn btn-primary" (click)="save()" [disabled]="saving">
              {{ saving ? 'Speichern...' : 'Speichern' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Delete Confirm -->
      <div class="modal-overlay" *ngIf="deleteTarget" (click)="deleteTarget = null">
        <div class="modal-content modal-small" (click)="$event.stopPropagation()">
          <h2>Eintrag löschen?</h2>
          <p>Möchten Sie diesen Eintrag wirklich löschen?</p>
          <div class="modal-actions">
            <button class="btn btn-secondary" (click)="deleteTarget = null">Abbrechen</button>
            <button class="btn btn-danger" (click)="confirmDelete()">Löschen</button>
          </div>
        </div>
      </div>

      <!-- Loading -->
      <div class="loading-state" *ngIf="loading">
        <div class="spinner"></div>
        <span>Laden...</span>
      </div>

      <!-- Empty -->
      <div class="empty-state" *ngIf="!loading && items.length === 0">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.3">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
        <p>Noch keine Renovierungskosten erfasst.</p>
        <button class="btn btn-primary" (click)="openNew()">Ersten Eintrag erstellen</button>
      </div>

      <!-- Table -->
      <div class="table-wrap" *ngIf="!loading && items.length > 0">
        <table>
          <thead>
            <tr>
              <th>DATUM</th>
              <th>GEMACHTE ARBEIT</th>
              <th class="text-right">BETRAG</th>
              <th>NOTIZEN</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let item of items">
              <td class="date-cell">{{ item.datum | date:'dd.MM.yyyy' }}</td>
              <td class="work-cell">{{ item.gemachteArbeit }}</td>
              <td class="amount-cell text-right">{{ item.betrag | number:'1.2-2' }} €</td>
              <td class="notes-cell">{{ item.notizen || '—' }}</td>
              <td class="actions-cell">
                <button class="btn-icon" title="Bearbeiten" (click)="startEdit(item)">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                </button>
                <button class="btn-icon btn-icon-danger" title="Löschen" (click)="deleteTarget = item">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                    <path d="M10 11v6M14 11v6"/>
                    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                  </svg>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .page { padding: 24px; max-width: 1100px; margin: 0 auto; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
    .page-header h1 { font-size: 1.6rem; font-weight: 700; margin: 0 0 4px; }
    .page-subtitle { color: var(--text-muted, #6b7280); font-size: 0.9rem; margin: 0; }

    .summary-bar {
      display: flex; gap: 24px; margin-bottom: 20px;
      background: var(--surface, #fff); border-radius: 12px;
      padding: 14px 20px; border: 1px solid var(--border, #e5e7eb);
    }
    .summary-item { display: flex; align-items: center; gap: 8px; }
    .summary-item .label { color: var(--text-muted, #6b7280); font-size: 0.85rem; }
    .summary-item .value { font-weight: 700; font-size: 1rem; }
    .summary-item .total { color: var(--accent-primary, #6366f1); }

    .modal-overlay {
      position: fixed; inset: 0; background: rgba(0,0,0,0.45); z-index: 1000;
      display: flex; align-items: center; justify-content: center; padding: 16px;
    }
    .modal-content {
      background: var(--surface, #fff); border-radius: 16px; padding: 28px;
      width: 100%; max-width: 580px; box-shadow: 0 20px 60px rgba(0,0,0,0.2);
    }
    .modal-content.modal-small { max-width: 400px; }
    .modal-content h2 { margin: 0 0 20px; font-size: 1.2rem; font-weight: 700; }

    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .form-group { display: flex; flex-direction: column; gap: 6px; }
    .form-group.full-width { grid-column: 1 / -1; }
    .form-group label { font-size: 0.75rem; font-weight: 700; color: var(--text-muted, #6b7280); letter-spacing: 0.04em; }
    .form-group input, .form-group textarea, .form-group select {
      border: 1.5px solid var(--border, #e5e7eb); border-radius: 10px;
      padding: 10px 14px; font-size: 0.95rem; background: var(--bg, #f9fafb);
      transition: border-color 0.15s; width: 100%; box-sizing: border-box;
      font-family: inherit;
    }
    .form-group input:focus, .form-group textarea:focus { outline: none; border-color: var(--accent-primary, #6366f1); background: #fff; }
    .form-group textarea { resize: vertical; min-height: 72px; }

    .modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px; }

    .table-wrap { background: var(--surface, #fff); border-radius: 14px; border: 1px solid var(--border, #e5e7eb); overflow: hidden; }
    table { width: 100%; border-collapse: collapse; }
    thead th { padding: 12px 16px; font-size: 0.72rem; font-weight: 700; color: var(--text-muted, #6b7280); letter-spacing: 0.05em; text-align: left; border-bottom: 1px solid var(--border, #e5e7eb); background: var(--bg, #f9fafb); }
    tbody tr { border-bottom: 1px solid var(--border-light, #f3f4f6); transition: background 0.1s; }
    tbody tr:last-child { border-bottom: none; }
    tbody tr:hover { background: var(--bg, #f9fafb); }
    td { padding: 12px 16px; font-size: 0.9rem; vertical-align: top; }
    .date-cell { white-space: nowrap; color: var(--text-muted, #6b7280); }
    .work-cell { font-weight: 500; }
    .amount-cell { font-weight: 700; white-space: nowrap; }
    .notes-cell { color: var(--text-muted, #6b7280); font-size: 0.85rem; }
    .text-right { text-align: right; }
    .actions-cell { white-space: nowrap; text-align: right; }

    .btn { display: inline-flex; align-items: center; gap: 7px; padding: 10px 18px; border-radius: 10px; font-size: 0.88rem; font-weight: 600; border: none; cursor: pointer; transition: all 0.15s; }
    .btn-primary { background: var(--accent-primary, #6366f1); color: #fff; }
    .btn-primary:hover { filter: brightness(1.08); }
    .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
    .btn-secondary { background: var(--bg, #f3f4f6); color: var(--text, #111827); border: 1px solid var(--border, #e5e7eb); }
    .btn-secondary:hover { background: var(--border, #e5e7eb); }
    .btn-danger { background: #ef4444; color: #fff; }
    .btn-danger:hover { background: #dc2626; }

    .btn-icon { background: none; border: none; cursor: pointer; padding: 6px; border-radius: 7px; color: var(--text-muted, #6b7280); transition: all 0.15s; }
    .btn-icon:hover { background: var(--bg, #f3f4f6); color: var(--text, #111827); }
    .btn-icon-danger:hover { background: #fee2e2; color: #ef4444; }

    .loading-state { display: flex; align-items: center; justify-content: center; gap: 12px; padding: 60px; color: var(--text-muted, #6b7280); }
    .spinner { width: 24px; height: 24px; border: 3px solid var(--border, #e5e7eb); border-top-color: var(--accent-primary, #6366f1); border-radius: 50%; animation: spin 0.7s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    .empty-state { display: flex; flex-direction: column; align-items: center; gap: 16px; padding: 80px 24px; color: var(--text-muted, #6b7280); text-align: center; }
    .empty-state p { margin: 0; font-size: 1rem; }

    @media (max-width: 640px) {
      .form-grid { grid-template-columns: 1fr; }
      .page-header { flex-direction: column; gap: 12px; }
    }
  `],
})
export class RenovationCostListComponent implements OnInit {
  private translationService = inject(TranslationService);
  get t() { return this.translationService.translations(); }

  items: RenovationCost[] = [];
  loading = false;
  saving = false;
  showForm = false;
  editing: RenovationCost | null = null;
  deleteTarget: RenovationCost | null = null;

  form: RenovationCostCreate = {
    datum: new Date().toISOString().split('T')[0],
    betrag: 0,
    gemachteArbeit: '',
    notizen: null,
  };

  constructor(private readonly service: RenovationCostService) {}

  ngOnInit() {
    this.load();
  }

  get totalBetrag(): number {
    return this.items.reduce((sum, i) => sum + i.betrag, 0);
  }

  load() {
    this.loading = true;
    this.service.getAll().subscribe({
      next: (data) => { this.items = data; this.loading = false; },
      error: () => { this.loading = false; },
    });
  }

  openNew() {
    this.editing = null;
    this.form = {
      datum: new Date().toISOString().split('T')[0],
      betrag: 0,
      gemachteArbeit: '',
      notizen: null,
    };
    this.showForm = true;
  }

  startEdit(item: RenovationCost) {
    this.editing = item;
    this.form = {
      datum: item.datum.split('T')[0],
      betrag: item.betrag,
      gemachteArbeit: item.gemachteArbeit,
      notizen: item.notizen,
    };
    this.showForm = true;
  }

  save() {
    if (!this.form.gemachteArbeit || this.form.betrag <= 0) return;
    this.saving = true;
    const req = this.editing
      ? this.service.update(this.editing.id, this.form)
      : this.service.create(this.form);

    req.subscribe({
      next: () => { this.saving = false; this.showForm = false; this.load(); },
      error: () => { this.saving = false; },
    });
  }

  confirmDelete() {
    if (!this.deleteTarget) return;
    this.service.delete(this.deleteTarget.id).subscribe({
      next: () => { this.deleteTarget = null; this.load(); },
    });
  }
}
