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
        min-width: 200px;
      }
      .filter-input {
        padding: 9px 12px;
        border: 1px solid var(--border-color);
        border-radius: 8px;
        font-size: 0.9rem;
        background: var(--bg-card);
        color: var(--text-primary);
        width: 100%;
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
      .actions {
        display: flex;
        gap: 6px;
      }
      .empty {
        text-align: center;
        color: var(--text-muted);
        padding: 40px;
      }
      .status-badge {
        display: inline-block;
        padding: 3px 10px;
        border-radius: 12px;
        font-size: 0.78rem;
        font-weight: 500;
      }
      .status-badge.active {
        background: #e8f5e9;
        color: #2e7d32;
      }
      .status-badge.inactive {
        background: #fce4ec;
        color: #c62828;
      }
      .dialog-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
      }
      .dialog {
        background: var(--bg-card, #fff);
        border-radius: 12px;
        padding: 24px;
        width: 100%;
        max-width: 400px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
      }
      .dialog h2 {
        margin-bottom: 20px;
        font-size: 1.2rem;
      }
      .field {
        margin-bottom: 16px;
      }
      .field label {
        display: block;
        font-size: 0.85rem;
        color: var(--text-secondary, #666);
        margin-bottom: 4px;
      }
      .field input[type='text'],
      .field input[type='number'] {
        width: 100%;
        padding: 10px 12px;
        border: 1px solid var(--border-color, #ddd);
        border-radius: 6px;
        font-size: 0.95rem;
      }
      .checkbox-label {
        display: flex !important;
        align-items: center;
        gap: 8px;
        cursor: pointer;
      }
      .checkbox-label input {
        width: auto !important;
      }
      .dialog-actions {
        display: flex;
        justify-content: flex-end;
        gap: 12px;
        margin-top: 24px;
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
