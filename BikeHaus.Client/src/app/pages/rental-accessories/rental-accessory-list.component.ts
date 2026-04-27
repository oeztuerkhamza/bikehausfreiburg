import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RentalAccessoryService } from '../../services/rental-accessory.service';
import { NotificationService } from '../../services/notification.service';
import { DialogService } from '../../services/dialog.service';
import { TranslationService } from '../../services/translation.service';
import {
  RentalAccessoryCreate,
  RentalAccessoryList,
  RentalAccessoryUpdate,
} from '../../models/models';

@Component({
  selector: 'app-rental-accessory-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>{{ t.rentalAccessories }}</h1>
        <div class="header-actions">
          <button class="btn btn-primary" (click)="openAddDialog()">
            + {{ t.add }}
          </button>
        </div>
      </div>

      <div class="filter-bar">
        <div class="filter-group search-group">
          <input
            type="text"
            [(ngModel)]="searchText"
            (input)="filterItems()"
            [placeholder]="t.search"
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
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>
        </div>
        <div class="filter-group">
          <select
            [(ngModel)]="filterStatus"
            (change)="filterItems()"
            class="filter-input"
          >
            <option value="">{{ t.all }}</option>
            <option value="active">{{ t.active }}</option>
            <option value="inactive">{{ t.inactive }}</option>
          </select>
        </div>
      </div>

      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>{{ t.designation }}</th>
              <th>{{ t.rentalAccessoryDayPrice }}</th>
              <th>Verlustgebühr</th>
              <th>{{ t.status }}</th>
              <th>{{ t.actions }}</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngIf="filteredItems.length === 0">
              <td colspan="5" class="empty">{{ t.rentalAccessoryNoItems }}</td>
            </tr>
            <tr *ngFor="let item of filteredItems">
              <td>{{ item.bezeichnung }}</td>
              <td>{{ item.tagespreis | number: '1.2-2' }} €</td>
              <td>
                <span
                  *ngIf="item.verlustgebuehr"
                  style="color:#ef4444;font-weight:600;"
                >
                  {{ item.verlustgebuehr | number: '1.2-2' }} €
                </span>
                <span
                  *ngIf="!item.verlustgebuehr"
                  style="color:var(--text-muted)"
                  >–</span
                >
              </td>
              <td>
                <span
                  class="status-badge"
                  [class.active]="item.aktiv"
                  [class.inactive]="!item.aktiv"
                >
                  {{ item.aktiv ? t.active : t.inactive }}
                </span>
              </td>
              <td class="actions">
                <button
                  class="btn btn-sm btn-outline"
                  (click)="openEditDialog(item)"
                >
                  {{ t.edit }}
                </button>
                <button
                  class="btn btn-sm btn-danger"
                  (click)="deleteItem(item)"
                >
                  {{ t.delete }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="dialog-overlay" *ngIf="showDialog">
        <div class="dialog">
          <h2>
            {{ editingItem ? t.rentalAccessoryEdit : t.rentalAccessoryNew }}
          </h2>
          <div class="field">
            <label>{{ t.designation }}</label>
            <input [(ngModel)]="formData.bezeichnung" />
          </div>
          <div class="field">
            <label>{{ t.rentalAccessoryDayPrice }}</label>
            <input
              type="number"
              step="0.01"
              min="0"
              [(ngModel)]="formData.tagespreis"
            />
          </div>
          <div class="field">
            <label>Verlustgebühr (€)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              [(ngModel)]="formData.verlustgebuehr"
              placeholder="z. B. 25.00"
            />
          </div>
          <div class="field">
            <label>{{ t.rentalAccessoryDescription }}</label>
            <textarea rows="3" [(ngModel)]="formData.beschreibung"></textarea>
          </div>
          <div class="field">
            <label class="checkbox-label">
              <input type="checkbox" [(ngModel)]="formData.aktiv" />
              {{ t.rentalAccessoryActive }}
            </label>
          </div>
          <div class="dialog-actions">
            <button class="btn btn-outline" (click)="closeDialog()">
              {{ t.cancel }}
            </button>
            <button
              class="btn btn-primary"
              (click)="saveItem()"
              [disabled]="saving || !formData.bezeichnung"
            >
              {{ saving ? t.saving : t.save }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .page {
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
        flex-wrap: wrap;
        gap: 10px;
      }
      .header-actions {
        display: flex;
        gap: 10px;
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
        max-width: 350px;
      }
      .filter-input {
        padding: 10px 14px;
        border: 1.5px solid var(--border-light, #e2e8f0);
        border-radius: var(--radius-md, 10px);
        background: var(--bg-card, #fff);
        color: var(--text-primary);
        font-size: 0.88rem;
        transition: all 0.2s;
        width: 100%;
      }
      .filter-input:focus {
        outline: none;
        border-color: var(--accent-primary, #6366f1);
        box-shadow: 0 0 0 3px
          var(--accent-primary-light, rgba(99, 102, 241, 0.1));
      }
      .search-input {
        padding-left: 40px;
      }
      .search-icon {
        position: absolute;
        left: 13px;
        top: 50%;
        transform: translateY(-50%);
        color: var(--text-secondary, #94a3b8);
        pointer-events: none;
        display: flex;
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
        background: var(--accent-success-light, rgba(16, 185, 129, 0.08));
        color: var(--accent-success, #10b981);
      }
      .status-badge.inactive {
        background: var(--accent-danger-light, rgba(239, 68, 68, 0.08));
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
      @keyframes scaleIn {
        from {
          opacity: 0;
          transform: scale(0.95);
        }
        to {
          opacity: 1;
          transform: scale(1);
        }
      }
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
      .field input[type='number'],
      .field textarea {
        width: 100%;
        padding: 10px 12px;
        border: 1.5px solid var(--border-light, #e2e8f0);
        border-radius: var(--radius-md, 10px);
        font-size: 0.92rem;
        background: var(--bg-card, #fff);
        color: var(--text-primary);
        transition: var(--transition-fast);
      }
      .field textarea {
        resize: vertical;
      }
      .field input:focus,
      .field textarea:focus {
        outline: none;
        border-color: var(--accent-primary, #6366f1);
        box-shadow: 0 0 0 3px
          var(--accent-primary-light, rgba(99, 102, 241, 0.1));
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
        background: var(--accent-primary-light, rgba(99, 102, 241, 0.06));
      }
      .btn-sm {
        padding: 5px 10px;
        font-size: 0.82rem;
        border-radius: var(--radius-sm, 6px);
      }
      .btn-danger {
        background: var(--accent-danger-light, rgba(239, 68, 68, 0.08));
        color: var(--accent-danger, #ef4444);
        border: none;
      }
      .btn-danger:hover {
        background: rgba(239, 68, 68, 0.15);
      }
    `,
  ],
})
export class RentalAccessoryListComponent implements OnInit {
  private service = inject(RentalAccessoryService);
  private notificationService = inject(NotificationService);
  private dialogService = inject(DialogService);
  private translationService = inject(TranslationService);

  items: RentalAccessoryList[] = [];
  filteredItems: RentalAccessoryList[] = [];
  searchText = '';
  filterStatus = '';

  showDialog = false;
  editingItem: RentalAccessoryList | null = null;
  formData = {
    bezeichnung: '',
    tagespreis: 0,
    verlustgebuehr: undefined as number | undefined,
    beschreibung: '',
    aktiv: true,
  };
  saving = false;

  get t() {
    return this.translationService.translations();
  }

  ngOnInit() {
    this.loadItems();
  }

  loadItems() {
    this.service.getAll().subscribe((items) => {
      this.items = [...items].sort(
        (left, right) =>
          new Date(right.createdAt).getTime() -
          new Date(left.createdAt).getTime(),
      );
      this.filterItems();
    });
  }

  filterItems() {
    let filtered = this.items;
    if (this.searchText) {
      const term = this.searchText.toLowerCase();
      filtered = filtered.filter((item) =>
        item.bezeichnung.toLowerCase().includes(term),
      );
    }

    if (this.filterStatus === 'active') {
      filtered = filtered.filter((item) => item.aktiv);
    } else if (this.filterStatus === 'inactive') {
      filtered = filtered.filter((item) => !item.aktiv);
    }

    this.filteredItems = filtered;
  }

  openAddDialog() {
    this.editingItem = null;
    this.formData = {
      bezeichnung: '',
      tagespreis: 0,
      verlustgebuehr: undefined,
      beschreibung: '',
      aktiv: true,
    };
    this.showDialog = true;
  }

  openEditDialog(item: RentalAccessoryList) {
    this.editingItem = item;
    this.service.getById(item.id).subscribe({
      next: (full) => {
        this.formData = {
          bezeichnung: full.bezeichnung,
          tagespreis: full.tagespreis,
          verlustgebuehr: full.verlustgebuehr,
          beschreibung: full.beschreibung || '',
          aktiv: full.aktiv,
        };
        this.showDialog = true;
      },
      error: () => {
        this.notificationService.error(this.t.saveError);
      },
    });
  }

  closeDialog() {
    this.showDialog = false;
    this.editingItem = null;
  }

  saveItem() {
    this.saving = true;

    if (this.editingItem) {
      const update: RentalAccessoryUpdate = {
        bezeichnung: this.formData.bezeichnung,
        tagespreis: this.formData.tagespreis,
        verlustgebuehr: this.formData.verlustgebuehr || undefined,
        beschreibung: this.formData.beschreibung || undefined,
        aktiv: this.formData.aktiv,
      };
      this.service.update(this.editingItem.id, update).subscribe({
        next: () => {
          this.saving = false;
          this.notificationService.success(this.t.saveSuccess);
          this.closeDialog();
          this.loadItems();
        },
        error: () => {
          this.saving = false;
          this.notificationService.error(this.t.saveError);
        },
      });
    } else {
      const create: RentalAccessoryCreate = {
        bezeichnung: this.formData.bezeichnung,
        tagespreis: this.formData.tagespreis,
        verlustgebuehr: this.formData.verlustgebuehr || undefined,
        beschreibung: this.formData.beschreibung || undefined,
      };
      this.service.create(create).subscribe({
        next: () => {
          this.saving = false;
          this.notificationService.success(this.t.saveSuccess);
          this.closeDialog();
          this.loadItems();
        },
        error: () => {
          this.saving = false;
          this.notificationService.error(this.t.saveError);
        },
      });
    }
  }

  deleteItem(item: RentalAccessoryList) {
    this.dialogService
      .danger(this.t.delete, this.t.confirmDelete)
      .then((confirmed) => {
        if (confirmed) {
          this.service.delete(item.id).subscribe({
            next: () => {
              this.notificationService.success(this.t.deleteSuccess);
              this.loadItems();
            },
            error: () => {
              this.notificationService.error(this.t.deleteError);
            },
          });
        }
      });
  }
}
