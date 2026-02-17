import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SaleService } from '../../services/sale.service';
import { SaleList } from '../../models/models';

@Component({
  selector: 'app-sale-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>Verkäufe</h1>
        <a routerLink="/sales/new" class="btn btn-primary">+ Neuer Verkauf</a>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Beleg-Nr.</th>
              <th>Fahrrad</th>
              <th>Käufer</th>
              <th>Preis</th>
              <th>Datum</th>
              <th>Garantie</th>
              <th>Aktionen</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngIf="sales.length === 0">
              <td
                colspan="7"
                style="text-align:center;padding:32px;color:#999;"
              >
                Keine Verkäufe vorhanden
              </td>
            </tr>
            <tr *ngFor="let s of sales">
              <td>{{ s.belegNummer }}</td>
              <td>{{ s.bikeInfo }}</td>
              <td>{{ s.buyerName }}</td>
              <td>{{ s.preis | number: '1.2-2' }} €</td>
              <td>{{ s.verkaufsdatum | date: 'dd.MM.yyyy' }}</td>
              <td>{{ s.garantie ? 'Ja' : 'Nein' }}</td>
              <td class="actions">
                <button
                  class="btn btn-sm btn-outline"
                  (click)="downloadPdf(s.id, s.belegNummer)"
                >
                  PDF
                </button>
                <button class="btn btn-sm btn-danger" (click)="delete(s.id)">
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
        max-width: 1000px;
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
    `,
  ],
})
export class SaleListComponent implements OnInit {
  sales: SaleList[] = [];

  constructor(private saleService: SaleService) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.saleService.getAll().subscribe((s) => (this.sales = s));
  }

  downloadPdf(id: number, belegNr: string) {
    this.saleService.downloadVerkaufsbeleg(id).subscribe((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Verkaufsbeleg_${belegNr}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  delete(id: number) {
    if (confirm('Verkauf wirklich löschen?')) {
      this.saleService.delete(id).subscribe({
        next: () => this.load(),
        error: (err) =>
          alert(err.error?.error || 'Fehler beim Löschen des Verkaufs'),
      });
    }
  }
}
