import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  StatisticsService,
  Statistics,
} from '../../services/statistics.service';

type PeriodType = 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom';

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="statistics-page">
      <h1>Statistiken</h1>

      <!-- Period Selector -->
      <div class="period-selector">
        <button
          [class.active]="selectedPeriod === 'today'"
          (click)="selectPeriod('today')"
        >
          Heute
        </button>
        <button
          [class.active]="selectedPeriod === 'week'"
          (click)="selectPeriod('week')"
        >
          Diese Woche
        </button>
        <button
          [class.active]="selectedPeriod === 'month'"
          (click)="selectPeriod('month')"
        >
          Dieser Monat
        </button>
        <button
          [class.active]="selectedPeriod === 'quarter'"
          (click)="selectPeriod('quarter')"
        >
          Dieses Quartal
        </button>
        <button
          [class.active]="selectedPeriod === 'year'"
          (click)="selectPeriod('year')"
        >
          Dieses Jahr
        </button>
        <button
          [class.active]="selectedPeriod === 'custom'"
          (click)="selectPeriod('custom')"
        >
          Benutzerdefiniert
        </button>
      </div>

      <!-- Custom Date Range -->
      <div class="custom-range" *ngIf="selectedPeriod === 'custom'">
        <div class="date-field">
          <label>Von:</label>
          <input
            type="date"
            [(ngModel)]="customStartDate"
            (change)="loadCustomStatistics()"
          />
        </div>
        <div class="date-field">
          <label>Bis:</label>
          <input
            type="date"
            [(ngModel)]="customEndDate"
            (change)="loadCustomStatistics()"
          />
        </div>
      </div>

      <!-- Loading -->
      <div class="loading" *ngIf="loading">
        <p>Lade Statistiken...</p>
      </div>

      <!-- Statistics Content -->
      <div class="statistics-content" *ngIf="!loading && stats">
        <!-- Summary Cards -->
        <div class="summary-cards">
          <div class="card purchases">
            <h3>Einkäufe</h3>
            <div class="big-number">{{ stats.purchaseCount }}</div>
            <div class="amount">
              {{ stats.totalPurchaseAmount | currency: 'EUR' }}
            </div>
            <div class="avg">
              Ø {{ stats.averagePurchasePrice | currency: 'EUR' }}
            </div>
          </div>

          <div class="card sales">
            <h3>Verkäufe</h3>
            <div class="big-number">{{ stats.saleCount }}</div>
            <div class="amount">
              {{ stats.totalSaleAmount | currency: 'EUR' }}
            </div>
            <div class="avg">
              Ø {{ stats.averageSalePrice | currency: 'EUR' }}
            </div>
          </div>

          <div class="card profit" [class.negative]="stats.profit < 0">
            <h3>Gewinn</h3>
            <div class="big-number">{{ stats.profit | currency: 'EUR' }}</div>
            <div class="avg">
              Ø pro Verkauf: {{ stats.averageProfit | currency: 'EUR' }}
            </div>
          </div>
        </div>

        <!-- Daily Breakdown Table -->
        <div class="daily-breakdown" *ngIf="stats.dailyBreakdown.length > 0">
          <h2>Tägliche Übersicht</h2>
          <div class="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Datum</th>
                  <th>Einkäufe</th>
                  <th>Einkaufswert</th>
                  <th>Verkäufe</th>
                  <th>Verkaufswert</th>
                  <th>Tagesgewinn</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  *ngFor="let day of stats.dailyBreakdown"
                  [class.has-activity]="
                    day.purchaseCount > 0 || day.saleCount > 0
                  "
                >
                  <td>{{ formatDate(day.date) }}</td>
                  <td>{{ day.purchaseCount }}</td>
                  <td>{{ day.purchaseAmount | currency: 'EUR' }}</td>
                  <td>{{ day.saleCount }}</td>
                  <td>{{ day.saleAmount | currency: 'EUR' }}</td>
                  <td
                    [class.positive]="day.dailyProfit > 0"
                    [class.negative]="day.dailyProfit < 0"
                  >
                    {{ day.dailyProfit | currency: 'EUR' }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Top Brands -->
        <div class="top-brands" *ngIf="stats.topBrands.length > 0">
          <h2>Top Marken (nach Umsatz)</h2>
          <div class="brands-list">
            <div
              class="brand-item"
              *ngFor="let brand of stats.topBrands; let i = index"
            >
              <span class="rank">{{ i + 1 }}.</span>
              <span class="brand-name">{{ brand.brand }}</span>
              <span class="count">{{ brand.count }} verkauft</span>
              <span class="revenue">{{
                brand.totalRevenue | currency: 'EUR'
              }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- No Data -->
      <div class="no-data" *ngIf="!loading && !stats">
        <p>Keine Daten verfügbar</p>
      </div>
    </div>
  `,
  styles: [
    `
      .statistics-page {
        padding: 20px;
        max-width: 1200px;
        margin: 0 auto;
      }

      h1 {
        margin-bottom: 24px;
        color: #333;
      }

      h2 {
        margin: 24px 0 16px;
        color: #444;
        font-size: 1.3rem;
      }

      .period-selector {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
        margin-bottom: 20px;
      }

      .period-selector button {
        padding: 10px 20px;
        border: 2px solid #4caf50;
        background: white;
        color: #4caf50;
        border-radius: 8px;
        cursor: pointer;
        font-weight: 500;
        transition: all 0.2s;
      }

      .period-selector button:hover {
        background: #e8f5e9;
      }

      .period-selector button.active {
        background: #4caf50;
        color: white;
      }

      .custom-range {
        display: flex;
        gap: 20px;
        margin-bottom: 20px;
        padding: 16px;
        background: #f5f5f5;
        border-radius: 8px;
      }

      .date-field {
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .date-field label {
        font-weight: 500;
      }

      .date-field input {
        padding: 8px 12px;
        border: 1px solid #ddd;
        border-radius: 6px;
        font-size: 1rem;
      }

      .loading {
        text-align: center;
        padding: 40px;
        color: #666;
      }

      .summary-cards {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 20px;
        margin-bottom: 32px;
      }

      .card {
        background: white;
        border-radius: 12px;
        padding: 24px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }

      .card h3 {
        margin: 0 0 12px;
        font-size: 1rem;
        color: #666;
        text-transform: uppercase;
        letter-spacing: 1px;
      }

      .card .big-number {
        font-size: 2.5rem;
        font-weight: bold;
        margin-bottom: 8px;
      }

      .card.purchases .big-number {
        color: #2196f3;
      }

      .card.sales .big-number {
        color: #4caf50;
      }

      .card.profit .big-number {
        color: #4caf50;
      }

      .card.profit.negative .big-number {
        color: #f44336;
      }

      .card .amount {
        font-size: 1.2rem;
        color: #333;
        margin-bottom: 4px;
      }

      .card .avg {
        font-size: 0.9rem;
        color: #888;
      }

      .daily-breakdown {
        background: white;
        border-radius: 12px;
        padding: 24px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        margin-bottom: 24px;
      }

      .table-wrapper {
        overflow-x: auto;
      }

      table {
        width: 100%;
        border-collapse: collapse;
      }

      th,
      td {
        padding: 12px;
        text-align: left;
        border-bottom: 1px solid #eee;
      }

      th {
        background: #f9f9f9;
        font-weight: 600;
        color: #555;
      }

      tr:hover {
        background: #f5f5f5;
      }

      tr.has-activity {
        background: #e8f5e9;
      }

      tr.has-activity:hover {
        background: #c8e6c9;
      }

      td.positive {
        color: #4caf50;
        font-weight: 500;
      }

      td.negative {
        color: #f44336;
        font-weight: 500;
      }

      .top-brands {
        background: white;
        border-radius: 12px;
        padding: 24px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }

      .brands-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .brand-item {
        display: flex;
        align-items: center;
        padding: 12px 16px;
        background: #f9f9f9;
        border-radius: 8px;
      }

      .brand-item .rank {
        width: 30px;
        font-weight: bold;
        color: #4caf50;
      }

      .brand-item .brand-name {
        flex: 1;
        font-weight: 500;
      }

      .brand-item .count {
        margin-right: 20px;
        color: #666;
      }

      .brand-item .revenue {
        font-weight: bold;
        color: #4caf50;
      }

      .no-data {
        text-align: center;
        padding: 60px 20px;
        color: #888;
      }
    `,
  ],
})
export class StatisticsComponent implements OnInit {
  selectedPeriod: PeriodType = 'month';
  customStartDate = '';
  customEndDate = '';
  stats: Statistics | null = null;
  loading = false;

  constructor(private readonly statisticsService: StatisticsService) {}

  ngOnInit() {
    this.setDefaultDates();
    this.loadStatistics();
  }

  setDefaultDates() {
    const today = new Date();
    this.customEndDate = today.toISOString().split('T')[0];
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    this.customStartDate = startOfMonth.toISOString().split('T')[0];
  }

  selectPeriod(period: PeriodType) {
    this.selectedPeriod = period;
    if (period !== 'custom') {
      this.loadStatistics();
    }
  }

  loadStatistics() {
    this.loading = true;
    this.stats = null;

    let request$;
    switch (this.selectedPeriod) {
      case 'today':
        request$ = this.statisticsService.getTodayStatistics();
        break;
      case 'week':
        request$ = this.statisticsService.getWeekStatistics();
        break;
      case 'month':
        request$ = this.statisticsService.getMonthStatistics();
        break;
      case 'quarter':
        request$ = this.statisticsService.getQuarterStatistics();
        break;
      case 'year':
        request$ = this.statisticsService.getYearStatistics();
        break;
      case 'custom':
        this.loadCustomStatistics();
        return;
    }

    request$.subscribe({
      next: (data) => {
        this.stats = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  loadCustomStatistics() {
    if (!this.customStartDate || !this.customEndDate) return;

    this.loading = true;
    this.stats = null;

    const start = new Date(this.customStartDate);
    const end = new Date(this.customEndDate);

    this.statisticsService.getStatistics(start, end).subscribe({
      next: (data) => {
        this.stats = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('de-DE', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }
}
