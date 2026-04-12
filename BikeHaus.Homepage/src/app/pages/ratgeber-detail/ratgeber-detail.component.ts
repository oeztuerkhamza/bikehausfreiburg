import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { TranslationService } from '../../services/translation.service';
import {
  BLOG_ARTICLES,
  BlogArticle,
  BlogArticleTranslation,
} from '../../services/blog.data';

@Component({
  selector: 'app-ratgeber-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="article-page" *ngIf="article() as a">
      <!-- Breadcrumb -->
      <nav class="breadcrumb" aria-label="Breadcrumb">
        <div class="container">
          <a [routerLink]="['/' + lang()]">{{ t().home }}</a>
          <span class="sep">/</span>
          <a [routerLink]="['/' + lang(), 'ratgeber']">{{ t().ratgeberNav }}</a>
          <span class="sep">/</span>
          <span class="current">{{ translation()?.title }}</span>
        </div>
      </nav>

      <!-- Article Header -->
      <header class="article-header">
        <div class="container">
          <div class="article-meta">
            <span class="category-badge">{{ a.category }}</span>
            <time [attr.datetime]="a.date">{{ a.date }}</time>
            <span>{{ a.readingTime }} min {{ t().ratgeberReadTime }}</span>
          </div>
          <h1>{{ translation()?.title }}</h1>
          <p class="excerpt">{{ translation()?.excerpt }}</p>
        </div>
      </header>

      <!-- Article Body -->
      <article class="article-body">
        <div class="container">
          <!-- TL;DR / Zusammenfassung Box (AI-optimized) -->
          @if (translation()?.tldr; as tldr) {
            <div class="tldr-box" role="region" aria-label="Zusammenfassung">
              <div class="tldr-header">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
                <span>{{ t().ratgeberTldr }}</span>
              </div>
              <p>{{ tldr }}</p>
            </div>
          }

          @if (translation()?.sections; as sections) {
            @for (section of sections; track $index) {
              @switch (section.type) {
                @case ('heading') {
                  <h2>{{ section.content }}</h2>
                }
                @case ('paragraph') {
                  <p>{{ section.content }}</p>
                }
                @case ('list') {
                  <ul>
                    @for (item of section.items; track $index) {
                      <li>{{ item }}</li>
                    }
                  </ul>
                }
                @case ('tip') {
                  <div class="tip-box">
                    <div class="tip-icon">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="16" x2="12" y2="12" />
                        <line x1="12" y1="8" x2="12.01" y2="8" />
                      </svg>
                      <span>{{ t().ratgeberTip }}</span>
                    </div>
                    <p>{{ section.content }}</p>
                  </div>
                }
                @case ('cta') {
                  <div class="cta-box">
                    <p>{{ section.content }}</p>
                    <a
                      [routerLink]="['/' + lang() + section.link]"
                      class="cta-button"
                      >{{ section.linkText }}</a
                    >
                  </div>
                }
              }
            }
          }

          <!-- Related Articles -->
          @if (relatedArticles().length > 0) {
            <section class="related-section">
              <h2>{{ t().ratgeberRelated }}</h2>
              <div class="related-grid">
                @for (rel of relatedArticles(); track rel.slug) {
                  <a
                    [routerLink]="['/' + lang(), 'ratgeber', rel.slug]"
                    class="related-card"
                  >
                    <span class="related-category">{{ rel.category }}</span>
                    <h3>{{ getTranslation(rel).title }}</h3>
                    <span class="related-link">
                      {{ t().ratgeberReadMore }}
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                      >
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </span>
                  </a>
                }
              </div>
            </section>
          }

          <!-- Back link -->
          <div class="back-link">
            <a [routerLink]="['/' + lang(), 'ratgeber']">
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
              {{ t().ratgeberBackToList }}
            </a>
          </div>
        </div>
      </article>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .article-page {
        min-height: 100vh;
        padding-bottom: 4rem;
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

      .container {
        max-width: 780px;
        margin: 0 auto;
        padding: 0 1.5rem;
      }

      .article-header {
        padding: 2.5rem 0 2rem;
        border-bottom: 1px solid var(--color-border, #222);
      }
      .article-meta {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        font-size: 0.75rem;
        color: var(--color-text-muted, #666);
        margin-bottom: 1rem;
      }
      .category-badge {
        background: var(--color-accent-subtle, rgba(255, 87, 34, 0.12));
        color: var(--color-accent, #ff5722);
        padding: 0.15rem 0.5rem;
        border-radius: 4px;
        font-weight: 600;
        text-transform: uppercase;
        font-size: 0.65rem;
        letter-spacing: 0.05em;
      }
      h1 {
        font-size: 2.25rem;
        font-weight: 800;
        color: var(--color-text, #fff);
        line-height: 1.25;
        margin: 0 0 0.75rem;
      }
      .excerpt {
        font-size: 1.1rem;
        color: var(--color-text-secondary, #aaa);
        line-height: 1.6;
        margin: 0;
      }

      /* Article body */
      .article-body {
        padding-top: 2rem;
      }

      /* TL;DR box — AI-optimized summary */
      .tldr-box {
        background: linear-gradient(
          135deg,
          rgba(76, 175, 80, 0.08) 0%,
          rgba(76, 175, 80, 0.04) 100%
        );
        border: 1px solid rgba(76, 175, 80, 0.3);
        border-radius: 12px;
        padding: 1.25rem 1.5rem;
        margin-bottom: 2rem;
      }
      .tldr-header {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: #4caf50;
        font-weight: 700;
        font-size: 0.85rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        margin-bottom: 0.5rem;
      }
      .tldr-box p {
        color: var(--color-text, #fff);
        margin: 0;
        font-size: 0.95rem;
        line-height: 1.65;
      }

      .article-body h2 {
        font-size: 1.4rem;
        font-weight: 700;
        color: var(--color-text, #fff);
        margin: 2.5rem 0 0.75rem;
        padding-top: 0.5rem;
      }
      .article-body h2:first-child {
        margin-top: 0;
      }
      .article-body p {
        color: var(--color-text-secondary, #ccc);
        font-size: 1rem;
        line-height: 1.75;
        margin: 0 0 1rem;
      }
      .article-body ul {
        margin: 0 0 1.5rem;
        padding-left: 1.25rem;
      }
      .article-body li {
        color: var(--color-text-secondary, #ccc);
        font-size: 1rem;
        line-height: 1.7;
        margin-bottom: 0.5rem;
      }
      .article-body li::marker {
        color: var(--color-accent, #ff5722);
      }

      /* Tip box */
      .tip-box {
        background: var(--color-accent-subtle, rgba(255, 87, 34, 0.08));
        border: 1px solid var(--color-accent, #ff5722);
        border-radius: 10px;
        padding: 1.25rem 1.5rem;
        margin: 1.5rem 0;
      }
      .tip-icon {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: var(--color-accent, #ff5722);
        font-weight: 700;
        font-size: 0.85rem;
        margin-bottom: 0.5rem;
      }
      .tip-box p {
        color: var(--color-text, #fff);
        margin: 0;
        font-size: 0.95rem;
      }

      /* CTA box */
      .cta-box {
        background: var(--color-surface, #111);
        border: 1px solid var(--color-border, #222);
        border-radius: 10px;
        padding: 1.5rem;
        margin: 2rem 0;
        text-align: center;
      }
      .cta-box p {
        color: var(--color-text, #fff);
        font-weight: 600;
        font-size: 1.05rem;
        margin-bottom: 1rem;
      }
      .cta-button {
        display: inline-block;
        background: var(--color-accent, #ff5722);
        color: #fff;
        font-weight: 700;
        font-size: 0.9rem;
        padding: 0.7rem 1.5rem;
        border-radius: 8px;
        text-decoration: none;
        transition: opacity 0.2s;
      }
      .cta-button:hover {
        opacity: 0.85;
      }

      /* Related */
      .related-section {
        margin-top: 3rem;
        padding-top: 2rem;
        border-top: 1px solid var(--color-border, #222);
      }
      .related-section h2 {
        margin-top: 0;
        font-size: 1.2rem;
      }
      .related-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
        gap: 1rem;
        margin-top: 1rem;
      }
      .related-card {
        background: var(--color-surface, #111);
        border: 1px solid var(--color-border, #222);
        border-radius: 10px;
        padding: 1.25rem;
        text-decoration: none;
        color: inherit;
        transition: border-color 0.2s;
      }
      .related-card:hover {
        border-color: var(--color-accent, #ff5722);
      }
      .related-category {
        display: inline-block;
        font-size: 0.65rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--color-accent, #ff5722);
        margin-bottom: 0.5rem;
      }
      .related-card h3 {
        font-size: 1rem;
        font-weight: 700;
        color: var(--color-text, #fff);
        margin: 0 0 0.5rem;
        line-height: 1.35;
      }
      .related-link {
        display: inline-flex;
        align-items: center;
        gap: 0.3rem;
        font-size: 0.8rem;
        font-weight: 600;
        color: var(--color-accent, #ff5722);
      }

      /* Back link */
      .back-link {
        margin-top: 2.5rem;
        padding-top: 1.5rem;
        border-top: 1px solid var(--color-border, #222);
      }
      .back-link a {
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        color: var(--color-text-secondary, #aaa);
        text-decoration: none;
        font-size: 0.9rem;
        font-weight: 500;
        transition: color 0.2s;
      }
      .back-link a:hover {
        color: var(--color-accent, #ff5722);
      }

      @media (max-width: 640px) {
        h1 {
          font-size: 1.6rem;
        }
        .article-body h2 {
          font-size: 1.2rem;
        }
        .related-grid {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class RatgeberDetailComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private titleService = inject(Title);
  private metaService = inject(Meta);
  private document = inject(DOCUMENT);
  private translationService = inject(TranslationService);

  t = this.translationService.translations;
  lang = this.translationService.currentLanguage;

  article = signal<BlogArticle | null>(null);
  translation = signal<BlogArticleTranslation | null>(null);
  relatedArticles = signal<BlogArticle[]>([]);

  private articleSchemaElement: HTMLScriptElement | null = null;
  private breadcrumbSchemaElement: HTMLScriptElement | null = null;

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const slug = params.get('slug');
      const found = BLOG_ARTICLES.find((a) => a.slug === slug);

      if (found) {
        this.article.set(found);
        const lang = this.lang();
        const trans = found.translations[lang] || found.translations['de'];
        this.translation.set(trans);

        // Related articles
        const related = BLOG_ARTICLES.filter((a) =>
          found.relatedSlugs.includes(a.slug),
        );
        this.relatedArticles.set(related);

        // SEO
        this.setMeta(found, trans, lang);
        this.addArticleSchema(found, trans, lang);
        this.addBreadcrumbSchema(found, trans, lang);
      }
    });
  }

  ngOnDestroy(): void {
    this.removeSchema(this.articleSchemaElement);
    this.removeSchema(this.breadcrumbSchemaElement);
  }

  getTranslation(article: BlogArticle): BlogArticleTranslation {
    return article.translations[this.lang()] || article.translations['de'];
  }

  private setMeta(
    article: BlogArticle,
    trans: BlogArticleTranslation,
    lang: string,
  ): void {
    const url = `https://bikehausfreiburg.com/${lang}/ratgeber/${article.slug}`;

    this.titleService.setTitle(trans.metaTitle);
    this.metaService.updateTag({
      name: 'description',
      content: trans.metaDescription,
    });
    this.metaService.updateTag({
      property: 'og:title',
      content: trans.metaTitle,
    });
    this.metaService.updateTag({
      property: 'og:description',
      content: trans.metaDescription,
    });
    this.metaService.updateTag({ property: 'og:url', content: url });
    this.metaService.updateTag({ property: 'og:type', content: 'article' });
    this.metaService.updateTag({
      property: 'article:published_time',
      content: article.date,
    });
    this.metaService.updateTag({
      property: 'article:author',
      content: 'Bike Haus Freiburg',
    });
    this.metaService.updateTag({
      name: 'robots',
      content: 'index, follow, max-snippet:-1',
    });
  }

  private addArticleSchema(
    article: BlogArticle,
    trans: BlogArticleTranslation,
    lang: string,
  ): void {
    this.removeSchema(this.articleSchemaElement);

    const schema = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      '@id': `https://bikehausfreiburg.com/${lang}/ratgeber/${article.slug}#article`,
      headline: trans.title,
      description: trans.metaDescription,
      datePublished: article.date,
      dateModified: article.date,
      author: {
        '@type': 'Organization',
        name: 'Bike Haus Freiburg',
        url: 'https://bikehausfreiburg.com',
      },
      publisher: {
        '@type': 'Organization',
        name: 'Bike Haus Freiburg',
        url: 'https://bikehausfreiburg.com',
        logo: {
          '@type': 'ImageObject',
          url: 'https://bikehausfreiburg.com/assets/logo.svg',
        },
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': `https://bikehausfreiburg.com/${lang}/ratgeber/${article.slug}`,
      },
      inLanguage: lang,
      articleSection: article.category,
      keywords: article.tags.join(', '),
      wordCount: this.estimateWordCount(trans),
      speakable: {
        '@type': 'SpeakableSpecification',
        cssSelector: [
          '.article-header h1',
          '.excerpt',
          '.tldr-box p',
          '.tip-box p',
        ],
      },
    };

    this.articleSchemaElement = this.document.createElement('script');
    this.articleSchemaElement.type = 'application/ld+json';
    this.articleSchemaElement.text = JSON.stringify(schema);
    this.document.head.appendChild(this.articleSchemaElement);
  }

  private addBreadcrumbSchema(
    article: BlogArticle,
    trans: BlogArticleTranslation,
    lang: string,
  ): void {
    this.removeSchema(this.breadcrumbSchemaElement);

    const schema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Startseite',
          item: `https://bikehausfreiburg.com/${lang}`,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Ratgeber',
          item: `https://bikehausfreiburg.com/${lang}/ratgeber`,
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: trans.title,
          item: `https://bikehausfreiburg.com/${lang}/ratgeber/${article.slug}`,
        },
      ],
    };

    this.breadcrumbSchemaElement = this.document.createElement('script');
    this.breadcrumbSchemaElement.type = 'application/ld+json';
    this.breadcrumbSchemaElement.text = JSON.stringify(schema);
    this.document.head.appendChild(this.breadcrumbSchemaElement);
  }

  private removeSchema(element: HTMLScriptElement | null): void {
    if (element && element.parentNode) {
      element.parentNode.removeChild(element);
    }
  }

  private estimateWordCount(trans: BlogArticleTranslation): number {
    let words = 0;
    for (const section of trans.sections) {
      if (section.content) words += section.content.split(/\s+/).length;
      if (section.items) words += section.items.join(' ').split(/\s+/).length;
    }
    return words;
  }
}
