import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AccessoryCatalogService } from '../../services/accessory-catalog.service';
import { ExcelExportService } from '../../services/excel-export.service';
import {
  AccessoryCatalogList,
  AccessoryCatalogCreate,
  AccessoryCatalogUpdate,
} from '../../models/models';

@Component({
  selector: 'app-parts-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>Zubehör-Katalog</h1>
        <div class="header-actions">
          <button class="btn btn-outline" (click)="exportExcel()">
            📥 Excel Export
          </button>
          <button class="btn btn-primary" (click)="openAddDialog()">
            + Neues Zubehör
          </button>
        </div>
      </div>

      <!-- Search/Filter -->
      <div class="filter-bar">
        <div class="filter-group search-group">
          <input
            type="text"
            [(ngModel)]="searchText"
            (ngModelChange)="filterParts()"
            placeholder="Suchen..."
            class="filter-input search-input"
          />
          <span class="search-icon">🔍</span>
        </div>
        <div class="filter-group">
          <select
            [(ngModel)]="filterStatus"
            (ngModelChange)="filterParts()"
            class="filter-input"
          >
            <option value="">Alle</option>
            <option value="active">Nur Aktive</option>
            <option value="inactive">Nur Inaktive</option>
          </select>
        </div>
        <span
          class="result-count"
          *ngIf="filteredParts.length !== parts.length"
        >
          {{ filteredParts.length }} / {{ parts.length }}
        </span>
      </div>

      <!-- Parts Table -->
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Bezeichnung</th>
              <th>Kategorie</th>
              <th>Standardpreis</th>
              <th>Status</th>
              <th>Aktionen</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let part of filteredParts">
              <td>{{ part.bezeichnung }}</td>
              <td>{{ part.kategorie || '–' }}</td>
              <td>{{ part.standardpreis | number: '1.2-2' }} €</td>
              <td>
                <span
                  class="status-badge"
                  [class.active]="part.aktiv"
                  [class.inactive]="!part.aktiv"
                >
                  {{ part.aktiv ? 'Aktiv' : 'Inaktiv' }}
                </span>
              </td>
              <td class="actions">
                <button
                  class="btn btn-sm btn-outline"
                  (click)="openEditDialog(part)"
                >
                  ✎
                </button>
                <button
                  class="btn btn-sm btn-danger"
                  (click)="deletePart(part)"
                >
                  ×
                </button>
              </td>
            </tr>
            <tr *ngIf="filteredParts.length === 0">
              <td colspan="5" class="empty">
                {{
                  parts.length === 0
                    ? 'Keine Zubehörteile vorhanden'
                    : 'Keine Treffer'
                }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Add/Edit Dialog -->
      <div class="dialog-overlay" *ngIf="showDialog" (click)="closeDialog()">
        <div class="dialog" (click)="$event.stopPropagation()">
          <h2>{{ editingPart ? 'Zubehör bearbeiten' : 'Neues Zubehör' }}</h2>
          <form (ngSubmit)="savePart()">
            <div class="field">
              <label>Bezeichnung *</label>
              <input
                [(ngModel)]="formData.bezeichnung"
                name="bezeichnung"
                required
                placeholder="z.B. Fahrradschloss"
              />
            </div>
            <div class="field">
              <label>Kategorie</label>
              <input
                [(ngModel)]="formData.kategorie"
                name="kategorie"
                placeholder="z.B. Sicherheit"
              />
            </div>
            <div class="field">
              <label>Standardpreis (€) *</label>
              <input
                type="number"
                step="0.01"
                [(ngModel)]="formData.standardpreis"
                name="standardpreis"
                required
              />
            </div>
            <div class="field" *ngIf="editingPart">
              <label class="checkbox-label">
                <input
                  type="checkbox"
                  [(ngModel)]="formData.aktiv"
                  name="aktiv"
                />
                Aktiv (wird in Verkäufen angezeigt)
              </label>
            </div>
            <div class="dialog-actions">
              <button
                type="button"
                class="btn btn-outline"
                (click)="closeDialog()"
              >
                Abbrechen
              </button>
              <button type="submit" class="btn btn-primary" [disabled]="saving">
                {{ saving ? 'Speichern...' : 'Speichern' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .page {
        max-width: 1000px;
        margin: 0 auto;
        animation: fadeIn 0.4s ease;
      }
      @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
      .page-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 22px;
      }
      .page-header h1 {
        font-size: 1.5rem;
        font-weight: 800;
        color: var(--text-primary);
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
        min-width: 200px;
      }
      .filter-input {
        padding: 10px 14px;
        border: 1.5px solid var(--border-light, #e2e8f0);
        border-radius: var(--radius-md, 10px);
        font-size: 0.92rem;
        background: var(--bg-card, #fff);
        color: var(--text-primary);
        width: 100%;
        transition: var(--transition-fast);
      }
      .filter-input:focus {
        outline: none;
        border-color: var(--accent-primary, #6366f1);
        box-shadow: 0 0 0 3px var(--accent-primary-light, rgba(99,102,241,0.10));
      }
      .search-input {
        padding-left: 38px;
      }
      .search-icon {
        position: absolute;
        left: 12px;
        top: 50%;
        transform: translateY(-50%);
        font-size: 0.9rem;
        pointer-events: none;
        color: var(--text-secondary, #94a3b8);
      }
      .result-count {
        font-size: 0.82rem;
        color: var(--text-secondary, #64748b);
        font-weight: 500;
      }
      .table-container {
        background: var(--bg-card, #fff);
        border-radius: var(--radius-lg, 14px);
        border: 1.5px solid var(--border-light, #e2e8f0);
        overflow-x: auto;
      }
      table {
        width: 100%;
        border-collapse: collapse;
      }
      th {
        text-align: left;
        padding: 10px 12px;
        background: var(--table-stripe, #f8fafc);
        font-size: 0.75rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        color: var(--text-secondary, #64748b);
        border-bottom: 1.5px solid var(--border-light, #e2e8f0);
      }
      td {
        padding: 10px 12px;
        font-size: 0.9rem;
        color: var(--text-primary);
        border-bottom: 1px solid var(--border-light, #e2e8f0);
      }
      tr:hover td {
        background: var(--table-hover, #f1f5f9);
      }
      .actions {
        display: flex;
        gap: 6px;
      }
      .empty {
        text-align: center;
        color: var(--text-secondary, #64748b);
        padding: 48px 20px;
        font-size: 0.95rem;
      }
      .status-badge {
        display: inline-block;
        padding: 4px 11px;
        border-radius: 50px;
        font-size: 0.75rem;
        font-weight: 600;
        letter-spacing: 0.02em;
      }
      .status-badge.active {
        background: var(--accent-success-light, rgba(16,185,129,0.08));
        color: var(--accent-success, #10b981);
      }
      .status-badge.inactive {
        background: var(--accent-danger-light, rgba(239,68,68,0.08));
        color: var(--accent-danger, #ef4444);
      }
      .dialog-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.4);
        backdrop-filter: blur(4px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        animation: fadeIn 0.2s ease;
      }
      .dialog {
        background: var(--bg-card, #fff);
        border-radius: var(--radius-xl, 20px);
        padding: 26px;
        width: 100%;
        max-width: 420px;
        box-shadow: var(--shadow-xl);
        animation: scaleIn 0.25s ease;
      }
      @keyframes scaleIn { from { opacity:0; transform:scale(0.95); } to { opacity:1; transform:scale(1); } }
      .dialog h2 {
        margin-bottom: 20px;
        font-size: 1.15rem;
        font-weight: 700;
        color: var(--text-primary);
      }
      .field {
        margin-bottom: 16px;
      }
      .field label {
        display: block;
        font-size: 0.78rem;
        font-weight: 600;
        color: var(--text-secondary, #64748b);
        margin-bottom: 5px;
        text-transform: uppercase;
        letter-spacing: 0.03em;
      }
      .field input[type='text'],
      .field input[type='number'] {
        width: 100%;
        padding: 10px 12px;
        border: 1.5px solid var(--border-light, #e2e8f0);
        border-radius: var(--radius-md, 10px);
        font-size: 0.92rem;
        background: var(--bg-card, #fff);
        color: var(--text-primary);
        transition: var(--transition-fast);
      }
      .field input:focus {
        outline: none;
        border-color: var(--accent-primary, #6366f1);
        box-shadow: 0 0 0 3px var(--accent-primary-light, rgba(99,102,241,0.10));
      }
      .checkbox-label {
        display: flex !important;
        align-items: center;
        gap: 8px;
        cursor: pointer;
        font-size: 0.9rem;
        text-transform: none;
        letter-spacing: normal;
      }
      .checkbox-label input {
        width: auto !important;
        accent-color: var(--accent-primary, #6366f1);
      }
      .dialog-actions {
        display: flex;
        justify-content: flex-end;
        gap: 10px;
        margin-top: 24px;
      }
      .btn {
        padding: 8px 16px;
        border-radius: var(--radius-md, 10px);
        font-weight: 600;
        font-size: 0.85rem;
        cursor: pointer;
        border: none;
        transition: var(--transition-fast);
        display: inline-flex;
        align-items: center;
        gap: 6px;
        text-decoration: none;
      }
      .btn-primary {
        background: var(--accent-primary, #6366f1);
        color: white;
      }
      .btn-primary:hover {
        background: var(--accent-primary-hover, #4f46e5);
        box-shadow: var(--shadow-sm);
      }
      .btn-primary:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
      .btn-outline {
        background: var(--bg-card, #fff);
        color: var(--text-primary);
        border: 1.5px solid var(--border-light, #e2e8f0);
      }
      .btn-outline:hover {
        border-color: var(--accent-primary, #6366f1);
        color: var(--accent-primary, #6366f1);
        background: var(--accent-primary-light, rgba(99,102,241,0.06));
      }
      .btn-sm {
        padding: 5px 10px;
        font-size: 0.82rem;
        border-radius: var(--radius-sm, 6px);
      }
      .btn-danger {
        background: var(--accent-danger-light, rgba(239,68,68,0.08));
        color: var(--accent-danger, #ef4444);
        border: none;
      }
      .btn-danger:hover {
        background: rgba(239,68,68,0.15);
      }
    `,
  ],
})
export class PartsListComponent implements OnInit {
  parts: AccessoryCatalogList[] = [];
  filteredParts: AccessoryCatalogList[] = [];
  searchText = '';
  filterStatus = '';

  showDialog = false;
  editingPart: AccessoryCatalogList | null = null;
  formData = {
    bezeichnung: '',
    kategorie: '',
    standardpreis: 0,
    aktiv: true,
  };
  saving = false;

  constructor(
    private service: AccessoryCatalogService,
    private excelExportService: ExcelExportService,
  ) {}

  ngOnInit() {
    this.loadParts();
  }

  loadParts() {
    this.service.getAll().subscribe((parts) => {
      this.parts = parts;
      this.filterParts();
    });
  }

  filterParts() {
    let filtered = this.parts;

    if (this.searchText) {
      const term = this.searchText.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.bezeichnung.toLowerCase().includes(term) ||
          (p.kategorie && p.kategorie.toLowerCase().includes(term)),
      );
    }

    if (this.filterStatus === 'active') {
      filtered = filtered.filter((p) => p.aktiv);
    } else if (this.filterStatus === 'inactive') {
      filtered = filtered.filter((p) => !p.aktiv);
    }

    this.filteredParts = filtered;
  }

  openAddDialog() {
    this.editingPart = null;
    this.formData = {
      bezeichnung: '',
      kategorie: '',
      standardpreis: 0,
      aktiv: true,
    };
    this.showDialog = true;
  }

  openEditDialog(part: AccessoryCatalogList) {
    this.editingPart = part;
    this.formData = {
      bezeichnung: part.bezeichnung,
      kategorie: part.kategorie || '',
      standardpreis: part.standardpreis,
      aktiv: part.aktiv,
    };
    this.showDialog = true;
  }

  closeDialog() {
    this.showDialog = false;
    this.editingPart = null;
  }

  savePart() {
    this.saving = true;

    if (this.editingPart) {
      const updateData: AccessoryCatalogUpdate = {
        bezeichnung: this.formData.bezeichnung,
        standardpreis: this.formData.standardpreis,
        kategorie: this.formData.kategorie || undefined,
        aktiv: this.formData.aktiv,
      };
      this.service.update(this.editingPart.id, updateData).subscribe({
        next: () => {
          this.saving = false;
          this.closeDialog();
          this.loadParts();
        },
        error: () => {
          this.saving = false;
          alert('Fehler beim Speichern');
        },
      });
    } else {
      const createData: AccessoryCatalogCreate = {
        bezeichnung: this.formData.bezeichnung,
        standardpreis: this.formData.standardpreis,
        kategorie: this.formData.kategorie || undefined,
      };
      this.service.create(createData).subscribe({
        next: () => {
          this.saving = false;
          this.closeDialog();
          this.loadParts();
        },
        error: () => {
          this.saving = false;
          alert('Fehler beim Speichern');
        },
      });
    }
  }

  exportExcel() {
    this.excelExportService.exportToExcel(this.filteredParts, 'Zubehoer', [
      { key: 'bezeichnung', header: 'Bezeichnung' },
      { key: 'kategorie', header: 'Kategorie' },
      { key: 'standardpreis', header: 'Standardpreis (€)' },
      { key: 'aktiv', header: 'Status' },
    ]);
  }

  deletePart(part: AccessoryCatalogList) {
    if (confirm(`"${part.bezeichnung}" wirklich löschen?`)) {
      this.service.delete(part.id).subscribe({
        next: () => this.loadParts(),
        error: () => alert('Fehler beim Löschen'),
      });
    }
  }
}
