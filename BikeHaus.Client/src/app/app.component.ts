import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { TranslationService } from './services/translation.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="app-layout">
      <aside class="sidebar" [class.open]="sidebarOpen">
        <div class="brand">
          <span class="brand-icon">🚲</span>
          <span class="brand-text">Bike Haus<br /><small>Freiburg</small></span>
        </div>
        <nav>
          <a
            routerLink="/"
            routerLinkActive="active"
            [routerLinkActiveOptions]="{ exact: true }"
            (click)="closeSidebar()"
          >
            <span class="nav-icon">📊</span> {{ t.dashboard }}
          </a>
          <a
            routerLink="/bicycles"
            routerLinkActive="active"
            (click)="closeSidebar()"
          >
            <span class="nav-icon">🚴</span> {{ t.bicycles }}
          </a>
          <a
            routerLink="/customers"
            routerLinkActive="active"
            (click)="closeSidebar()"
          >
            <span class="nav-icon">👥</span> {{ t.customers }}
          </a>
          <a
            routerLink="/purchases"
            routerLinkActive="active"
            (click)="closeSidebar()"
          >
            <span class="nav-icon">📥</span> {{ t.purchases }}
          </a>
          <a
            routerLink="/sales"
            routerLinkActive="active"
            (click)="closeSidebar()"
          >
            <span class="nav-icon">📤</span> {{ t.sales }}
          </a>
          <a
            routerLink="/parts"
            routerLinkActive="active"
            (click)="closeSidebar()"
          >
            <span class="nav-icon">🔧</span> Zubehör
          </a>
          <a
            routerLink="/returns"
            routerLinkActive="active"
            (click)="closeSidebar()"
          >
            <span class="nav-icon">↩️</span> {{ t.returns }}
          </a>
          <a
            routerLink="/statistics"
            routerLinkActive="active"
            (click)="closeSidebar()"
          >
            <span class="nav-icon">📈</span> {{ t.statistics }}
          </a>
          <a
            routerLink="/settings"
            routerLinkActive="active"
            (click)="closeSidebar()"
            class="nav-settings"
          >
            <span class="nav-icon">⚙️</span> {{ t.settings }}
          </a>
        </nav>
      </aside>
      <div
        class="sidebar-overlay"
        *ngIf="sidebarOpen"
        (click)="closeSidebar()"
      ></div>
      <main class="main-content">
        <header class="topbar">
          <button class="menu-toggle" (click)="sidebarOpen = !sidebarOpen">
            ☰
          </button>
          <span class="topbar-title">Bike Haus Freiburg</span>
        </header>
        <div class="content-area">
          <router-outlet></router-outlet>
        </div>
      </main>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        height: 100vh;
      }
      .app-layout {
        display: flex;
        height: 100%;
      }

      .sidebar {
        width: 230px;
        min-width: 230px;
        background: var(
          --sidebar-bg,
          linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)
        );
        color: var(--text-sidebar);
        display: flex;
        flex-direction: column;
        transition:
          transform 0.3s,
          background 0.3s;
      }
      .brand {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 20px 18px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      }
      .brand-icon {
        font-size: 2rem;
      }
      .brand-text {
        font-weight: 700;
        font-size: 1.1rem;
        line-height: 1.2;
      }
      .brand-text small {
        font-weight: 400;
        font-size: 0.75rem;
        opacity: 0.7;
      }

      nav {
        flex: 1;
        padding: 12px 0;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      nav a {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 11px 20px;
        color: rgba(255, 255, 255, 0.7);
        text-decoration: none;
        font-size: 0.92rem;
        border-left: 3px solid transparent;
        transition: all 0.2s;
      }
      nav a:hover {
        color: #fff;
        background: rgba(255, 255, 255, 0.06);
      }
      nav a.active {
        color: #fff;
        background: rgba(255, 255, 255, 0.1);
        border-left-color: #4cc9f0;
      }
      .nav-icon {
        font-size: 1.15rem;
      }

      .main-content {
        flex: 1;
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }

      .topbar {
        padding: 12px 24px;
        background: var(--bg-secondary);
        border-bottom: 1px solid var(--border-light);
        display: flex;
        align-items: center;
        gap: 12px;
        transition:
          background 0.3s,
          border-color 0.3s;
      }
      .topbar-title {
        font-weight: 600;
        font-size: 1.05rem;
        color: var(--text-primary);
      }
      .menu-toggle {
        display: none;
        background: none;
        border: none;
        font-size: 1.3rem;
        cursor: pointer;
        padding: 4px 8px;
        color: var(--text-primary);
      }

      .content-area {
        flex: 1;
        overflow-y: auto;
        padding: 24px;
        background: var(--bg-primary);
        transition: background 0.3s;
      }

      nav .nav-settings {
        margin-top: auto;
        border-top: 1px solid rgba(255, 255, 255, 0.08);
      }

      .sidebar-overlay {
        display: none;
      }

      @media (max-width: 768px) {
        .sidebar {
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
          z-index: 100;
          transform: translateX(-100%);
        }
        .sidebar.open {
          transform: translateX(0);
        }
        .menu-toggle {
          display: block;
        }
        .sidebar-overlay {
          display: block;
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.4);
          z-index: 99;
        }
      }
    `,
  ],
})
export class AppComponent {
  title = 'BikeHaus.Client';
  sidebarOpen = false;
  private translationService = inject(TranslationService);

  get t() {
    return this.translationService.translations();
  }

  closeSidebar() {
    this.sidebarOpen = false;
  }
}
