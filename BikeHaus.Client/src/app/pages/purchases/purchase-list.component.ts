import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PurchaseService } from '../../services/purchase.service';
import { PurchaseList } from '../../models/models';

@Component({
  selector: 'app-purchase-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>Ankäufe</h1>
        <a routerLink="/purchases/new" class="btn btn-primary"
          >+ Neuer Ankauf</a
        >
      </div>

      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Beleg-Nr.</th>
              <th>Fahrrad</th>
              <th>Verkäufer</th>
              <th>Preis</th>
              <th>Datum</th>
              <th>Aktionen</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let p of purchases">
              <td class="mono">{{ p.belegNummer }}</td>
              <td>{{ p.bikeInfo }}</td>
              <td>{{ p.sellerName }}</td>
              <td>{{ p.preis | number: '1.2-2' }} €</td>
              <td>{{ p.kaufdatum | date: 'dd.MM.yyyy' }}</td>
              <td class="actions">
                <button class="btn btn-sm btn-outline" (click)="downloadPdf(p)">
                  PDF
                </button>
                <button
                  class="btn btn-sm btn-danger"
                  (click)="deletePurchase(p)"
                >
                  ×
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        <p *ngIf="purchases.length === 0" class="empty">
          Keine Ankäufe vorhanden
        </p>
      </div>
    </div>
  `,
  styles: [
    `
      .page {
        max-width: 1200px;
        margin: 0 auto;
      }
      .page-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
      }
      .table-container {
        background: #fff;
        border-radius: 10px;
        padding: 16px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
        overflow-x: auto;
      }
      table {
        width: 100%;
        border-collapse: collapse;
      }
      th {
        text-align: left;
        padding: 10px 8px;
        border-bottom: 2px solid #eee;
        font-size: 0.85rem;
        color: #555;
      }
      td {
        padding: 10px 8px;
        border-bottom: 1px solid #f0f0f0;
      }
      .mono {
        font-family: monospace;
      }
      .actions {
        display: flex;
        gap: 6px;
      }
      .empty {
        text-align: center;
        color: #999;
        padding: 40px;
      }
    `,
  ],
})
export class PurchaseListComponent implements OnInit {
  purchases: PurchaseList[] = [];

  constructor(private purchaseService: PurchaseService) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.purchaseService.getAll().subscribe((data) => (this.purchases = data));
  }

  downloadPdf(p: PurchaseList) {
    this.purchaseService.downloadKaufbeleg(p.id).subscribe((blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Kaufbeleg_${p.belegNummer}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    });
  }

  deletePurchase(p: PurchaseList) {
    if (confirm(`Ankauf ${p.belegNummer} wirklich löschen?`)) {
      this.purchaseService.delete(p.id).subscribe({
        next: () => this.load(),
        error: (err) =>
          alert(err.error?.error || 'Fehler beim Löschen des Ankaufs'),
      });
    }
  }
}
