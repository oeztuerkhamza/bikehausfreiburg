import {
  Component,
  inject,
  HostListener,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import {
  TranslationService,
  Language,
} from '../../services/translation.service';
import { ShopInfoService } from '../../services/shop-info.service';
import {
  LANGUAGE_LABELS,
  SUPPORTED_LANGUAGES,
} from '../../services/language-config';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="navbar" [class.scrolled]="scrolled()" role="banner">
      <nav
        class="container nav-inner"
        [attr.aria-label]="t().navbarMainNavAria"
      >
        <a
          [routerLink]="['/' + currentLang()]"
          class="brand"
          [attr.aria-label]="t().navbarHomeAria"
        >
          <img
            [src]="logoUrl()"
            [alt]="t().navbarLogoAlt"
            class="brand-logo"
            width="40"
            height="40"
          />
          <span class="brand-name"
            >Bike Haus<span class="brand-city">Freiburg</span></span
          >
        </a>

        <button
          class="menu-toggle"
          (click)="toggleMenu()"
          [class.active]="menuOpen"
          [attr.aria-expanded]="menuOpen"
          [attr.aria-label]="t().navbarMenuAria"
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
          position: relative;
          z-index: 2002;
        }

        .nav-menu {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background:
            radial-gradient(
              circle at top,
              rgba(255, 87, 34, 0.14),
              transparent 22%
            ),
            radial-gradient(
              circle at bottom,
              rgba(16, 185, 129, 0.12),
              transparent 24%
            ),
            rgba(5, 8, 13, 0.985);
          backdrop-filter: blur(18px) saturate(140%);
          -webkit-backdrop-filter: blur(18px) saturate(140%);
          flex-direction: column;
          justify-content: center;
          align-items: center;
          gap: 0.8rem;
          padding: 6.5rem 1.25rem 2rem;
          overflow-y: auto;
          z-index: 2001;
        }

        .nav-menu.open {
          display: flex;
        }

        .nav-menu a {
          font-size: 1.2rem;
          font-weight: 700;
          padding: 1rem 1.1rem;
          color: #f8fafc;
          line-height: 1.15;
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

      .navbar {
        padding: 1rem 0;
      }

      .nav-inner {
        padding: 0.9rem 1.25rem;
        border-radius: 999px;
        background:
          radial-gradient(
            circle at 8% 50%,
            rgba(16, 185, 129, 0.16),
            transparent 22%
          ),
          radial-gradient(
            circle at 92% 50%,
            rgba(249, 115, 22, 0.16),
            transparent 24%
          ),
          rgba(10, 12, 18, 0.62);
        border: 1px solid rgba(255, 255, 255, 0.1);
        box-shadow: 0 20px 44px rgba(0, 0, 0, 0.22);
        position: relative;
        isolation: isolate;
      }

      .nav-inner::before {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: 999px;
        backdrop-filter: blur(18px) saturate(160%);
        -webkit-backdrop-filter: blur(18px) saturate(160%);
        z-index: -1;
        pointer-events: none;
      }

      .navbar.scrolled {
        background: transparent;
        border-bottom: none;
      }

      .navbar.scrolled .nav-inner {
        background: rgba(8, 10, 16, 0.78);
        box-shadow: 0 22px 44px rgba(0, 0, 0, 0.22);
      }

      .brand-logo {
        width: 44px;
        height: 44px;
        border-radius: 14px;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.08);
      }

      .nav-menu a {
        padding: 0.5rem 0.25rem;
        color: rgba(241, 245, 249, 0.86);
        font-weight: 600;
        border-radius: 10px;
      }

      .nav-menu a:hover {
        color: #fff;
        text-shadow: 0 0 16px rgba(16, 185, 129, 0.25);
      }

      .nav-menu a.active {
        color: #fff;
        text-shadow:
          0 0 14px rgba(16, 185, 129, 0.3),
          0 0 22px rgba(249, 115, 22, 0.18);
      }

      .lang-switch {
        margin-left: 0.9rem;
        padding-left: 1.2rem;
        border-left-color: rgba(255, 255, 255, 0.08);
      }

      .lang-switch button.active {
        background: linear-gradient(
          135deg,
          rgba(16, 185, 129, 0.26),
          rgba(249, 115, 22, 0.22)
        );
        border-color: rgba(255, 255, 255, 0.22);
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.28);
      }

      .lang-switch button:hover {
        color: #fff;
        border-color: rgba(255, 255, 255, 0.16);
      }

      @media (max-width: 768px) {
        .navbar {
          padding: 0.85rem 0;
        }

        .nav-inner {
          padding: 0.8rem 1rem;
          border-radius: 22px;
          background:
            radial-gradient(
              circle at 10% 50%,
              rgba(16, 185, 129, 0.22),
              transparent 24%
            ),
            radial-gradient(
              circle at 90% 50%,
              rgba(249, 115, 22, 0.22),
              transparent 26%
            ),
            rgba(8, 10, 16, 0.74);
        }

        .nav-menu {
          padding-top: 7.5rem;
        }

        .nav-menu a {
          width: min(420px, 100%);
          text-align: center;
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(255, 255, 255, 0.05);
          border-radius: 18px;
          margin: 0;
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.05),
            0 16px 30px rgba(0, 0, 0, 0.18);
        }

        .nav-menu a.active {
          border-color: rgba(16, 185, 129, 0.34);
          background: linear-gradient(
            135deg,
            rgba(16, 185, 129, 0.16),
            rgba(249, 115, 22, 0.12)
          );
        }

        .brand-name {
          font-size: 1rem;
        }

        .brand-city {
          font-size: 0.66rem;
          letter-spacing: 0.12em;
        }

        .lang-switch {
          width: min(420px, 100%);
          justify-content: center;
          flex-wrap: wrap;
          gap: 0.4rem;
          padding-top: 1.25rem;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
        }

        .lang-switch button {
          min-width: 48px;
          background: rgba(255, 255, 255, 0.04);
        }
      }
    `,
  ],
})
export class NavbarComponent {
  private translationService = inject(TranslationService);
  private router = inject(Router);
  private shopInfoService = inject(ShopInfoService);
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

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
    if (this.isBrowser) {
      document.body.style.overflow = value ? 'hidden' : '';
    }
  }

  toggleMenu(): void {
    this.menuOpen = !this._menuOpen;
    if (this._menuOpen && this.isBrowser) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
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
    {
      path: 'fahrradverleih',
      label: () => this.t().bikeRental,
      exact: false,
    },
    { path: 'about', label: () => this.t().about, exact: false },
    { path: 'contact', label: () => this.t().contact, exact: false },
  ];

  languages: { code: Language; label: string }[] = SUPPORTED_LANGUAGES.map(
    (code) => ({ code, label: LANGUAGE_LABELS[code] }),
  );

  @HostListener('window:scroll')
  onScroll(): void {
    if (!this.isBrowser) return;
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
