import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { DashboardService } from '../../services/dashboard.service';
import { Dashboard } from '../../models/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="dashboard" *ngIf="data">
      <h1>Dashboard</h1>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-value">{{ data.totalBicycles }}</div>
          <div class="stat-label">Fahrräder gesamt</div>
        </div>
        <div class="stat-card accent">
          <div class="stat-value">{{ data.availableBicycles }}</div>
          <div class="stat-label">Verfügbar</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ data.soldBicycles }}</div>
          <div class="stat-label">Verkauft</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ data.totalPurchases }}</div>
          <div class="stat-label">Ankäufe</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ data.totalSales }}</div>
          <div class="stat-label">Verkäufe</div>
        </div>
        <div class="stat-card money">
          <div class="stat-value">
            {{ data.totalPurchaseAmount | number: '1.2-2' }} €
          </div>
          <div class="stat-label">Einkauf gesamt</div>
        </div>
        <div class="stat-card money">
          <div class="stat-value">
            {{ data.totalSaleAmount | number: '1.2-2' }} €
          </div>
          <div class="stat-label">Verkauf gesamt</div>
        </div>
        <div class="stat-card profit" [class.negative]="data.profit < 0">
          <div class="stat-value">{{ data.profit | number: '1.2-2' }} €</div>
          <div class="stat-label">Gewinn</div>
        </div>
      </div>

      <div class="recent-sections">
        <div class="recent-section">
          <h2>Letzte Ankäufe</h2>
          <table *ngIf="data.recentPurchases?.length; else noPurchases">
            <thead>
              <tr>
                <th>Beleg-Nr.</th>
                <th>Fahrrad</th>
                <th>Verkäufer</th>
                <th>Preis</th>
                <th>Datum</th>
              </tr>
            </thead>
            <tbody>
              <tr
                *ngFor="let p of data.recentPurchases"
                class="clickable-row"
                (click)="goToPurchase(p.id)"
              >
                <td>{{ p.belegNummer }}</td>
                <td>{{ p.bikeInfo }}</td>
                <td>{{ p.sellerName }}</td>
                <td>{{ p.preis | number: '1.2-2' }} €</td>
                <td>{{ p.kaufdatum | date: 'dd.MM.yyyy' }}</td>
              </tr>
            </tbody>
          </table>
          <ng-template #noPurchases
            ><p class="empty">Keine Ankäufe vorhanden</p></ng-template
          >
        </div>

        <div class="recent-section">
          <h2>Letzte Verkäufe</h2>
          <table *ngIf="data.recentSales?.length; else noSales">
            <thead>
              <tr>
                <th>Beleg-Nr.</th>
                <th>Fahrrad</th>
                <th>Käufer</th>
                <th>Preis</th>
                <th>Datum</th>
              </tr>
            </thead>
            <tbody>
              <tr
                *ngFor="let s of data.recentSales"
                class="clickable-row"
                (click)="goToSale(s.id)"
              >
                <td>{{ s.belegNummer }}</td>
                <td>{{ s.bikeInfo }}</td>
                <td>{{ s.buyerName }}</td>
                <td>{{ s.preis | number: '1.2-2' }} €</td>
                <td>{{ s.verkaufsdatum | date: 'dd.MM.yyyy' }}</td>
              </tr>
            </tbody>
          </table>
          <ng-template #noSales
            ><p class="empty">Keine Verkäufe vorhanden</p></ng-template
          >
        </div>
      </div>

      <div class="quick-actions">
        <a routerLink="/purchases/new" class="btn btn-primary">Neuer Ankauf</a>
        <a routerLink="/sales/new" class="btn btn-primary">Neuer Verkauf</a>
        <a routerLink="/bicycles" class="btn btn-outline">Fahrräder</a>
        <a routerLink="/customers" class="btn btn-outline">Kunden</a>
      </div>
    </div>
  `,
  styles: [
    `
      .dashboard {
        max-width: 1200px;
        margin: 0 auto;
      }
      h1 {
        margin-bottom: 24px;
      }
      .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 16px;
        margin-bottom: 32px;
      }
      .stat-card {
        background: #fff;
        border-radius: 10px;
        padding: 20px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
        text-align: center;
      }
      .stat-value {
        font-size: 2rem;
        font-weight: 700;
        color: #1a1a2e;
      }
      .stat-label {
        font-size: 0.85rem;
        color: #777;
        margin-top: 4px;
      }
      .stat-card.accent .stat-value {
        color: #2ecc71;
      }
      .stat-card.money .stat-value {
        color: #3498db;
        font-size: 1.5rem;
      }
      .stat-card.profit .stat-value {
        color: #2ecc71;
      }
      .stat-card.profit.negative .stat-value {
        color: #e74c3c;
      }

      .recent-sections {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 24px;
        margin-bottom: 32px;
      }
      @media (max-width: 768px) {
        .recent-sections {
          grid-template-columns: 1fr;
        }
      }
      .recent-section {
        background: #fff;
        border-radius: 10px;
        padding: 20px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
      }
      .recent-section h2 {
        font-size: 1.1rem;
        margin-bottom: 12px;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        font-size: 0.85rem;
      }
      th {
        text-align: left;
        padding: 8px 6px;
        border-bottom: 2px solid #eee;
        color: #555;
      }
      td {
        padding: 8px 6px;
        border-bottom: 1px solid #f0f0f0;
      }
      .clickable-row {
        cursor: pointer;
        transition: background-color 0.15s ease;
      }
      .clickable-row:hover {
        background-color: #f5f5f5;
      }
      .empty {
        color: #999;
        font-style: italic;
      }
      .quick-actions {
        display: flex;
        gap: 12px;
        flex-wrap: wrap;
      }
    `,
  ],
})
export class DashboardComponent implements OnInit {
  data: Dashboard | null = null;

  constructor(
    private dashboardService: DashboardService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.dashboardService.getDashboard().subscribe((d) => (this.data = d));
  }

  goToPurchase(id: number) {
    this.router.navigate(['/purchases/edit', id]);
  }

  goToSale(id: number) {
    this.router.navigate(['/sales/edit', id]);
  }
}
