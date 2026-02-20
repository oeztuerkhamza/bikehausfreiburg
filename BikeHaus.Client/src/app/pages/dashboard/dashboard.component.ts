import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { DashboardService } from '../../services/dashboard.service';
import { PurchaseService } from '../../services/purchase.service';
import { SaleService } from '../../services/sale.service';
import { Dashboard } from '../../models/models';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="dashboard" *ngIf="data">
      <div class="page-header">
        <div>
          <h1>{{ t.dashboard }}</h1>
          <p class="page-subtitle">{{ t.welcomeToBikeHaus }}</p>
        </div>
      </div>

      <div class="shortcuts-grid">
        <a routerLink="/purchases/new" class="shortcut-card card-accent">
          <div class="shortcut-icon-wrap accent-primary">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path
                d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"
              />
            </svg>
          </div>
          <div class="shortcut-info">
            <div class="shortcut-label">{{ t.newPurchase }}</div>
            <div class="shortcut-desc">{{ t.buyBicycle }}</div>
          </div>
          <svg
            class="shortcut-arrow"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </a>
        <a
          routerLink="/purchases/new"
          [queryParams]="{ bulk: 'true' }"
          class="shortcut-card card-accent"
        >
          <div class="shortcut-icon-wrap accent-violet">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <rect x="2" y="7" width="20" height="14" rx="2" />
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
              <path d="M6 11h4" />
              <path d="M14 11h4" />
            </svg>
          </div>
          <div class="shortcut-info">
            <div class="shortcut-label">{{ t.bulkPurchase }}</div>
            <div class="shortcut-desc">{{ t.bulkPurchaseDesc }}</div>
          </div>
          <svg
            class="shortcut-arrow"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </a>
        <a routerLink="/sales/new" class="shortcut-card card-accent">
          <div class="shortcut-icon-wrap accent-success">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <div class="shortcut-info">
            <div class="shortcut-label">{{ t.newSale }}</div>
            <div class="shortcut-desc">{{ t.sellBicycle }}</div>
          </div>
          <svg
            class="shortcut-arrow"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </a>
      </div>

      <div class="recent-sections">
        <div class="recent-section">
          <div class="section-header">
            <h2>{{ t.recentPurchases }}</h2>
            <a routerLink="/purchases" class="view-all"
              >{{ t.viewAll }}
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </a>
          </div>
          <div
            class="table-wrap"
            *ngIf="data.recentPurchases?.length; else noPurchases"
          >
            <table>
              <thead>
                <tr>
                  <th>{{ t.receiptNo }}</th>
                  <th>{{ t.bicycle }}</th>
                  <th>{{ t.seller }}</th>
                  <th>{{ t.price }}</th>
                  <th>{{ t.date }}</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  *ngFor="let p of data.recentPurchases"
                  class="clickable-row"
                  (click)="showPurchaseMenu($event, p.id)"
                >
                  <td>
                    <span class="badge-mono">{{ p.belegNummer }}</span>
                  </td>
                  <td>{{ p.bikeInfo }}</td>
                  <td>{{ p.sellerName }}</td>
                  <td class="price">{{ p.preis | number: '1.2-2' }} €</td>
                  <td class="date">{{ p.kaufdatum | date: 'dd.MM.yyyy' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <ng-template #noPurchases>
            <div class="empty-state">
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
              >
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
              </svg>
              <p>{{ t.noPurchasesFound }}</p>
            </div>
          </ng-template>
        </div>

        <div class="recent-section">
          <div class="section-header">
            <h2>{{ t.recentSales }}</h2>
            <a routerLink="/sales" class="view-all"
              >{{ t.viewAll }}
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </a>
          </div>
          <div
            class="table-wrap"
            *ngIf="data.recentSales?.length; else noSales"
          >
            <table>
              <thead>
                <tr>
                  <th>{{ t.receiptNo }}</th>
                  <th>{{ t.bicycle }}</th>
                  <th>{{ t.buyer }}</th>
                  <th>{{ t.price }}</th>
                  <th>{{ t.date }}</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  *ngFor="let s of data.recentSales"
                  class="clickable-row"
                  (click)="showSaleMenu($event, s.id)"
                >
                  <td>
                    <span class="badge-mono">{{ s.belegNummer }}</span>
                  </td>
                  <td>{{ s.bikeInfo }}</td>
                  <td>{{ s.buyerName }}</td>
                  <td class="price">{{ s.preis | number: '1.2-2' }} €</td>
                  <td class="date">
                    {{ s.verkaufsdatum | date: 'dd.MM.yyyy' }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <ng-template #noSales>
            <div class="empty-state">
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
              >
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
              <p>{{ t.noSalesFound }}</p>
            </div>
          </ng-template>
        </div>
      </div>
    </div>

    <!-- Context Menu -->
    <div
      class="context-menu"
      *ngIf="contextMenu.visible"
      [style.top.px]="contextMenu.y"
      [style.left.px]="contextMenu.x"
    >
      <button (click)="printDocument()">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <polyline points="6 9 6 2 18 2 18 9"></polyline>
          <path
            d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"
          ></path>
          <rect x="6" y="14" width="12" height="8"></rect>
        </svg>
        {{ t.printDocument }}
      </button>
      <button (click)="editDocument()">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
          ></path>
          <path
            d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
          ></path>
        </svg>
        {{ t.editDocument }}
      </button>
    </div>
    <div
      class="context-menu-backdrop"
      *ngIf="contextMenu.visible"
      (click)="closeMenu()"
    ></div>
  `,
  styles: [
    `
      .dashboard {
        max-width: 1280px;
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
        margin-bottom: 28px;
      }
      .page-header h1 {
        font-size: 1.65rem;
        font-weight: 800;
        color: var(--text-heading);
        letter-spacing: -0.02em;
        margin: 0;
      }
      .page-subtitle {
        font-size: 0.88rem;
        color: var(--text-muted);
        margin-top: 4px;
      }

      /* ── Shortcut Grid ── */
      .shortcuts-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
        gap: 14px;
        margin-bottom: 36px;
      }

      .shortcut-card {
        display: flex;
        align-items: center;
        gap: 14px;
        padding: 16px 18px;
        background: var(--bg-card);
        border: 1px solid var(--border-light);
        border-radius: var(--radius-lg, 14px);
        text-decoration: none;
        color: var(--text-primary);
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        cursor: pointer;
        position: relative;
        overflow: hidden;
      }
      .shortcut-card::before {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(
          135deg,
          transparent 60%,
          rgba(99, 102, 241, 0.03) 100%
        );
        pointer-events: none;
      }
      .shortcut-card:hover {
        transform: translateY(-2px);
        box-shadow: var(--shadow-lg, 0 10px 15px rgba(0, 0, 0, 0.08));
        border-color: var(--border-color);
        text-decoration: none;
        color: var(--text-primary);
      }
      .shortcut-card.card-accent {
        border-color: rgba(99, 102, 241, 0.15);
      }
      .shortcut-card.card-accent::before {
        background: linear-gradient(
          135deg,
          rgba(99, 102, 241, 0.02),
          rgba(99, 102, 241, 0.06)
        );
      }

      .shortcut-icon-wrap {
        width: 44px;
        height: 44px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      .accent-primary {
        background: rgba(99, 102, 241, 0.1);
        color: #6366f1;
      }
      .accent-success {
        background: rgba(16, 185, 129, 0.1);
        color: #10b981;
      }
      .accent-info {
        background: rgba(6, 182, 212, 0.1);
        color: #06b6d4;
      }
      .accent-warning {
        background: rgba(245, 158, 11, 0.1);
        color: #f59e0b;
      }
      .accent-violet {
        background: rgba(139, 92, 246, 0.1);
        color: #8b5cf6;
      }
      .accent-emerald {
        background: rgba(52, 211, 153, 0.1);
        color: #34d399;
      }
      .accent-sky {
        background: rgba(56, 189, 248, 0.1);
        color: #38bdf8;
      }
      .accent-rose {
        background: rgba(244, 63, 94, 0.1);
        color: #f43f5e;
      }
      .accent-amber {
        background: rgba(251, 191, 36, 0.1);
        color: #fbbf24;
      }
      .accent-slate {
        background: rgba(100, 116, 139, 0.1);
        color: #64748b;
      }

      .shortcut-info {
        flex: 1;
        min-width: 0;
      }
      .shortcut-label {
        font-size: 0.9rem;
        font-weight: 650;
        color: var(--text-primary);
      }
      .shortcut-desc {
        font-size: 0.76rem;
        color: var(--text-muted);
        margin-top: 1px;
      }
      .shortcut-arrow {
        color: var(--text-muted);
        opacity: 0;
        transform: translateX(-4px);
        transition: all 0.2s;
        flex-shrink: 0;
      }
      .shortcut-card:hover .shortcut-arrow {
        opacity: 1;
        transform: translateX(0);
      }

      /* ── Recent Sections ── */
      .recent-sections {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
        margin-bottom: 32px;
      }
      @media (max-width: 900px) {
        .recent-sections {
          grid-template-columns: 1fr;
        }
      }

      .recent-section {
        background: var(--bg-card);
        border-radius: var(--radius-lg, 14px);
        border: 1px solid var(--border-light);
        padding: 0;
        overflow: hidden;
      }

      .section-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 18px 22px;
        border-bottom: 1px solid var(--border-light);
      }
      .section-header h2 {
        font-size: 1rem;
        font-weight: 700;
        color: var(--text-heading);
        margin: 0;
      }
      .view-all {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        font-size: 0.8rem;
        font-weight: 600;
        color: var(--accent-primary);
        text-decoration: none;
        transition: gap 0.2s;
      }
      .view-all:hover {
        gap: 6px;
        text-decoration: none;
      }

      .table-wrap {
        overflow-x: auto;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        font-size: 0.84rem;
      }
      th {
        text-align: left;
        padding: 10px 18px;
        font-size: 0.75rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--text-muted);
        background: var(--table-stripe, #f8fafc);
        border-bottom: 1px solid var(--border-light);
      }
      td {
        padding: 11px 18px;
        border-bottom: 1px solid var(--border-light);
        color: var(--text-secondary);
      }
      .clickable-row {
        cursor: pointer;
        transition: background-color 0.15s;
      }
      .clickable-row:hover {
        background-color: var(--table-hover, #f1f5f9);
      }
      .badge-mono {
        display: inline-block;
        padding: 2px 8px;
        background: var(--accent-primary-light, rgba(99, 102, 241, 0.08));
        color: var(--accent-primary);
        border-radius: 6px;
        font-size: 0.78rem;
        font-weight: 600;
        font-family: 'SF Mono', 'Consolas', monospace;
      }
      .price {
        font-weight: 600;
        color: var(--text-primary);
        font-variant-numeric: tabular-nums;
      }
      .date {
        color: var(--text-muted);
        font-variant-numeric: tabular-nums;
      }

      .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
        padding: 40px 20px;
        color: var(--text-muted);
      }
      .empty-state svg {
        opacity: 0.3;
      }
      .empty-state p {
        font-size: 0.88rem;
        font-style: italic;
      }

      @media (max-width: 600px) {
        .shortcuts-grid {
          grid-template-columns: 1fr;
        }
      }

      .action-cell {
        text-align: center;
        display: flex;
        gap: 4px;
        justify-content: center;
      }
      .btn-icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        padding: 0;
        border: none;
        background: var(--accent-primary-light, rgba(99, 102, 241, 0.08));
        color: var(--accent-primary, #6366f1);
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s;
      }
      .btn-icon:hover {
        background: var(--accent-primary, #6366f1);
        color: white;
        transform: scale(1.05);
      }

      .context-menu-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 999;
      }

      .context-menu {
        position: fixed;
        z-index: 1000;
        background: white;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        min-width: 180px;
        overflow: hidden;
        animation: menuFadeIn 0.15s ease;
      }

      @keyframes menuFadeIn {
        from {
          opacity: 0;
          transform: scale(0.95);
        }
        to {
          opacity: 1;
          transform: scale(1);
        }
      }

      .context-menu button {
        display: flex;
        align-items: center;
        gap: 10px;
        width: 100%;
        padding: 12px 16px;
        border: none;
        background: none;
        font-size: 14px;
        cursor: pointer;
        transition: background 0.2s;
        text-align: left;
      }

      .context-menu button:hover {
        background: var(--bg-secondary, #f3f4f6);
      }

      .context-menu button svg {
        color: var(--accent-primary, #6366f1);
      }
    `,
  ],
})
export class DashboardComponent implements OnInit {
  private translationService = inject(TranslationService);
  private purchaseService = inject(PurchaseService);
  private saleService = inject(SaleService);

  get t() {
    return this.translationService.translations();
  }

  data: Dashboard | null = null;

  contextMenu = {
    visible: false,
    x: 0,
    y: 0,
    type: '' as 'purchase' | 'sale',
    id: 0,
  };

  constructor(
    private dashboardService: DashboardService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.dashboardService.getDashboard().subscribe((d) => (this.data = d));
  }

  showPurchaseMenu(event: MouseEvent, id: number) {
    event.stopPropagation();
    this.contextMenu = {
      visible: true,
      x: event.clientX,
      y: event.clientY,
      type: 'purchase',
      id,
    };
  }

  showSaleMenu(event: MouseEvent, id: number) {
    event.stopPropagation();
    this.contextMenu = {
      visible: true,
      x: event.clientX,
      y: event.clientY,
      type: 'sale',
      id,
    };
  }

  closeMenu() {
    this.contextMenu.visible = false;
  }

  printDocument() {
    const id = this.contextMenu.id;
    this.closeMenu();
    if (this.contextMenu.type === 'purchase') {
      this.previewPurchasePdf(id);
    } else {
      this.previewSalePdf(id);
    }
  }

  editDocument() {
    const id = this.contextMenu.id;
    const type = this.contextMenu.type;
    this.closeMenu();
    if (type === 'purchase') {
      this.router.navigate(['/purchases/edit', id]);
    } else {
      this.router.navigate(['/sales/edit', id]);
    }
  }

  downloadPurchasePdf(id: number, belegNr: string | undefined) {
    this.purchaseService.downloadKaufbeleg(id).subscribe((blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Kaufbeleg_${belegNr || id}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    });
  }

  downloadSalePdf(id: number, belegNr: string | undefined) {
    this.saleService.downloadVerkaufsbeleg(id).subscribe((blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Verkaufsbeleg_${belegNr || id}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    });
  }

  previewPurchasePdf(id: number) {
    this.purchaseService.downloadKaufbeleg(id).subscribe((blob) => {
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
    });
  }

  previewSalePdf(id: number) {
    this.saleService.downloadVerkaufsbeleg(id).subscribe((blob) => {
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
    });
  }
}
