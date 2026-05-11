import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslationService } from '../../services/translation.service';
import { ShopInfoService } from '../../services/shop-info.service';
import {
  LANGUAGE_LABELS,
  SUPPORTED_LANGUAGES,
} from '../../services/language-config';

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
            <a [routerLink]="['/' + lang(), 'neue-fahrraeder']">{{
              t().neueFahrraeder
            }}</a>
            <a [routerLink]="['/' + lang(), 'zubehoer']">{{
              t().accessories
            }}</a>
            <a [routerLink]="['/' + lang(), 'fahrradverleih']">{{
              t().bikeRental
            }}</a>
            <a [routerLink]="['/' + lang(), 'ratgeber']">{{
              t().ratgeberNav
            }}</a>
            <a [routerLink]="['/' + lang(), 'faq']">{{ t().faqTitle }}</a>
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
            <a [routerLink]="['/' + lang(), 'garantie']">{{
              t().warrantyTerms
            }}</a>
          </nav>
        </div>

        <!-- Standorte -->
        <div class="footer-col">
          <h4>{{ t().footerLocations }}</h4>
          <nav [attr.aria-label]="t().footerLocations">
            <a [routerLink]="['/' + lang(), 'fahrrad-emmendingen']"
              >Fahrrad Emmendingen</a
            >
            <a [routerLink]="['/' + lang(), 'fahrrad-bad-krozingen']"
              >Fahrrad Bad Krozingen</a
            >
            <a [routerLink]="['/' + lang(), 'fahrrad-breisach']"
              >Fahrrad Breisach</a
            >
            <a [routerLink]="['/' + lang(), 'fahrrad-gundelfingen']"
              >Fahrrad Gundelfingen</a
            >
            <a [routerLink]="['/' + lang(), 'fahrrad-march']">Fahrrad March</a>
          </nav>
        </div>

        <!-- Language -->
        <div class="footer-col">
          <h4>{{ t().languageLabel }}</h4>
          <div class="footer-langs">
            <a
              *ngFor="let language of languages"
              [routerLink]="['/' + language.code]"
              [class.active]="lang() === language.code"
              >{{ language.label }}</a
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
        grid-template-columns: 1.5fr 1fr 1fr 1fr 1fr;
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

        .footer-brand,
        .footer-col {
          padding: 1rem;
          border-radius: 18px;
          background: linear-gradient(
            145deg,
            rgba(255, 255, 255, 0.06),
            rgba(255, 255, 255, 0.025)
          );
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

        .footer {
          background:
            radial-gradient(
              circle at 15% 0%,
              rgba(16, 185, 129, 0.2),
              transparent 34%
            ),
            radial-gradient(
              circle at 85% 0%,
              rgba(249, 115, 22, 0.22),
              transparent 38%
            ),
            var(--color-bg-secondary);
        }

        .footer-grid {
          padding: 2.4rem 0 1.6rem;
        }

        .footer-brand,
        .footer-col {
          background:
            linear-gradient(
              145deg,
              rgba(16, 185, 129, 0.08),
              rgba(249, 115, 22, 0.06)
            ),
            rgba(255, 255, 255, 0.04);
          box-shadow: 0 16px 34px rgba(0, 0, 0, 0.18);
        }

        .footer-col nav a,
        .footer-langs a {
          width: 100%;
          justify-content: center;
          text-align: center;
          background: rgba(255, 255, 255, 0.03);
        }
      }

      .footer {
        position: relative;
        background:
          radial-gradient(
            circle at 15% -10%,
            rgba(16, 185, 129, 0.14),
            transparent 36%
          ),
          radial-gradient(
            circle at 85% -12%,
            rgba(249, 115, 22, 0.16),
            transparent 40%
          ),
          linear-gradient(180deg, rgba(255, 255, 255, 0.03), transparent 18%),
          var(--color-bg-secondary);
        border-top: 1px solid rgba(255, 255, 255, 0.08);
      }

      .footer::before {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(
          135deg,
          rgba(255, 255, 255, 0.04),
          transparent 42%
        );
        pointer-events: none;
      }

      .footer-grid {
        position: relative;
        z-index: 1;
        gap: 2rem;
        padding: 4.5rem 0 3.2rem;
      }

      .footer-brand,
      .footer-col {
        padding: 1.1rem 1.15rem;
        border-radius: 20px;
        background: rgba(255, 255, 255, 0.035);
        border: 1px solid rgba(255, 255, 255, 0.08);
        backdrop-filter: blur(4px);
      }

      .footer-brand {
        background:
          linear-gradient(
            145deg,
            rgba(16, 185, 129, 0.14) 0%,
            rgba(249, 115, 22, 0.1) 100%
          ),
          rgba(255, 255, 255, 0.03);
      }

      .footer-logo {
        margin-bottom: 1rem;
      }

      .logo-img {
        width: 40px;
        height: 40px;
        border-radius: 12px;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.08);
      }

      .footer-col nav a,
      .footer-langs a {
        transition:
          color 0.2s,
          transform 0.2s,
          background-color 0.2s,
          border-color 0.2s;
        border-radius: 10px;
        padding: 0.26rem 0.48rem;
        border: 1px solid transparent;
      }

      .footer-col nav a:hover,
      .footer-langs a:hover {
        transform: translateX(3px);
        background: rgba(255, 255, 255, 0.05);
        border-color: rgba(255, 255, 255, 0.12);
        color: #fff;
      }

      .footer-col h4 {
        color: rgba(255, 255, 255, 0.8);
        letter-spacing: 0.11em;
      }

      .footer-bottom {
        position: relative;
        z-index: 1;
        border-top: 1px solid rgba(255, 255, 255, 0.08);
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
  languages = SUPPORTED_LANGUAGES.map((code) => ({
    code,
    label: LANGUAGE_LABELS[code],
  }));
  year = new Date().getFullYear();
}
