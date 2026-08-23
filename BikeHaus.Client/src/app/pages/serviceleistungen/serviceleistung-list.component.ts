import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  ServiceleistungService,
  Serviceleistung,
} from '../../services/serviceleistung.service';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-serviceleistung-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="service-page">
      <div class="page-header">
        <h1>Serviceleistungen</h1>
        <a routerLink="/serviceleistungen/new" class="btn-primary">
          + Neuer Servicebeleg
        </a>
      </div>

      <p class="page-hint">
        Dokumentiert durchgeführte Serviceleistungen (Service/Wartung) am
        Kundenrad. Es wird <strong>keine Rechnung</strong> erstellt — nur ein
        Servicebeleg als Nachweis.
      </p>

      <!-- Search -->
      <div class="search-bar">
        <input
          type="text"
          placeholder="Suchen (Kunde, Beleg-Nr., Fahrrad, Leistung)..."
          [(ngModel)]="searchQuery"
          (input)="onSearch()"
        />
      </div>

      <!-- Delete Confirm Modal -->
      <div
        class="modal-overlay"
        *ngIf="deleteTarget"
        (click)="deleteTarget = null"
      >
        <div class="modal-content small" (click)="$event.stopPropagation()">
          <h2>{{ t.confirm }}</h2>
          <p>Servicebeleg {{ deleteTarget.belegNummer }} wirklich löschen?</p>
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

      <!-- List -->
      <div class="table-wrapper" *ngIf="filteredItems.length > 0">
        <table>
          <thead>
            <tr>
              <th>{{ t.date }}</th>
              <th>Beleg-Nr.</th>
              <th>Kunde</th>
              <th>Fahrrad</th>
              <th>Leistungen</th>
              <th>{{ t.price }}</th>
              <th>{{ t.actions }}</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let item of filteredItems">
              <td>{{ formatDate(item.datum) }}</td>
              <td class="beleg-cell">{{ item.belegNummer }}</td>
              <td class="name-cell">{{ item.kundeName }}</td>
              <td>
                {{ item.fahrradMarke || '–' }}
                {{ item.fahrradModell || '' }}
              </td>
              <td class="work-cell" [title]="item.durchgefuehrteArbeiten">
                <span class="badge">{{
                  leistungCount(item.durchgefuehrteArbeiten)
                }}</span>
                {{ firstLeistung(item.durchgefuehrteArbeiten) }}
              </td>
              <td class="amount-cell">
                {{ item.preis != null ? (item.preis | currency: 'EUR') : '–' }}
              </td>
              <td class="actions-cell">
                <button
                  class="btn-icon pdf"
                  (click)="downloadBeleg(item)"
                  title="Servicebeleg (PDF)"
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
                      d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
                    />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="12" y1="18" x2="12" y2="12" />
                    <polyline points="9 15 12 18 15 15" />
                  </svg>
                </button>
                <a
                  class="btn-icon edit"
                  [routerLink]="['/serviceleistungen/edit', item.id]"
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
                </a>
                <button
                  class="btn-icon delete"
                  (click)="deleteTarget = item"
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
      <div class="no-data" *ngIf="!loading && filteredItems.length === 0">
        <p>Keine Serviceleistungen vorhanden.</p>
      </div>

      <!-- Loading -->
      <div class="loading" *ngIf="loading">
        <p>{{ t.loading }}</p>
      </div>
    </div>
  `,
  styles: [
    `
      .service-page {
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
        margin-bottom: 8px;
      }
      .page-header h1 {
        font-size: 1.5rem;
        font-weight: 800;
        color: var(--text-primary);
        margin: 0;
      }
      .page-hint {
        font-size: 0.85rem;
        color: var(--text-secondary, #64748b);
        margin: 0 0 16px 0;
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
        text-decoration: none;
        display: inline-block;
      }
      .btn-primary:hover {
        background: var(--accent-primary-hover, #4f46e5);
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
        padding: 16px;
      }
      .modal-content {
        background: var(--bg-card, #fff);
        border-radius: var(--radius-lg, 14px);
        padding: 24px;
        max-width: 400px;
        width: 100%;
        box-shadow: var(--shadow-lg, 0 20px 50px rgba(0, 0, 0, 0.2));
      }
      .modal-content h2 {
        margin: 0 0 16px 0;
        font-size: 1.15rem;
        font-weight: 700;
        color: var(--text-primary);
      }
      .form-actions {
        display: flex;
        justify-content: flex-end;
        gap: 10px;
        margin-top: 20px;
      }

      /* Table */
      .table-wrapper {
        background: var(--bg-card, #fff);
        border-radius: var(--radius-lg, 14px);
        border: 1.5px solid var(--border-light, #e2e8f0);
        overflow-x: auto;
        box-shadow: var(--shadow-sm);
      }
      table {
        width: 100%;
        border-collapse: collapse;
        min-width: 800px;
      }
      th {
        text-align: left;
        padding: 12px 14px;
        font-size: 0.75rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        color: var(--text-secondary, #64748b);
        border-bottom: 1.5px solid var(--border-light, #e2e8f0);
        white-space: nowrap;
      }
      td {
        padding: 12px 14px;
        font-size: 0.87rem;
        color: var(--text-primary);
        border-bottom: 1px solid var(--border-light, #f1f5f9);
        vertical-align: middle;
      }
      tr:last-child td {
        border-bottom: none;
      }
      .beleg-cell {
        font-weight: 700;
        white-space: nowrap;
      }
      .name-cell {
        font-weight: 600;
      }
      .work-cell {
        max-width: 280px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .badge {
        display: inline-block;
        padding: 2px 8px;
        border-radius: 10px;
        background: var(--accent-primary-light, rgba(99, 102, 241, 0.08));
        color: var(--accent-primary, #6366f1);
        font-size: 0.75rem;
        font-weight: 700;
        margin-right: 6px;
      }
      .amount-cell {
        font-weight: 700;
        white-space: nowrap;
      }
      .actions-cell {
        white-space: nowrap;
      }

      .btn-icon {
        background: none;
        border: none;
        cursor: pointer;
        padding: 6px;
        border-radius: 8px;
        color: var(--text-secondary, #64748b);
        display: inline-flex;
        align-items: center;
        transition: var(--transition-fast);
      }
      .btn-icon:hover {
        background: var(--bg-secondary, #f1f5f9);
      }
      .btn-icon.pdf:hover,
      .btn-icon.edit:hover {
        color: var(--accent-primary, #6366f1);
      }
      .btn-icon.delete:hover {
        color: var(--accent-danger, #ef4444);
      }

      .no-data,
      .loading {
        text-align: center;
        padding: 48px 16px;
        color: var(--text-secondary, #64748b);
      }
    `,
  ],
})
export class ServiceleistungListComponent implements OnInit {
  private serviceleistungService = inject(ServiceleistungService);
  private translationService = inject(TranslationService);

  get t() {
    return this.translationService.translations();
  }

  items: Serviceleistung[] = [];
  filteredItems: Serviceleistung[] = [];
  loading = false;
  deleteTarget: Serviceleistung | null = null;
  searchQuery = '';

  ngOnInit() {
    this.loadItems();
  }

  loadItems() {
    this.loading = true;
    this.serviceleistungService.getAll().subscribe({
      next: (items) => {
        this.items = items;
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

  private applyFilter() {
    const q = this.searchQuery.trim().toLowerCase();
    if (!q) {
      this.filteredItems = this.items;
      return;
    }
    this.filteredItems = this.items.filter((i) =>
      [
        i.belegNummer,
        i.kundeName,
        i.kundeTelefon,
        i.fahrradMarke,
        i.fahrradModell,
        i.rahmennummer,
        i.durchgefuehrteArbeiten,
      ]
        .filter(Boolean)
        .some((v) => (v as string).toLowerCase().includes(q)),
    );
  }

  confirmDelete() {
    if (!this.deleteTarget) return;
    this.serviceleistungService.delete(this.deleteTarget.id).subscribe({
      next: () => {
        this.deleteTarget = null;
        this.loadItems();
      },
    });
  }

  downloadBeleg(item: Serviceleistung) {
    this.serviceleistungService.downloadServicebeleg(item.id).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Servicebeleg_${item.belegNummer}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      },
    });
  }

  leistungCount(text: string): number {
    return text.split('\n').filter((l) => l.trim().length > 0).length;
  }

  firstLeistung(text: string): string {
    const first =
      text.split('\n').find((l) => l.trim().length > 0)?.trim() ?? '';
    const count = this.leistungCount(text);
    const suffix = count > 1 ? ' …' : '';
    return first.length > 45 ? first.substring(0, 42) + '...' : first + suffix;
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
