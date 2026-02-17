import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReturnService } from '../../services/return.service';
import { ReturnList, ReturnReason } from '../../models/models';

@Component({
  selector: 'app-return-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>Rückgaben</h1>
        <a routerLink="/returns/new" class="btn btn-primary">+ Neue Rückgabe</a>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Beleg-Nr.</th>
              <th>Org. Verkauf</th>
              <th>Fahrrad</th>
              <th>Kunde</th>
              <th>Datum</th>
              <th>Grund</th>
              <th>Erstattung</th>
              <th>Aktionen</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngIf="returns.length === 0">
              <td
                colspan="8"
                style="text-align:center;padding:32px;color:#999;"
              >
                Keine Rückgaben vorhanden
              </td>
            </tr>
            <tr *ngFor="let r of returns">
              <td>{{ r.belegNummer }}</td>
              <td>{{ r.originalSaleBelegNummer }}</td>
              <td>{{ r.bikeInfo }}</td>
              <td>{{ r.customerName }}</td>
              <td>{{ r.rueckgabedatum | date: 'dd.MM.yyyy' }}</td>
              <td>
                <span class="badge" [class]="getBadgeClass(r.grund)">{{
                  getReasonLabel(r.grund)
                }}</span>
              </td>
              <td>{{ r.erstattungsbetrag | number: '1.2-2' }} €</td>
              <td class="actions">
                <button
                  class="btn btn-sm btn-outline"
                  (click)="downloadPdf(r.id, r.belegNummer)"
                >
                  PDF
                </button>
                <button class="btn btn-sm btn-danger" (click)="delete(r.id)">
                  Löschen
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
      .page {
        max-width: 1100px;
        margin: 0 auto;
      }
      .page-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
      }
      .table-wrap {
        background: #fff;
        border-radius: 10px;
        overflow: auto;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
      }
      table {
        width: 100%;
        border-collapse: collapse;
      }
      th {
        text-align: left;
        padding: 12px 14px;
        font-size: 0.8rem;
        color: #777;
        border-bottom: 2px solid #eee;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      td {
        padding: 12px 14px;
        border-bottom: 1px solid #f0f0f0;
        font-size: 0.92rem;
      }
      .actions {
        display: flex;
        gap: 6px;
      }
      .btn-sm {
        padding: 4px 10px;
        font-size: 0.8rem;
      }
      .badge {
        padding: 3px 8px;
        border-radius: 4px;
        font-size: 0.75rem;
        font-weight: 500;
      }
      .badge-defekt {
        background: #fee2e2;
        color: #dc2626;
      }
      .badge-garantie {
        background: #fef3c7;
        color: #d97706;
      }
      .badge-nicht-erwartet {
        background: #dbeafe;
        color: #2563eb;
      }
      .badge-sonstiges {
        background: #e5e7eb;
        color: #6b7280;
      }
    `,
  ],
})
export class ReturnListComponent implements OnInit {
  returns: ReturnList[] = [];

  constructor(private returnService: ReturnService) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.returnService.getAll().subscribe((r) => (this.returns = r));
  }

  getReasonLabel(reason: ReturnReason): string {
    const labels: Record<ReturnReason, string> = {
      [ReturnReason.Defekt]: 'Defekt',
      [ReturnReason.Garantie]: 'Garantie',
      [ReturnReason.NichtWieErwartet]: 'Nicht wie erwartet',
      [ReturnReason.Sonstiges]: 'Sonstiges',
    };
    return labels[reason] || reason;
  }

  getBadgeClass(reason: ReturnReason): string {
    const classes: Record<ReturnReason, string> = {
      [ReturnReason.Defekt]: 'badge-defekt',
      [ReturnReason.Garantie]: 'badge-garantie',
      [ReturnReason.NichtWieErwartet]: 'badge-nicht-erwartet',
      [ReturnReason.Sonstiges]: 'badge-sonstiges',
    };
    return classes[reason] || '';
  }

  downloadPdf(id: number, belegNr: string) {
    this.returnService.downloadRueckgabebeleg(id).subscribe((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Rueckgabebeleg_${belegNr}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  delete(id: number) {
    if (confirm('Rückgabe wirklich löschen?')) {
      this.returnService.delete(id).subscribe({
        next: () => this.load(),
        error: (err) =>
          alert(err.error?.error || 'Fehler beim Löschen der Rückgabe'),
      });
    }
  }
}
