import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  StatisticsService,
  Statistics,
} from '../../services/statistics.service';
import { TranslationService } from '../../services/translation.service';

type PeriodType = 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom';

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="statistics-page">
      <h1>{{ t.statistics }}</h1>

      <!-- Period Selector -->
      <div class="period-selector">
        <button
          [class.active]="selectedPeriod === 'today'"
          (click)="selectPeriod('today')"
        >
          {{ t.today }}
        </button>
        <button
          [class.active]="selectedPeriod === 'week'"
          (click)="selectPeriod('week')"
        >
          {{ t.thisWeek }}
        </button>
        <button
          [class.active]="selectedPeriod === 'month'"
          (click)="selectPeriod('month')"
        >
          {{ t.thisMonth }}
        </button>
        <button
          [class.active]="selectedPeriod === 'quarter'"
          (click)="selectPeriod('quarter')"
        >
          {{ t.thisQuarter }}
        </button>
        <button
          [class.active]="selectedPeriod === 'year'"
          (click)="selectPeriod('year')"
        >
          {{ t.thisYear }}
        </button>
        <button
          [class.active]="selectedPeriod === 'custom'"
          (click)="selectPeriod('custom')"
        >
          {{ t.custom }}
        </button>
      </div>

      <!-- Custom Date Range -->
      <div class="custom-range" *ngIf="selectedPeriod === 'custom'">
        <div class="date-field">
          <label>{{ t.from }}:</label>
          <input
            type="date"
            [(ngModel)]="customStartDate"
            (change)="loadCustomStatistics()"
          />
        </div>
        <div class="date-field">
          <label>{{ t.to }}:</label>
          <input
            type="date"
            [(ngModel)]="customEndDate"
            (change)="loadCustomStatistics()"
          />
        </div>
      </div>

      <!-- Loading -->
      <div class="loading" *ngIf="loading">
        <p>{{ t.loadingStatistics }}</p>
      </div>

      <!-- Statistics Content -->
      <div class="statistics-content" *ngIf="!loading && stats">
        <!-- Summary Cards -->
        <div class="summary-cards">
          <div class="card purchases">
            <h3>{{ t.purchases }}</h3>
            <div class="big-number">{{ stats.purchaseCount }}</div>
            <div class="amount">
              {{ stats.totalPurchaseAmount | currency: 'EUR' }}
            </div>
            <div class="avg">
              Ø {{ stats.averagePurchasePrice | currency: 'EUR' }}
            </div>
          </div>

          <div class="card sales">
            <h3>{{ t.sales }}</h3>
            <div class="big-number">{{ stats.saleCount }}</div>
            <div class="amount">
              {{ stats.totalSaleAmount | currency: 'EUR' }}
            </div>
            <div class="avg">
              Ø {{ stats.averageSalePrice | currency: 'EUR' }}
            </div>
          </div>

          <div class="card profit" [class.negative]="stats.profit < 0">
            <h3>{{ t.profit }}</h3>
            <div class="big-number">{{ stats.profit | currency: 'EUR' }}</div>
            <div class="avg">
              {{ t.averagePerSale }}:
              {{ stats.averageProfit | currency: 'EUR' }}
            </div>
          </div>
        </div>

        <!-- Daily Breakdown Table -->
        <div class="daily-breakdown" *ngIf="stats.dailyBreakdown.length > 0">
          <h2>{{ t.dailyOverview }}</h2>
          <div class="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>{{ t.date }}</th>
                  <th>{{ t.purchases }}</th>
                  <th>{{ t.purchaseValue }}</th>
                  <th>{{ t.sales }}</th>
                  <th>{{ t.saleValue }}</th>
                  <th>{{ t.dailyProfit }}</th>
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
          <h2>{{ t.topBrands }}</h2>
          <div class="brands-list">
            <div
              class="brand-item"
              *ngFor="let brand of stats.topBrands; let i = index"
            >
              <span class="rank">{{ i + 1 }}.</span>
              <span class="brand-name">{{ brand.brand }}</span>
              <span class="count">{{ brand.count }} {{ t.soldCount }}</span>
              <span class="revenue">{{
                brand.totalRevenue | currency: 'EUR'
              }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- No Data -->
      <div class="no-data" *ngIf="!loading && !stats">
        <p>{{ t.noData }}</p>
      </div>
    </div>
  `,
  styles: [
    `
      .statistics-page {
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

      h1 {
        margin-bottom: 24px;
        font-size: 1.5rem;
        font-weight: 800;
        color: var(--text-primary);
      }

      h2 {
        margin: 24px 0 16px;
        font-size: 1.15rem;
        font-weight: 700;
        color: var(--text-primary);
      }

      .period-selector {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
        margin-bottom: 20px;
      }

      .period-selector button {
        padding: 10px 20px;
        border: 1.5px solid var(--border-light, #e2e8f0);
        background: var(--bg-card, #fff);
        color: var(--text-primary);
        border-radius: var(--radius-md, 10px);
        cursor: pointer;
        font-weight: 600;
        font-size: 0.88rem;
        transition: var(--transition-fast);
      }

      .period-selector button:hover {
        border-color: var(--accent-primary, #6366f1);
        color: var(--accent-primary, #6366f1);
        background: var(--accent-primary-light, rgba(99, 102, 241, 0.06));
      }

      .period-selector button.active {
        background: var(--accent-primary, #6366f1);
        color: white;
        border-color: var(--accent-primary, #6366f1);
        box-shadow: var(--shadow-sm);
      }

      .custom-range {
        display: flex;
        gap: 20px;
        margin-bottom: 20px;
        padding: 16px;
        background: var(--bg-secondary, #f8fafc);
        border-radius: var(--radius-lg, 14px);
        border: 1.5px solid var(--border-light, #e2e8f0);
      }

      .date-field {
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .date-field label {
        font-weight: 600;
        font-size: 0.82rem;
        color: var(--text-secondary, #64748b);
        text-transform: uppercase;
        letter-spacing: 0.03em;
      }

      .date-field input {
        padding: 9px 14px;
        border: 1.5px solid var(--border-light, #e2e8f0);
        border-radius: var(--radius-md, 10px);
        font-size: 0.92rem;
        background: var(--bg-card, #fff);
        color: var(--text-primary);
        transition: var(--transition-fast);
      }

      .date-field input:focus {
        outline: none;
        border-color: var(--accent-primary, #6366f1);
        box-shadow: 0 0 0 3px
          var(--accent-primary-light, rgba(99, 102, 241, 0.1));
      }

      .loading {
        text-align: center;
        padding: 40px;
        color: var(--text-secondary, #64748b);
      }

      .summary-cards {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 20px;
        margin-bottom: 32px;
      }

      .card {
        background: var(--bg-card, #fff);
        border-radius: var(--radius-lg, 14px);
        padding: 24px;
        border: 1.5px solid var(--border-light, #e2e8f0);
        box-shadow: var(--shadow-sm);
        transition: var(--transition-fast);
      }

      .card:hover {
        box-shadow: var(--shadow-md);
        transform: translateY(-2px);
      }

      .card h3 {
        margin: 0 0 12px;
        font-size: 0.78rem;
        color: var(--text-secondary, #64748b);
        text-transform: uppercase;
        letter-spacing: 0.05em;
        font-weight: 600;
      }

      .card .big-number {
        font-size: 2.2rem;
        font-weight: 800;
        margin-bottom: 8px;
      }

      .card.purchases .big-number {
        color: #3b82f6;
      }

      .card.sales .big-number {
        color: var(--accent-success, #10b981);
      }

      .card.profit .big-number {
        color: var(--accent-primary, #6366f1);
      }

      .card.profit.negative .big-number {
        color: var(--accent-danger, #ef4444);
      }

      .card .amount {
        font-size: 1.1rem;
        font-weight: 600;
        color: var(--text-primary);
        margin-bottom: 4px;
      }

      .card .avg {
        font-size: 0.85rem;
        color: var(--text-secondary, #94a3b8);
      }

      .daily-breakdown {
        background: var(--bg-card, #fff);
        border-radius: var(--radius-lg, 14px);
        padding: 24px;
        border: 1.5px solid var(--border-light, #e2e8f0);
        box-shadow: var(--shadow-sm);
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
        padding: 12px 14px;
        text-align: left;
        border-bottom: 1px solid var(--border-light, #e2e8f0);
      }

      th {
        background: var(--table-stripe, #f8fafc);
        font-weight: 600;
        font-size: 0.78rem;
        color: var(--text-secondary, #64748b);
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }

      tr:hover {
        background: var(--table-hover, #f1f5f9);
      }

      tr.has-activity {
        background: var(--accent-primary-light, rgba(99, 102, 241, 0.04));
      }

      tr.has-activity:hover {
        background: rgba(99, 102, 241, 0.08);
      }

      td.positive {
        color: var(--accent-success, #10b981);
        font-weight: 600;
      }

      td.negative {
        color: var(--accent-danger, #ef4444);
        font-weight: 600;
      }

      .top-brands {
        background: var(--bg-card, #fff);
        border-radius: var(--radius-lg, 14px);
        padding: 24px;
        border: 1.5px solid var(--border-light, #e2e8f0);
        box-shadow: var(--shadow-sm);
      }

      .brands-list {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }

      .brand-item {
        display: flex;
        align-items: center;
        padding: 14px 16px;
        background: var(--bg-secondary, #f8fafc);
        border-radius: var(--radius-md, 10px);
        border: 1px solid var(--border-light, #e2e8f0);
        transition: var(--transition-fast);
      }

      .brand-item:hover {
        border-color: var(--accent-primary, #6366f1);
        box-shadow: var(--shadow-xs);
      }

      .brand-item .rank {
        width: 30px;
        font-weight: 800;
        color: var(--accent-primary, #6366f1);
      }

      .brand-item .brand-name {
        flex: 1;
        font-weight: 600;
        color: var(--text-primary);
      }

      .brand-item .count {
        margin-right: 20px;
        color: var(--text-secondary, #64748b);
        font-size: 0.88rem;
      }

      .brand-item .revenue {
        font-weight: 700;
        color: var(--accent-primary, #6366f1);
      }

      .no-data {
        text-align: center;
        padding: 60px 20px;
        color: var(--text-secondary, #94a3b8);
      }
    `,
  ],
})
export class StatisticsComponent implements OnInit {
  private translationService = inject(TranslationService);
  get t() {
    return this.translationService.translations();
  }

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
