import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RentalReviewService } from '../../services/rental-review.service';
import { NotificationService } from '../../services/notification.service';
import { DialogService } from '../../services/dialog.service';
import { TranslationService } from '../../services/translation.service';
import { RentalReview } from '../../models/models';

@Component({
  selector: 'app-rental-review-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1>{{ t.rentalReviewTitle }}</h1>
          <p class="subtitle">{{ reviews.length }} {{ t.total }}</p>
        </div>
      </div>

      <div class="filter-bar">
        <button
          class="filter-btn"
          [class.active]="filterStatus === ''"
          (click)="setFilter('')"
        >{{ t.rentalReviewAll }}</button>
        <button
          class="filter-btn"
          [class.active]="filterStatus === 'pending'"
          (click)="setFilter('pending')"
        >
          {{ t.rentalReviewPending }}
          <span class="badge-count" *ngIf="pendingCount > 0">{{ pendingCount }}</span>
        </button>
        <button
          class="filter-btn"
          [class.active]="filterStatus === 'approved'"
          (click)="setFilter('approved')"
        >{{ t.rentalReviewApproved }}</button>
      </div>

      <div *ngIf="loading" class="loading">{{ t.loading }}</div>

      <div *ngIf="!loading && filtered.length === 0" class="empty-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
        <p>{{ t.rentalReviewNoItems }}</p>
      </div>

      <div class="reviews-grid" *ngIf="!loading && filtered.length > 0">
        <div
          class="review-card"
          *ngFor="let r of filtered"
          [class.approved]="r.onaylandi"
          [class.pending]="!r.onaylandi"
        >
          <div class="review-header">
            <div class="reviewer-info">
              <div class="avatar">{{ r.ad.charAt(0).toUpperCase() }}</div>
              <div>
                <div class="reviewer-name">{{ r.ad }}</div>
                <div class="reviewer-email" *ngIf="r.email">{{ r.email }}</div>
              </div>
            </div>
            <div class="review-meta">
              <div class="stars">
                <span *ngFor="let s of starsArray(r.sterne)" class="star filled">★</span>
                <span *ngFor="let s of emptyStarsArray(r.sterne)" class="star empty">★</span>
              </div>
              <span
                class="status-badge"
                [class.badge-approved]="r.onaylandi"
                [class.badge-pending]="!r.onaylandi"
              >
                {{ r.onaylandi ? t.rentalReviewApproved : t.rentalReviewPending }}
              </span>
            </div>
          </div>

          <p class="review-text">{{ r.yorum }}</p>

          <div class="admin-note-row" *ngIf="r.adminNotiz">
            <span class="admin-note-label">{{ t.rentalReviewAdminNote }}:</span>
            <span class="admin-note-text">{{ r.adminNotiz }}</span>
          </div>

          <div class="review-footer">
            <span class="review-date">{{ r.createdAt | date:'dd.MM.yyyy HH:mm' }}</span>
            <div class="review-actions">
              <button
                *ngIf="!r.onaylandi"
                class="btn btn-approve"
                (click)="approve(r)"
                [disabled]="saving === r.id"
              >
                {{ saving === r.id ? t.saving : t.rentalReviewApprove }}
              </button>
              <button
                *ngIf="r.onaylandi"
                class="btn btn-reject"
                (click)="reject(r)"
                [disabled]="saving === r.id"
              >
                {{ saving === r.id ? t.saving : t.rentalReviewReject }}
              </button>
              <button
                class="btn btn-delete"
                (click)="deleteReview(r)"
                [disabled]="saving === r.id"
              >
                {{ t.rentalReviewDelete }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page {
      max-width: 900px;
      margin: 0 auto;
      animation: fadeIn 0.3s ease;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
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
      transition: all 0.15s;
    }
    .filter-btn:hover { background: var(--bg-secondary, #f8fafc); }
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
    .filter-btn.active .badge-count {
      background: rgba(255,255,255,0.3);
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
    .empty-state svg {
      margin-bottom: 12px;
      opacity: 0.4;
    }
    .reviews-grid {
      display: flex;
      flex-direction: column;
      gap: 14px;
    }
    .review-card {
      background: var(--bg-card, #fff);
      border-radius: var(--radius-lg, 14px);
      border: 1.5px solid var(--border-light, #e2e8f0);
      padding: 18px 20px;
      transition: box-shadow 0.2s;
    }
    .review-card:hover {
      box-shadow: var(--shadow-md, 0 4px 12px rgba(0,0,0,0.08));
    }
    .review-card.pending {
      border-left: 4px solid #f59e0b;
    }
    .review-card.approved {
      border-left: 4px solid #10b981;
    }
    .review-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 12px;
      gap: 12px;
      flex-wrap: wrap;
    }
    .reviewer-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: var(--accent-primary, #6366f1);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.1rem;
      font-weight: 700;
      flex-shrink: 0;
    }
    .reviewer-name {
      font-weight: 700;
      font-size: 0.95rem;
      color: var(--text-primary);
    }
    .reviewer-email {
      font-size: 0.8rem;
      color: var(--text-secondary, #64748b);
      margin-top: 2px;
    }
    .review-meta {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 6px;
    }
    .stars {
      display: flex;
      gap: 2px;
    }
    .star {
      font-size: 1.1rem;
      line-height: 1;
    }
    .star.filled { color: #f59e0b; }
    .star.empty { color: var(--border-light, #e2e8f0); }
    .status-badge {
      padding: 3px 10px;
      border-radius: 50px;
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 0.02em;
    }
    .badge-approved { background: rgba(16,185,129,0.12); color: #059669; }
    .badge-pending { background: rgba(245,158,11,0.12); color: #d97706; }
    .review-text {
      font-size: 0.95rem;
      color: var(--text-primary);
      line-height: 1.6;
      margin: 0 0 12px;
    }
    .admin-note-row {
      display: flex;
      gap: 6px;
      background: var(--bg-secondary, #f8fafc);
      border-radius: 8px;
      padding: 8px 12px;
      margin-bottom: 12px;
      font-size: 0.85rem;
    }
    .admin-note-label {
      font-weight: 600;
      color: var(--text-secondary, #64748b);
      white-space: nowrap;
    }
    .admin-note-text { color: var(--text-primary); }
    .review-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }
    .review-date {
      font-size: 0.82rem;
      color: var(--text-secondary, #64748b);
    }
    .review-actions {
      display: flex;
      gap: 8px;
    }
    .btn {
      padding: 6px 14px;
      border-radius: var(--radius-md, 10px);
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      border: none;
      transition: all 0.15s;
    }
    .btn:disabled { opacity: 0.6; cursor: not-allowed; }
    .btn-approve {
      background: rgba(16,185,129,0.12);
      color: #059669;
    }
    .btn-approve:hover:not(:disabled) { background: rgba(16,185,129,0.22); }
    .btn-reject {
      background: rgba(245,158,11,0.12);
      color: #d97706;
    }
    .btn-reject:hover:not(:disabled) { background: rgba(245,158,11,0.22); }
    .btn-delete {
      background: rgba(239,68,68,0.1);
      color: #dc2626;
    }
    .btn-delete:hover:not(:disabled) { background: rgba(239,68,68,0.2); }
    @media (max-width: 600px) {
      .review-header { flex-direction: column; }
      .review-meta { align-items: flex-start; }
    }
  `],
})
export class RentalReviewListComponent implements OnInit {
  private service = inject(RentalReviewService);
  private notification = inject(NotificationService);
  private dialog = inject(DialogService);
  private translationService = inject(TranslationService);

  get t() { return this.translationService.translations(); }

  reviews: RentalReview[] = [];
  filtered: RentalReview[] = [];
  filterStatus = '';
  loading = true;
  saving: number | null = null;

  get pendingCount() {
    return this.reviews.filter(r => !r.onaylandi).length;
  }

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading = true;
    this.service.getAll().subscribe({
      next: (items) => {
        this.reviews = items;
        this.applyFilter();
        this.loading = false;
      },
      error: () => { this.loading = false; },
    });
  }

  setFilter(status: string) {
    this.filterStatus = status;
    this.applyFilter();
  }

  applyFilter() {
    if (this.filterStatus === 'pending') {
      this.filtered = this.reviews.filter(r => !r.onaylandi);
    } else if (this.filterStatus === 'approved') {
      this.filtered = this.reviews.filter(r => r.onaylandi);
    } else {
      this.filtered = [...this.reviews];
    }
  }

  approve(r: RentalReview) {
    this.saving = r.id;
    this.service.approve(r.id, { onaylandi: true, adminNotiz: r.adminNotiz }).subscribe({
      next: (updated) => {
        Object.assign(r, updated);
        this.applyFilter();
        this.saving = null;
        this.notification.success(this.t.rentalReviewSaved);
      },
      error: () => { this.saving = null; },
    });
  }

  reject(r: RentalReview) {
    this.saving = r.id;
    this.service.approve(r.id, { onaylandi: false, adminNotiz: r.adminNotiz }).subscribe({
      next: (updated) => {
        Object.assign(r, updated);
        this.applyFilter();
        this.saving = null;
        this.notification.success(this.t.rentalReviewSaved);
      },
      error: () => { this.saving = null; },
    });
  }

  async deleteReview(r: RentalReview) {
    const confirmed = await this.dialog.danger(
      this.t.rentalReviewDelete,
      this.t.rentalReviewDeleteConfirm,
    );
    if (!confirmed) return;
    this.service.delete(r.id).subscribe({
      next: () => {
        this.reviews = this.reviews.filter(x => x.id !== r.id);
        this.applyFilter();
        this.notification.success(this.t.rentalReviewDeleted ?? this.t.rentalReviewDelete);
      },
    });
  }

  starsArray(n: number): number[] {
    return Array(Math.min(5, Math.max(0, n))).fill(0);
  }

  emptyStarsArray(n: number): number[] {
    return Array(Math.max(0, 5 - Math.min(5, n))).fill(0);
  }
}
