import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslationService } from '../../services/translation.service';
import { ShopInfoService } from '../../services/shop-info.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <footer class="footer" role="contentinfo">
      <div class="container footer-grid">
        <!-- Brand -->
        <div class="footer-brand">
          <div class="footer-logo">
            <img [src]="logoUrl()" alt="Bike Haus Freiburg" class="logo-img" />
            <span class="logo-text">Bike Haus Freiburg</span>
          </div>
          <p class="footer-tagline">{{ t().footerTagline }}</p>
        </div>

        <!-- Navigation -->
        <div class="footer-col">
          <h4>{{ t().quickLinks }}</h4>
          <nav aria-label="Footer navigation">
            <a [routerLink]="['/' + lang()]">{{ t().home }}</a>
            <a [routerLink]="['/' + lang(), 'showroom']">{{ t().showroom }}</a>
            <a [routerLink]="['/' + lang(), 'about']">{{ t().about }}</a>
            <a [routerLink]="['/' + lang(), 'contact']">{{ t().contact }}</a>
          </nav>
        </div>

        <!-- Legal -->
        <div class="footer-col">
          <h4>{{ t().legalLabel }}</h4>
          <nav>
            <a [routerLink]="['/' + lang(), 'impressum']">{{
              t().legalNotice
            }}</a>
            <a [routerLink]="['/' + lang(), 'datenschutz']">{{
              t().privacy
            }}</a>
          </nav>
        </div>

        <!-- Language -->
        <div class="footer-col">
          <h4>{{ t().languageLabel }}</h4>
          <div class="footer-langs">
            <a [routerLink]="['/de']" [class.active]="lang() === 'de'"
              >Deutsch</a
            >
            <a [routerLink]="['/fr']" [class.active]="lang() === 'fr'"
              >Français</a
            >
            <a [routerLink]="['/tr']" [class.active]="lang() === 'tr'"
              >Türkçe</a
            >
          </div>
        </div>
      </div>

      <div class="footer-bottom">
        <div class="container footer-bottom-inner">
          <p>&copy; {{ year }} Bike Haus Freiburg. {{ t().allRights }}</p>
        </div>
      </div>
    </footer>
  `,
  styles: [
    `
      .footer {
        background: var(--color-bg-secondary);
        border-top: 1px solid var(--color-border);
        margin-top: auto;
      }

      .footer-grid {
        display: grid;
        grid-template-columns: 1.5fr 1fr 1fr 1fr;
        gap: 3rem;
        padding: 4rem 0 3rem;
      }

      .footer-logo {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        margin-bottom: 0.75rem;
      }

      .logo-img {
        width: 36px;
        height: 36px;
        border-radius: 8px;
        background: var(--color-surface);
        padding: 3px;
      }

      .logo-text {
        font-weight: 700;
        font-size: 1rem;
        color: var(--color-text);
      }

      .footer-tagline {
        font-size: 0.9rem;
        color: var(--color-text-secondary);
        line-height: 1.6;
      }

      .footer-col h4 {
        font-size: 0.75rem;
        font-weight: 700;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        color: var(--color-text-muted);
        margin-bottom: 1rem;
      }

      .footer-col nav {
        display: flex;
        flex-direction: column;
        gap: 0.6rem;
      }

      .footer-col nav a,
      .footer-langs a {
        color: var(--color-text-secondary);
        text-decoration: none;
        font-size: 0.9rem;
        transition: color 0.2s;
      }

      .footer-col nav a:hover,
      .footer-langs a:hover {
        color: #fff;
      }

      .footer-langs a.active {
        color: var(--color-accent);
      }

      .footer-langs {
        display: flex;
        flex-direction: column;
        gap: 0.6rem;
      }

      .footer-bottom {
        border-top: 1px solid var(--color-border);
        padding: 1.5rem 0;
      }

      .footer-bottom-inner {
        display: flex;
        justify-content: center;
      }

      .footer-bottom p {
        font-size: 0.8rem;
        color: var(--color-text-muted);
      }

      @media (max-width: 768px) {
        .footer-grid {
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
          padding: 3rem 0 2rem;
        }

        .footer-brand {
          grid-column: 1 / -1;
          text-align: center;
        }

        .footer-logo {
          justify-content: center;
        }

        .footer-col {
          text-align: center;
        }

        .footer-col nav,
        .footer-langs {
          align-items: center;
        }
      }

      @media (max-width: 480px) {
        .footer-grid {
          grid-template-columns: 1fr;
          gap: 1.75rem;
          padding: 2.5rem 0 1.5rem;
        }

        .footer-col h4 {
          margin-bottom: 0.75rem;
        }

        .footer-bottom {
          padding: 1.25rem 0;
        }

        .footer-bottom p {
          font-size: 0.75rem;
          text-align: center;
        }
      }
    `,
  ],
})
export class FooterComponent {
  private translationService = inject(TranslationService);
  private shopInfoService = inject(ShopInfoService);
  t = this.translationService.translations;
  lang = this.translationService.currentLanguage;
  logoUrl = this.shopInfoService.logoUrl;
  year = new Date().getFullYear();
}
