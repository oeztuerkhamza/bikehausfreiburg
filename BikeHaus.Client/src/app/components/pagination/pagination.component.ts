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
        <span>{{ totalCount }} Einträge</span>
        <span class="separator">|</span>
        <span>Seite {{ currentPage }} von {{ totalPages }}</span>
      </div>

      <div class="pagination-controls">
        <select
          [(ngModel)]="pageSize"
          (ngModelChange)="onPageSizeChange($event)"
          class="page-size-select"
        >
          <option [value]="15">15</option>
          <option [value]="20">20</option>
          <option [value]="30">30</option>
          <option [value]="50">50</option>
          <option [value]="100">100</option>
          <option [value]="1000">1000</option>
        </select>

        <div class="page-buttons">
          <button
            class="page-btn"
            [disabled]="!hasPrevious"
            (click)="goToPage(1)"
            title="Erste Seite"
          >
            ⟨⟨
          </button>
          <button
            class="page-btn"
            [disabled]="!hasPrevious"
            (click)="goToPage(currentPage - 1)"
            title="Vorherige"
          >
            ⟨
          </button>

          <span class="page-number">{{ currentPage }}</span>

          <button
            class="page-btn"
            [disabled]="!hasNext"
            (click)="goToPage(currentPage + 1)"
            title="Nächste"
          >
            ⟩
          </button>
          <button
            class="page-btn"
            [disabled]="!hasNext"
            (click)="goToPage(totalPages)"
            title="Letzte Seite"
          >
            ⟩⟩
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
        padding: 12px 0;
        margin-top: 16px;
        border-top: 1px solid var(--border-color, #eee);
        flex-wrap: wrap;
        gap: 12px;
      }

      .pagination-info {
        font-size: 0.85rem;
        color: var(--text-secondary, #666);
      }

      .separator {
        margin: 0 8px;
        opacity: 0.5;
      }

      .pagination-controls {
        display: flex;
        align-items: center;
        gap: 16px;
      }

      .page-size-select {
        padding: 6px 10px;
        border: 1px solid var(--border-color, #ddd);
        border-radius: 6px;
        background: var(--bg-input, #fff);
        color: var(--text-primary, #333);
        font-size: 0.85rem;
        cursor: pointer;
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
        width: 32px;
        height: 32px;
        border: 1px solid var(--border-color, #ddd);
        border-radius: 6px;
        background: var(--bg-input, #fff);
        color: var(--text-primary, #333);
        cursor: pointer;
        font-size: 0.85rem;
        transition: all 0.2s;
      }

      .page-btn:hover:not(:disabled) {
        background: var(--accent-primary, #4361ee);
        color: white;
        border-color: var(--accent-primary, #4361ee);
      }

      .page-btn:disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }

      .page-number {
        min-width: 32px;
        text-align: center;
        font-weight: 600;
        color: var(--accent-primary, #4361ee);
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
