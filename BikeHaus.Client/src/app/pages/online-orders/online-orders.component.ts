import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  OnlineSale,
  OnlineSaleService,
} from '../../services/online-sale.service';
import { NotificationService } from '../../services/notification.service';
import { PaginationComponent } from '../../components/pagination/pagination.component';

@Component({
  selector: 'app-online-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>Online-Bestellungen</h1>
        <span class="badge-new" *ngIf="pendingCount() > 0">
          {{ pendingCount() }} neu
        </span>
      </div>

      <div class="filter-bar">
        <select
          [(ngModel)]="filterVerarbeitet"
          (change)="load(1)"
          class="filter-input"
        >
          <option value="">Alle</option>
          <option value="false">Neu / Offen</option>
          <option value="true">Verarbeitet</option>
        </select>
      </div>

      <div class="table-wrap" *ngIf="!loading(); else loadingTpl">
        <table *ngIf="items().length > 0; else emptyTpl">
          <thead>
            <tr>
              <th>Datum</th>
              <th>Fahrrad</th>
              <th>Preis</th>
              <th>Kunde</th>
              <th>E-Mail</th>
              <th>Adresse</th>
              <th>Abholtag</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr
              *ngFor="let s of items()"
              [class.row-done]="s.isVerarbeitet"
              class="clickable-row"
              (click)="openEdit(s)"
            >
              <td class="td-date">
                {{ s.createdAt | date: 'dd.MM.yyyy HH:mm' }}
              </td>
              <td class="td-bike">
                <strong>{{ s.bikeTitle }}</strong>
                <div *ngIf="s.bikeUrl">
                  <a
                    [href]="s.bikeUrl"
                    target="_blank"
                    rel="noopener noreferrer"
                    (click)="$event.stopPropagation()"
                  >
                    Fahrrad-Link
                  </a>
                </div>
              </td>
              <td class="td-price">
                {{ s.preis | currency: 'EUR' : 'symbol' : '1.2-2' : 'de' }}
              </td>
              <td>{{ s.vorname }} {{ s.nachname }}</td>
              <td>
                <a
                  [href]="'mailto:' + s.email"
                  (click)="$event.stopPropagation()"
                  >{{ s.email }}</a
                >
              </td>
              <td class="td-adresse">{{ s.adresse }}</td>
              <td>{{ s.abholtag | date: 'dd.MM.yyyy' : '' : 'de' }}</td>
              <td>
                <span
                  class="status-badge"
                  [class.done]="s.isVerarbeitet && !isRefunded(s)"
                  [class.refunded]="isRefunded(s)"
                >
                  {{
                    isRefunded(s)
                      ? 'Iade'
                      : s.isVerarbeitet
                        ? 'Erledigt'
                        : 'Offen'
                  }}
                </span>
              </td>
              <td class="td-actions" (click)="$event.stopPropagation()">
                <button
                  class="btn-icon"
                  title="Bearbeiten"
                  (click)="openEdit(s)"
                >
                  ✎
                </button>
                <button
                  class="btn-icon btn-pdf"
                  title="PDF herunterladen"
                  (click)="downloadPdf(s)"
                >
                  ⬇ PDF
                </button>
                <button
                  *ngIf="s.molliePaymentId"
                  class="btn-icon btn-refund"
                  title="Rückerstattung"
                  (click)="refundSale(s)"
                >
                  ↺
                </button>
                <button
                  *ngIf="!s.isVerarbeitet"
                  class="btn-mark"
                  (click)="markProcessed(s)"
                  title="Als erledigt markieren"
                >
                  ✓
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <ng-template #emptyTpl>
          <div class="empty-state">
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
            >
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path
                d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"
              />
            </svg>
            <p>Keine Online-Bestellungen gefunden.</p>
          </div>
        </ng-template>
      </div>

      <ng-template #loadingTpl>
        <div class="loading-state">Wird geladen...</div>
      </ng-template>

      <app-pagination
        *ngIf="total() > pageSize"
        [currentPage]="page()"
        [totalCount]="total()"
        [totalPages]="totalPages()"
        [pageSize]="pageSize"
        [hasPrevious]="page() > 1"
        [hasNext]="page() < totalPages()"
        (pageChange)="load($event)"
      />
    </div>

    <!-- Edit Modal -->
    <div class="modal-backdrop" *ngIf="editTarget()" (click)="closeEdit()">
      <div
        class="modal"
        (click)="$event.stopPropagation()"
        *ngIf="editTarget() as s"
      >
        <div class="modal-header">
          <h2>Bestellung #{{ s.id }} bearbeiten</h2>
          <button class="btn-close" (click)="closeEdit()">✕</button>
        </div>

        <!-- Read-only summary -->
        <div class="modal-section modal-summary">
          <div class="summary-row">
            <span class="lbl">Fahrrad:</span>
            <strong>{{ s.bikeTitle }}</strong>
          </div>
          <div class="summary-row">
            <span class="lbl">Preis:</span>
            <strong>{{
              s.preis | currency: 'EUR' : 'symbol' : '1.2-2' : 'de'
            }}</strong>
          </div>
          <div class="summary-row">
            <span class="lbl">Datum:</span>
            <span>{{ s.createdAt | date: 'dd.MM.yyyy HH:mm' }}</span>
          </div>
          <div class="summary-row">
            <span class="lbl">Mollie-ID:</span>
            <span class="mono">{{ s.molliePaymentId }}</span>
          </div>
          <div class="summary-row" *ngIf="s.bikeUrl">
            <span class="lbl">Fahrrad-Link:</span>
            <a [href]="s.bikeUrl" target="_blank" rel="noopener noreferrer"
              >Anzeigen</a
            >
          </div>
        </div>

        <!-- Editable fields -->
        <div class="modal-section">
          <h3>Kundendaten</h3>
          <div class="form-grid">
            <div class="field">
              <label>Vorname</label>
              <input [(ngModel)]="editVorname" name="vorname" />
            </div>
            <div class="field">
              <label>Nachname</label>
              <input [(ngModel)]="editNachname" name="nachname" />
            </div>
            <div class="field field-full">
              <label>E-Mail</label>
              <input type="email" [(ngModel)]="editEmail" name="email" />
            </div>
            <div class="field field-full">
              <label>Adresse</label>
              <input [(ngModel)]="editAdresse" name="adresse" />
            </div>
            <div class="field">
              <label>Abholtag</label>
              <input type="date" [(ngModel)]="editAbholtag" name="abholtag" />
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <div class="footer-left">
            <button class="btn btn-pdf" (click)="downloadPdf(s)">
              ⬇ PDF herunterladen
            </button>
            <button class="btn btn-print" (click)="printPdf(s)">
              🖨 Drucken
            </button>
            <button
              *ngIf="s.molliePaymentId"
              class="btn btn-refund"
              (click)="refundSale(s)"
              [disabled]="refundingId() === s.id"
            >
              {{ refundingId() === s.id ? 'Erstatte...' : '↺ Erstatten' }}
            </button>
            <button
              *ngIf="!s.isVerarbeitet"
              class="btn btn-done"
              (click)="markProcessed(s); closeEdit()"
            >
              ✓ Als erledigt markieren
            </button>
          </div>
          <div class="footer-right">
            <button class="btn btn-outline" (click)="closeEdit()">
              Abbrechen
            </button>
            <button
              class="btn btn-primary"
              (click)="saveEdit(s)"
              [disabled]="saving()"
            >
              {{ saving() ? 'Speichern...' : 'Speichern' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .page-header {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        margin-bottom: 1.25rem;
      }

      h1 {
        margin: 0;
      }

      .badge-new {
        background: var(--color-warning, #f59e0b);
        color: #fff;
        font-size: 0.75rem;
        font-weight: 700;
        padding: 0.25rem 0.65rem;
        border-radius: 999px;
      }

      .filter-bar {
        margin-bottom: 1rem;
      }

      .filter-input {
        padding: 0.5rem 0.75rem;
        border: 1px solid var(--color-border);
        border-radius: 8px;
        background: var(--color-surface);
        color: var(--color-text);
        font-size: 0.88rem;
        cursor: pointer;
      }

      .table-wrap {
        overflow-x: auto;
      }

      table {
        width: 100%;
        border-collapse: collapse;
        font-size: 0.88rem;
      }

      th {
        text-align: left;
        padding: 0.6rem 0.85rem;
        font-size: 0.72rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.07em;
        color: var(--color-text-muted);
        border-bottom: 1px solid var(--color-border);
        white-space: nowrap;
      }

      td {
        padding: 0.75rem 0.85rem;
        border-bottom: 1px solid var(--color-border);
        vertical-align: middle;
        color: var(--color-text);
      }

      tr:last-child td {
        border-bottom: none;
      }

      .clickable-row {
        cursor: pointer;
        transition: background 0.15s;
      }
      .clickable-row:hover td {
        background: rgba(255, 255, 255, 0.03);
      }
      tr.row-done td {
        opacity: 0.55;
      }

      .td-date {
        white-space: nowrap;
        color: var(--color-text-muted);
        font-size: 0.82rem;
      }
      .td-bike {
        min-width: 160px;
      }
      .td-price {
        white-space: nowrap;
        font-weight: 600;
        color: var(--color-accent);
      }
      .td-adresse {
        font-size: 0.82rem;
        max-width: 180px;
      }
      .td-actions {
        white-space: nowrap;
      }

      a {
        color: var(--color-accent);
        text-decoration: none;
      }
      a:hover {
        text-decoration: underline;
      }

      .status-badge {
        display: inline-block;
        padding: 0.2rem 0.6rem;
        border-radius: 999px;
        font-size: 0.72rem;
        font-weight: 700;
        background: rgba(245, 158, 11, 0.15);
        color: #f59e0b;
        white-space: nowrap;
      }
      .status-badge.done {
        background: rgba(34, 197, 94, 0.12);
        color: #22c55e;
      }
      .status-badge.refunded {
        background: rgba(59, 130, 246, 0.14);
        color: #60a5fa;
      }

      .btn-mark {
        padding: 0.3rem 0.65rem;
        border-radius: 6px;
        border: 1px solid rgba(34, 197, 94, 0.3);
        background: rgba(34, 197, 94, 0.08);
        color: #22c55e;
        font-size: 0.78rem;
        font-weight: 600;
        cursor: pointer;
        transition: background 0.2s;
      }
      .btn-mark:hover {
        background: rgba(34, 197, 94, 0.18);
      }

      .btn-icon {
        padding: 0.3rem 0.55rem;
        border-radius: 6px;
        border: 1px solid var(--color-border);
        background: transparent;
        color: var(--color-text-muted);
        font-size: 0.8rem;
        cursor: pointer;
        margin-right: 4px;
        transition: all 0.15s;
      }
      .btn-icon:hover {
        background: var(--color-surface);
        color: var(--color-text);
      }
      .btn-icon.btn-pdf {
        color: var(--color-accent);
        border-color: rgba(var(--color-accent-rgb, 99, 179, 237), 0.3);
      }
      .btn-icon.btn-refund {
        color: #f59e0b;
        border-color: rgba(245, 158, 11, 0.3);
      }

      .empty-state {
        text-align: center;
        padding: 4rem 1rem;
        color: var(--color-text-muted);
      }
      .empty-state svg {
        margin-bottom: 1rem;
        opacity: 0.4;
      }
      .loading-state {
        text-align: center;
        padding: 3rem;
        color: var(--color-text-muted);
        font-size: 0.9rem;
      }

      /* Modal */
      .modal-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.6);
        z-index: 1000;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 1rem;
      }

      .modal {
        background: var(--color-surface, #1e2230);
        border: 1px solid var(--color-border);
        border-radius: 12px;
        width: 100%;
        max-width: 640px;
        max-height: 90vh;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
      }

      .modal-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 1rem 1.25rem;
        border-bottom: 1px solid var(--color-border);
      }
      .modal-header h2 {
        margin: 0;
        font-size: 1rem;
      }

      .btn-close {
        background: none;
        border: none;
        color: var(--color-text-muted);
        font-size: 1.1rem;
        cursor: pointer;
        padding: 0.25rem 0.5rem;
        border-radius: 6px;
        transition: background 0.15s;
      }
      .btn-close:hover {
        background: rgba(255, 255, 255, 0.08);
      }

      .modal-section {
        padding: 1rem 1.25rem;
        border-bottom: 1px solid var(--color-border);
      }
      .modal-section h3 {
        margin: 0 0 0.75rem;
        font-size: 0.88rem;
        color: var(--color-text-muted);
        text-transform: uppercase;
        letter-spacing: 0.06em;
      }

      .modal-summary {
        background: rgba(255, 255, 255, 0.02);
      }
      .summary-row {
        display: flex;
        gap: 0.5rem;
        align-items: baseline;
        margin-bottom: 0.35rem;
        font-size: 0.88rem;
      }
      .lbl {
        color: var(--color-text-muted);
        min-width: 90px;
        font-size: 0.8rem;
      }
      .mono {
        font-family: monospace;
        font-size: 0.8rem;
      }

      .form-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 0.75rem;
      }
      .field {
        display: flex;
        flex-direction: column;
        gap: 0.3rem;
      }
      .field-full {
        grid-column: span 2;
      }
      .field label {
        font-size: 0.78rem;
        color: var(--color-text-muted);
      }
      .field input {
        padding: 0.5rem 0.65rem;
        border: 1px solid var(--color-border);
        border-radius: 8px;
        background: var(--color-bg, #13161f);
        color: var(--color-text);
        font-size: 0.88rem;
        outline: none;
        transition: border-color 0.15s;
      }
      .field input:focus {
        border-color: var(--color-accent);
      }

      .modal-footer {
        padding: 1rem 1.25rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 0.5rem;
        flex-wrap: wrap;
      }
      .footer-left,
      .footer-right {
        display: flex;
        gap: 0.5rem;
        flex-wrap: wrap;
      }

      .btn {
        padding: 0.45rem 1rem;
        border-radius: 8px;
        border: none;
        font-size: 0.85rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.15s;
      }
      .btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      .btn-primary {
        background: var(--color-accent, #3b82f6);
        color: #fff;
      }
      .btn-primary:hover:not(:disabled) {
        filter: brightness(1.1);
      }
      .btn-outline {
        background: transparent;
        border: 1px solid var(--color-border);
        color: var(--color-text);
      }
      .btn-outline:hover {
        background: rgba(255, 255, 255, 0.05);
      }
      .btn-pdf {
        background: rgba(99, 179, 237, 0.1);
        color: #63b3ed;
        border: 1px solid rgba(99, 179, 237, 0.25);
      }
      .btn-pdf:hover {
        background: rgba(99, 179, 237, 0.2);
      }
      .btn-print {
        background: rgba(167, 139, 250, 0.1);
        color: #a78bfa;
        border: 1px solid rgba(167, 139, 250, 0.25);
      }
      .btn-print:hover {
        background: rgba(167, 139, 250, 0.2);
      }
      .btn-done {
        background: rgba(34, 197, 94, 0.1);
        color: #22c55e;
        border: 1px solid rgba(34, 197, 94, 0.25);
      }
      .btn-done:hover {
        background: rgba(34, 197, 94, 0.2);
      }
      .btn-refund {
        background: rgba(245, 158, 11, 0.12);
        color: #f59e0b;
        border: 1px solid rgba(245, 158, 11, 0.3);
      }
      .btn-refund:hover {
        background: rgba(245, 158, 11, 0.2);
      }
    `,
  ],
})
export class OnlineOrdersComponent implements OnInit {
  private service = inject(OnlineSaleService);
  private notif = inject(NotificationService);

  items = signal<OnlineSale[]>([]);
  total = signal(0);
  loading = signal(true);
  saving = signal(false);
  refundingId = signal<number | null>(null);
  refundedIds = signal<Record<number, boolean>>({});
  page = signal(1);
  pendingCount = signal(0);
  pageSize = 20;
  filterVerarbeitet = '';
  totalPages = computed(() => Math.ceil(this.total() / this.pageSize));

  editTarget = signal<OnlineSale | null>(null);
  editVorname = '';
  editNachname = '';
  editEmail = '';
  editAdresse = '';
  editAbholtag = '';

  ngOnInit(): void {
    this.loadPendingCount();
    this.load(1);
  }

  load(p: number): void {
    this.page.set(p);
    this.loading.set(true);
    const v =
      this.filterVerarbeitet === ''
        ? undefined
        : this.filterVerarbeitet === 'true';
    this.service.getAll(p, this.pageSize, v).subscribe({
      next: (res) => {
        this.items.set(res.items);
        this.total.set(res.total);
        this.loading.set(false);
      },
      error: () => {
        this.notif.error('Fehler beim Laden der Bestellungen.');
        this.loading.set(false);
      },
    });
  }

  openEdit(sale: OnlineSale): void {
    this.editTarget.set(sale);
    this.editVorname = sale.vorname;
    this.editNachname = sale.nachname;
    this.editEmail = sale.email;
    this.editAdresse = sale.adresse;
    // Normalize abholtag to yyyy-MM-dd for <input type="date">
    const d = sale.abholtag ? new Date(sale.abholtag) : null;
    this.editAbholtag =
      d && !isNaN(d.getTime())
        ? d.toISOString().substring(0, 10)
        : (sale.abholtag ?? '');
  }

  closeEdit(): void {
    this.editTarget.set(null);
  }

  saveEdit(sale: OnlineSale): void {
    this.saving.set(true);
    this.service
      .update(sale.id, {
        vorname: this.editVorname,
        nachname: this.editNachname,
        email: this.editEmail,
        adresse: this.editAdresse,
        abholtag: this.editAbholtag,
      })
      .subscribe({
        next: () => {
          // Update local copy
          sale.vorname = this.editVorname;
          sale.nachname = this.editNachname;
          sale.email = this.editEmail;
          sale.adresse = this.editAdresse;
          sale.abholtag = this.editAbholtag;
          this.saving.set(false);
          this.notif.success('Gespeichert.');
          this.closeEdit();
        },
        error: () => {
          this.notif.error('Fehler beim Speichern.');
          this.saving.set(false);
        },
      });
  }

  markProcessed(sale: OnlineSale): void {
    this.service.markProcessed(sale.id).subscribe({
      next: () => {
        sale.isVerarbeitet = true;
        this.pendingCount.update((c) => Math.max(0, c - 1));
        this.notif.success('Als erledigt markiert.');
      },
      error: () => this.notif.error('Fehler beim Aktualisieren.'),
    });
  }

  downloadPdf(sale: OnlineSale): void {
    this.service.downloadBeleg(sale.id).subscribe((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Online-Bestellung_${sale.id}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  printPdf(sale: OnlineSale): void {
    this.service.downloadBeleg(sale.id).subscribe((blob) => {
      const url = URL.createObjectURL(blob);
      const w = window.open(url, '_blank');
      if (w)
        w.onload = () => {
          w.print();
        };
    });
  }

  refundSale(sale: OnlineSale): void {
    if (!sale.molliePaymentId) {
      this.notif.error('Keine Mollie-ID vorhanden.');
      return;
    }

    const confirmed = window.confirm(
      'Rückerstattung für diese Bestellung auslösen?',
    );
    if (!confirmed) return;

    this.refundingId.set(sale.id);
    this.service.refund(sale.id).subscribe({
      next: (result) => {
        sale.isVerarbeitet = result.isVerarbeitet;
        this.refundedIds.update((current) => ({
          ...current,
          [sale.id]: result.status.toLowerCase() === 'iade',
        }));
        this.pendingCount.update((c) => Math.max(0, c - 1));
        this.notif.success('Rueckerstattung erfolgreich. Status: Iade');
        this.refundingId.set(null);
      },
      error: () => {
        this.notif.error('Rückerstattung fehlgeschlagen.');
        this.refundingId.set(null);
      },
    });
  }

  isRefunded(sale: OnlineSale): boolean {
    return this.refundedIds()[sale.id] === true;
  }

  private loadPendingCount(): void {
    this.service.getPendingCount().subscribe({
      next: (r) => this.pendingCount.set(r.count),
      error: () => {},
    });
  }
}
