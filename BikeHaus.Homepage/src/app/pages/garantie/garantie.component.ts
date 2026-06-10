import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-garantie',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="legal-page">
      <header class="page-header">
        <div class="container">
          <span class="label">{{ t().warrantyPageLabel }}</span>
          <h1>{{ t().warrantyPageTitle }}</h1>
        </div>
      </header>

      <div class="container legal-body">
        <article class="legal-content">
          <section class="warranty-section warranty-new">
            <div class="warranty-badge new">{{ t().conditionNew }}</div>
            <h2>{{ t().warrantyNewTitle }}</h2>
            <p>{{ t().warrantyNewText }}</p>
          </section>

          <section class="warranty-section warranty-used">
            <div class="warranty-badge used">{{ t().conditionUsed }}</div>
            <h2>{{ t().warrantyUsedTitle }}</h2>
            <p>{{ t().warrantyUsedText }}</p>
          </section>

          <section class="warranty-section warranty-excluded">
            <h2>{{ t().warrantyExcludedTitle }}</h2>
            <p>{{ t().warrantyExcludedItems }}</p>
          </section>

          <section class="warranty-section warranty-return">
            <h2>{{ t().warrantyReturnTitle }}</h2>
            <p>{{ t().warrantyReturnText }}</p>
          </section>

          <section class="warranty-note">
            <p><strong>*</strong> {{ t().warrantyRepairNote }}</p>
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

      .warranty-section {
        margin-bottom: 2.5rem;
        padding: 1.5rem;
        border-radius: 12px;
        background: var(--color-surface);
        border: 1px solid var(--color-border);
      }

      .warranty-badge {
        display: inline-block;
        padding: 0.25rem 0.75rem;
        border-radius: 4px;
        font-size: 0.7rem;
        font-weight: 700;
        letter-spacing: 0.05em;
        text-transform: uppercase;
        margin-bottom: 0.75rem;
      }

      .warranty-badge.new {
        background: rgba(34, 197, 94, 0.15);
        color: #4ade80;
      }

      .warranty-badge.used {
        background: rgba(249, 115, 22, 0.15);
        color: #fb923c;
      }

      .warranty-section h2 {
        font-size: 1.1rem;
        font-weight: 700;
        color: var(--color-text);
        margin: 0 0 0.75rem;
      }

      .warranty-section p {
        font-size: 0.92rem;
        color: var(--color-text-secondary);
        line-height: 1.75;
        margin: 0;
      }

      .warranty-excluded {
        background: rgba(239, 68, 68, 0.08);
        border-color: rgba(239, 68, 68, 0.25);
      }

      .warranty-return {
        background: var(--color-accent-subtle);
        border-color: rgba(16, 185, 129, 0.3);
      }

      .warranty-note {
        margin-top: 2rem;
        padding: 1rem 1.5rem;
        background: var(--color-surface);
        border-left: 4px solid var(--color-accent);
        border-radius: 0 8px 8px 0;
      }

      .warranty-note p {
        font-size: 0.88rem;
        color: var(--color-text-secondary);
        margin: 0;
        font-style: italic;
      }

      .warranty-note strong {
        color: var(--color-accent);
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

        .warranty-section {
          padding: 1rem;
        }
      }
    `,
  ],
})
export class GarantieComponent implements OnInit {
  private translationService = inject(TranslationService);
  private titleService = inject(Title);
  private metaService = inject(Meta);

  t = this.translationService.translations;
  lang = this.translationService.currentLanguage;

  ngOnInit(): void {
    const t = this.t();
    const lang = this.lang();
    const pageUrl = `https://bikehausfreiburg.com/${lang}/garantie`;

    this.titleService.setTitle(t.garantieMetaTitle);
    this.metaService.updateTag({
      name: 'description',
      content: t.garantieMetaDescription,
    });
    this.metaService.updateTag({
      property: 'og:title',
      content: t.garantieMetaTitle,
    });
    this.metaService.updateTag({
      property: 'og:description',
      content: t.garantieMetaDescription,
    });
    this.metaService.updateTag({ property: 'og:url', content: pageUrl });
    this.metaService.updateTag({ name: 'robots', content: 'index, follow' });
  }
}
