import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KleinanzeigenCategory } from '../../models/models';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-category-filter',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Sidebar version (default) -->
    <nav
      class="sidebar-filter"
      [class.horizontal]="horizontal"
      role="navigation"
      [attr.aria-label]="t().filterByCategory"
    >
      <h3 class="filter-heading" *ngIf="!horizontal">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
        </svg>
        {{ t().filterByCategory }}
      </h3>

      <ul class="cat-list">
        <li>
          <button
            class="cat-item"
            [class.active]="!selectedCategory"
            (click)="onSelect(null)"
          >
            <span class="cat-icon" [innerHTML]="getCategoryIcon(null)"></span>
            <span class="cat-name">{{ t().allCategories }}</span>
            <span class="cat-count">{{ totalCount }}</span>
          </button>
        </li>
        <li *ngFor="let cat of categories">
          <button
            class="cat-item"
            [class.active]="selectedCategory === cat.name"
            (click)="onSelect(cat.name)"
          >
            <span
              class="cat-icon"
              [innerHTML]="getCategoryIcon(cat.name)"
            ></span>
            <span class="cat-name">{{ cat.name }}</span>
            <span class="cat-count">{{ cat.count }}</span>
          </button>
        </li>
      </ul>
    </nav>
  `,
  styles: [
    `
      .sidebar-filter {
        width: 100%;
      }

      .filter-heading {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.78rem;
        font-weight: 700;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        color: var(--color-text-muted);
        margin-bottom: 0.75rem;
        padding: 0 0.25rem;
      }

      .filter-heading svg {
        opacity: 0.6;
      }

      .cat-list {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .cat-item {
        display: flex;
        align-items: center;
        gap: 0.65rem;
        width: 100%;
        padding: 0.6rem 0.75rem;
        border: none;
        border-radius: 10px;
        background: transparent;
        color: var(--color-text-secondary);
        font-family: var(--font-family);
        font-size: 0.88rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
        text-align: left;
      }

      .cat-item:hover {
        background: var(--color-surface);
        color: var(--color-text);
      }

      .cat-item.active {
        background: var(--color-accent-subtle);
        color: var(--color-accent);
        font-weight: 600;
      }

      .cat-icon {
        flex-shrink: 0;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0.7;
      }

      .cat-item.active .cat-icon {
        opacity: 1;
      }

      .cat-name {
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .cat-count {
        font-size: 0.75rem;
        font-weight: 600;
        color: var(--color-text-muted);
        background: var(--color-surface);
        padding: 0.15rem 0.5rem;
        border-radius: 50px;
        min-width: 26px;
        text-align: center;
      }

      .cat-item.active .cat-count {
        background: rgba(255, 87, 34, 0.15);
        color: var(--color-accent);
      }

      /* Horizontal mode (mobile) */
      .horizontal .cat-list {
        flex-direction: row;
        gap: 0.4rem;
        overflow-x: auto;
        padding-bottom: 0.25rem;
        scrollbar-width: none;
      }

      .horizontal .cat-list::-webkit-scrollbar {
        display: none;
      }

      .horizontal .cat-item {
        white-space: nowrap;
        padding: 0.5rem 0.9rem;
        border-radius: 50px;
        gap: 0.4rem;
        border: 1px solid var(--color-border);
      }

      .horizontal .cat-item:hover {
        border-color: var(--color-text-secondary);
      }

      .horizontal .cat-item.active {
        background: var(--color-accent);
        border-color: var(--color-accent);
        color: #fff;
      }

      .horizontal .cat-item.active .cat-count {
        background: rgba(255, 255, 255, 0.2);
        color: #fff;
      }

      .horizontal .cat-icon {
        display: none;
      }
    `,
  ],
})
export class CategoryFilterComponent {
  @Input() categories: KleinanzeigenCategory[] = [];
  @Input() selectedCategory: string | null = null;
  @Input() horizontal = false;
  @Output() categoryChange = new EventEmitter<string | null>();

  private translationService = inject(TranslationService);
  t = this.translationService.translations;

  get totalCount(): number {
    return this.categories.reduce((sum, c) => sum + c.count, 0);
  }

  onSelect(category: string | null): void {
    this.categoryChange.emit(category);
  }

  getCategoryIcon(category: string | null): string {
    if (!category) {
      // "All" icon — grid
      return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>';
    }
    const c = category.toLowerCase();
    if (c.includes('herren')) {
      return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="5" cy="18" r="3"/><circle cx="19" cy="18" r="3"/><path d="M5 18l4-10h3l4 10"/><path d="M12 8V5"/><path d="M9 8h6"/></svg>';
    }
    if (c.includes('damen')) {
      return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="5" cy="18" r="3"/><circle cx="19" cy="18" r="3"/><path d="M5 18l7-10l7 10"/><path d="M8 14h8"/></svg>';
    }
    if (
      c.includes('e-bike') ||
      c.includes('elektro') ||
      c.includes('pedelec')
    ) {
      return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="5" cy="17" r="3"/><circle cx="19" cy="17" r="3"/><path d="M5 17l4-9h3l4 9"/><path d="M13 8l-1-4"/><path d="M11 12l2-1"/><path d="M15 5l-2 1 2 1"/></svg>';
    }
    if (c.includes('mountain') || c.includes('mtb')) {
      return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="5" cy="18" r="3"/><circle cx="19" cy="18" r="3"/><path d="M5 18l5-11h4l5 11"/><path d="M3 21l6-8 3 4 4-6 5 10"/></svg>';
    }
    if (c.includes('renn') || c.includes('road') || c.includes('rennr')) {
      return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="5" cy="17" r="3"/><circle cx="19" cy="17" r="3"/><path d="M5 17l5-10h4l5 10"/><path d="M10 7l3-2h3"/></svg>';
    }
    if (c.includes('kinder') || c.includes('jugend')) {
      return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="6" cy="17" r="2.5"/><circle cx="18" cy="17" r="2.5"/><path d="M6 17l3-7h3l3 7"/><path d="M12 10V7"/><path d="M9 10h6"/></svg>';
    }
    if (c.includes('city') || c.includes('urban') || c.includes('cityr')) {
      return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="5" cy="18" r="3"/><circle cx="19" cy="18" r="3"/><path d="M5 18l5-10h4l5 10"/><path d="M8 14h8"/><path d="M12 8V5h2"/></svg>';
    }
    if (c.includes('bmx')) {
      return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="6" cy="17" r="3"/><circle cx="18" cy="17" r="3"/><path d="M6 17l6-9l6 9"/><path d="M12 8V4"/></svg>';
    }
    if (c.includes('lasten') || c.includes('cargo')) {
      return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="5" cy="18" r="3"/><circle cx="19" cy="18" r="3"/><rect x="7" y="10" width="6" height="5" rx="1"/><path d="M13 14l6 4"/><path d="M5 18l2-8"/></svg>';
    }
    if (c.includes('falt') || c.includes('klapp') || c.includes('fold')) {
      return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="6" cy="17" r="2.5"/><circle cx="18" cy="17" r="2.5"/><path d="M6 17l6-10M18 17l-6-10"/><path d="M9 12h6"/></svg>';
    }
    if (c.includes('trekking') || c.includes('touring')) {
      return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="5" cy="18" r="3"/><circle cx="19" cy="18" r="3"/><path d="M5 18l5-10h4l5 10"/><path d="M7 14h10"/><path d="M10 8l2-4 2 4"/></svg>';
    }
    if (c.includes('zubeh') || c.includes('access')) {
      return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="3"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>';
    }
    // Default bike icon
    return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="18.5" cy="17.5" r="3.5"/><path d="M15 6l-4 8h6l-2 3.5"/><path d="M5.5 17.5L9 9h3"/></svg>';
  }
}
