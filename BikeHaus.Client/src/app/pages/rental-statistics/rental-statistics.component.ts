import { Component, OnInit, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  RentalStatisticsService,
  RentalStatistics,
} from '../../services/rental-statistics.service';
import { TranslationService } from '../../services/translation.service';

type PeriodType = 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom';

@Component({
  selector: 'app-rental-statistics',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="rental-stats-page">
      <h1>{{ t.rentalStatistics }}</h1>

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
            (change)="loadCustom()"
          />
        </div>
        <div class="date-field">
          <label>{{ t.to }}:</label>
          <input type="date" [(ngModel)]="customEndDate" (change)="loadCustom()" />
        </div>
      </div>

      <!-- Loading -->
      <div class="loading" *ngIf="loading()">
        <p>{{ t.loadingStatistics }}</p>
      </div>

      <!-- Content -->
      <div class="stats-content" *ngIf="!loading() && stats() as s">
        <!-- Summary Cards -->
        <div class="summary-cards">
          <div class="card total-days">
            <h3>{{ t.totalRentalDays }}</h3>
            <div class="big-number">{{ s.totalRentalDays }}</div>
            <div class="avg">{{ t.rentalDaysUnit }}</div>
          </div>
          <div class="card bikes">
            <h3>{{ t.rentedBikesCount }}</h3>
            <div class="big-number">{{ s.rentedBikeCount }}</div>
          </div>
          <div class="card contracts">
            <h3>{{ t.rentals }}</h3>
            <div class="big-number">{{ s.rentalContractCount }}</div>
            <div class="avg">{{ t.newRentals }}</div>
          </div>
          <div class="card revenue">
            <h3>{{ t.rentalRevenue }}</h3>
            <div class="big-number">{{ s.totalRevenue | currency: 'EUR' }}</div>
          </div>
        </div>

        <!-- Day-by-day chart -->
        <div class="chart-card" *ngIf="s.dailyBreakdown.length > 0">
          <div class="chart-header">
            <h2>{{ t.dailyOverview }}</h2>
            <div class="legend">
              <span class="legend-item">
                <span class="swatch bikes"></span>{{ t.rentedBikesCount }}
              </span>
              <span class="legend-item">
                <span class="swatch revenue"></span>{{ t.rentalRevenue }}
              </span>
            </div>
          </div>

          <div class="chart-scroll">
            <div class="chart" [style.min-width.px]="s.dailyBreakdown.length * 34">
              <div
                class="chart-col"
                *ngFor="let day of s.dailyBreakdown"
                [title]="tooltip(day)"
              >
                <div class="bars">
                  <div
                    class="bar bikes"
                    [style.height.%]="pct(day.rentedBikeCount, maxBikes())"
                  >
                    <span class="bar-value" *ngIf="day.rentedBikeCount > 0">{{
                      day.rentedBikeCount
                    }}</span>
                  </div>
                  <div
                    class="bar revenue"
                    [style.height.%]="pct(day.revenue, maxRevenue())"
                  ></div>
                </div>
                <div class="x-label">{{ shortDate(day.date) }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Detail Table -->
        <div class="daily-table" *ngIf="s.dailyBreakdown.length > 0">
          <div class="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>{{ t.date }}</th>
                  <th>{{ t.rentedBikesCount }}</th>
                  <th>{{ t.newRentals }}</th>
                  <th>{{ t.rentalRevenue }}</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  *ngFor="let day of s.dailyBreakdown"
                  [class.has-activity]="day.rentedBikeCount > 0"
                >
                  <td>{{ formatDate(day.date) }}</td>
                  <td>{{ day.rentedBikeCount }}</td>
                  <td>{{ day.newRentalCount }}</td>
                  <td [class.positive]="day.revenue > 0">
                    {{ day.revenue | currency: 'EUR' }}
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td>{{ t.totalRentalDays }}</td>
                  <td>{{ s.totalRentalDays }}</td>
                  <td>{{ s.rentalContractCount }}</td>
                  <td>{{ s.totalRevenue | currency: 'EUR' }}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <!-- Top Bikes -->
        <div class="top-bikes" *ngIf="s.topBikes.length > 0">
          <h2>{{ t.topRentedBikes }}</h2>
          <div class="bikes-list">
            <div
              class="bike-item"
              *ngFor="let bike of s.topBikes; let i = index"
            >
              <span class="rank">{{ i + 1 }}.</span>
              <span class="bike-name">{{ bike.bike }}</span>
              <span class="days"
                >{{ bike.rentalDays }} {{ t.rentalDaysUnit }}</span
              >
              <span class="revenue">{{ bike.revenue | currency: 'EUR' }}</span>
            </div>
          </div>
        </div>

        <!-- No rentals in range -->
        <div
          class="no-data"
          *ngIf="s.totalRentalDays === 0 && s.rentedBikeCount === 0"
        >
          <p>{{ t.noData }}</p>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .rental-stats-page {
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
        margin: 0 0 16px;
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
        grid-template-columns: repeat(4, 1fr);
        gap: 12px;
        margin-bottom: 24px;
      }

      .card {
        background: var(--bg-card, #fff);
        border-radius: var(--radius-md, 10px);
        padding: 16px;
        border: 1.5px solid var(--border-light, #e2e8f0);
        box-shadow: var(--shadow-sm);
        transition: var(--transition-fast);
      }

      .card:hover {
        box-shadow: var(--shadow-md);
        transform: translateY(-2px);
      }

      .card h3 {
        margin: 0 0 8px;
        font-size: 0.7rem;
        color: var(--text-secondary, #64748b);
        text-transform: uppercase;
        letter-spacing: 0.05em;
        font-weight: 600;
      }

      .card .big-number {
        font-size: 1.6rem;
        font-weight: 800;
        margin-bottom: 4px;
      }

      .card.total-days .big-number {
        color: var(--accent-primary, #6366f1);
      }
      .card.bikes .big-number {
        color: #3b82f6;
      }
      .card.contracts .big-number {
        color: #0ea5e9;
      }
      .card.revenue .big-number {
        color: var(--accent-success, #10b981);
      }

      .card .avg {
        font-size: 0.75rem;
        color: var(--text-secondary, #94a3b8);
      }

      @media (max-width: 640px) {
        .summary-cards {
          grid-template-columns: repeat(2, 1fr);
        }
      }

      /* Chart */
      .chart-card,
      .daily-table,
      .top-bikes {
        background: var(--bg-card, #fff);
        border-radius: var(--radius-lg, 14px);
        padding: 24px;
        border: 1.5px solid var(--border-light, #e2e8f0);
        box-shadow: var(--shadow-sm);
        margin-bottom: 24px;
      }

      .chart-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 12px;
      }

      .legend {
        display: flex;
        gap: 16px;
      }

      .legend-item {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 0.8rem;
        color: var(--text-secondary, #64748b);
        font-weight: 600;
      }

      .swatch {
        width: 12px;
        height: 12px;
        border-radius: 3px;
        display: inline-block;
      }
      .swatch.bikes {
        background: var(--accent-primary, #6366f1);
      }
      .swatch.revenue {
        background: var(--accent-success, #10b981);
      }

      .chart-scroll {
        overflow-x: auto;
        margin-top: 16px;
        padding-bottom: 8px;
      }

      .chart {
        display: flex;
        align-items: flex-end;
        gap: 6px;
        height: 220px;
      }

      .chart-col {
        flex: 1;
        min-width: 24px;
        display: flex;
        flex-direction: column;
        align-items: center;
        height: 100%;
      }

      .bars {
        flex: 1;
        display: flex;
        align-items: flex-end;
        justify-content: center;
        gap: 3px;
        width: 100%;
      }

      .bar {
        width: 10px;
        border-radius: 4px 4px 0 0;
        position: relative;
        min-height: 2px;
        transition: height 0.35s ease;
      }
      .bar.bikes {
        background: var(--accent-primary, #6366f1);
      }
      .bar.revenue {
        background: var(--accent-success, #10b981);
      }

      .bar-value {
        position: absolute;
        top: -16px;
        left: 50%;
        transform: translateX(-50%);
        font-size: 0.65rem;
        font-weight: 700;
        color: var(--text-secondary, #64748b);
      }

      .x-label {
        margin-top: 6px;
        font-size: 0.62rem;
        color: var(--text-secondary, #94a3b8);
        white-space: nowrap;
      }

      /* Table */
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

      tbody tr:hover {
        background: var(--table-hover, #f1f5f9);
      }

      tr.has-activity {
        background: var(--accent-primary-light, rgba(99, 102, 241, 0.04));
      }

      td.positive {
        color: var(--accent-success, #10b981);
        font-weight: 600;
      }

      tfoot td {
        font-weight: 800;
        color: var(--text-primary);
        border-top: 2px solid var(--border-light, #e2e8f0);
        background: var(--bg-secondary, #f8fafc);
      }

      /* Top bikes */
      .bikes-list {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }

      .bike-item {
        display: flex;
        align-items: center;
        padding: 14px 16px;
        background: var(--bg-secondary, #f8fafc);
        border-radius: var(--radius-md, 10px);
        border: 1px solid var(--border-light, #e2e8f0);
      }

      .bike-item .rank {
        width: 30px;
        font-weight: 800;
        color: var(--accent-primary, #6366f1);
      }

      .bike-item .bike-name {
        flex: 1;
        font-weight: 600;
        color: var(--text-primary);
      }

      .bike-item .days {
        margin-right: 20px;
        color: var(--text-secondary, #64748b);
        font-size: 0.88rem;
      }

      .bike-item .revenue {
        font-weight: 700;
        color: var(--accent-success, #10b981);
      }

      .no-data {
        text-align: center;
        padding: 40px 20px;
        color: var(--text-secondary, #94a3b8);
      }
    `,
  ],
})
export class RentalStatisticsComponent implements OnInit {
  private translationService = inject(TranslationService);
  private rentalStatisticsService = inject(RentalStatisticsService);

  get t() {
    return this.translationService.translations();
  }

  selectedPeriod: PeriodType = 'month';
  customStartDate = '';
  customEndDate = '';
  stats = signal<RentalStatistics | null>(null);
  loading = signal(false);

  maxBikes = computed(() =>
    Math.max(1, ...(this.stats()?.dailyBreakdown ?? []).map((d) => d.rentedBikeCount)),
  );
  maxRevenue = computed(() =>
    Math.max(1, ...(this.stats()?.dailyBreakdown ?? []).map((d) => d.revenue)),
  );

  ngOnInit() {
    const today = new Date();
    this.customEndDate = today.toISOString().split('T')[0];
    this.customStartDate = new Date(today.getFullYear(), today.getMonth(), 1)
      .toISOString()
      .split('T')[0];
    this.selectPeriod('month');
  }

  selectPeriod(period: PeriodType) {
    this.selectedPeriod = period;
    if (period === 'custom') {
      this.loadCustom();
      return;
    }
    const { start, end } = this.rangeForPeriod(period);
    this.load(start, end);
  }

  loadCustom() {
    if (!this.customStartDate || !this.customEndDate) return;
    this.load(new Date(this.customStartDate), new Date(this.customEndDate));
  }

  private rangeForPeriod(period: PeriodType): { start: Date; end: Date } {
    const today = new Date();
    const end = today;
    let start: Date;
    switch (period) {
      case 'today':
        start = today;
        break;
      case 'week': {
        const diff = (today.getDay() + 6) % 7; // Monday = 0
        start = new Date(today);
        start.setDate(today.getDate() - diff);
        break;
      }
      case 'month':
        start = new Date(today.getFullYear(), today.getMonth(), 1);
        break;
      case 'quarter': {
        const q = Math.floor(today.getMonth() / 3);
        start = new Date(today.getFullYear(), q * 3, 1);
        break;
      }
      case 'year':
        start = new Date(today.getFullYear(), 0, 1);
        break;
      default:
        start = new Date(today.getFullYear(), today.getMonth(), 1);
    }
    return { start, end };
  }

  private load(start: Date, end: Date) {
    this.loading.set(true);
    this.stats.set(null);
    this.rentalStatisticsService.getRentalStatistics(start, end).subscribe({
      next: (data) => {
        this.stats.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  pct(value: number, max: number): number {
    return max > 0 ? (value / max) * 100 : 0;
  }

  shortDate(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('de-DE', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  tooltip(day: {
    date: string;
    rentedBikeCount: number;
    revenue: number;
  }): string {
    const rev = day.revenue.toLocaleString('de-DE', {
      style: 'currency',
      currency: 'EUR',
    });
    return `${this.formatDate(day.date)}\n${this.t.rentedBikesCount}: ${day.rentedBikeCount}\n${this.t.rentalRevenue}: ${rev}`;
  }
}
