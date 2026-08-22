import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  ServiceleistungService,
  Serviceleistung,
  ServiceleistungCreate,
} from '../../services/serviceleistung.service';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-serviceleistung-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="service-page">
      <div class="page-header">
        <h1>Serviceleistungen</h1>
        <button class="btn-primary" (click)="startNew()">
          + Neuer Servicebeleg
        </button>
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
          placeholder="Suchen (Kunde, Beleg-Nr., Fahrrad, Arbeiten)..."
          [(ngModel)]="searchQuery"
          (input)="onSearch()"
        />
      </div>

      <!-- Form Modal -->
      <div class="modal-overlay" *ngIf="showForm" (click)="showForm = false">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <h2>
            {{ editingItem ? 'Servicebeleg bearbeiten' : 'Neuer Servicebeleg' }}
          </h2>
          <div class="form-grid">
            <div class="form-group">
              <label>{{ t.date }} *</label>
              <input type="date" [(ngModel)]="form.datum" />
            </div>
            <div class="form-group">
              <label>Beleg-Nr.</label>
              <input
                type="text"
                [value]="editingItem ? editingItem.belegNummer : nextBelegNummer"
                disabled
              />
            </div>

            <div class="form-section full-width">Kunde</div>
            <div class="form-group full-width">
              <label>Name *</label>
              <input type="text" [(ngModel)]="form.kundeName" />
            </div>
            <div class="form-group">
              <label>Telefon</label>
              <input type="text" [(ngModel)]="form.kundeTelefon" />
            </div>
            <div class="form-group">
              <label>E-Mail</label>
              <input type="email" [(ngModel)]="form.kundeEmail" />
            </div>
            <div class="form-group full-width">
              <label>Adresse</label>
              <input type="text" [(ngModel)]="form.kundeAdresse" />
            </div>

            <div class="form-section full-width">Fahrrad</div>
            <div class="form-group">
              <label>Marke</label>
              <input type="text" [(ngModel)]="form.fahrradMarke" />
            </div>
            <div class="form-group">
              <label>Modell</label>
              <input type="text" [(ngModel)]="form.fahrradModell" />
            </div>
            <div class="form-group">
              <label>Rahmennummer</label>
              <input type="text" [(ngModel)]="form.rahmennummer" />
            </div>
            <div class="form-group">
              <label>Farbe</label>
              <input type="text" [(ngModel)]="form.farbe" />
            </div>

            <div class="form-section full-width">Serviceleistung</div>
            <div class="form-group full-width">
              <label>Durchgeführte Arbeiten *</label>
              <textarea
                [(ngModel)]="form.durchgefuehrteArbeiten"
                rows="4"
                placeholder="z.B. Bremsen eingestellt, Kette gewechselt, Schaltung justiert..."
              ></textarea>
            </div>
            <div class="form-group full-width">
              <label>Verwendete Teile / Material</label>
              <textarea [(ngModel)]="form.verwendeteTeile" rows="2"></textarea>
            </div>
            <div class="form-group">
              <label>{{ t.price }} (€)</label>
              <input
                type="number"
                [(ngModel)]="form.preis"
                step="0.01"
                min="0"
              />
            </div>
            <div class="form-group">
              <label>{{ t.paymentMethod }}</label>
              <select [(ngModel)]="form.zahlungsart">
                <option [ngValue]="null">{{ t.selectOption }}</option>
                <option value="Bar">Bar</option>
                <option value="Überweisung">Überweisung</option>
                <option value="PayPal">PayPal</option>
                <option value="Karte">Karte</option>
              </select>
            </div>
            <div class="form-group full-width">
              <label>{{ t.notes }}</label>
              <textarea [(ngModel)]="form.notizen" rows="2"></textarea>
            </div>
          </div>
          <div class="form-actions">
            <button class="btn-secondary" (click)="showForm = false">
              {{ t.cancel }}
            </button>
            <button
              class="btn-primary"
              (click)="saveItem()"
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
          <p>
            Servicebeleg {{ deleteTarget.belegNummer }} wirklich löschen?
          </p>
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
              <th>Durchgeführte Arbeiten</th>
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
                {{ shorten(item.durchgefuehrteArbeiten) }}
              </td>
              <td class="amount-cell">
                {{
                  item.preis != null ? (item.preis | currency: 'EUR') : '–'
                }}
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
                <button
                  class="btn-icon edit"
                  (click)="startEdit(item)"
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
        max-width: 640px;
        width: 100%;
        max-height: 90vh;
        overflow-y: auto;
        box-shadow: var(--shadow-lg, 0 20px 50px rgba(0, 0, 0, 0.2));
      }
      .modal-content.small {
        max-width: 400px;
      }
      .modal-content h2 {
        margin: 0 0 16px 0;
        font-size: 1.15rem;
        font-weight: 700;
        color: var(--text-primary);
      }

      .form-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
      }
      .form-section {
        font-size: 0.78rem;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--accent-primary, #6366f1);
        border-bottom: 1.5px solid var(--border-light, #e2e8f0);
        padding-bottom: 4px;
        margin-top: 8px;
      }
      .form-group {
        display: flex;
        flex-direction: column;
        gap: 5px;
      }
      .form-group.full-width {
        grid-column: 1 / -1;
      }
      .form-group label {
        font-size: 0.8rem;
        font-weight: 600;
        color: var(--text-secondary, #64748b);
      }
      .form-group input,
      .form-group select,
      .form-group textarea {
        padding: 9px 12px;
        border: 1.5px solid var(--border-light, #e2e8f0);
        border-radius: var(--radius-md, 10px);
        font-size: 0.88rem;
        background: var(--bg-secondary, #f8fafc);
        color: var(--text-primary);
        font-family: inherit;
        box-sizing: border-box;
        width: 100%;
      }
      .form-group input:disabled {
        opacity: 0.7;
      }
      .form-group input:focus,
      .form-group select:focus,
      .form-group textarea:focus {
        outline: none;
        border-color: var(--accent-primary, #6366f1);
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
        max-width: 260px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
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
      .btn-icon.pdf:hover {
        color: var(--accent-primary, #6366f1);
      }
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

      @media (max-width: 640px) {
        .form-grid {
          grid-template-columns: 1fr;
        }
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
  saving = false;
  showForm = false;
  editingItem: Serviceleistung | null = null;
  deleteTarget: Serviceleistung | null = null;
  searchQuery = '';
  nextBelegNummer = '';

  form: ServiceleistungCreate = this.emptyForm();

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

  startNew() {
    this.editingItem = null;
    this.form = this.emptyForm();
    this.nextBelegNummer = '...';
    this.serviceleistungService.getNextBelegNummer().subscribe({
      next: (r) => (this.nextBelegNummer = r.belegNummer),
      error: () => (this.nextBelegNummer = ''),
    });
    this.showForm = true;
  }

  startEdit(item: Serviceleistung) {
    this.editingItem = item;
    this.form = {
      datum: item.datum.split('T')[0],
      kundeName: item.kundeName,
      kundeTelefon: item.kundeTelefon,
      kundeEmail: item.kundeEmail,
      kundeAdresse: item.kundeAdresse,
      fahrradMarke: item.fahrradMarke,
      fahrradModell: item.fahrradModell,
      rahmennummer: item.rahmennummer,
      farbe: item.farbe,
      durchgefuehrteArbeiten: item.durchgefuehrteArbeiten,
      verwendeteTeile: item.verwendeteTeile,
      preis: item.preis,
      zahlungsart: item.zahlungsart,
      notizen: item.notizen,
    };
    this.showForm = true;
  }

  saveItem() {
    if (!this.form.kundeName || !this.form.durchgefuehrteArbeiten) return;
    this.saving = true;

    const payload: ServiceleistungCreate = {
      ...this.form,
      datum: new Date(this.form.datum).toISOString(),
    };

    const request$ = this.editingItem
      ? this.serviceleistungService.update(this.editingItem.id, payload)
      : this.serviceleistungService.create(payload);

    request$.subscribe({
      next: () => {
        this.showForm = false;
        this.saving = false;
        this.loadItems();
      },
      error: () => {
        this.saving = false;
      },
    });
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

  shorten(text: string): string {
    return text.length > 60 ? text.substring(0, 57) + '...' : text;
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  private emptyForm(): ServiceleistungCreate {
    return {
      datum: new Date().toISOString().split('T')[0],
      kundeName: '',
      kundeTelefon: null,
      kundeEmail: null,
      kundeAdresse: null,
      fahrradMarke: null,
      fahrradModell: null,
      rahmennummer: null,
      farbe: null,
      durchgefuehrteArbeiten: '',
      verwendeteTeile: null,
      preis: null,
      zahlungsart: null,
      notizen: null,
    };
  }
}
