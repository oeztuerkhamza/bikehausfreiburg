import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="pagination-container">
      <div class="pagination-info">
        <span class="total-badge">{{ totalCount }}</span>
        <span>Einträge</span>
        <span class="dot">·</span>
        <span>Seite <strong>{{ currentPage }}</strong> von <strong>{{ totalPages }}</strong></span>
      </div>

      <div class="pagination-controls">
        <select
          [(ngModel)]="pageSize"
          (ngModelChange)="onPageSizeChange($event)"
          class="page-size-select"
        >
          <option [value]="15">15 / Seite</option>
          <option [value]="20">20 / Seite</option>
          <option [value]="30">30 / Seite</option>
          <option [value]="50">50 / Seite</option>
          <option [value]="100">100 / Seite</option>
          <option [value]="1000">1000 / Seite</option>
        </select>

        <div class="page-buttons">
          <button
            class="page-btn"
            [disabled]="!hasPrevious"
            (click)="goToPage(1)"
            title="Erste Seite"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="11 17 6 12 11 7"/><polyline points="18 17 13 12 18 7"/></svg>
          </button>
          <button
            class="page-btn"
            [disabled]="!hasPrevious"
            (click)="goToPage(currentPage - 1)"
            title="Vorherige"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
          </button>

          <span class="page-number">{{ currentPage }}</span>

          <button
            class="page-btn"
            [disabled]="!hasNext"
            (click)="goToPage(currentPage + 1)"
            title="Nächste"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
          <button
            class="page-btn"
            [disabled]="!hasNext"
            (click)="goToPage(totalPages)"
            title="Letzte Seite"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="13 17 18 12 13 7"/><polyline points="6 17 11 12 6 7"/></svg>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .pagination-container {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 14px 0;
        margin-top: 16px;
        border-top: 1px solid var(--border-light, #f1f5f9);
        flex-wrap: wrap;
        gap: 12px;
      }

      .pagination-info {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 0.84rem;
        color: var(--text-secondary, #64748b);
      }
      .pagination-info strong {
        color: var(--text-primary);
        font-weight: 700;
      }

      .total-badge {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 28px;
        padding: 2px 8px;
        background: var(--accent-primary-light, rgba(99,102,241,0.08));
        color: var(--accent-primary, #6366f1);
        border-radius: 8px;
        font-size: 0.8rem;
        font-weight: 700;
        font-variant-numeric: tabular-nums;
      }

      .dot {
        color: var(--text-muted, #94a3b8);
      }

      .pagination-controls {
        display: flex;
        align-items: center;
        gap: 14px;
      }

      .page-size-select {
        padding: 7px 12px;
        padding-right: 28px;
        border: 1.5px solid var(--border-color, #e2e8f0);
        border-radius: var(--radius-md, 10px);
        background: var(--bg-card, #fff);
        color: var(--text-primary, #1e293b);
        font-size: 0.82rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.15s;
        appearance: none;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
        background-repeat: no-repeat;
        background-position: right 10px center;
      }
      .page-size-select:focus {
        outline: none;
        border-color: var(--accent-primary, #6366f1);
        box-shadow: 0 0 0 3px var(--accent-primary-light, rgba(99,102,241,0.08));
      }

      .page-buttons {
        display: flex;
        align-items: center;
        gap: 4px;
      }

      .page-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 34px;
        height: 34px;
        border: 1.5px solid var(--border-color, #e2e8f0);
        border-radius: var(--radius-md, 10px);
        background: var(--bg-card, #fff);
        color: var(--text-secondary, #64748b);
        cursor: pointer;
        transition: all 0.15s;
      }
      .page-btn:hover:not(:disabled) {
        background: var(--accent-primary, #6366f1);
        color: #fff;
        border-color: var(--accent-primary, #6366f1);
        transform: translateY(-1px);
        box-shadow: 0 2px 8px rgba(99,102,241,0.25);
      }
      .page-btn:active:not(:disabled) {
        transform: translateY(0);
      }
      .page-btn:disabled {
        opacity: 0.35;
        cursor: not-allowed;
      }

      .page-number {
        display: flex;
        align-items: center;
        justify-content: center;
        min-width: 34px;
        height: 34px;
        background: var(--accent-primary, #6366f1);
        color: #fff;
        border-radius: var(--radius-md, 10px);
        font-size: 0.82rem;
        font-weight: 700;
        box-shadow: 0 2px 8px rgba(99,102,241,0.25);
      }

      @media (max-width: 600px) {
        .pagination-container {
          flex-direction: column;
          align-items: stretch;
        }
        .pagination-controls {
          justify-content: space-between;
        }
      }
    `,
  ],
})
export class PaginationComponent {
  @Input() currentPage = 1;
  @Input() pageSize = 20;
  @Input() totalCount = 0;
  @Input() totalPages = 1;
  @Input() hasPrevious = false;
  @Input() hasNext = false;

  @Output() pageChange = new EventEmitter<number>();
  @Output() pageSizeChange = new EventEmitter<number>();

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.pageChange.emit(page);
    }
  }

  onPageSizeChange(size: number) {
    this.pageSizeChange.emit(+size);
  }
}
