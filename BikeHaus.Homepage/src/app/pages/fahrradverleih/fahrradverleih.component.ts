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
    <div class="legal-page">
      <header class="page-header">
        <div class="container">
          <span class="label">{{ t().bikeRentalPageLabel }}</span>
          <h1>{{ t().bikeRentalPageTitle }}</h1>
        </div>
      </header>

      <div class="container legal-body">
        <article class="legal-content">
          <p class="intro">{{ t().bikeRentalIntro }}</p>

          <section class="rental-section prices">
            <h2>{{ t().bikeRentalPricesTitle }}</h2>
            <ul class="price-list">
              <li>{{ t().bikeRentalDay1 }}</li>
              <li>{{ t().bikeRentalDay7 }}</li>
              <li>{{ t().bikeRentalDay8Plus }}</li>
              <li>{{ t().bikeRentalMonth }}</li>
            </ul>
          </section>

          <section class="rental-section deposit">
            <h2>{{ t().bikeRentalDepositTitle }}</h2>
            <p>{{ t().bikeRentalDepositText }}</p>
          </section>

          <section class="rental-section note">
            <h2>{{ t().bikeRentalNoteTitle }}</h2>
            <p>{{ t().bikeRentalNoteText }}</p>
          </section>

          <section class="rental-section included">
            <h2>{{ t().bikeRentalIncludedTitle }}</h2>
            <ul class="included-list">
              <li>{{ t().bikeRentalIncluded1 }}</li>
              <li>{{ t().bikeRentalIncluded2 }}</li>
            </ul>
            <p class="included-note">{{ t().bikeRentalIncludedNote }}</p>
          </section>
        </article>

        <div class="legal-back">
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
        </div>
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

      .legal-body {
        padding-top: 3rem;
        padding-bottom: 4rem;
      }

      .legal-content {
        max-width: 740px;
      }

      .intro {
        font-size: 1rem;
        color: var(--color-text-secondary);
        line-height: 1.75;
        margin-bottom: 2.5rem;
      }

      .rental-section {
        margin-bottom: 2.5rem;
        padding: 1.5rem;
        border-radius: 12px;
        background: var(--color-bg-soft);
        border: 1px solid var(--color-border);
      }

      .rental-section h2 {
        font-size: 1.1rem;
        font-weight: 700;
        color: var(--color-text);
        margin: 0 0 0.75rem;
      }

      .rental-section p {
        font-size: 0.92rem;
        color: var(--color-text-secondary);
        line-height: 1.75;
        margin: 0;
      }

      .prices {
        background: #e6fffa;
        border-color: #b2f5ea;
      }

      .price-list {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      .price-list li {
        font-size: 0.95rem;
        font-weight: 600;
        color: var(--color-text);
        padding: 0.5rem 0.75rem;
        background: rgba(255, 255, 255, 0.6);
        border-radius: 6px;
      }

      .deposit {
        background: #fff3cd;
        border-color: #ffeeba;
      }

      .note {
        background: #fff5f5;
        border-color: #fed7d7;
      }

      .included {
        background: #d4edda;
        border-color: #c3e6cb;
      }

      .included-list {
        list-style: none;
        padding: 0;
        margin: 0 0 0.75rem;
        display: flex;
        flex-direction: column;
        gap: 0.4rem;
      }

      .included-list li {
        font-size: 0.92rem;
        color: var(--color-text);
        padding-left: 1.25rem;
        position: relative;
      }

      .included-list li::before {
        content: '✓';
        position: absolute;
        left: 0;
        color: #155724;
        font-weight: 700;
      }

      .included-note {
        font-style: italic;
        font-size: 0.85rem !important;
        color: var(--color-text-secondary);
      }

      .legal-back {
        margin-top: 3rem;
        padding-top: 2rem;
        border-top: 1px solid var(--color-border);
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

      @media (max-width: 768px) {
        .page-header {
          padding: 6rem 0 2rem;
        }

        .rental-section {
          padding: 1rem;
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
