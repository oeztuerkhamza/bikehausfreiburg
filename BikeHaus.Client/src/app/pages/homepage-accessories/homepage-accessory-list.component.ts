import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HomepageAccessoryService } from '../../services/homepage-accessory.service';
import { TranslationService } from '../../services/translation.service';
import { HomepageAccessory } from '../../models/models';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-homepage-accessory-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1>{{ t.homepageAccessories }}</h1>
          <p class="subtitle">{{ items.length }} {{ t.total }}</p>
        </div>
        <a routerLink="/homepage-accessories/new" class="btn btn-primary">
          + {{ t.homepageAccessoryNew }}
        </a>
      </div>

      <div class="toolbar">
        <div class="search-box">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            [(ngModel)]="searchTerm"
            [placeholder]="t.search"
            (input)="filterItems()"
          />
        </div>
        <select [(ngModel)]="filterCategory" (change)="filterItems()">
          <option value="">{{ t.all }}</option>
          <option *ngFor="let cat of categories" [value]="cat">
            {{ cat }}
          </option>
        </select>
      </div>

      <div *ngIf="loading" class="loading">{{ t.loading }}</div>

      <div *ngIf="!loading && filteredItems.length === 0" class="empty-state">
        <p>{{ t.homepageAccessoryNoItems }}</p>
      </div>

      <div class="grid" *ngIf="!loading && filteredItems.length > 0">
        <div class="card" *ngFor="let item of filteredItems">
          <div class="card-image">
            <img
              *ngIf="item.images.length > 0"
              [src]="getImageUrl(item.images[0].filePath)"
              [alt]="item.titel"
            />
            <div *ngIf="item.images.length === 0" class="no-image">
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
            </div>
            <div class="card-badges">
              <span class="badge badge-category" *ngIf="item.kategorie">{{
                item.kategorie
              }}</span>
              <span
                class="badge"
                [class.badge-active]="item.isActive"
                [class.badge-inactive]="!item.isActive"
              >
                {{ item.isActive ? t.homepageAccessoryActive : t.inactive }}
              </span>
            </div>
            <span class="image-count" *ngIf="item.images.length > 1">
              📷 {{ item.images.length }}
            </span>
          </div>
          <div class="card-body">
            <h3>{{ item.titel }}</h3>
            <div class="card-meta">
              <span *ngIf="item.marke">{{ item.marke }}</span>
            </div>
            <div class="card-price">{{ item.preis | number: '1.2-2' }} €</div>
          </div>
          <div class="card-actions">
            <a
              [routerLink]="['/homepage-accessories/edit', item.id]"
              class="btn btn-outline btn-sm"
            >
              {{ t.edit }}
            </a>
            <button class="btn btn-danger btn-sm" (click)="deleteItem(item)">
              {{ t.delete }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .page {
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
      .page-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
      }
      .page-header h1 {
        font-size: 1.5rem;
        font-weight: 800;
        color: var(--text-primary);
        margin: 0;
      }
      .subtitle {
        font-size: 0.85rem;
        color: var(--text-secondary, #64748b);
        margin: 4px 0 0;
      }
      .toolbar {
        display: flex;
        gap: 12px;
        margin-bottom: 20px;
        flex-wrap: wrap;
      }
      .search-box {
        display: flex;
        align-items: center;
        gap: 8px;
        background: var(--bg-card, #fff);
        border: 1.5px solid var(--border-light, #e2e8f0);
        border-radius: var(--radius-md, 10px);
        padding: 8px 12px;
        flex: 1;
        min-width: 200px;
      }
      .search-box svg {
        color: var(--text-secondary, #64748b);
        flex-shrink: 0;
      }
      .search-box input {
        border: none;
        outline: none;
        background: transparent;
        font-size: 0.9rem;
        color: var(--text-primary);
        width: 100%;
      }
      .toolbar select {
        padding: 8px 12px;
        border: 1.5px solid var(--border-light, #e2e8f0);
        border-radius: var(--radius-md, 10px);
        background: var(--bg-card, #fff);
        color: var(--text-primary);
        font-size: 0.9rem;
      }
      .loading {
        text-align: center;
        padding: 48px;
        color: var(--text-secondary, #64748b);
      }
      .empty-state {
        text-align: center;
        padding: 60px 20px;
        color: var(--text-secondary, #64748b);
      }
      .grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 20px;
      }
      .card {
        background: var(--bg-card, #fff);
        border-radius: var(--radius-lg, 14px);
        border: 1.5px solid var(--border-light, #e2e8f0);
        overflow: hidden;
        transition:
          box-shadow 0.2s,
          transform 0.2s;
      }
      .card:hover {
        box-shadow: var(--shadow-md, 0 4px 12px rgba(0, 0, 0, 0.1));
        transform: translateY(-2px);
      }
      .card-image {
        position: relative;
        height: 200px;
        background: var(--bg-secondary, #f8fafc);
        overflow: hidden;
      }
      .card-image img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .no-image {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
        color: var(--text-secondary, #94a3b8);
      }
      .card-badges {
        position: absolute;
        top: 10px;
        left: 10px;
        display: flex;
        gap: 6px;
        flex-wrap: wrap;
      }
      .badge {
        padding: 3px 10px;
        border-radius: 50px;
        font-size: 0.72rem;
        font-weight: 600;
      }
      .badge-category {
        background: rgba(99, 102, 241, 0.9);
        color: #fff;
      }
      .badge-active {
        background: rgba(16, 185, 129, 0.9);
        color: #fff;
      }
      .badge-inactive {
        background: rgba(239, 68, 68, 0.9);
        color: #fff;
      }
      .image-count {
        position: absolute;
        bottom: 10px;
        right: 10px;
        background: rgba(0, 0, 0, 0.65);
        color: #fff;
        padding: 3px 8px;
        border-radius: 6px;
        font-size: 0.78rem;
        font-weight: 600;
      }
      .card-body {
        padding: 16px;
      }
      .card-body h3 {
        font-size: 1rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 8px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .card-meta {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
        font-size: 0.82rem;
        color: var(--text-secondary, #64748b);
        margin-bottom: 8px;
      }
      .card-price {
        font-size: 1.15rem;
        font-weight: 800;
        color: var(--accent-primary, #6366f1);
      }
      .card-actions {
        display: flex;
        gap: 8px;
        padding: 0 16px 16px;
      }
      .btn {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 8px 16px;
        border-radius: var(--radius-md, 10px);
        font-size: 0.88rem;
        font-weight: 600;
        cursor: pointer;
        border: none;
        transition: all 0.15s;
        text-decoration: none;
      }
      .btn-primary {
        background: var(--accent-primary, #6366f1);
        color: #fff;
      }
      .btn-primary:hover {
        background: var(--accent-primary-hover, #4f46e5);
      }
      .btn-outline {
        background: transparent;
        border: 1.5px solid var(--border-light, #e2e8f0);
        color: var(--text-primary);
      }
      .btn-outline:hover {
        background: var(--bg-secondary, #f8fafc);
      }
      .btn-danger {
        background: var(--accent-danger, #ef4444);
        color: #fff;
      }
      .btn-sm {
        padding: 6px 12px;
        font-size: 0.82rem;
      }
      @media (max-width: 600px) {
        .grid {
          grid-template-columns: 1fr;
        }
        .page-header {
          flex-direction: column;
          align-items: flex-start;
          gap: 12px;
        }
      }
    `,
  ],
})
export class HomepageAccessoryListComponent implements OnInit {
  private translationService = inject(TranslationService);
  private service = inject(HomepageAccessoryService);

  items: HomepageAccessory[] = [];
  filteredItems: HomepageAccessory[] = [];
  categories: string[] = [];
  loading = true;
  searchTerm = '';
  filterCategory = '';

  get t() {
    return this.translationService.translations();
  }

  ngOnInit() {
    this.loadItems();
  }

  loadItems() {
    this.loading = true;
    this.service.getAll().subscribe({
      next: (items) => {
        this.items = items;
        this.categories = [
          ...new Set(items.map((i) => i.kategorie).filter(Boolean) as string[]),
        ].sort();
        this.filterItems();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  filterItems() {
    let result = this.items;
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(
        (i) =>
          i.titel.toLowerCase().includes(term) ||
          i.marke?.toLowerCase().includes(term) ||
          i.beschreibung?.toLowerCase().includes(term),
      );
    }
    if (this.filterCategory) {
      result = result.filter((i) => i.kategorie === this.filterCategory);
    }
    this.filteredItems = result;
  }

  getImageUrl(path: string): string {
    if (environment.production) {
      return path;
    }
    return `${environment.apiUrl.replace('/api', '')}${path}`;
  }

  deleteItem(item: HomepageAccessory) {
    if (!confirm(this.t.homepageAccessoryDeleteConfirm)) return;
    this.service.delete(item.id).subscribe({
      next: () => {
        this.items = this.items.filter((i) => i.id !== item.id);
        this.filterItems();
      },
    });
  }
}
