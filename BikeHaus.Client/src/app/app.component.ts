import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { TranslationService } from './services/translation.service';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <!-- Login page: no sidebar -->
    <ng-container *ngIf="!authService.isLoggedIn()">
      <router-outlet></router-outlet>
    </ng-container>

    <!-- Authenticated layout -->
    <div class="app-layout" *ngIf="authService.isLoggedIn()">
      <aside class="sidebar" [class.open]="sidebarOpen">
        <div class="brand">
          <div class="brand-icon-wrap">
            <img src="assets/logo.svg" alt="Bike Haus" class="brand-logo" />
          </div>
          <div class="brand-info">
            <span class="brand-name">BikeHaus</span>
            <span class="brand-sub">Freiburg</span>
          </div>
        </div>

        <div class="nav-section-label">Menu</div>
        <nav>
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }" (click)="closeSidebar()">
            <span class="nav-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
            </span>
            <span class="nav-label">{{ t.dashboard }}</span>
          </a>
          <a routerLink="/bicycles" routerLinkActive="active" (click)="closeSidebar()">
            <span class="nav-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="18.5" cy="17.5" r="3.5"/><path d="M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm-3 11.5V14l-3-3 4-3 2 3h2"/></svg>
            </span>
            <span class="nav-label">{{ t.bicycles }}</span>
          </a>
          <a routerLink="/customers" routerLinkActive="active" (click)="closeSidebar()">
            <span class="nav-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </span>
            <span class="nav-label">{{ t.customers }}</span>
          </a>

          <div class="nav-divider"></div>
          <div class="nav-section-label">Transaktionen</div>

          <a routerLink="/purchases" routerLinkActive="active" (click)="closeSidebar()">
            <span class="nav-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
            </span>
            <span class="nav-label">{{ t.purchases }}</span>
          </a>
          <a routerLink="/sales" routerLinkActive="active" (click)="closeSidebar()">
            <span class="nav-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            </span>
            <span class="nav-label">{{ t.sales }}</span>
          </a>
          <a routerLink="/reservations" routerLinkActive="active" (click)="closeSidebar()">
            <span class="nav-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            </span>
            <span class="nav-label">{{ t.reservations }}</span>
          </a>
          <a routerLink="/returns" routerLinkActive="active" (click)="closeSidebar()">
            <span class="nav-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
            </span>
            <span class="nav-label">{{ t.returns }}</span>
          </a>

          <div class="nav-divider"></div>
          <div class="nav-section-label">Extras</div>

          <a routerLink="/parts" routerLinkActive="active" (click)="closeSidebar()">
            <span class="nav-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
            </span>
            <span class="nav-label">Zubehör</span>
          </a>
          <a routerLink="/statistics" routerLinkActive="active" (click)="closeSidebar()">
            <span class="nav-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
            </span>
            <span class="nav-label">{{ t.statistics }}</span>
          </a>
          <a routerLink="/settings" routerLinkActive="active" (click)="closeSidebar()" class="nav-settings">
            <span class="nav-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
            </span>
            <span class="nav-label">{{ t.settings }}</span>
          </a>
        </nav>
      </aside>

      <div class="sidebar-overlay" *ngIf="sidebarOpen" (click)="closeSidebar()"></div>

      <main class="main-content">
        <header class="topbar">
          <button class="menu-toggle" (click)="sidebarOpen = !sidebarOpen">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
          <img src="assets/logo.svg" alt="Bike Haus" class="topbar-logo" />
          <div class="topbar-spacer"></div>
          <div class="topbar-right">
            <div class="user-info">
              <div class="user-avatar">{{ getInitials() }}</div>
              <span class="user-name">{{ authService.displayName() }}</span>
            </div>
            <button class="btn-logout" (click)="logout()" title="Abmelden">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            </button>
          </div>
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

      /* ══ SIDEBAR ══ */
      .sidebar {
        width: 260px;
        min-width: 260px;
        background: var(--sidebar-bg);
        color: var(--text-sidebar);
        display: flex;
        flex-direction: column;
        transition: transform var(--transition-smooth, 0.35s);
        border-right: 1px solid rgba(255,255,255,0.04);
        z-index: 100;
      }

      .brand {
        display: flex;
        align-items: center;
        gap: 14px;
        padding: 24px 22px;
        border-bottom: 1px solid rgba(255,255,255,0.06);
      }
      .brand-icon-wrap {
        width: 44px;
        height: 44px;
        border-radius: 12px;
        background: linear-gradient(135deg, rgba(99,102,241,0.3), rgba(79,70,229,0.2));
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      .brand-logo {
        width: 28px;
        height: 28px;
        object-fit: contain;
        filter: brightness(0) invert(1);
      }
      .brand-info {
        display: flex;
        flex-direction: column;
      }
      .brand-name {
        font-weight: 800;
        font-size: 1.15rem;
        letter-spacing: -0.02em;
        line-height: 1.2;
      }
      .brand-sub {
        font-size: 0.72rem;
        font-weight: 400;
        opacity: 0.5;
        text-transform: uppercase;
        letter-spacing: 0.15em;
      }

      .nav-section-label {
        padding: 16px 22px 6px;
        font-size: 0.68rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.12em;
        color: rgba(255,255,255,0.3);
      }

      .nav-divider {
        margin: 4px 22px;
        border-top: 1px solid rgba(255,255,255,0.05);
      }

      nav {
        flex: 1;
        padding: 4px 0 12px;
        display: flex;
        flex-direction: column;
        gap: 1px;
        overflow-y: auto;
      }
      nav a {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 10px 22px;
        margin: 0 10px;
        color: rgba(255,255,255,0.55);
        text-decoration: none;
        font-size: 0.88rem;
        font-weight: 500;
        border-radius: 10px;
        transition: all 0.2s ease;
        position: relative;
      }
      nav a:hover {
        color: rgba(255,255,255,0.9);
        background: rgba(255,255,255,0.06);
        text-decoration: none;
      }
      nav a.active {
        color: #fff;
        background: linear-gradient(135deg, rgba(99,102,241,0.25), rgba(99,102,241,0.12));
        box-shadow: 0 0 20px rgba(99,102,241,0.15);
      }
      nav a.active::before {
        content: '';
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 3px;
        height: 20px;
        background: #818cf8;
        border-radius: 0 4px 4px 0;
      }
      .nav-icon {
        display: flex;
        align-items: center;
        opacity: 0.8;
        flex-shrink: 0;
      }
      nav a.active .nav-icon {
        opacity: 1;
        color: #a5b4fc;
      }
      .nav-label {
        white-space: nowrap;
      }

      nav .nav-settings {
        margin-top: auto;
        border-top: 1px solid rgba(255,255,255,0.05);
        padding-top: 14px;
      }

      /* ══ MAIN ══ */
      .main-content {
        flex: 1;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        min-width: 0;
      }

      /* ══ TOPBAR ══ */
      .topbar {
        padding: 0 28px;
        height: 64px;
        background: var(--bg-secondary);
        border-bottom: 1px solid var(--border-light);
        display: flex;
        align-items: center;
        gap: 16px;
        transition: all var(--transition-smooth, 0.35s);
        box-shadow: var(--shadow-xs, 0 1px 2px rgba(0,0,0,0.04));
        position: relative;
        z-index: 10;
      }
      .topbar-logo {
        width: 30px;
        height: 30px;
        display: none;
      }
      .menu-toggle {
        display: none;
        background: none;
        border: none;
        cursor: pointer;
        padding: 6px;
        color: var(--text-secondary);
        border-radius: 8px;
        transition: all 0.15s;
      }
      .menu-toggle:hover {
        background: var(--accent-primary-light, rgba(99,102,241,0.08));
        color: var(--accent-primary);
      }

      .topbar-spacer { flex: 1; }

      .topbar-right {
        display: flex;
        align-items: center;
        gap: 16px;
      }
      .user-info {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .user-avatar {
        width: 36px;
        height: 36px;
        border-radius: 10px;
        background: linear-gradient(135deg, var(--accent-primary), var(--accent-primary-hover, #4f46e5));
        color: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.78rem;
        font-weight: 700;
        letter-spacing: 0.02em;
      }
      .user-name {
        font-size: 0.88rem;
        font-weight: 600;
        color: var(--text-primary);
      }

      .btn-logout {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 38px;
        height: 38px;
        padding: 0;
        background: transparent;
        border: 1.5px solid var(--border-color);
        border-radius: 10px;
        cursor: pointer;
        color: var(--text-muted);
        transition: all 0.2s;
      }
      .btn-logout:hover {
        background: var(--accent-danger-light, rgba(239,68,68,0.08));
        border-color: var(--accent-danger);
        color: var(--accent-danger);
      }

      /* ══ CONTENT ══ */
      .content-area {
        flex: 1;
        overflow-y: auto;
        padding: 28px;
        background: var(--bg-primary);
        transition: background var(--transition-smooth, 0.35s);
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
          transform: translateX(-100%);
          box-shadow: none;
        }
        .sidebar.open {
          transform: translateX(0);
          box-shadow: 8px 0 30px rgba(0,0,0,0.3);
        }
        .menu-toggle {
          display: flex;
        }
        .topbar-logo {
          display: block;
        }
        .user-name {
          display: none;
        }
        .sidebar-overlay {
          display: block;
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.5);
          z-index: 99;
          backdrop-filter: blur(2px);
        }
        .content-area {
          padding: 20px 16px;
        }
      }
    `,
  ],
})
export class AppComponent {
  title = 'BikeHaus.Client';
  sidebarOpen = false;
  private translationService = inject(TranslationService);
  authService = inject(AuthService);

  get t() {
    return this.translationService.translations();
  }

  getInitials(): string {
    const name = this.authService.displayName();
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  }

  closeSidebar() {
    this.sidebarOpen = false;
  }

  logout() {
    this.authService.logout();
  }
}
