import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { TranslationService } from '../../services/translation.service';
import { BLOG_ARTICLES, BlogArticle } from '../../services/blog.data';

@Component({
  selector: 'app-ratgeber',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="ratgeber-page">
      <header class="page-header">
        <div class="container">
          <span class="label">{{ t().ratgeberLabel }}</span>
          <h1>{{ t().ratgeberTitle }}</h1>
          <p class="sub">{{ t().ratgeberSub }}</p>
        </div>
      </header>

      <div class="container">
        <div class="articles-grid">
          @for (article of articles; track article.slug) {
            <a
              [routerLink]="['/' + lang(), 'ratgeber', article.slug]"
              class="article-card"
            >
              <div class="card-image">
                <div class="card-image-placeholder">
                  <svg
                    width="48"
                    height="48"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M8 12l2 2 4-4" />
                  </svg>
                </div>
              </div>
              <div class="card-body">
                <div class="card-meta">
                  <span class="card-category">{{ article.category }}</span>
                  <span class="card-date">{{ article.date }}</span>
                  <span class="card-reading"
                    >{{ article.readingTime }} min</span
                  >
                </div>
                <h2 class="card-title">
                  {{ getTranslation(article).title }}
                </h2>
                <p class="card-excerpt">
                  {{ getTranslation(article).excerpt }}
                </p>
                <span class="card-link">
                  {{ t().ratgeberReadMore }}
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
                </span>
              </div>
            </a>
          }
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .ratgeber-page {
        min-height: 100vh;
        padding-bottom: 4rem;
      }

      .page-header {
        padding: 3rem 0 2rem;
        border-bottom: 1px solid var(--color-border, #222);
      }
      .container {
        max-width: 1100px;
        margin: 0 auto;
        padding: 0 1.5rem;
      }
      .label {
        display: inline-block;
        font-size: 0.75rem;
        font-weight: 600;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--color-accent, #ff5722);
        margin-bottom: 0.5rem;
      }
      h1 {
        font-size: 2rem;
        font-weight: 700;
        color: var(--color-text, #fff);
        margin: 0 0 0.5rem;
      }
      .sub {
        color: var(--color-text-secondary, #aaa);
        font-size: 1rem;
        margin: 0;
      }

      .articles-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
        gap: 1.5rem;
        margin-top: 2rem;
      }

      .article-card {
        display: flex;
        flex-direction: column;
        background: var(--color-surface, #111);
        border: 1px solid var(--color-border, #222);
        border-radius: 12px;
        overflow: hidden;
        text-decoration: none;
        color: inherit;
        transition:
          transform 0.2s,
          border-color 0.2s;
      }
      .article-card:hover {
        transform: translateY(-4px);
        border-color: var(--color-accent, #ff5722);
      }

      .card-image {
        position: relative;
        aspect-ratio: 16 / 9;
        background: var(--color-bg, #0a0a0a);
        overflow: hidden;
      }
      .card-image img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .card-image-placeholder {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
        color: var(--color-text-muted, #555);
        background: linear-gradient(
          135deg,
          var(--color-surface, #111) 0%,
          var(--color-bg, #0a0a0a) 100%
        );
      }

      .card-body {
        padding: 1.25rem;
        flex: 1;
        display: flex;
        flex-direction: column;
      }

      .card-meta {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        font-size: 0.75rem;
        color: var(--color-text-muted, #666);
        margin-bottom: 0.75rem;
      }
      .card-category {
        background: var(--color-accent-subtle, rgba(255, 87, 34, 0.12));
        color: var(--color-accent, #ff5722);
        padding: 0.15rem 0.5rem;
        border-radius: 4px;
        font-weight: 600;
        text-transform: uppercase;
        font-size: 0.65rem;
        letter-spacing: 0.05em;
      }

      .card-title {
        font-size: 1.15rem;
        font-weight: 700;
        color: var(--color-text, #fff);
        margin: 0 0 0.5rem;
        line-height: 1.35;
      }

      .card-excerpt {
        color: var(--color-text-secondary, #aaa);
        font-size: 0.9rem;
        line-height: 1.5;
        margin: 0 0 1rem;
        flex: 1;
      }

      .card-link {
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
        font-size: 0.85rem;
        font-weight: 600;
        color: var(--color-accent, #ff5722);
      }
      .card-link svg {
        transition: transform 0.2s;
      }
      .article-card:hover .card-link svg {
        transform: translateX(3px);
      }

      @media (max-width: 640px) {
        .articles-grid {
          grid-template-columns: 1fr;
        }
        h1 {
          font-size: 1.5rem;
        }
      }

      .ratgeber-page {
        background:
          radial-gradient(circle at top, rgba(255, 87, 34, 0.08), transparent 30%),
          linear-gradient(180deg, rgba(255, 255, 255, 0.015), transparent 22%),
          var(--color-bg);
      }

      .page-header {
        position: relative;
        padding: 7rem 0 3rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      }

      .page-header .container {
        max-width: 920px;
      }

      h1 {
        font-size: clamp(2.3rem, 5vw, 4.2rem);
        font-weight: 800;
        letter-spacing: -0.04em;
        line-height: 0.98;
        margin-bottom: 0.85rem;
      }

      .sub {
        max-width: 640px;
        color: rgba(255, 255, 255, 0.72);
      }

      .articles-grid {
        margin-top: 2.5rem;
        gap: 1.6rem;
      }

      .article-card {
        border-radius: 22px;
        background:
          linear-gradient(180deg, rgba(255, 255, 255, 0.045), rgba(255, 255, 255, 0.015)),
          var(--color-surface, #111);
        border-color: rgba(255, 255, 255, 0.08);
        box-shadow: 0 18px 44px rgba(0, 0, 0, 0.16);
      }

      .article-card:hover {
        transform: translateY(-6px);
        box-shadow: 0 24px 54px rgba(0, 0, 0, 0.24);
      }

      .card-image::after {
        content: '';
        position: absolute;
        inset: auto 0 0 0;
        height: 50%;
        background: linear-gradient(180deg, transparent, rgba(4, 6, 12, 0.4));
        pointer-events: none;
      }

      .card-category {
        border-radius: 999px;
        padding: 0.28rem 0.65rem;
        border: 1px solid rgba(255, 87, 34, 0.18);
      }
    `,
  ],
})
export class RatgeberComponent implements OnInit {
  private titleService = inject(Title);
  private metaService = inject(Meta);
  private document = inject(DOCUMENT);
  private translationService = inject(TranslationService);

  t = this.translationService.translations;
  lang = this.translationService.currentLanguage;
  articles = BLOG_ARTICLES;

  ngOnInit(): void {
    const t = this.t();
    const lang = this.lang();
    const url = `https://bikehausfreiburg.com/${lang}/ratgeber`;

    this.titleService.setTitle(t.ratgeberMetaTitle);
    this.metaService.updateTag({
      name: 'description',
      content: t.ratgeberMetaDescription,
    });
    this.metaService.updateTag({
      property: 'og:title',
      content: t.ratgeberMetaTitle,
    });
    this.metaService.updateTag({
      property: 'og:description',
      content: t.ratgeberMetaDescription,
    });
    this.metaService.updateTag({ property: 'og:url', content: url });
    this.metaService.updateTag({ name: 'robots', content: 'index, follow' });
  }

  getTranslation(article: BlogArticle) {
    return article.translations[this.lang()] || article.translations['de'];
  }
}
