import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { DashboardService } from '../../services/dashboard.service';
import { Dashboard } from '../../models/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="dashboard" *ngIf="data">
      <div class="page-header">
        <div>
          <h1>Dashboard</h1>
          <p class="page-subtitle">Willkommen bei BikeHaus Freiburg</p>
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
            <div class="shortcut-label">Neuer Ankauf</div>
            <div class="shortcut-desc">Fahrrad ankaufen</div>
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
            <div class="shortcut-label">Neuer Verkauf</div>
            <div class="shortcut-desc">Fahrrad verkaufen</div>
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
        <a routerLink="/bicycles" class="shortcut-card">
          <div class="shortcut-icon-wrap accent-info">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <circle cx="5.5" cy="17.5" r="3.5" />
              <circle cx="18.5" cy="17.5" r="3.5" />
              <path
                d="M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm-3 11.5V14l-3-3 4-3 2 3h2"
              />
            </svg>
          </div>
          <div class="shortcut-info">
            <div class="shortcut-label">Fahrräder</div>
            <div class="shortcut-desc">Bestand ansehen</div>
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
        <a routerLink="/customers" class="shortcut-card">
          <div class="shortcut-icon-wrap accent-warning">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <div class="shortcut-info">
            <div class="shortcut-label">Kunden</div>
            <div class="shortcut-desc">Kundenverwaltung</div>
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
        <a routerLink="/purchases" class="shortcut-card">
          <div class="shortcut-icon-wrap accent-violet">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
          </div>
          <div class="shortcut-info">
            <div class="shortcut-label">Ankäufe</div>
            <div class="shortcut-desc">Alle Ankäufe</div>
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
        <a routerLink="/sales" class="shortcut-card">
          <div class="shortcut-icon-wrap accent-emerald">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
              <polyline points="17 6 23 6 23 12" />
            </svg>
          </div>
          <div class="shortcut-info">
            <div class="shortcut-label">Verkäufe</div>
            <div class="shortcut-desc">Alle Verkäufe</div>
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
        <a routerLink="/reservations" class="shortcut-card">
          <div class="shortcut-icon-wrap accent-sky">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <div class="shortcut-info">
            <div class="shortcut-label">Reservierungen</div>
            <div class="shortcut-desc">Reservierungen</div>
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
        <a routerLink="/returns" class="shortcut-card">
          <div class="shortcut-icon-wrap accent-rose">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <polyline points="1 4 1 10 7 10" />
              <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
            </svg>
          </div>
          <div class="shortcut-info">
            <div class="shortcut-label">Rückgaben</div>
            <div class="shortcut-desc">Rückgaben verwalten</div>
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
        <a routerLink="/parts" class="shortcut-card">
          <div class="shortcut-icon-wrap accent-amber">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"
              />
            </svg>
          </div>
          <div class="shortcut-info">
            <div class="shortcut-label">Zubehör</div>
            <div class="shortcut-desc">Zubehörteile</div>
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
        <a routerLink="/settings" class="shortcut-card">
          <div class="shortcut-icon-wrap accent-slate">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <circle cx="12" cy="12" r="3" />
              <path
                d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"
              />
            </svg>
          </div>
          <div class="shortcut-info">
            <div class="shortcut-label">Einstellungen</div>
            <div class="shortcut-desc">App konfigurieren</div>
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
            <h2>Letzte Ankäufe</h2>
            <a routerLink="/purchases" class="view-all"
              >Alle ansehen
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
                  <th>Beleg-Nr.</th>
                  <th>Fahrrad</th>
                  <th>Verkäufer</th>
                  <th>Preis</th>
                  <th>Datum</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  *ngFor="let p of data.recentPurchases"
                  class="clickable-row"
                  (click)="goToPurchase(p.id)"
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
              <p>Keine Ankäufe vorhanden</p>
            </div>
          </ng-template>
        </div>

        <div class="recent-section">
          <div class="section-header">
            <h2>Letzte Verkäufe</h2>
            <a routerLink="/sales" class="view-all"
              >Alle ansehen
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
                  <th>Beleg-Nr.</th>
                  <th>Fahrrad</th>
                  <th>Käufer</th>
                  <th>Preis</th>
                  <th>Datum</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  *ngFor="let s of data.recentSales"
                  class="clickable-row"
                  (click)="goToSale(s.id)"
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
              <p>Keine Verkäufe vorhanden</p>
            </div>
          </ng-template>
        </div>
      </div>
    </div>
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
    `,
  ],
})
export class DashboardComponent implements OnInit {
  data: Dashboard | null = null;

  constructor(
    private dashboardService: DashboardService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.dashboardService.getDashboard().subscribe((d) => (this.data = d));
  }

  goToPurchase(id: number) {
    this.router.navigate(['/purchases/edit', id]);
  }

  goToSale(id: number) {
    this.router.navigate(['/sales/edit', id]);
  }
}
