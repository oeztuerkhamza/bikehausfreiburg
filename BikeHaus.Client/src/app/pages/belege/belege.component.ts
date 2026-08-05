import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BelegService } from '../../services/beleg.service';
import { RentalService } from '../../services/rental.service';
import { SaleService } from '../../services/sale.service';
import { NotificationService } from '../../services/notification.service';
import { BelegListItem } from '../../models/models';

/**
 * Miet- und Verkaufsbelege in einer gemeinsamen, nach Datum sortierten Liste.
 * Der Export liefert genau diese Belege in EINER PDF-Datei, in derselben
 * Reihenfolge — Mietverträge und Verkaufsbelege hintereinander.
 */
@Component({
  selector: 'app-belege',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>Belege</h1>
        <button
          class="btn btn-primary"
          (click)="exportPdf()"
          [disabled]="exporting || belege.length === 0"
        >
          <span *ngIf="!exporting">📄 Beleg exportieren</span>
          <span *ngIf="exporting">Wird erstellt…</span>
        </button>
      </div>

      <div class="filters">
        <div class="date-field">
          <label>Von</label>
          <input type="date" [(ngModel)]="startDate" (change)="load()" />
        </div>
        <div class="date-field">
          <label>Bis</label>
          <input type="date" [(ngModel)]="endDate" (change)="load()" />
        </div>
        <div class="summary" *ngIf="!loading">
          {{ mieteCount }} Mietvertrag / {{ verkaufCount }} Verkauf
        </div>
      </div>

      <p class="hint">
        Nach Beleg-Nr. sortiert, höchste zuerst. Der Export fasst alle Belege
        dieses Zeitraums in einer einzigen PDF-Datei zusammen — in der
        Reihenfolge dieser Liste.
      </p>

      <div class="loading" *ngIf="loading">Wird geladen…</div>

      <div class="table-wrap" *ngIf="!loading">
        <table>
          <thead>
            <tr>
              <th>Art</th>
              <th>Beleg-Nr.</th>
              <th>Datum</th>
              <th>Kunde</th>
              <th>Fahrrad</th>
              <th class="right">Betrag</th>
              <th style="width:60px"></th>
            </tr>
          </thead>
          <tbody>
            <tr *ngIf="belege.length === 0">
              <td colspan="7" class="empty">
                In diesem Zeitraum gibt es keine Belege.
              </td>
            </tr>
            <tr *ngFor="let b of belege">
              <td>
                <span
                  class="badge"
                  [class.badge-miete]="b.art === 'Miete'"
                  [class.badge-verkauf]="b.art === 'Verkauf'"
                >
                  {{ b.art === 'Miete' ? 'Miete' : 'Verkauf' }}
                </span>
              </td>
              <td class="mono">{{ b.belegNummer }}</td>
              <td>{{ b.datum | date: 'dd.MM.yyyy' }}</td>
              <td>{{ b.kundeName }}</td>
              <td>{{ b.fahrradInfo || '–' }}</td>
              <td class="right">{{ b.betrag | number: '1.2-2' }} €</td>
              <td>
                <button
                  class="btn btn-outline btn-sm"
                  (click)="openSingle(b)"
                  title="Einzelbeleg öffnen"
                >
                  🖨️
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
      .page-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 16px;
        margin-bottom: 20px;
      }
      .filters {
        display: flex;
        gap: 16px;
        align-items: flex-end;
        flex-wrap: wrap;
        margin-bottom: 10px;
      }
      .date-field {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .date-field label {
        font-size: 0.8rem;
        color: var(--text-secondary, #64748b);
      }
      .date-field input {
        padding: 9px 12px;
        border: 1.5px solid var(--border-light, #e2e8f0);
        border-radius: var(--radius-md, 10px);
        background: var(--bg-card, #fff);
        color: var(--text-primary);
      }
      .summary {
        padding-bottom: 10px;
        font-size: 0.88rem;
        color: var(--text-secondary, #64748b);
      }
      .hint {
        margin: 0 0 18px;
        font-size: 0.85rem;
        color: var(--text-muted, #94a3b8);
      }
      .table-wrap {
        overflow-x: auto;
        background: var(--bg-card, #fff);
        border-radius: var(--radius-lg, 14px);
        border: 1px solid var(--border-light, #e2e8f0);
      }
      table {
        width: 100%;
        border-collapse: collapse;
      }
      th,
      td {
        padding: 11px 14px;
        text-align: left;
        border-bottom: 1px solid var(--border-light, #e2e8f0);
        font-size: 0.9rem;
      }
      th {
        font-size: 0.78rem;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        color: var(--text-secondary, #64748b);
      }
      tbody tr:last-child td {
        border-bottom: none;
      }
      .right {
        text-align: right;
      }
      .mono {
        font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      }
      .empty {
        text-align: center;
        padding: 30px;
        color: var(--text-muted, #94a3b8);
      }
      .loading {
        padding: 30px;
        text-align: center;
        color: var(--text-muted, #94a3b8);
      }
      .badge {
        display: inline-block;
        padding: 3px 9px;
        border-radius: 999px;
        font-size: 0.75rem;
        font-weight: 600;
      }
      .badge-miete {
        background: rgba(37, 99, 235, 0.12);
        color: #2563eb;
      }
      .badge-verkauf {
        background: rgba(16, 185, 129, 0.14);
        color: #059669;
      }
    `,
  ],
})
export class BelegeComponent implements OnInit {
  private belegService = inject(BelegService);
  private rentalService = inject(RentalService);
  private saleService = inject(SaleService);
  private notificationService = inject(NotificationService);

  belege: BelegListItem[] = [];
  loading = false;
  exporting = false;
  startDate = '';
  endDate = '';

  get mieteCount(): number {
    return this.belege.filter((b) => b.art === 'Miete').length;
  }

  get verkaufCount(): number {
    return this.belege.filter((b) => b.art === 'Verkauf').length;
  }

  ngOnInit(): void {
    // Voreinstellung: laufender Monat.
    const now = new Date();
    this.startDate = this.toInput(new Date(now.getFullYear(), now.getMonth(), 1));
    this.endDate = this.toInput(new Date(now.getFullYear(), now.getMonth() + 1, 0));
    this.load();
  }

  load(): void {
    if (!this.startDate || !this.endDate) return;
    // Beim Umstellen des Zeitraums steht kurz ein Datum hinter dem anderen.
    // Dann gar nicht erst laden — sonst quittiert der Server das mit 400 und
    // der Benutzer sieht mitten im Tippen eine Fehlermeldung.
    if (this.startDate > this.endDate) return;
    this.loading = true;
    this.belegService.getBelege(this.startDate, this.endDate).subscribe({
      next: (items) => {
        this.belege = items;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.notificationService.error('Belege konnten nicht geladen werden.');
      },
    });
  }

  exportPdf(): void {
    if (!this.startDate || !this.endDate) return;
    this.exporting = true;
    this.belegService.downloadCombinedPdf(this.startDate, this.endDate).subscribe({
      next: (blob) => {
        this.exporting = false;
        this.save(blob, `Belege_${this.startDate}_bis_${this.endDate}.pdf`);
      },
      error: () => {
        this.exporting = false;
        this.notificationService.error('Export fehlgeschlagen.');
      },
    });
  }

  openSingle(b: BelegListItem): void {
    const request$ =
      b.art === 'Miete'
        ? this.rentalService.downloadMietvertragPdf(b.id)
        : this.saleService.downloadVerkaufsbeleg(b.id);

    request$.subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
        // Der neue Tab hält das Blob; nach kurzer Zeit darf die URL weg.
        setTimeout(() => URL.revokeObjectURL(url), 60000);
      },
      error: () => this.notificationService.error('Beleg konnte nicht geladen werden.'),
    });
  }

  private save(blob: Blob, fileName: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  }

  private toInput(d: Date): string {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }
}
