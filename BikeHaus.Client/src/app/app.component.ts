import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { TranslationService } from './services/translation.service';
import { AuthService } from './services/auth.service';
import { SettingsService, ShopSettings } from './services/settings.service';
import { ThemeService } from './services/theme.service';
import { PurchaseService } from './services/purchase.service';
import { NotificationComponent } from './components/notification/notification.component';
import { DialogComponent } from './components/dialog/dialog.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    NotificationComponent,
    DialogComponent,
  ],
  template: `
    <!-- Login page: no sidebar -->
    <ng-container *ngIf="!authService.isLoggedIn()">
      <router-outlet></router-outlet>
    </ng-container>

    <!-- Authenticated layout -->
    <div class="app-layout" *ngIf="authService.isLoggedIn()">
      <!-- Skip Link für Barrierefreiheit -->
      <a href="#main-content" class="skip-link">{{ t.skipToMain }}</a>

      <aside
        class="sidebar"
        [class.open]="sidebarOpen"
        role="complementary"
        aria-label="Hauptnavigation"
      >
        <div class="brand">
          <div class="brand-icon-wrap">
            <img
              [src]="logoSrc()"
              alt="Bike Haus Logo"
              class="brand-logo"
              [class.no-filter]="hasCustomLogo()"
            />
          </div>
          <div class="brand-info">
            <span class="brand-name">BikeHaus</span>
            <span class="brand-sub">Freiburg</span>
          </div>
        </div>

        <div class="nav-section-label" id="menu-label">Menu</div>
        <nav role="navigation" aria-labelledby="menu-label">
          <a
            routerLink="/"
            routerLinkActive="active"
            [routerLinkActiveOptions]="{ exact: true }"
            (click)="closeSidebar()"
          >
            <span class="nav-icon">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
              </svg>
            </span>
            <span class="nav-label">{{ t.dashboard }}</span>
          </a>
          <a
            routerLink="/bicycles"
            routerLinkActive="active"
            (click)="closeSidebar()"
          >
            <span class="nav-icon">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <circle cx="5.5" cy="17.5" r="3.5" />
                <circle cx="18.5" cy="17.5" r="3.5" />
                <path
                  d="M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm-3 11.5V14l-3-3 4-3 2 3h2"
                />
              </svg>
            </span>
            <span class="nav-label">{{ t.bicycles }}</span>
          </a>
          <a
            routerLink="/neue-fahrraeder"
            routerLinkActive="active"
            (click)="closeSidebar()"
          >
            <span class="nav-icon">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <circle cx="5.5" cy="17.5" r="3.5" />
                <circle cx="18.5" cy="17.5" r="3.5" />
                <path
                  d="M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm-3 11.5V14l-3-3 4-3 2 3h2"
                />
                <line x1="12" y1="2" x2="12" y2="6" />
                <line x1="10" y1="4" x2="14" y2="4" />
              </svg>
            </span>
            <span class="nav-label">{{ t.neueFahrraeder }}</span>
          </a>
          <a
            routerLink="/homepage-accessories"
            routerLinkActive="active"
            (click)="closeSidebar()"
          >
            <span class="nav-icon">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
            </span>
            <span class="nav-label">{{ t.homepageAccessories }}</span>
          </a>

          <div class="nav-divider"></div>
          <div class="nav-section-label">Transaktionen</div>

          <a
            routerLink="/purchases"
            routerLinkActive="active"
            (click)="closeSidebar()"
          >
            <span class="nav-icon">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
            </span>
            <span class="nav-label">{{ t.purchases }}</span>
            <span class="nav-badge" *ngIf="missingPurchasesCount() > 0">{{
              missingPurchasesCount()
            }}</span>
          </a>
          <a
            routerLink="/sales"
            routerLinkActive="active"
            (click)="closeSidebar()"
          >
            <span class="nav-icon">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </span>
            <span class="nav-label">{{ t.sales }}</span>
          </a>
          <a
            routerLink="/returns"
            routerLinkActive="active"
            (click)="closeSidebar()"
          >
            <span class="nav-icon">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <polyline points="1 4 1 10 7 10" />
                <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
              </svg>
            </span>
            <span class="nav-label">{{ t.returns }}</span>
          </a>

          <div class="nav-divider"></div>
          <div class="nav-section-label">Extras</div>

          <a
            routerLink="/labels"
            routerLinkActive="active"
            (click)="closeSidebar()"
          >
            <span class="nav-icon">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path
                  d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"
                />
                <line x1="7" y1="7" x2="7.01" y2="7" />
              </svg>
            </span>
            <span class="nav-label">Etiketten</span>
          </a>
          <a
            routerLink="/parts"
            routerLinkActive="active"
            (click)="closeSidebar()"
          >
            <span class="nav-icon">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path
                  d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"
                />
              </svg>
            </span>
            <span class="nav-label">Zubehör</span>
          </a>
          <a
            routerLink="/expenses"
            routerLinkActive="active"
            (click)="closeSidebar()"
          >
            <span class="nav-icon">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <rect x="2" y="5" width="20" height="14" rx="2" />
                <line x1="2" y1="10" x2="22" y2="10" />
              </svg>
            </span>
            <span class="nav-label">{{ t.expenses }}</span>
          </a>
          <a
            routerLink="/invoices"
            routerLinkActive="active"
            (click)="closeSidebar()"
          >
            <span class="nav-icon">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
            </span>
            <span class="nav-label">{{ t.invoices }}</span>
          </a>
          <a
            routerLink="/statistics"
            routerLinkActive="active"
            (click)="closeSidebar()"
          >
            <span class="nav-icon">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <line x1="18" y1="20" x2="18" y2="10" />
                <line x1="12" y1="20" x2="12" y2="4" />
                <line x1="6" y1="20" x2="6" y2="14" />
              </svg>
            </span>
            <span class="nav-label">{{ t.statistics }}</span>
          </a>
          <a
            routerLink="/archive"
            routerLinkActive="active"
            (click)="closeSidebar()"
          >
            <span class="nav-icon">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M21 8v13H3V8" />
                <path d="M1 3h22v5H1z" />
                <path d="M10 12h4" />
              </svg>
            </span>
            <span class="nav-label">{{ t.archive }}</span>
          </a>
          <a
            routerLink="/settings"
            routerLinkActive="active"
            (click)="closeSidebar()"
            class="nav-settings"
          >
            <span class="nav-icon">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <circle cx="12" cy="12" r="3" />
                <path
                  d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"
                />
              </svg>
            </span>
            <span class="nav-label">{{ t.settings }}</span>
          </a>
        </nav>
      </aside>

      <div
        class="sidebar-overlay"
        *ngIf="sidebarOpen"
        (click)="closeSidebar()"
        role="button"
        aria-label="Menü schließen"
      ></div>

      <main id="main-content" class="main-content" role="main">
        <header class="topbar" role="banner">
          <button
            class="menu-toggle"
            (click)="sidebarOpen = !sidebarOpen"
            [attr.aria-expanded]="sidebarOpen"
            aria-controls="sidebar"
            aria-label="Menü öffnen/schließen"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              aria-hidden="true"
            >
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <img
            [src]="logoSrc()"
            alt="Bike Haus"
            class="topbar-logo"
            [class.no-filter]="hasCustomLogo()"
          />
          <div class="topbar-spacer"></div>
          <div class="topbar-right">
            <button
              class="btn-theme-toggle"
              (click)="themeService.toggleTheme()"
              [title]="
                themeService.currentTheme() === 'dark'
                  ? t.darkMode + ' (An)'
                  : t.darkMode + ' (Aus)'
              "
            >
              <!-- Sun icon for dark mode (click to go light) -->
              <svg
                *ngIf="themeService.currentTheme() === 'dark'"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
              <!-- Moon icon for light mode (click to go dark) -->
              <svg
                *ngIf="themeService.currentTheme() === 'light'"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            </button>
            <div class="user-info">
              <div class="user-avatar">{{ getInitials() }}</div>
              <span class="user-name">{{ ownerDisplayName() }}</span>
            </div>
          </div>
        </header>
        <div class="content-area">
          <router-outlet></router-outlet>
        </div>
      </main>
    </div>

    <!-- Global Notification & Dialog -->
    <app-notification></app-notification>
    <app-dialog></app-dialog>
  `,
  styles: [
    `
      :host {
        display: block;
        height: 100vh;
      }

      /* ══ SKIP LINK (Barrierefreiheit) ══ */
      .skip-link {
        position: absolute;
        top: -100px;
        left: 16px;
        padding: 12px 24px;
        background: var(--accent-primary, #6366f1);
        color: #fff;
        text-decoration: none;
        font-weight: 600;
        border-radius: 8px;
        z-index: 9999;
        transition: top 0.2s ease;
      }
      .skip-link:focus {
        top: 16px;
        outline: 2px solid var(--accent-primary, #6366f1);
        outline-offset: 2px;
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
        border-right: 1px solid rgba(255, 255, 255, 0.04);
        z-index: 100;
      }

      .brand {
        display: flex;
        align-items: center;
        gap: 14px;
        padding: 24px 22px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.06);
      }
      .brand-icon-wrap {
        width: 44px;
        height: 44px;
        border-radius: 12px;
        background: linear-gradient(
          135deg,
          rgba(99, 102, 241, 0.3),
          rgba(79, 70, 229, 0.2)
        );
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
      .brand-logo.no-filter {
        filter: none;
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
        color: rgba(255, 255, 255, 0.3);
      }

      .nav-divider {
        margin: 4px 22px;
        border-top: 1px solid rgba(255, 255, 255, 0.05);
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
        color: rgba(255, 255, 255, 0.55);
        text-decoration: none;
        font-size: 0.88rem;
        font-weight: 500;
        border-radius: 10px;
        transition: all 0.2s ease;
        position: relative;
      }
      nav a:hover {
        color: rgba(255, 255, 255, 0.9);
        background: rgba(255, 255, 255, 0.06);
        text-decoration: none;
      }
      nav a.active {
        color: #fff;
        background: linear-gradient(
          135deg,
          rgba(99, 102, 241, 0.25),
          rgba(99, 102, 241, 0.12)
        );
        box-shadow: 0 0 20px rgba(99, 102, 241, 0.15);
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
      .nav-badge {
        margin-left: auto;
        background: #ef4444;
        color: #fff;
        font-size: 0.7rem;
        font-weight: 700;
        min-width: 20px;
        height: 20px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0 6px;
        line-height: 1;
      }

      nav .nav-settings {
        margin-top: auto;
        border-top: 1px solid rgba(255, 255, 255, 0.05);
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
        box-shadow: var(--shadow-xs, 0 1px 2px rgba(0, 0, 0, 0.04));
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
        background: var(--accent-primary-light, rgba(99, 102, 241, 0.08));
        color: var(--accent-primary);
      }

      .topbar-spacer {
        flex: 1;
      }

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
        background: linear-gradient(
          135deg,
          var(--accent-primary),
          var(--accent-primary-hover, #4f46e5)
        );
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

      .btn-theme-toggle {
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
      .btn-theme-toggle:hover {
        background: var(--accent-light, rgba(79, 70, 229, 0.08));
        border-color: var(--accent);
        color: var(--accent);
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
        background: var(--accent-danger-light, rgba(239, 68, 68, 0.08));
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
          box-shadow: 8px 0 30px rgba(0, 0, 0, 0.3);
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
          background: rgba(0, 0, 0, 0.5);
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
export class AppComponent implements OnInit {
  title = 'BikeHaus.Client';
  sidebarOpen = false;
  private translationService = inject(TranslationService);
  private settingsService = inject(SettingsService);
  private purchaseService = inject(PurchaseService);
  authService = inject(AuthService);
  themeService = inject(ThemeService);

  settings = signal<ShopSettings | null>(null);

  logoSrc = signal('assets/logo.svg');
  hasCustomLogo = signal(false);
  ownerDisplayName = signal('');
  missingPurchasesCount = signal(0);

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.loadSettings();
      this.loadMissingPurchasesCount();
    }
  }

  private loadMissingPurchasesCount(): void {
    this.purchaseService.getMissingSalesCount().subscribe({
      next: (res) => this.missingPurchasesCount.set(res.count),
      error: () => {},
    });
  }

  private loadSettings(): void {
    this.settingsService.getSettings().subscribe({
      next: (settings) => {
        this.settings.set(settings);

        // Set logo
        if (settings.logoBase64) {
          this.logoSrc.set(settings.logoBase64);
          this.hasCustomLogo.set(true);
          this.updateFavicon(settings.logoBase64);
        }

        // Set owner name
        const ownerName = [settings.inhaberVorname, settings.inhaberNachname]
          .filter(Boolean)
          .join(' ');
        this.ownerDisplayName.set(ownerName || this.authService.displayName());
      },
      error: () => {
        this.ownerDisplayName.set(this.authService.displayName());
      },
    });
  }

  private updateFavicon(base64: string): void {
    const link =
      (document.querySelector("link[rel*='icon']") as HTMLLinkElement) ||
      document.createElement('link');
    link.type = 'image/x-icon';
    link.rel = 'icon';
    link.href = base64;
    document.head.appendChild(link);
  }

  get t() {
    return this.translationService.translations();
  }

  getInitials(): string {
    const name = this.ownerDisplayName() || this.authService.displayName();
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  closeSidebar() {
    this.sidebarOpen = false;
  }

  logout() {
    this.authService.logout();
  }
}
