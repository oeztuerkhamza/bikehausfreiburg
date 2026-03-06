import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PurchaseService } from '../../services/purchase.service';
import { TranslationService } from '../../services/translation.service';
import { MissingSale } from '../../models/models';

@Component({
  selector: 'app-missing-purchases',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1>{{ t.missingPurchasesTitle }}</h1>
          <p class="subtitle">{{ t.missingPurchasesDesc }}</p>
        </div>
        <a routerLink="/purchases" class="btn btn-outline">{{ t.back }}</a>
      </div>

      <!-- Loading -->
      <div class="loading" *ngIf="loading">
        <div class="spinner"></div>
      </div>

      <!-- Empty State -->
      <div class="empty-state" *ngIf="!loading && missingSales.length === 0">
        <div class="empty-icon">✅</div>
        <p>{{ t.noMissingPurchases }}</p>
      </div>

      <!-- Missing Purchases List -->
      <div class="card-list" *ngIf="!loading && missingSales.length > 0">
        <div class="missing-card" *ngFor="let sale of missingSales">
          <div class="card-header">
            <div class="bike-info">
              <span class="stok-badge" *ngIf="sale.stokNo"
                >#{{ sale.stokNo }}</span
              >
              <h3>{{ sale.bikeInfo }}</h3>
            </div>
            <span class="sale-badge"
              >{{ t.saleReceipt }} {{ sale.saleBelegNummer }}</span
            >
          </div>

          <div class="card-details">
            <div class="detail-row">
              <span class="label">{{ t.soldTo }}:</span>
              <span class="value">{{ sale.buyerName }}</span>
            </div>
            <div class="detail-row">
              <span class="label">{{ t.salePrice }}:</span>
              <span class="value price"
                >{{ sale.salePreis | number: '1.2-2' }} €</span
              >
            </div>
            <div class="detail-row">
              <span class="label">{{ t.date }}:</span>
              <span class="value">{{
                sale.verkaufsdatum | date: 'dd.MM.yyyy'
              }}</span>
            </div>
            <div class="detail-row" *ngIf="sale.rahmennummer">
              <span class="label">{{ t.frameNumber }}:</span>
              <span class="value">{{ sale.rahmennummer }}</span>
            </div>
          </div>

          <div class="card-actions">
            <a
              [routerLink]="'/purchases/missing/new'"
              [queryParams]="{
                bicycleId: sale.bicycleId,
                marke: sale.marke,
                modell: sale.modell,
                rahmennummer: sale.rahmennummer || '',
                rahmengroesse: sale.rahmengroesse || '',
                farbe: sale.farbe || '',
                reifengroesse: sale.reifengroesse,
                fahrradtyp: sale.fahrradtyp || '',
                art: sale.art || '',
                zustand: sale.zustand,
                stokNo: sale.stokNo || '',
                salePreis: sale.salePreis,
              }"
              class="btn btn-primary"
            >
              + {{ t.createPurchase }}
            </a>
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
      }
      .page-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 28px;
        gap: 16px;
      }
      .page-header h1 {
        margin: 0;
        font-size: 1.5rem;
        font-weight: 700;
      }
      .subtitle {
        margin: 4px 0 0;
        color: var(--text-muted);
        font-size: 0.9rem;
      }
      .btn {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 10px 20px;
        border-radius: 10px;
        font-weight: 600;
        font-size: 0.88rem;
        cursor: pointer;
        text-decoration: none;
        border: none;
        transition: all 0.2s;
      }
      .btn-outline {
        background: transparent;
        border: 1.5px solid var(--border-color);
        color: var(--text-secondary);
      }
      .btn-outline:hover {
        border-color: var(--accent-primary);
        color: var(--accent-primary);
      }
      .btn-primary {
        background: var(--accent-primary);
        color: #fff;
      }
      .btn-primary:hover {
        background: var(--accent-primary-hover, #4f46e5);
      }

      .loading {
        display: flex;
        justify-content: center;
        padding: 60px;
      }
      .spinner {
        width: 40px;
        height: 40px;
        border: 3px solid var(--border-color);
        border-top-color: var(--accent-primary);
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
      }
      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }

      .empty-state {
        text-align: center;
        padding: 60px 20px;
        background: var(--bg-secondary);
        border-radius: 16px;
        border: 1px solid var(--border-light);
      }
      .empty-icon {
        font-size: 3rem;
        margin-bottom: 12px;
      }
      .empty-state p {
        color: var(--text-muted);
        font-size: 1rem;
      }

      .card-list {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .missing-card {
        background: var(--bg-secondary);
        border-radius: 14px;
        border: 1px solid var(--border-light);
        overflow: hidden;
        transition: all 0.2s;
      }
      .missing-card:hover {
        border-color: var(--accent-primary);
        box-shadow: 0 4px 20px rgba(99, 102, 241, 0.08);
      }

      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px 20px;
        border-bottom: 1px solid var(--border-light);
        gap: 12px;
      }
      .bike-info {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .bike-info h3 {
        margin: 0;
        font-size: 1.05rem;
        font-weight: 600;
      }
      .stok-badge {
        background: var(--accent-primary);
        color: #fff;
        padding: 2px 8px;
        border-radius: 6px;
        font-size: 0.78rem;
        font-weight: 700;
        white-space: nowrap;
      }
      .sale-badge {
        background: rgba(239, 68, 68, 0.1);
        color: #ef4444;
        padding: 4px 10px;
        border-radius: 8px;
        font-size: 0.78rem;
        font-weight: 600;
        white-space: nowrap;
      }

      .card-details {
        padding: 16px 20px;
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 10px;
      }
      .detail-row {
        display: flex;
        gap: 8px;
      }
      .label {
        color: var(--text-muted);
        font-size: 0.85rem;
        white-space: nowrap;
      }
      .value {
        font-size: 0.85rem;
        font-weight: 500;
      }
      .value.price {
        color: var(--accent-primary);
        font-weight: 700;
      }

      .card-actions {
        padding: 12px 20px 16px;
        display: flex;
        justify-content: flex-end;
      }

      @media (max-width: 640px) {
        .page-header {
          flex-direction: column;
        }
        .card-header {
          flex-direction: column;
          align-items: flex-start;
        }
        .card-details {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class MissingPurchasesComponent implements OnInit {
  private purchaseService = inject(PurchaseService);
  private translationService = inject(TranslationService);

  missingSales: MissingSale[] = [];
  loading = true;

  get t() {
    return this.translationService.translations();
  }

  ngOnInit() {
    this.loadMissingSales();
  }

  private loadMissingSales() {
    this.loading = true;
    this.purchaseService.getMissingSales().subscribe({
      next: (data) => {
        this.missingSales = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }
}
