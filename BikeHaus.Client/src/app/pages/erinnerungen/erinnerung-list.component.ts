import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ErinnerungService } from '../../services/erinnerung.service';
import { NotificationService } from '../../services/notification.service';
import { DialogService } from '../../services/dialog.service';
import { TranslationService } from '../../services/translation.service';
import { environment } from '../../../environments/environment';
import { Erinnerung } from '../../models/models';

@Component({
  selector: 'app-erinnerung-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1>Erinnerungsecke</h1>
          <p class="subtitle">{{ items.length }} {{ t.total }}</p>
        </div>
      </div>

      <div class="filter-bar">
        <button
          class="filter-btn"
          [class.active]="filterStatus === ''"
          (click)="setFilter('')"
        >
          Alle
        </button>
        <button
          class="filter-btn"
          [class.active]="filterStatus === 'pending'"
          (click)="setFilter('pending')"
        >
          Ausstehend
          <span class="badge-count" *ngIf="pendingCount > 0">{{
            pendingCount
          }}</span>
        </button>
        <button
          class="filter-btn"
          [class.active]="filterStatus === 'approved'"
          (click)="setFilter('approved')"
        >
          Freigegeben
        </button>
      </div>

      <div *ngIf="loading" class="loading">{{ t.loading }}</div>

      <div *ngIf="!loading && filtered.length === 0" class="empty-state">
        <p>Keine Erinnerungen.</p>
      </div>

      <div class="mem-grid" *ngIf="!loading && filtered.length > 0">
        <div
          class="mem-card"
          *ngFor="let m of filtered"
          [class.approved]="m.onaylandi"
          [class.pending]="!m.onaylandi"
        >
          <div class="mem-photos" *ngIf="m.fotos.length > 0">
            <a
              *ngFor="let f of m.fotos"
              [href]="getImageUrl(f.filePath)"
              target="_blank"
              rel="noopener"
              class="mem-thumb"
            >
              <img [src]="getImageUrl(f.filePath)" [alt]="m.ad" loading="lazy" />
            </a>
          </div>

          <div class="mem-body">
            <div class="mem-head">
              <div>
                <strong class="mem-name">{{ m.ad }}</strong>
                <span class="mem-ort">📍 {{ m.ort }}</span>
              </div>
              <span
                class="status-badge"
                [class.badge-approved]="m.onaylandi"
                [class.badge-pending]="!m.onaylandi"
              >
                {{ m.onaylandi ? 'Freigegeben' : 'Ausstehend' }}
              </span>
            </div>

            <p class="mem-story">{{ m.geschichte }}</p>

            <label class="admin-note">
              <span>Admin-Notiz</span>
              <input
                type="text"
                [(ngModel)]="m.adminNotiz"
                placeholder="optional"
              />
            </label>

            <div class="mem-footer">
              <span class="mem-date">{{
                m.createdAt | date: 'dd.MM.yyyy HH:mm'
              }}</span>
              <div class="mem-actions">
                <button
                  *ngIf="!m.onaylandi"
                  class="btn btn-approve"
                  (click)="approve(m)"
                  [disabled]="saving === m.id"
                >
                  {{ saving === m.id ? t.saving : 'Freigeben' }}
                </button>
                <button
                  *ngIf="m.onaylandi"
                  class="btn btn-reject"
                  (click)="reject(m)"
                  [disabled]="saving === m.id"
                >
                  {{ saving === m.id ? t.saving : 'Zurückziehen' }}
                </button>
                <button
                  class="btn btn-delete"
                  (click)="deleteItem(m)"
                  [disabled]="saving === m.id"
                >
                  {{ t.delete }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .page {
        max-width: 1000px;
        margin: 0 auto;
        animation: fadeIn 0.3s ease;
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
        margin-bottom: 20px;
      }
      .page-header h1 {
        font-size: 1.5rem;
        font-weight: 800;
        margin: 0;
      }
      .subtitle {
        font-size: 0.85rem;
        color: var(--text-secondary, #64748b);
        margin: 4px 0 0;
      }
      .filter-bar {
        display: flex;
        gap: 8px;
        margin-bottom: 20px;
        flex-wrap: wrap;
      }
      .filter-btn {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 7px 16px;
        border-radius: 50px;
        border: 1.5px solid var(--border-light, #e2e8f0);
        background: var(--bg-card, #fff);
        color: var(--text-secondary, #64748b);
        font-size: 0.88rem;
        font-weight: 600;
        cursor: pointer;
      }
      .filter-btn.active {
        background: var(--accent-primary, #6366f1);
        color: #fff;
        border-color: var(--accent-primary, #6366f1);
      }
      .badge-count {
        background: #ef4444;
        color: #fff;
        border-radius: 50px;
        font-size: 0.72rem;
        font-weight: 700;
        padding: 1px 7px;
      }
      .loading,
      .empty-state {
        text-align: center;
        padding: 48px;
        color: var(--text-secondary, #64748b);
      }
      .mem-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
        gap: 16px;
      }
      .mem-card {
        border-radius: 14px;
        border: 1.5px solid var(--border-light, #e2e8f0);
        background: var(--bg-card, #fff);
        overflow: hidden;
        display: flex;
        flex-direction: column;
      }
      .mem-card.pending {
        border-color: #f59e0b;
      }
      .mem-photos {
        display: flex;
        gap: 4px;
        padding: 8px;
        overflow-x: auto;
        background: #f1f5f9;
      }
      .mem-thumb {
        flex: 0 0 auto;
      }
      .mem-thumb img {
        width: 96px;
        height: 72px;
        object-fit: cover;
        border-radius: 6px;
        display: block;
      }
      .mem-body {
        padding: 14px 16px 16px;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .mem-head {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 8px;
      }
      .mem-name {
        display: block;
        font-size: 1rem;
      }
      .mem-ort {
        font-size: 0.82rem;
        color: var(--text-secondary, #64748b);
      }
      .status-badge {
        font-size: 0.72rem;
        font-weight: 700;
        padding: 3px 10px;
        border-radius: 50px;
        white-space: nowrap;
      }
      .badge-approved {
        background: rgba(16, 185, 129, 0.14);
        color: #059669;
      }
      .badge-pending {
        background: rgba(245, 158, 11, 0.16);
        color: #d97706;
      }
      .mem-story {
        font-size: 0.9rem;
        line-height: 1.5;
        margin: 0;
      }
      .admin-note {
        display: flex;
        flex-direction: column;
        gap: 3px;
        font-size: 0.78rem;
        color: var(--text-secondary, #64748b);
      }
      .admin-note input {
        padding: 7px 10px;
        border-radius: 8px;
        border: 1.5px solid var(--border-light, #e2e8f0);
        font-size: 0.85rem;
        background: var(--bg-input, #fff);
        color: inherit;
      }
      .mem-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
      }
      .mem-date {
        font-size: 0.75rem;
        color: var(--text-secondary, #94a3b8);
      }
      .mem-actions {
        display: flex;
        gap: 6px;
      }
      .btn {
        padding: 7px 14px;
        border-radius: 8px;
        border: none;
        font-size: 0.82rem;
        font-weight: 600;
        cursor: pointer;
      }
      .btn:disabled {
        opacity: 0.6;
        cursor: default;
      }
      .btn-approve {
        background: rgba(16, 185, 129, 0.12);
        color: #059669;
      }
      .btn-reject {
        background: rgba(245, 158, 11, 0.12);
        color: #d97706;
      }
      .btn-delete {
        background: rgba(239, 68, 68, 0.1);
        color: #dc2626;
      }
    `,
  ],
})
export class ErinnerungListComponent implements OnInit {
  private service = inject(ErinnerungService);
  private notification = inject(NotificationService);
  private dialog = inject(DialogService);
  private translationService = inject(TranslationService);

  get t() {
    return this.translationService.translations();
  }

  items: Erinnerung[] = [];
  filtered: Erinnerung[] = [];
  filterStatus = '';
  loading = true;
  saving: number | null = null;

  get pendingCount() {
    return this.items.filter((m) => !m.onaylandi).length;
  }

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading = true;
    this.service.getAll().subscribe({
      next: (items) => {
        this.items = items;
        this.applyFilter();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  setFilter(status: string) {
    this.filterStatus = status;
    this.applyFilter();
  }

  applyFilter() {
    if (this.filterStatus === 'pending') {
      this.filtered = this.items.filter((m) => !m.onaylandi);
    } else if (this.filterStatus === 'approved') {
      this.filtered = this.items.filter((m) => m.onaylandi);
    } else {
      this.filtered = [...this.items];
    }
  }

  approve(m: Erinnerung) {
    this.saving = m.id;
    this.service
      .approve(m.id, { onaylandi: true, adminNotiz: m.adminNotiz })
      .subscribe({
        next: (updated) => {
          Object.assign(m, updated);
          this.applyFilter();
          this.saving = null;
          this.notification.success(this.t.saveSuccess);
        },
        error: () => {
          this.saving = null;
          this.notification.error(this.t.saveError);
        },
      });
  }

  reject(m: Erinnerung) {
    this.saving = m.id;
    this.service
      .approve(m.id, { onaylandi: false, adminNotiz: m.adminNotiz })
      .subscribe({
        next: (updated) => {
          Object.assign(m, updated);
          this.applyFilter();
          this.saving = null;
          this.notification.success(this.t.saveSuccess);
        },
        error: () => {
          this.saving = null;
          this.notification.error(this.t.saveError);
        },
      });
  }

  async deleteItem(m: Erinnerung) {
    const confirmed = await this.dialog.danger(
      this.t.delete,
      'Diese Erinnerung und ihre Fotos endgültig löschen?',
    );
    if (!confirmed) return;
    this.service.delete(m.id).subscribe({
      next: () => {
        this.items = this.items.filter((x) => x.id !== m.id);
        this.applyFilter();
        this.notification.success(this.t.saveSuccess);
      },
      error: () => this.notification.error(this.t.saveError),
    });
  }

  getImageUrl(path: string): string {
    if (environment.production) {
      const cleanPath = path.startsWith('/') ? path.slice(1) : path;
      return `${environment.apiUrl}/public/gallery-image/${cleanPath}`;
    }
    return `${environment.apiUrl.replace('/api', '')}${path}`;
  }
}
