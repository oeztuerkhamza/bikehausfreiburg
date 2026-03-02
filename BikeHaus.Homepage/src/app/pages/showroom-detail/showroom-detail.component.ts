import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { TranslationService } from '../../services/translation.service';
import { ApiService } from '../../services/api.service';
import { KleinanzeigenListing } from '../../models/models';

@Component({
  selector: 'app-showroom-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <!-- Loading -->
    <div *ngIf="loading()" class="loading-wrap">
      <div class="container">
        <div class="sk-layout">
          <div class="sk-gallery"><div class="sk-main-img"></div></div>
          <div class="sk-details">
            <div class="sk-line w30"></div>
            <div class="sk-line w90"></div>
            <div class="sk-line w50"></div>
            <div class="sk-line w70"></div>
          </div>
        </div>
      </div>
    </div>

    <div class="detail-page" *ngIf="!loading()">
      <!-- Breadcrumb Bar -->
      <nav class="breadcrumb-bar">
        <div class="container">
          <a [routerLink]="['/' + lang(), 'showroom']" class="back-link">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            <span>{{ t().backToShowroom }}</span>
          </a>
        </div>
      </nav>

      <div class="container" *ngIf="listing()">
        <article class="detail-layout">
          <!-- ── LEFT: Gallery ── -->
          <div class="gallery-col">
            <figure class="main-image-wrap">
              <img
                *ngIf="listing()!.images.length > 0"
                [src]="listing()!.images[selectedImage()].imageUrl"
                [alt]="listing()!.title"
                class="main-img"
                (error)="onImageError($event)"
              />
              <div *ngIf="listing()!.images.length === 0" class="no-image">
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--color-text-muted)"
                  stroke-width="1"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
              </div>

              <!-- Nav Arrows -->
              <button
                *ngIf="listing()!.images.length > 1"
                class="g-nav g-prev"
                (click)="prevImage()"
                aria-label="Previous"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.5"
                >
                  <path d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                *ngIf="listing()!.images.length > 1"
                class="g-nav g-next"
                (click)="nextImage()"
                aria-label="Next"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.5"
                >
                  <path d="M9 5l7 7-7 7" />
                </svg>
              </button>

              <!-- Counter -->
              <span class="img-counter" *ngIf="listing()!.images.length > 1">
                {{ selectedImage() + 1 }} / {{ listing()!.images.length }}
              </span>
            </figure>

            <!-- Thumbnail Strip -->
            <div class="thumb-strip" *ngIf="listing()!.images.length > 1">
              <button
                *ngFor="let img of listing()!.images; let i = index"
                class="thumb"
                [class.active]="selectedImage() === i"
                (click)="selectedImage.set(i)"
              >
                <img [src]="img.imageUrl" [alt]="''" loading="lazy" />
              </button>
            </div>
          </div>

          <!-- ── RIGHT: Details ── -->
          <aside class="details-col">
            <div class="details-inner">
              <!-- Condition + Category Badges -->
              <div class="badge-row">
                <span class="condition-badge" [class.is-new]="isNew()">{{
                  isNew() ? t().conditionNew : t().conditionUsed
                }}</span>
                <span *ngIf="displayCategory()" class="cat-badge">{{
                  displayCategory()
                }}</span>
              </div>

              <!-- Title -->
              <h1 class="title">{{ listing()!.title }}</h1>

              <!-- Price Card -->
              <div class="price-card" *ngIf="listing()!.priceText">
                <span class="price-value">{{ listing()!.priceText }}</span>
              </div>

              <!-- Meta Info -->
              <div class="meta-list">
                <div *ngIf="listing()!.location" class="meta-row">
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--color-accent)"
                    stroke-width="2"
                  >
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <span>{{ listing()!.location }}</span>
                </div>
                <div class="meta-row">
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--color-accent)"
                    stroke-width="2"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                  <span>{{ listing()!.images.length }} {{ t().photos }}</span>
                </div>
              </div>

              <!-- CTA -->
              <a
                [href]="listing()!.externalUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="btn-primary cta-link"
              >
                {{ t().viewOnKleinanzeigen }}
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"
                  />
                </svg>
              </a>

              <!-- Google Maps -->
              <a
                href="https://maps.google.com/?q=Heckerstra%C3%9Fe+27+Freiburg+im+Breisgau"
                target="_blank"
                rel="noopener"
                class="btn-maps"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                Google Maps
              </a>
            </div>
          </aside>
        </article>

        <!-- ── Description (full width below) ── -->
        <section *ngIf="listing()!.description" class="desc-section">
          <h2>{{ t().description }}</h2>
          <div
            class="desc-body"
            [innerHTML]="formatDescription(listing()!.description!)"
          ></div>
        </section>
      </div>

      <!-- Not Found -->
      <div *ngIf="!listing() && !loading()" class="container not-found-wrap">
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--color-text-muted)"
          stroke-width="1.5"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
        <p>{{ t().noResults }}</p>
        <a [routerLink]="['/' + lang(), 'showroom']" class="btn-primary">{{
          t().backToShowroom
        }}</a>
      </div>
    </div>
  `,
  styles: [
    `
      /* ── Loading Skeleton ── */
      .loading-wrap {
        padding: 7rem 0 4rem;
      }

      .sk-layout {
        display: grid;
        grid-template-columns: 1fr 420px;
        gap: 2.5rem;
      }

      .sk-main-img {
        aspect-ratio: 4/3;
        border-radius: 20px;
        background: linear-gradient(
          90deg,
          var(--color-surface) 25%,
          var(--color-surface-alt, #1a1a1a) 50%,
          var(--color-surface) 75%
        );
        background-size: 200% 100%;
        animation: shimmer 1.5s infinite;
      }

      .sk-details {
        padding-top: 1rem;
      }

      .sk-line {
        height: 16px;
        border-radius: 8px;
        margin-bottom: 1.25rem;
        background: linear-gradient(
          90deg,
          var(--color-surface) 25%,
          var(--color-surface-alt, #1a1a1a) 50%,
          var(--color-surface) 75%
        );
        background-size: 200% 100%;
        animation: shimmer 1.5s infinite;
      }

      .w30 {
        width: 30%;
      }
      .w50 {
        width: 50%;
      }
      .w70 {
        width: 70%;
      }
      .w90 {
        width: 90%;
      }

      @keyframes shimmer {
        to {
          background-position: -200% 0;
        }
      }

      /* ── Page ── */
      .detail-page {
        padding-bottom: 4rem;
      }

      /* ── Breadcrumb ── */
      .breadcrumb-bar {
        padding: 6.5rem 0 1.5rem;
        border-bottom: 1px solid var(--color-border);
        margin-bottom: 2.5rem;
      }

      .back-link {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        color: var(--color-text-secondary);
        text-decoration: none;
        font-size: 0.88rem;
        font-weight: 500;
        transition: color 0.2s;
      }

      .back-link:hover {
        color: var(--color-accent);
      }

      /* ── Layout ── */
      .detail-layout {
        display: grid;
        grid-template-columns: 1fr 400px;
        gap: 3rem;
        align-items: start;
      }

      /* ── Gallery ── */
      .gallery-col {
        min-width: 0;
      }

      .main-image-wrap {
        position: relative;
        border-radius: 20px;
        overflow: hidden;
        background: #0d0d0d;
        border: 1px solid var(--color-border);
        aspect-ratio: 4/3;
        margin: 0;
      }

      .main-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }

      .no-image {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--color-surface);
      }

      .g-nav {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        width: 40px;
        height: 40px;
        border-radius: 50%;
        border: none;
        background: rgba(0, 0, 0, 0.55);
        backdrop-filter: blur(8px);
        color: #fff;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition:
          opacity 0.25s,
          background 0.2s;
      }

      .main-image-wrap:hover .g-nav {
        opacity: 1;
      }

      .g-nav:hover {
        background: rgba(0, 0, 0, 0.8);
      }
      .g-prev {
        left: 1rem;
      }
      .g-next {
        right: 1rem;
      }

      .img-counter {
        position: absolute;
        bottom: 1rem;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0, 0, 0, 0.6);
        backdrop-filter: blur(6px);
        color: #fff;
        padding: 0.3rem 0.9rem;
        border-radius: 50px;
        font-size: 0.78rem;
        font-weight: 500;
        letter-spacing: 0.04em;
      }

      /* Thumbnails */
      .thumb-strip {
        display: flex;
        gap: 0.5rem;
        margin-top: 0.75rem;
        overflow-x: auto;
        padding-bottom: 0.25rem;
        scrollbar-width: thin;
        scrollbar-color: var(--color-border) transparent;
      }

      .thumb {
        flex-shrink: 0;
        width: 72px;
        height: 54px;
        border-radius: 10px;
        overflow: hidden;
        border: 2px solid var(--color-border);
        cursor: pointer;
        padding: 0;
        background: none;
        transition:
          border-color 0.2s,
          opacity 0.2s;
        opacity: 0.6;
      }

      .thumb.active {
        border-color: var(--color-accent);
        opacity: 1;
      }

      .thumb:hover {
        opacity: 1;
      }

      .thumb img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }

      /* ── Details Column ── */
      .details-col {
        position: sticky;
        top: 6rem;
      }

      .details-inner {
        background: var(--color-surface);
        border: 1px solid var(--color-border);
        border-radius: 20px;
        padding: 2rem;
      }

      .badge-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        flex-wrap: wrap;
        margin-bottom: 1rem;
      }

      .condition-badge {
        display: inline-block;
        background: rgba(120, 120, 120, 0.25);
        color: var(--color-text-secondary);
        font-size: 0.72rem;
        font-weight: 700;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        padding: 0.35rem 0.9rem;
        border-radius: 50px;
      }

      .condition-badge.is-new {
        background: rgba(76, 175, 80, 0.15);
        color: #4caf50;
      }

      .cat-badge {
        display: inline-block;
        background: rgba(255, 87, 34, 0.1);
        color: var(--color-accent);
        font-size: 0.72rem;
        font-weight: 700;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        padding: 0.35rem 0.9rem;
        border-radius: 50px;
      }

      .title {
        font-size: 1.35rem;
        font-weight: 700;
        color: var(--color-text);
        line-height: 1.35;
        margin: 0 0 1.25rem;
        letter-spacing: -0.01em;
      }

      /* Price */
      .price-card {
        background: rgba(255, 87, 34, 0.08);
        border: 1px solid rgba(255, 87, 34, 0.18);
        border-radius: 14px;
        padding: 1rem 1.25rem;
        margin-bottom: 1.5rem;
      }

      .price-value {
        font-size: 1.5rem;
        font-weight: 800;
        color: var(--color-accent);
        letter-spacing: -0.02em;
      }

      /* Meta */
      .meta-list {
        display: flex;
        flex-direction: column;
        gap: 0.65rem;
        margin-bottom: 1.75rem;
        padding-bottom: 1.5rem;
        border-bottom: 1px solid var(--color-border);
      }

      .meta-row {
        display: flex;
        align-items: center;
        gap: 0.6rem;
        font-size: 0.88rem;
        color: var(--color-text-secondary);
      }

      .meta-row svg {
        flex-shrink: 0;
      }

      /* CTA */
      .cta-link {
        width: 100%;
        justify-content: center;
        text-decoration: none;
        padding: 0.85rem 1.5rem;
      }

      .btn-maps {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        width: 100%;
        margin-top: 0.65rem;
        padding: 0.75rem 1.5rem;
        border-radius: 12px;
        background: var(--color-bg);
        border: 1px solid var(--color-border);
        color: var(--color-text-secondary);
        font-size: 0.88rem;
        font-weight: 600;
        text-decoration: none;
        transition:
          border-color 0.25s,
          color 0.25s;
      }

      .btn-maps:hover {
        border-color: var(--color-accent);
        color: var(--color-accent);
      }

      /* ── Description ── */
      .desc-section {
        margin-top: 3rem;
        padding-top: 2.5rem;
        border-top: 1px solid var(--color-border);
        max-width: 800px;
      }

      .desc-section h2 {
        font-size: 1.1rem;
        font-weight: 700;
        color: var(--color-text);
        margin-bottom: 1rem;
      }

      .desc-body {
        font-size: 0.95rem;
        line-height: 1.8;
        color: var(--color-text-secondary);
        white-space: pre-wrap;
        word-break: break-word;
      }

      /* ── Not Found ── */
      .not-found-wrap {
        text-align: center;
        padding: 8rem 1rem;
      }

      .not-found-wrap svg {
        margin-bottom: 1rem;
      }
      .not-found-wrap p {
        color: var(--color-text-secondary);
        margin-bottom: 1.5rem;
      }

      /* ── Responsive ── */
      @media (max-width: 960px) {
        .detail-layout {
          grid-template-columns: 1fr;
          gap: 1.5rem;
        }

        .sk-layout {
          grid-template-columns: 1fr;
        }

        .details-col {
          position: static;
        }

        .details-inner {
          padding: 1.5rem;
        }

        .breadcrumb-bar {
          padding-top: 5.5rem;
          margin-bottom: 1.5rem;
        }
      }

      @media (max-width: 640px) {
        .main-image-wrap {
          border-radius: 14px;
        }

        .title {
          font-size: 1.15rem;
        }

        .price-value {
          font-size: 1.3rem;
        }

        .g-nav {
          opacity: 1;
          width: 36px;
          height: 36px;
        }
      }
    `,
  ],
})
export class ShowroomDetailComponent implements OnInit, OnDestroy {
  private translationService = inject(TranslationService);
  private apiService = inject(ApiService);
  private route = inject(ActivatedRoute);
  private titleService = inject(Title);
  private metaService = inject(Meta);
  private document = inject(DOCUMENT);
  
  private productSchemaElement: HTMLScriptElement | null = null;

  t = this.translationService.translations;
  lang = this.translationService.currentLanguage;

  listing = signal<KleinanzeigenListing | null>(null);
  loading = signal(true);
  selectedImage = signal(0);

  private static readonly NEW_PATTERN =
    /\b(neue?[smrn]?|nagelneu|brandneu|unbenutzt|originalverpackt|\bovp\b)\b/i;

  isNew = () =>
    ShowroomDetailComponent.NEW_PATTERN.test(this.listing()?.title || '');

  displayCategory(): string | null {
    const cat = this.listing()?.category;
    if (!cat || /kleinanzeigen|freiburg/i.test(cat)) return null;
    return cat;
  }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      const id = +params['id'];
      if (id) {
        this.loadListing(id);
      }
    });
  }

  private loadListing(id: number): void {
    this.apiService.getListingById(id).subscribe({
      next: (data) => {
        this.listing.set(data);
        this.loading.set(false);

        // Dynamic SEO
        if (data) {
          const title = `${data.title} — Bike Haus Freiburg`;
          const price = data.price ? `${data.price}€` : '';
          const desc = `${data.title} ${price}. Jetzt bei Bike Haus Freiburg in 79114 Freiburg im Breisgau ansehen.`;

          this.titleService.setTitle(title);
          this.metaService.updateTag({ name: 'description', content: desc });
          this.metaService.updateTag({ property: 'og:title', content: title });
          this.metaService.updateTag({
            property: 'og:description',
            content: desc,
          });
          this.metaService.updateTag({
            property: 'og:url',
            content: `https://bikehausfreiburg.com/showroom/${id}`,
          });
          if (data.images?.length) {
            this.metaService.updateTag({
              property: 'og:image',
              content: data.images[0].imageUrl,
            });
          }
          
          // Add Product Schema.org for SEO
          this.addProductSchema(data, id);
        }
      },
      error: () => this.loading.set(false),
    });
  }
  
  private addProductSchema(data: KleinanzeigenListing, id: number): void {
    // Remove existing schema if any
    this.removeProductSchema();
    
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      '@id': `https://bikehausfreiburg.com/showroom/${id}#product`,
      name: data.title,
      description: data.description || data.title,
      image: data.images?.map(img => img.imageUrl) || [],
      url: `https://bikehausfreiburg.com/showroom/${id}`,
      brand: {
        '@type': 'Brand',
        name: 'Bike Haus Freiburg'
      },
      seller: {
        '@type': 'LocalBusiness',
        name: 'Bike Haus Freiburg',
        url: 'https://bikehausfreiburg.com'
      },
      offers: {
        '@type': 'Offer',
        url: `https://bikehausfreiburg.com/showroom/${id}`,
        priceCurrency: 'EUR',
        price: data.price || 0,
        priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        availability: 'https://schema.org/InStock',
        itemCondition: this.isNew() ? 'https://schema.org/NewCondition' : 'https://schema.org/UsedCondition',
        seller: {
          '@type': 'LocalBusiness',
          name: 'Bike Haus Freiburg'
        }
      },
      category: data.category || 'Fahrrad'
    };
    
    this.productSchemaElement = this.document.createElement('script');
    this.productSchemaElement.type = 'application/ld+json';
    this.productSchemaElement.text = JSON.stringify(schema);
    this.document.head.appendChild(this.productSchemaElement);
  }
  
  private removeProductSchema(): void {
    if (this.productSchemaElement && this.productSchemaElement.parentNode) {
      this.productSchemaElement.parentNode.removeChild(this.productSchemaElement);
      this.productSchemaElement = null;
    }
  }
  
  ngOnDestroy(): void {
    this.removeProductSchema();
  }

  prevImage(): void {
    const images = this.listing()?.images || [];
    const current = this.selectedImage();
    this.selectedImage.set(current === 0 ? images.length - 1 : current - 1);
  }

  nextImage(): void {
    const images = this.listing()?.images || [];
    const current = this.selectedImage();
    this.selectedImage.set(current === images.length - 1 ? 0 : current + 1);
  }

  formatDescription(text: string): string {
    return text.replace(/\n/g, '<br>');
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
  }
}
