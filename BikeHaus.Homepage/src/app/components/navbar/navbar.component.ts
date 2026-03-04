import { Component, inject, HostListener, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import {
  TranslationService,
  Language,
} from '../../services/translation.service';
import { ShopInfoService } from '../../services/shop-info.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="navbar" [class.scrolled]="scrolled()" role="banner">
      <nav class="container nav-inner" aria-label="Main navigation">
        <a
          [routerLink]="['/' + currentLang()]"
          class="brand"
          aria-label="Bike Haus Freiburg Home"
        >
          <img [src]="logoUrl()" alt="Bike Haus Freiburg" class="brand-logo" />
          <span class="brand-name"
            >Bike Haus<span class="brand-city">Freiburg</span></span
          >
        </a>

        <button
          class="menu-toggle"
          (click)="menuOpen = !menuOpen"
          [class.active]="menuOpen"
          [attr.aria-expanded]="menuOpen"
          aria-label="Menu"
        >
          <span></span><span></span><span></span>
        </button>

        <div class="nav-menu" [class.open]="menuOpen">
          <a
            *ngFor="let link of navLinks"
            [routerLink]="['/' + currentLang(), link.path]"
            routerLinkActive="active"
            [routerLinkActiveOptions]="{ exact: link.exact }"
            (click)="menuOpen = false"
            >{{ link.label() }}</a
          >

          <div class="lang-switch">
            <button
              *ngFor="let lang of languages"
              [class.active]="currentLang() === lang.code"
              (click)="switchLang(lang.code)"
              [attr.aria-label]="lang.label"
            >
              {{ lang.code.toUpperCase() }}
            </button>
          </div>
        </div>
      </nav>
    </header>
  `,
  styles: [
    `
      .navbar {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        z-index: 1000;
        padding: 1.25rem 0;
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .navbar.scrolled {
        padding: 0.6rem 0;
        background: rgba(10, 10, 10, 0.92);
        backdrop-filter: blur(20px) saturate(180%);
        -webkit-backdrop-filter: blur(20px) saturate(180%);
        border-bottom: 1px solid rgba(255, 255, 255, 0.06);
      }

      .nav-inner {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      /* Brand */
      .brand {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        text-decoration: none;
        z-index: 10;
      }

      .brand-logo {
        width: 40px;
        height: 40px;
        border-radius: 10px;
        background: var(--color-surface);
        padding: 4px;
      }

      .brand-name {
        font-weight: 700;
        font-size: 1.1rem;
        color: #fff;
        letter-spacing: -0.02em;
      }

      .brand-city {
        display: block;
        font-weight: 400;
        font-size: 0.7rem;
        color: var(--color-text-secondary);
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }

      /* Menu Toggle (Mobile) */
      .menu-toggle {
        display: none;
        flex-direction: column;
        gap: 5px;
        background: none;
        border: none;
        cursor: pointer;
        padding: 6px;
        z-index: 10;
      }

      .menu-toggle span {
        display: block;
        width: 22px;
        height: 1.5px;
        background: #fff;
        transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        transform-origin: center;
      }

      .menu-toggle.active span:nth-child(1) {
        transform: rotate(45deg) translate(4.5px, 4.5px);
      }
      .menu-toggle.active span:nth-child(2) {
        opacity: 0;
      }
      .menu-toggle.active span:nth-child(3) {
        transform: rotate(-45deg) translate(4.5px, -4.5px);
      }

      /* Nav Menu */
      .nav-menu {
        display: flex;
        align-items: center;
        gap: 2rem;
      }

      .nav-menu a {
        text-decoration: none;
        color: var(--color-text-secondary);
        font-weight: 500;
        font-size: 0.9rem;
        letter-spacing: 0.01em;
        padding: 0.25rem 0;
        position: relative;
        transition: color 0.3s;
      }

      .nav-menu a::after {
        content: '';
        position: absolute;
        bottom: -2px;
        left: 0;
        width: 0;
        height: 1.5px;
        background: var(--color-accent);
        transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .nav-menu a:hover,
      .nav-menu a.active {
        color: #fff;
      }

      .nav-menu a.active::after,
      .nav-menu a:hover::after {
        width: 100%;
      }

      /* Language Switcher */
      .lang-switch {
        display: flex;
        gap: 2px;
        margin-left: 0.75rem;
        border-left: 1px solid var(--color-border);
        padding-left: 1.5rem;
      }

      .lang-switch button {
        background: none;
        border: 1px solid transparent;
        border-radius: 6px;
        color: var(--color-text-muted);
        font-weight: 600;
        font-size: 0.72rem;
        letter-spacing: 0.06em;
        cursor: pointer;
        padding: 0.3rem 0.5rem;
        transition: all 0.2s;
        font-family: var(--font-family);
      }

      .lang-switch button:hover {
        color: var(--color-text-secondary);
      }

      .lang-switch button.active {
        color: #fff;
        background: var(--color-surface-elevated);
        border-color: var(--color-border-hover);
      }

      /* Mobile */
      @media (max-width: 768px) {
        .menu-toggle {
          display: flex;
        }

        .nav-menu {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: #000;
          flex-direction: column;
          justify-content: flex-start;
          align-items: center;
          gap: 0;
          padding: 5rem 2rem 2rem;
          z-index: 999;
        }

        .nav-menu.open {
          display: flex;
        }

        .nav-menu a {
          font-size: 1.5rem;
          font-weight: 700;
          padding: 1rem 0;
          color: var(--color-text-secondary);
        }

        .nav-menu a.active {
          color: #fff;
        }

        .lang-switch {
          border-left: none;
          border-top: 1px solid var(--color-border);
          padding-left: 0;
          padding-top: 1.5rem;
          margin-left: 0;
          margin-top: 1rem;
        }

        .lang-switch button {
          font-size: 0.85rem;
          padding: 0.5rem 0.75rem;
        }
      }
    `,
  ],
})
export class NavbarComponent {
  private translationService = inject(TranslationService);
  private router = inject(Router);
  private shopInfoService = inject(ShopInfoService);

  t = this.translationService.translations;
  currentLang = this.translationService.currentLanguage;
  logoUrl = this.shopInfoService.logoUrl;
  private _menuOpen = false;
  scrolled = signal(false);

  get menuOpen(): boolean {
    return this._menuOpen;
  }

  set menuOpen(value: boolean) {
    this._menuOpen = value;
    // Prevent body scroll when menu is open
    document.body.style.overflow = value ? 'hidden' : '';
  }

  navLinks = [
    { path: '', label: () => this.t().home, exact: true },
    { path: 'showroom', label: () => this.t().showroom, exact: false },
    {
      path: 'neue-fahrraeder',
      label: () => this.t().neueFahrraeder,
      exact: false,
    },
    { path: 'zubehoer', label: () => this.t().accessories, exact: false },
    { path: 'about', label: () => this.t().about, exact: false },
    { path: 'contact', label: () => this.t().contact, exact: false },
  ];

  languages: { code: Language; label: string }[] = [
    { code: 'de', label: 'Deutsch' },
    { code: 'en', label: 'English' },
    { code: 'fr', label: 'Français' },
    { code: 'tr', label: 'Türkçe' },
  ];

  @HostListener('window:scroll')
  onScroll(): void {
    this.scrolled.set(window.scrollY > 40);
  }

  switchLang(lang: Language): void {
    const currentUrl = this.router.url;
    const segments = currentUrl.split('/');
    segments[1] = lang;
    this.router.navigateByUrl(segments.join('/'));
    this.menuOpen = false;
  }
}
