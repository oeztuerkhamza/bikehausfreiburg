import { Component, inject, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, switchMap, of } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ArchiveService } from '../../services/archive.service';
import { PurchaseService } from '../../services/purchase.service';
import { SaleService } from '../../services/sale.service';
import { DocumentService } from '../../services/document.service';
import { TranslationService } from '../../services/translation.service';
import {
  ArchiveSearchResult,
  ArchiveBicycleHistory,
  ArchiveTimelineEvent,
} from '../../models/models';

@Component({
  selector: 'app-archive',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="archive-page">
      <div class="page-header">
        <div>
          <h1>{{ t.archive }}</h1>
          <p class="page-subtitle">{{ t.archiveSearchHint }}</p>
        </div>
      </div>

      <!-- Search Section -->
      <div class="search-section" *ngIf="!selectedHistory()">
        <div class="search-box">
          <span class="search-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </span>
          <input
            type="text"
            class="search-input"
            [placeholder]="t.archiveSearchPlaceholder"
            [(ngModel)]="searchQuery"
            (ngModelChange)="onSearch($event)"
            autofocus
          />
          <button class="search-clear" *ngIf="searchQuery" (click)="clearSearch()">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <!-- Loading -->
        <div class="search-loading" *ngIf="searching()">
          <div class="spinner"></div>
        </div>

        <!-- Results -->
        <div class="search-results" *ngIf="results().length > 0 && !searching()">
          <div
            class="result-card"
            *ngFor="let r of results()"
            (click)="selectResult(r)"
          >
            <div class="result-main">
              <div class="result-bike">{{ r.bikeInfo }}</div>
              <div class="result-meta">
                <span class="result-stok" *ngIf="r.stokNo">Stok {{ r.stokNo }}</span>
                <span class="result-beleg" *ngIf="r.purchaseBelegNummer">
                  {{ t.archivePurchaseReceipt }}: {{ r.purchaseBelegNummer }}
                </span>
                <span class="result-beleg" *ngIf="r.saleBelegNummer">
                  {{ t.archiveSaleReceipt }}: {{ r.saleBelegNummer }}
                </span>
              </div>
            </div>
            <div class="result-dates">
              <span *ngIf="r.purchaseDate" class="result-date">
                {{ t.archivePurchase }}: {{ r.purchaseDate | date:'dd.MM.yyyy' }}
              </span>
              <span *ngIf="r.saleDate" class="result-date">
                {{ t.archiveSale }}: {{ r.saleDate | date:'dd.MM.yyyy' }}
              </span>
            </div>
            <div class="result-match">
              <span class="match-badge">{{ r.matchType }}</span>
            </div>
            <span class="result-arrow">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
            </span>
          </div>
        </div>

        <!-- No results -->
        <div class="no-results" *ngIf="searched() && results().length === 0 && !searching()">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            <line x1="8" y1="8" x2="14" y2="14"/><line x1="14" y1="8" x2="8" y2="14"/>
          </svg>
          <p>{{ t.archiveNoResults }}</p>
        </div>
      </div>

      <!-- History / Timeline Section -->
      <div class="history-section" *ngIf="selectedHistory()">
        <button class="btn-back" (click)="goBack()">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          {{ t.archiveBackToSearch }}
        </button>

        <!-- Bicycle Info Card -->
        <div class="bike-info-card">
          <div class="bike-info-header">
            <div class="bike-icon-wrap">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="5.5" cy="17.5" r="3.5"/>
                <circle cx="18.5" cy="17.5" r="3.5"/>
                <path d="M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm-3 11.5V14l-3-3 4-3 2 3h2"/>
              </svg>
            </div>
            <div class="bike-info-title">
              <h2>{{ selectedHistory()!.marke }} {{ selectedHistory()!.modell }}</h2>
              <span class="bike-stok" *ngIf="selectedHistory()!.stokNo">
                {{ t.archiveStokNo }} {{ selectedHistory()!.stokNo }}
              </span>
            </div>
            <div class="bike-status-badges">
              <span class="status-badge" [ngClass]="'badge-' + selectedHistory()!.status.toLowerCase()">
                {{ selectedHistory()!.status }}
              </span>
              <span class="zustand-badge">{{ selectedHistory()!.zustand }}</span>
            </div>
          </div>
          <div class="bike-info-grid">
            <div class="info-item" *ngIf="selectedHistory()!.rahmennummer">
              <span class="info-label">Rahmennummer</span>
              <span class="info-value">{{ selectedHistory()!.rahmennummer }}</span>
            </div>
            <div class="info-item" *ngIf="selectedHistory()!.farbe">
              <span class="info-label">Farbe</span>
              <span class="info-value">{{ selectedHistory()!.farbe }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Reifengröße</span>
              <span class="info-value">{{ selectedHistory()!.reifengroesse }}</span>
            </div>
            <div class="info-item" *ngIf="selectedHistory()!.fahrradtyp">
              <span class="info-label">Typ</span>
              <span class="info-value">{{ selectedHistory()!.fahrradtyp }}</span>
            </div>
          </div>
        </div>

        <!-- Timeline -->
        <h3 class="timeline-title">{{ t.archiveTimeline }}</h3>
        <div class="timeline">
          <div
            class="timeline-event"
            *ngFor="let event of selectedHistory()!.timeline; let i = index; let last = last"
            [ngClass]="'event-' + event.eventType.toLowerCase()"
          >
            <div class="timeline-connector">
              <div class="timeline-dot" [ngClass]="'dot-' + event.eventType.toLowerCase()">
                <ng-container [ngSwitch]="event.eventType">
                  <svg *ngSwitchCase="'Purchase'" width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                    <line x1="3" y1="6" x2="21" y2="6"/>
                    <path d="M16 10a4 4 0 0 1-8 0"/>
                  </svg>
                  <svg *ngSwitchCase="'Sale'" width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="12" y1="1" x2="12" y2="23"/>
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                  </svg>
                  <svg *ngSwitchCase="'Return'" width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="1 4 1 10 7 10"/>
                    <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
                  </svg>
                  <svg *ngSwitchCase="'Reservation'" width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                  <svg *ngSwitchCase="'ReservationCancelled'" width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="15" y1="9" x2="9" y2="15"/>
                    <line x1="9" y1="9" x2="15" y2="15"/>
                  </svg>
                </ng-container>
              </div>
              <div class="timeline-line" *ngIf="!last"></div>
            </div>

            <div class="timeline-card">
              <div class="event-header">
                <span class="event-type-label" [ngClass]="'label-' + event.eventType.toLowerCase()">
                  {{ getEventLabel(event.eventType) }}
                </span>
                <span class="event-date">{{ event.eventDate | date:'dd.MM.yyyy' }}</span>
              </div>
              <div class="event-title">{{ event.title }}</div>
              <div class="event-desc" *ngIf="event.description">{{ event.description }}</div>
              <div class="event-details">
                <span class="event-amount" *ngIf="event.amount != null">
                  {{ event.amount | number:'1.2-2' }} €
                </span>
                <span class="event-customer" *ngIf="event.customerName">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                  {{ event.customerName }}
                </span>
                <span class="event-payment" *ngIf="event.paymentMethod">
                  {{ event.paymentMethod }}
                </span>
                <span class="event-beleg" *ngIf="event.belegNummer">
                  {{ event.belegNummer }}
                </span>
              </div>
              <div class="event-actions" *ngIf="event.documentId">
                <button class="btn-doc" (click)="previewDocument(event)">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                  {{ t.archiveViewDocument }}
                </button>
                <button class="btn-doc" (click)="printDocument(event)">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="6 9 6 2 18 2 18 9"/>
                    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
                    <rect x="6" y="14" width="12" height="8"/>
                  </svg>
                  {{ t.archivePrintDocument }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty timeline -->
        <div class="no-results" *ngIf="selectedHistory()!.timeline.length === 0">
          <p>Keine Ereignisse vorhanden.</p>
        </div>
      </div>

      <!-- Loading History -->
      <div class="search-loading" *ngIf="loadingHistory()">
        <div class="spinner"></div>
      </div>
    </div>
  `,
  styles: [`
    .archive-page {
      padding: 24px;
      max-width: 900px;
      margin: 0 auto;
    }

    .page-header {
      margin-bottom: 28px;
    }
    .page-header h1 {
      font-size: 1.6rem;
      font-weight: 800;
      color: var(--text-primary);
      margin: 0 0 4px;
    }
    .page-subtitle {
      color: var(--text-secondary);
      font-size: 0.88rem;
      margin: 0;
    }

    /* ── Search ── */
    .search-section { }

    .search-box {
      position: relative;
      display: flex;
      align-items: center;
      background: var(--card-bg);
      border: 1.5px solid var(--border-color);
      border-radius: 14px;
      padding: 0 16px;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    .search-box:focus-within {
      border-color: var(--accent);
      box-shadow: 0 0 0 3px rgba(99,102,241,0.13);
    }
    .search-icon {
      color: var(--text-tertiary);
      display: flex;
      align-items: center;
      margin-right: 10px;
      flex-shrink: 0;
    }
    .search-input {
      flex: 1;
      border: none;
      background: transparent;
      padding: 14px 0;
      font-size: 1rem;
      color: var(--text-primary);
      outline: none;
    }
    .search-input::placeholder {
      color: var(--text-tertiary);
    }
    .search-clear {
      background: none;
      border: none;
      color: var(--text-tertiary);
      cursor: pointer;
      padding: 4px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      transition: color 0.2s;
    }
    .search-clear:hover {
      color: var(--text-primary);
    }

    /* ── Loading ── */
    .search-loading {
      display: flex;
      justify-content: center;
      padding: 40px 0;
    }
    .spinner {
      width: 32px;
      height: 32px;
      border: 3px solid var(--border-color);
      border-top-color: var(--accent);
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* ── Results ── */
    .search-results {
      margin-top: 16px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .result-card {
      display: flex;
      align-items: center;
      gap: 16px;
      background: var(--card-bg);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      padding: 14px 18px;
      cursor: pointer;
      transition: border-color 0.2s, box-shadow 0.2s, transform 0.15s;
    }
    .result-card:hover {
      border-color: var(--accent);
      box-shadow: 0 2px 12px rgba(99,102,241,0.1);
      transform: translateY(-1px);
    }
    .result-main {
      flex: 1;
      min-width: 0;
    }
    .result-bike {
      font-weight: 600;
      color: var(--text-primary);
      font-size: 0.95rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .result-meta {
      display: flex;
      gap: 12px;
      margin-top: 3px;
      flex-wrap: wrap;
    }
    .result-stok {
      font-size: 0.78rem;
      font-weight: 600;
      color: var(--accent);
      background: rgba(99,102,241,0.1);
      padding: 1px 8px;
      border-radius: 6px;
    }
    .result-beleg {
      font-size: 0.78rem;
      color: var(--text-tertiary);
    }
    .result-dates {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 2px;
      flex-shrink: 0;
    }
    .result-date {
      font-size: 0.75rem;
      color: var(--text-tertiary);
      white-space: nowrap;
    }
    .result-match {
      flex-shrink: 0;
    }
    .match-badge {
      font-size: 0.7rem;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      font-weight: 600;
      color: var(--text-tertiary);
      background: var(--bg-elevated);
      padding: 2px 8px;
      border-radius: 6px;
    }
    .result-arrow {
      color: var(--text-tertiary);
      flex-shrink: 0;
      display: flex;
    }

    /* ── No Results ── */
    .no-results {
      text-align: center;
      padding: 60px 20px;
      color: var(--text-tertiary);
    }
    .no-results svg {
      margin-bottom: 12px;
      opacity: 0.5;
    }
    .no-results p {
      font-size: 0.95rem;
    }

    /* ── Back Button ── */
    .btn-back {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: none;
      border: none;
      color: var(--accent);
      font-size: 0.88rem;
      font-weight: 600;
      cursor: pointer;
      padding: 6px 0;
      margin-bottom: 20px;
      transition: opacity 0.2s;
    }
    .btn-back:hover { opacity: 0.8; }

    /* ── Bike Info Card ── */
    .bike-info-card {
      background: var(--card-bg);
      border: 1px solid var(--border-color);
      border-radius: 16px;
      padding: 24px;
      margin-bottom: 28px;
    }
    .bike-info-header {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 20px;
    }
    .bike-icon-wrap {
      width: 52px;
      height: 52px;
      border-radius: 14px;
      background: linear-gradient(135deg, rgba(99,102,241,0.15), rgba(79,70,229,0.1));
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      color: var(--accent);
    }
    .bike-info-title {
      flex: 1;
    }
    .bike-info-title h2 {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--text-primary);
    }
    .bike-stok {
      font-size: 0.82rem;
      color: var(--accent);
      font-weight: 600;
    }
    .bike-status-badges {
      display: flex;
      gap: 8px;
      flex-shrink: 0;
    }
    .status-badge {
      font-size: 0.72rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      padding: 4px 10px;
      border-radius: 8px;
    }
    .badge-available {
      background: rgba(16,185,129,0.12);
      color: #10b981;
    }
    .badge-sold {
      background: rgba(239,68,68,0.12);
      color: #ef4444;
    }
    .badge-reserved {
      background: rgba(245,158,11,0.12);
      color: #f59e0b;
    }
    .zustand-badge {
      font-size: 0.72rem;
      font-weight: 600;
      padding: 4px 10px;
      border-radius: 8px;
      background: var(--bg-elevated);
      color: var(--text-secondary);
    }
    .bike-info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
      gap: 14px;
    }
    .info-item {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .info-label {
      font-size: 0.72rem;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--text-tertiary);
      font-weight: 600;
    }
    .info-value {
      font-size: 0.92rem;
      color: var(--text-primary);
      font-weight: 500;
    }

    /* ── Timeline ── */
    .timeline-title {
      font-size: 1.05rem;
      font-weight: 700;
      color: var(--text-primary);
      margin: 0 0 20px;
    }

    .timeline {
      position: relative;
      display: flex;
      flex-direction: column;
    }

    .timeline-event {
      display: flex;
      gap: 20px;
      min-height: 80px;
    }

    .timeline-connector {
      display: flex;
      flex-direction: column;
      align-items: center;
      flex-shrink: 0;
      width: 40px;
    }

    .timeline-dot {
      width: 40px;
      height: 40px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      z-index: 1;
    }
    .dot-purchase {
      background: rgba(99,102,241,0.15);
      color: var(--accent);
    }
    .dot-sale {
      background: rgba(16,185,129,0.15);
      color: #10b981;
    }
    .dot-return {
      background: rgba(245,158,11,0.15);
      color: #f59e0b;
    }
    .dot-reservation {
      background: rgba(59,130,246,0.15);
      color: #3b82f6;
    }
    .dot-reservationcancelled {
      background: rgba(239,68,68,0.12);
      color: #ef4444;
    }

    .timeline-line {
      width: 2px;
      flex: 1;
      background: var(--border-color);
      min-height: 20px;
    }

    .timeline-card {
      flex: 1;
      background: var(--card-bg);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      padding: 16px 20px;
      margin-bottom: 16px;
      transition: border-color 0.2s;
    }
    .timeline-card:hover {
      border-color: rgba(99,102,241,0.3);
    }

    .event-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }
    .event-type-label {
      font-size: 0.72rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      padding: 3px 10px;
      border-radius: 6px;
    }
    .label-purchase {
      background: rgba(99,102,241,0.12);
      color: var(--accent);
    }
    .label-sale {
      background: rgba(16,185,129,0.12);
      color: #10b981;
    }
    .label-return {
      background: rgba(245,158,11,0.12);
      color: #f59e0b;
    }
    .label-reservation {
      background: rgba(59,130,246,0.12);
      color: #3b82f6;
    }
    .label-reservationcancelled {
      background: rgba(239,68,68,0.1);
      color: #ef4444;
    }

    .event-date {
      font-size: 0.8rem;
      color: var(--text-tertiary);
      font-weight: 500;
    }

    .event-title {
      font-weight: 600;
      font-size: 0.95rem;
      color: var(--text-primary);
      margin-bottom: 4px;
    }
    .event-desc {
      font-size: 0.85rem;
      color: var(--text-secondary);
      margin-bottom: 8px;
      line-height: 1.5;
    }
    .event-details {
      display: flex;
      gap: 14px;
      align-items: center;
      flex-wrap: wrap;
    }
    .event-amount {
      font-weight: 700;
      font-size: 1rem;
      color: var(--text-primary);
    }
    .event-customer {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 0.82rem;
      color: var(--text-secondary);
    }
    .event-customer svg {
      color: var(--text-tertiary);
    }
    .event-payment {
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--text-tertiary);
      background: var(--bg-elevated);
      padding: 2px 8px;
      border-radius: 6px;
    }
    .event-beleg {
      font-size: 0.78rem;
      font-family: 'SF Mono', 'Fira Code', monospace;
      color: var(--accent);
      background: rgba(99,102,241,0.08);
      padding: 2px 8px;
      border-radius: 6px;
    }

    .event-actions {
      display: flex;
      gap: 8px;
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px solid var(--border-color);
    }
    .btn-doc {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: var(--bg-elevated);
      color: var(--text-secondary);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      padding: 6px 14px;
      font-size: 0.8rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-doc:hover {
      background: rgba(99,102,241,0.08);
      color: var(--accent);
      border-color: rgba(99,102,241,0.3);
    }

    /* ── Responsive ── */
    @media (max-width: 640px) {
      .archive-page {
        padding: 16px;
      }
      .result-card {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
      }
      .result-dates {
        align-items: flex-start;
      }
      .result-arrow {
        display: none;
      }
      .bike-info-header {
        flex-direction: column;
        align-items: flex-start;
      }
      .bike-status-badges {
        margin-top: 4px;
      }
      .timeline-event {
        gap: 12px;
      }
    }
  `],
})
export class ArchiveComponent implements OnDestroy {
  private archiveService = inject(ArchiveService);
  private purchaseService = inject(PurchaseService);
  private saleService = inject(SaleService);
  private documentService = inject(DocumentService);
  private translationService = inject(TranslationService);

  get t() {
    return this.translationService.translations();
  }

  searchQuery = '';
  results = signal<ArchiveSearchResult[]>([]);
  searching = signal(false);
  searched = signal(false);
  selectedHistory = signal<ArchiveBicycleHistory | null>(null);
  loadingHistory = signal(false);

  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor() {
    this.searchSubject
      .pipe(
        debounceTime(350),
        distinctUntilChanged(),
        switchMap((q) => {
          if (!q || q.trim().length < 2) {
            this.searching.set(false);
            this.searched.set(false);
            return of([]);
          }
          this.searching.set(true);
          return this.archiveService.search(q.trim());
        }),
        takeUntil(this.destroy$),
      )
      .subscribe((data) => {
        this.results.set(data);
        this.searching.set(false);
        if (data !== undefined) this.searched.set(true);
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSearch(q: string) {
    this.searchSubject.next(q);
  }

  clearSearch() {
    this.searchQuery = '';
    this.results.set([]);
    this.searched.set(false);
  }

  selectResult(r: ArchiveSearchResult) {
    this.loadingHistory.set(true);
    this.archiveService.getHistory(r.bicycleId).subscribe({
      next: (h) => {
        this.selectedHistory.set(h);
        this.loadingHistory.set(false);
      },
      error: () => {
        this.loadingHistory.set(false);
      },
    });
  }

  goBack() {
    this.selectedHistory.set(null);
  }

  getEventLabel(type: string): string {
    const map: Record<string, string> = {
      Purchase: this.t.archivePurchase,
      Sale: this.t.archiveSale,
      Return: this.t.archiveReturn,
      Reservation: this.t.archiveReservation,
      ReservationCancelled: this.t.archiveReservationCancelled,
    };
    return map[type] || type;
  }

  previewDocument(event: ArchiveTimelineEvent) {
    if (!event.documentId) return;
    this.documentService.download(event.documentId).subscribe((blob) => {
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
    });
  }

  printDocument(event: ArchiveTimelineEvent) {
    if (!event.documentId) return;
    this.documentService.download(event.documentId).subscribe((blob) => {
      const url = window.URL.createObjectURL(blob);
      const w = window.open(url, '_blank');
      if (w) {
        w.addEventListener('load', () => w.print());
      }
    });
  }
}
