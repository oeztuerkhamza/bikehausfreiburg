import {
  Component,
  ElementRef,
  computed,
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
  getRentalSlug,
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
            *ngFor="let link of navLinks()"
            [routerLink]="['/' + currentLang(), link.path]"
            routerLinkActive="active"
            [routerLinkActiveOptions]="{ exact: link.exact }"
            (click)="menuOpen = false"
            >{{ link.label() }}</a
          >

          <div class="lang-switch" [class.open]="languageMenuOpen()">
            <button
              type="button"
              class="lang-trigger"
              (click)="toggleLanguageMenu($event)"
              [attr.aria-expanded]="languageMenuOpen()"
              [attr.aria-label]="currentLanguageLabel()"
            >
              <img
                [src]="currentLanguageFlag()"
                [alt]="currentLanguageLabel()"
                class="lang-flag"
                width="24"
                height="16"
              />
              <span class="lang-trigger-label">{{
                currentLang().toUpperCase()
              }}</span>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                class="lang-chevron"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>

            <div class="lang-menu" *ngIf="languageMenuOpen()">
              <button
                *ngFor="let lang of languages"
                type="button"
                class="lang-option"
                [class.active]="currentLang() === lang.code"
                (click)="switchLang(lang.code)"
                [attr.aria-label]="lang.label"
              >
                <img
                  [src]="getLanguageFlag(lang.code)"
                  [alt]="lang.label"
                  class="lang-flag"
                  width="24"
                  height="16"
                />
                <span>{{ lang.label }}</span>
                <small>{{ lang.code.toUpperCase() }}</small>
              </button>
            </div>
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
        height: var(--navbar-height);
        padding: 0;
        display: flex;
        align-items: center;
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .navbar.scrolled {
        padding: 0;
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
        position: relative;
        display: flex;
        align-items: center;
        margin-left: 0.75rem;
        border-left: 1px solid var(--color-border);
        padding-left: 1.5rem;
      }

      .lang-trigger {
        display: inline-flex;
        align-items: center;
        gap: 0.45rem;
        padding: 0.45rem 0.65rem;
        border-radius: 12px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        background: rgba(255, 255, 255, 0.04);
        color: #fff;
        font-weight: 700;
        font-size: 0.74rem;
        letter-spacing: 0.08em;
        cursor: pointer;
        font-family: var(--font-family);
        transition:
          border-color 0.2s,
          background 0.2s,
          transform 0.2s;
      }

      .lang-trigger:hover,
      .lang-switch.open .lang-trigger {
        border-color: rgba(255, 255, 255, 0.22);
        background: rgba(255, 255, 255, 0.07);
      }

      .lang-flag {
        display: block;
        width: 22px;
        height: 15px;
        object-fit: cover;
        border-radius: 3px;
        border: 1px solid rgba(255, 255, 255, 0.18);
        box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.18) inset;
      }

      .lang-trigger-label {
        min-width: 2.2rem;
        text-align: left;
      }

      .lang-chevron {
        opacity: 0.75;
      }

      .lang-menu {
        position: absolute;
        top: calc(100% + 0.55rem);
        right: 0;
        min-width: 220px;
        padding: 0.45rem;
        border-radius: 16px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        background: rgba(8, 10, 16, 0.96);
        box-shadow: 0 24px 60px rgba(0, 0, 0, 0.3);
        backdrop-filter: blur(18px) saturate(160%);
        -webkit-backdrop-filter: blur(18px) saturate(160%);
        z-index: 20;
      }

      .lang-option {
        width: 100%;
        display: grid;
        grid-template-columns: 24px 1fr auto;
        align-items: center;
        gap: 0.65rem;
        padding: 0.65rem 0.7rem;
        border: none;
        border-radius: 12px;
        background: transparent;
        color: var(--color-text-secondary);
        cursor: pointer;
        text-align: left;
        font-family: var(--font-family);
        transition:
          background 0.2s,
          color 0.2s;
      }

      .lang-option:hover,
      .lang-option.active {
        background: rgba(255, 255, 255, 0.06);
        color: #fff;
      }

      .lang-option small {
        color: var(--color-text-muted);
        font-size: 0.68rem;
        letter-spacing: 0.08em;
      }

      .lang-option.active small {
        color: var(--color-text-secondary);
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
          /* flex-start statt center: bei center sind überlaufende Items oben
             nicht erreichbar und der Sprachumschalter rutscht aus dem Viewport */
          justify-content: flex-start;
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
          /* Sprachumschalter zuerst, damit er beim Öffnen sofort sichtbar ist */
          order: -1;
          width: min(420px, 100%);
          justify-content: center;
          flex-wrap: wrap;
          padding-left: 0;
          border-top: none;
          border-bottom: 1px solid var(--color-border);
          border-left: none;
          padding-top: 0;
          padding-bottom: 1.25rem;
          margin-left: 0;
          margin-top: 0;
          margin-bottom: 0.5rem;
        }

        .lang-menu {
          left: 50%;
          right: auto;
          transform: translateX(-50%);
          width: min(320px, calc(100vw - 2rem));
        }

        .lang-option {
          grid-template-columns: 24px 1fr auto;
        }

        .lang-trigger {
          font-size: 0.8rem;
        }

        .lang-trigger-label {
          min-width: 2.4rem;
        }
      }

      .navbar {
        height: var(--navbar-height);
        padding: 0;
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
          height: var(--navbar-height-mobile);
          padding: 0;
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
          padding-top: 0;
          padding-bottom: 1.25rem;
          border-top: none;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
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
  private hostElement = inject(ElementRef);
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  t = this.translationService.translations;
  currentLang = this.translationService.currentLanguage;
  logoUrl = this.shopInfoService.logoUrl;
  private _menuOpen = false;
  languageMenuOpen = signal(false);
  scrolled = signal(false);

  private readonly languageFlags: Record<Language, string> = {
    de: '/assets/images/sections/flags/image%20copy.png',
    en: '/assets/images/sections/flags/image%20copy%205.png',
    fr: '/assets/images/sections/flags/france.svg',
    tr: '/assets/images/sections/flags/image.png',
    es: '/assets/images/sections/flags/image%20copy%206.png',
    it: '/assets/images/sections/flags/image%20copy%207.png',
    ar: '/assets/images/sections/flags/image%20copy%203.png',
    ru: '/assets/images/sections/flags/image%20copy%202.png',
    no: '/assets/images/sections/flags/no.svg',
    da: '/assets/images/sections/flags/da.svg',
    nl: '/assets/images/sections/flags/nl.svg',
    pl: '/assets/images/sections/flags/pl.svg',
  };

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
    this.languageMenuOpen.set(false);
    this.menuOpen = !this._menuOpen;
    if (this._menuOpen && this.isBrowser) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  toggleLanguageMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.languageMenuOpen.update((open) => !open);
  }

  getLanguageFlag(lang: Language): string {
    return this.languageFlags[lang];
  }

  currentLanguageFlag(): string {
    return this.getLanguageFlag(this.currentLang());
  }

  currentLanguageLabel(): string {
    return LANGUAGE_LABELS[this.currentLang()];
  }

  // computed: der Verleih-Slug ist sprachabhängig (fahrradverleih / bike-rental / …)
  navLinks = computed(() => [
    { path: 'showroom', label: () => this.t().showroom, exact: false },
    {
      path: 'neue-fahrraeder',
      label: () => this.t().neueFahrraeder,
      exact: false,
    },
    {
      path: 'e-bikes',
      label: () => this.t().eBikesNav,
      exact: false,
    },
    {
      path: getRentalSlug(this.currentLang()),
      label: () => this.t().bikeRental,
      exact: false,
    },
    {
      path: 'fahrradtouren',
      label: () => this.t().bikeToursNav,
      exact: false,
    },
    {
      path: 'ausflugsziele',
      label: () => this.t().ausflugszieleNav,
      exact: false,
    },
    {
      path: 'service',
      label: () => this.t().bikeService,
      exact: false,
    },
    { path: 'about', label: () => this.t().about, exact: false },
    { path: 'contact', label: () => this.t().contact, exact: false },
  ]);

  languages: { code: Language; label: string }[] = SUPPORTED_LANGUAGES.map(
    (code) => ({ code, label: LANGUAGE_LABELS[code] }),
  );

  @HostListener('window:scroll')
  onScroll(): void {
    if (!this.isBrowser) return;
    this.scrolled.set(window.scrollY > 40);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.isBrowser) return;
    const target = event.target as Node | null;
    if (target && !this.hostElement.nativeElement.contains(target)) {
      this.languageMenuOpen.set(false);
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.languageMenuOpen.set(false);
  }

  switchLang(lang: Language): void {
    const currentUrl = this.router.url;
    const segments = currentUrl.split('/');
    segments[1] = lang;
    this.router.navigateByUrl(segments.join('/'));
    this.menuOpen = false;
    this.languageMenuOpen.set(false);
  }
}
