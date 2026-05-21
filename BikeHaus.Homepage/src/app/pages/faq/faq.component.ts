import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { TranslationService } from '../../services/translation.service';

interface FaqItem {
  question: string;
  answer: string;
  open: boolean;
}

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="faq-page">
      <!-- Breadcrumb -->
      <nav class="breadcrumb" aria-label="Breadcrumb">
        <div class="container">
          <a [routerLink]="['/' + lang()]">{{ t().home }}</a>
          <span class="sep">/</span>
          <span class="current">{{ t().faqTitle }}</span>
        </div>
      </nav>

      <header class="faq-header">
        <div class="container">
          <h1>{{ t().faqTitle }}</h1>
          <p class="faq-sub">{{ t().faqSub }}</p>
        </div>
      </header>

      <section class="faq-body">
        <div class="container">
          @for (item of faqItems(); track $index) {
            <div
              class="faq-item"
              [class.faq-open]="item.open"
              (click)="toggle($index)"
              (keydown.enter)="toggle($index)"
              (keydown.space)="toggle($index)"
              role="button"
              tabindex="0"
              [attr.aria-expanded]="item.open"
            >
              <div class="faq-question">
                <h2>{{ item.question }}</h2>
                <svg
                  class="faq-chevron"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
              <div class="faq-answer" [class.visible]="item.open">
                <p>{{ item.answer }}</p>
              </div>
            </div>
          }

          <!-- CTA -->
          <div class="faq-cta">
            <p>{{ t().faqCtaText }}</p>
            <div class="faq-cta-actions">
              <a [routerLink]="['/' + lang(), 'contact']" class="btn-primary">{{
                t().faqCtaButton
              }}</a>
              <a
                href="https://wa.me/4915566300011"
                target="_blank"
                rel="noopener"
                class="btn-secondary"
                >WhatsApp</a
              >
            </div>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .faq-page {
        min-height: 100vh;
        padding-bottom: 4rem;
      }
      .container {
        max-width: 780px;
        margin: 0 auto;
        padding: 0 1.5rem;
      }
      .breadcrumb {
        padding: 1rem 0;
        font-size: 0.8rem;
        color: var(--color-text-muted, #666);
        border-bottom: 1px solid var(--color-border, #222);
      }
      .breadcrumb a {
        color: var(--color-text-secondary, #aaa);
        text-decoration: none;
      }
      .breadcrumb a:hover {
        color: var(--color-accent, #ff5722);
      }
      .breadcrumb .sep {
        margin: 0 0.4rem;
        color: var(--color-text-muted, #444);
      }
      .breadcrumb .current {
        color: var(--color-text, #fff);
      }
      .faq-header {
        padding: 2.5rem 0 2rem;
        border-bottom: 1px solid var(--color-border, #222);
      }
      .faq-header h1 {
        font-size: 2rem;
        font-weight: 800;
        color: var(--color-text, #fff);
        margin: 0 0 0.5rem;
      }
      .faq-sub {
        color: var(--color-text-secondary, #aaa);
        font-size: 1.05rem;
        line-height: 1.6;
        margin: 0;
      }
      .faq-body {
        padding-top: 1.5rem;
      }
      .faq-item {
        border-bottom: 1px solid var(--color-border, #222);
        cursor: pointer;
        user-select: none;
      }
      .faq-question {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1.25rem 0;
        gap: 1rem;
      }
      .faq-question h2 {
        font-size: 1.05rem;
        font-weight: 600;
        color: var(--color-text, #fff);
        margin: 0;
        line-height: 1.4;
      }
      .faq-chevron {
        flex-shrink: 0;
        color: var(--color-text-muted, #666);
        transition: transform 0.2s;
      }
      .faq-open .faq-chevron {
        transform: rotate(180deg);
        color: var(--color-accent, #ff5722);
      }
      .faq-answer {
        max-height: 0;
        overflow: hidden;
        transition: max-height 0.3s ease;
      }
      .faq-answer.visible {
        max-height: 300px;
      }
      .faq-answer p {
        color: var(--color-text-secondary, #ccc);
        font-size: 0.95rem;
        line-height: 1.7;
        margin: 0;
        padding-bottom: 1.25rem;
      }
      .faq-cta {
        margin-top: 2.5rem;
        background: var(--color-surface, #111);
        border: 1px solid var(--color-border, #222);
        border-radius: 12px;
        padding: 2rem;
        text-align: center;
      }
      .faq-cta p {
        color: var(--color-text, #fff);
        font-weight: 600;
        font-size: 1.1rem;
        margin: 0 0 1rem;
      }
      .faq-cta-actions {
        display: flex;
        gap: 0.75rem;
        justify-content: center;
        flex-wrap: wrap;
      }
      .btn-primary {
        background: var(--color-accent, #ff5722);
        color: #fff;
        font-weight: 700;
        font-size: 0.9rem;
        padding: 0.7rem 1.5rem;
        border-radius: 8px;
        text-decoration: none;
        transition: opacity 0.2s;
      }
      .btn-primary:hover {
        opacity: 0.85;
      }
      .btn-secondary {
        background: transparent;
        color: var(--color-accent, #ff5722);
        border: 1px solid var(--color-accent, #ff5722);
        font-weight: 700;
        font-size: 0.9rem;
        padding: 0.7rem 1.5rem;
        border-radius: 8px;
        text-decoration: none;
        transition: background 0.2s;
      }
      .btn-secondary:hover {
        background: rgba(255, 87, 34, 0.08);
      }
      @media (max-width: 640px) {
        .faq-header h1 {
          font-size: 1.5rem;
        }
      }

      .faq-page {
        background:
          radial-gradient(circle at top, rgba(255, 87, 34, 0.08), transparent 30%),
          linear-gradient(180deg, rgba(255, 255, 255, 0.015), transparent 22%),
          var(--color-bg);
      }

      .breadcrumb {
        padding: 6.5rem 0 1rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      }

      .breadcrumb .container,
      .faq-header .container,
      .faq-body .container {
        position: relative;
        z-index: 1;
      }

      .faq-header {
        padding: 2.75rem 0 2.2rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      }

      .faq-header h1 {
        font-size: clamp(2.1rem, 5vw, 3.6rem);
        line-height: 0.98;
        letter-spacing: -0.04em;
      }

      .faq-sub {
        color: rgba(255, 255, 255, 0.72);
      }

      .faq-item {
        padding: 0 1.2rem;
        margin-bottom: 0.85rem;
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 18px;
        background: rgba(255, 255, 255, 0.03);
      }

      .faq-question {
        padding: 1.15rem 0;
      }

      .faq-cta {
        border-radius: 24px;
        background:
          linear-gradient(180deg, rgba(255, 255, 255, 0.045), rgba(255, 255, 255, 0.015)),
          var(--color-surface, #111);
        border-color: rgba(255, 255, 255, 0.08);
        box-shadow: 0 18px 44px rgba(0, 0, 0, 0.16);
      }
    `,
  ],
})
export class FaqComponent implements OnInit, OnDestroy {
  private titleService = inject(Title);
  private metaService = inject(Meta);
  private document = inject(DOCUMENT);
  private translationService = inject(TranslationService);

  t = this.translationService.translations;
  lang = this.translationService.currentLanguage;

  faqItems = signal<FaqItem[]>([]);
  private faqSchemaElement: HTMLScriptElement | null = null;

  ngOnInit(): void {
    const trans = this.t();

    this.titleService.setTitle(trans.faqMetaTitle);
    this.metaService.updateTag({
      name: 'description',
      content: trans.faqMetaDescription,
    });
    this.metaService.updateTag({
      property: 'og:title',
      content: trans.faqMetaTitle,
    });
    this.metaService.updateTag({
      property: 'og:description',
      content: trans.faqMetaDescription,
    });
    this.metaService.updateTag({
      property: 'og:url',
      content: `https://bikehausfreiburg.com/${this.lang()}/faq`,
    });

    const items: FaqItem[] = [
      { question: trans.faqQ1, answer: trans.faqA1, open: false },
      { question: trans.faqQ2, answer: trans.faqA2, open: false },
      { question: trans.faqQ3, answer: trans.faqA3, open: false },
      { question: trans.faqQ4, answer: trans.faqA4, open: false },
      { question: trans.faqQ5, answer: trans.faqA5, open: false },
      { question: trans.faqQ6, answer: trans.faqA6, open: false },
      { question: trans.faqQ7, answer: trans.faqA7, open: false },
      { question: trans.faqQ8, answer: trans.faqA8, open: false },
      { question: trans.faqQ9, answer: trans.faqA9, open: false },
      { question: trans.faqQ10, answer: trans.faqA10, open: false },
    ];
    this.faqItems.set(items);

    this.addFaqSchema(items);
  }

  ngOnDestroy(): void {
    if (this.faqSchemaElement?.parentNode) {
      this.faqSchemaElement.parentNode.removeChild(this.faqSchemaElement);
    }
  }

  toggle(index: number): void {
    const items = [...this.faqItems()];
    items[index] = { ...items[index], open: !items[index].open };
    this.faqItems.set(items);
  }

  private addFaqSchema(items: FaqItem[]): void {
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: items.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.answer,
        },
      })),
    };

    const existing = this.faqSchemaElement || this.document.getElementById('faq-schema');
    if (existing) existing.remove();

    this.faqSchemaElement = this.document.createElement('script');
    this.faqSchemaElement.id = 'faq-schema';
    this.faqSchemaElement.type = 'application/ld+json';
    this.faqSchemaElement.text = JSON.stringify(schema);
    this.document.head.appendChild(this.faqSchemaElement);
  }
}
