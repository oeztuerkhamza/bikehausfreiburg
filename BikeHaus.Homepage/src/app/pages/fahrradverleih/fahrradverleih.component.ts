import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-fahrradverleih',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="rental-page">
      <!-- Header -->
      <header class="page-header">
        <div class="container">
          <span class="label">{{ t().bikeRentalPageLabel }}</span>
          <h1>{{ t().bikeRentalPageTitle }}</h1>
        </div>
      </header>

      <div class="container rental-body">
        <!-- Hero Intro -->
        <section class="hero-intro">
          <div class="intro-content">
            <div class="intro-badge">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
              >
                <circle cx="5.5" cy="17.5" r="3.5" />
                <circle cx="18.5" cy="17.5" r="3.5" />
                <path
                  d="M15 6a1 1 0 100-2 1 1 0 000 2zM12 17.5V14l-3-3 4-3 2 3h3"
                />
              </svg>
              <span>{{ t().bikeRental }}</span>
            </div>
            <p class="intro-text">{{ t().bikeRentalIntro }}</p>
          </div>
          <div class="intro-visual">
            <div class="visual-card">
              <div class="visual-price">10€</div>
              <div class="visual-content">
                <p class="visual-tagline">{{ t().bikeRentalDay1 }}</p>
              </div>
            </div>
          </div>
        </section>

        <!-- Prices Section -->
        <section class="prices-section">
          <div class="section-header">
            <span class="section-label">{{ t().bikeRentalPricesTitle }}</span>
          </div>
          <div class="prices-grid">
            <div class="price-card">
              <div class="price-icon">
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.5"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <span class="price-duration">1</span>
              <span class="price-amount">10 €</span>
            </div>
            <div class="price-card featured">
              <div class="price-icon">
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.5"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <span class="price-duration">7</span>
              <span class="price-amount">50 €</span>
            </div>
            <div class="price-card">
              <div class="price-icon">
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.5"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <span class="price-duration">8+</span>
              <span class="price-amount">5 € / Tag</span>
            </div>
            <div class="price-card">
              <div class="price-icon">
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.5"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <span class="price-duration">30</span>
              <span class="price-amount">120 €</span>
            </div>
          </div>
        </section>

        <!-- Info Cards Grid -->
        <section class="info-section">
          <div class="info-grid">
            <!-- Deposit -->
            <div class="info-card">
              <div class="info-icon deposit-icon">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.5"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <h3>{{ t().bikeRentalDepositTitle }}</h3>
              <p>{{ t().bikeRentalDepositText }}</p>
            </div>

            <!-- Included -->
            <div class="info-card">
              <div class="info-icon included-icon">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.5"
                >
                  <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
              <h3>{{ t().bikeRentalIncludedTitle }}</h3>
              <ul class="included-list">
                <li>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.5"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  {{ t().bikeRentalIncluded1 }}
                </li>
                <li>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.5"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  {{ t().bikeRentalIncluded2 }}
                </li>
              </ul>
              <p class="included-note">{{ t().bikeRentalIncludedNote }}</p>
            </div>
          </div>
        </section>

        <!-- Note -->
        <section class="note-banner">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
          <div>
            <strong>{{ t().bikeRentalNoteTitle }}</strong>
            <p>{{ t().bikeRentalNoteText }}</p>
          </div>
        </section>

        <!-- CTA -->
        <section class="rental-cta">
          <a [routerLink]="['/' + lang(), 'contact']" class="btn-primary">
            {{ t().contact }}
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
          <a [routerLink]="['/' + lang()]" class="back-link">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            {{ t().home }}
          </a>
        </section>
      </div>
    </div>
  `,
  styles: [
    `
      .page-header {
        padding: 7rem 0 3rem;
        background: var(--color-bg);
        border-bottom: 1px solid var(--color-border);
      }

      .label {
        display: block;
        font-size: 0.75rem;
        font-weight: 600;
        letter-spacing: 0.15em;
        text-transform: uppercase;
        color: var(--color-accent);
        margin-bottom: 0.75rem;
      }

      .page-header h1 {
        font-size: clamp(1.75rem, 4vw, 2.5rem);
        font-weight: 800;
        color: var(--color-text);
        margin: 0;
        letter-spacing: -0.02em;
      }

      .rental-body {
        padding-top: 3rem;
        padding-bottom: 4rem;
      }

      /* ── Hero Intro ── */
      .hero-intro {
        display: grid;
        grid-template-columns: 1fr 280px;
        gap: 3rem;
        align-items: center;
        margin-bottom: 4rem;
      }

      .intro-badge {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 1rem;
        background: rgba(255, 87, 34, 0.1);
        border: 1px solid rgba(255, 87, 34, 0.2);
        border-radius: 50px;
        color: var(--color-accent);
        font-size: 0.82rem;
        font-weight: 600;
        margin-bottom: 1.5rem;
      }

      .intro-badge svg {
        color: var(--color-accent);
      }

      .intro-text {
        font-size: 1.05rem;
        line-height: 1.85;
        color: var(--color-text-secondary);
        margin: 0;
        max-width: 560px;
      }

      .intro-visual {
        position: relative;
      }

      .visual-card {
        position: relative;
        background: linear-gradient(
          135deg,
          var(--color-surface) 0%,
          rgba(255, 87, 34, 0.05) 100%
        );
        border: 1px solid var(--color-border);
        border-radius: 20px;
        padding: 2.5rem 2rem;
        text-align: center;
        overflow: hidden;
      }

      .visual-card::before {
        content: '';
        position: absolute;
        top: -50%;
        right: -50%;
        width: 200%;
        height: 200%;
        background: radial-gradient(
          circle,
          rgba(255, 87, 34, 0.08) 0%,
          transparent 50%
        );
        pointer-events: none;
      }

      .visual-price {
        position: relative;
        z-index: 1;
        font-size: 3.5rem;
        font-weight: 900;
        color: var(--color-accent);
        letter-spacing: -0.05em;
        line-height: 1;
        margin-bottom: 0.5rem;
      }

      .visual-content {
        position: relative;
        z-index: 1;
      }

      .visual-tagline {
        font-size: 0.95rem;
        font-weight: 500;
        color: var(--color-text-secondary);
        margin: 0;
      }

      /* ── Prices Section ── */
      .prices-section {
        margin-bottom: 3.5rem;
      }

      .section-header {
        margin-bottom: 1.5rem;
      }

      .section-label {
        display: block;
        font-size: 0.75rem;
        font-weight: 700;
        letter-spacing: 0.15em;
        text-transform: uppercase;
        color: var(--color-accent);
      }

      .prices-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 1.25rem;
      }

      .price-card {
        background: var(--color-surface);
        border: 1px solid var(--color-border);
        border-radius: 16px;
        padding: 1.75rem 1.25rem;
        text-align: center;
        transition:
          border-color 0.3s,
          transform 0.3s;
      }

      .price-card:hover {
        border-color: var(--color-accent);
        transform: translateY(-2px);
      }

      .price-card.featured {
        border-color: var(--color-accent);
        background: linear-gradient(
          135deg,
          var(--color-surface) 0%,
          rgba(255, 87, 34, 0.06) 100%
        );
      }

      .price-icon {
        width: 44px;
        height: 44px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 10px;
        background: rgba(255, 87, 34, 0.1);
        color: var(--color-accent);
        margin: 0 auto 1rem;
      }

      .price-duration {
        display: block;
        font-size: 2rem;
        font-weight: 800;
        color: var(--color-text);
        line-height: 1;
        margin-bottom: 0.3rem;
        letter-spacing: -0.02em;
      }

      .price-card.featured .price-duration {
        color: var(--color-accent);
      }

      .price-amount {
        font-size: 0.9rem;
        font-weight: 600;
        color: var(--color-text-secondary);
      }

      /* ── Info Cards ── */
      .info-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 1.5rem;
        margin-bottom: 2rem;
      }

      .info-card {
        background: var(--color-surface);
        border: 1px solid var(--color-border);
        border-radius: 16px;
        padding: 2rem 1.5rem;
      }

      .info-icon {
        width: 44px;
        height: 44px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 1rem;
      }

      .deposit-icon {
        background: rgba(255, 193, 7, 0.15);
        color: #d4a017;
      }

      .included-icon {
        background: rgba(40, 167, 69, 0.12);
        color: #28a745;
      }

      .info-card h3 {
        font-size: 0.85rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--color-text-secondary);
        margin: 0 0 0.75rem;
      }

      .info-card p {
        font-size: 0.92rem;
        color: var(--color-text);
        line-height: 1.75;
        margin: 0;
      }

      .included-list {
        list-style: none;
        padding: 0;
        margin: 0 0 0.75rem;
        display: flex;
        flex-direction: column;
        gap: 0.6rem;
      }

      .included-list li {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.95rem;
        font-weight: 600;
        color: var(--color-text);
      }

      .included-list li svg {
        color: #28a745;
        flex-shrink: 0;
      }

      .included-note {
        font-style: italic;
        font-size: 0.85rem !important;
        color: var(--color-text-secondary) !important;
      }

      /* ── Note Banner ── */
      .note-banner {
        display: flex;
        gap: 0.75rem;
        align-items: flex-start;
        padding: 1.25rem 1.5rem;
        background: var(--color-surface);
        border: 1px solid var(--color-border);
        border-left: 4px solid var(--color-accent);
        border-radius: 0 12px 12px 0;
        margin-bottom: 3rem;
      }

      .note-banner svg {
        flex-shrink: 0;
        margin-top: 2px;
        color: var(--color-accent);
      }

      .note-banner strong {
        display: block;
        font-size: 0.82rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--color-text);
        margin-bottom: 0.25rem;
      }

      .note-banner p {
        font-size: 0.9rem;
        color: var(--color-text-secondary);
        line-height: 1.65;
        margin: 0;
      }

      /* ── CTA ── */
      .rental-cta {
        display: flex;
        align-items: center;
        gap: 2rem;
        padding-top: 2rem;
        border-top: 1px solid var(--color-border);
      }

      .btn-primary {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        text-decoration: none;
        padding: 0.75rem 1.5rem;
        background: var(--color-accent);
        color: #fff;
        border-radius: 10px;
        font-size: 0.9rem;
        font-weight: 600;
        transition:
          opacity 0.2s,
          gap 0.2s;
      }

      .btn-primary:hover {
        opacity: 0.9;
        gap: 0.7rem;
      }

      .back-link {
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        font-size: 0.9rem;
        font-weight: 600;
        color: var(--color-text-secondary);
        text-decoration: none;
        transition:
          color 0.2s,
          gap 0.2s;
      }

      .back-link:hover {
        color: var(--color-accent);
        gap: 0.6rem;
      }

      /* ── Responsive ── */
      @media (max-width: 900px) {
        .hero-intro {
          grid-template-columns: 1fr;
          gap: 2rem;
        }

        .intro-visual {
          order: -1;
          max-width: 280px;
        }

        .prices-grid {
          grid-template-columns: repeat(2, 1fr);
        }
      }

      @media (max-width: 768px) {
        .page-header {
          padding: 6rem 0 2rem;
        }

        .hero-intro {
          margin-bottom: 3rem;
        }

        .info-grid {
          grid-template-columns: 1fr;
        }

        .rental-cta {
          flex-direction: column;
          align-items: flex-start;
          gap: 1rem;
        }
      }

      @media (max-width: 480px) {
        .prices-grid {
          grid-template-columns: 1fr 1fr;
          gap: 0.75rem;
        }

        .price-card {
          padding: 1.25rem 1rem;
        }
      }
    `,
  ],
})
export class FahrradverleihComponent implements OnInit {
  private translationService = inject(TranslationService);
  private titleService = inject(Title);
  private metaService = inject(Meta);

  t = this.translationService.translations;
  lang = this.translationService.currentLanguage;

  ngOnInit(): void {
    this.titleService.setTitle('Fahrradverleih — Bike Haus Freiburg');
    this.metaService.updateTag({
      name: 'description',
      content:
        'Fahrradverleih bei Bike Haus Freiburg. Mieten Sie Fahrräder zu günstigen Preisen — ab 10 € pro Tag.',
    });
  }
}
