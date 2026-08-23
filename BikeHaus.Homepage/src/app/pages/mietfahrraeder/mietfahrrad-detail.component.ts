import {
  Component,
  computed,
  inject,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { ApiService } from '../../services/api.service';
import { TranslationService } from '../../services/translation.service';
import { getRentalBookingPath } from '../../services/language-config';
import {
  rentalBikeTitle,
  rentalBrandName,
  cleanRentalLabel,
} from '../../services/rental-bike-name';
import { PublicRentalBicycle } from '../../models/models';
import {
  AvailabilityCalendarComponent,
  CalendarBusyPeriod,
} from '../../components/availability-calendar/availability-calendar.component';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-mietfahrrad-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, AvailabilityCalendarComponent],
  template: `
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

    <div class="detail-page" *ngIf="!loading() && bike()">
      <nav class="breadcrumb-bar" aria-label="Breadcrumb">
        <div class="container">
          <a [routerLink]="['/' + lang(), catalogSlug()]" class="back-link">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            <span>{{ t().rentalDetailBackToCatalog }}</span>
          </a>
        </div>
      </nav>

      <div class="container">
        <article class="detail-layout">
          <!-- Gallery -->
          <div class="gallery-col">
            <figure class="main-image-wrap">
              <img
                *ngIf="bike()!.images.length > 0"
                [src]="getImageUrl(bike()!.images[selectedImage()].filePath)"
                [alt]="bikeAlt(bike()!, selectedImage())"
                class="main-img"
                width="800"
                height="600"
                fetchpriority="high"
              />
              <div *ngIf="bike()!.images.length === 0" class="no-image">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
              </div>
              <button
                *ngIf="bike()!.images.length > 1"
                class="g-nav g-prev"
                (click)="prevImage()"
                type="button"
                aria-label="Previous"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                *ngIf="bike()!.images.length > 1"
                class="g-nav g-next"
                (click)="nextImage()"
                type="button"
                aria-label="Next"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M9 5l7 7-7 7" />
                </svg>
              </button>
              <span class="img-counter" *ngIf="bike()!.images.length > 1">
                {{ selectedImage() + 1 }} / {{ bike()!.images.length }}
              </span>
            </figure>

            <div class="thumb-strip" *ngIf="bike()!.images.length > 1">
              <button
                *ngFor="let img of bike()!.images; let i = index"
                class="thumb"
                [class.active]="selectedImage() === i"
                (click)="selectedImage.set(i)"
                type="button"
                [attr.aria-label]="bikeAlt(bike()!, i)"
              >
                <img
                  [src]="getImageUrl(img.filePath)"
                  [alt]="bikeAlt(bike()!, i)"
                  loading="lazy"
                  width="120"
                  height="90"
                />
              </button>
            </div>
          </div>

          <!-- Details -->
          <aside class="details-col">
            <div class="details-inner">
              <div class="badge-row">
                <span *ngIf="bike()!.fahrradtyp" class="cat-badge">{{ bike()!.fahrradtyp }}</span>
                <span *ngIf="bike()!.art && bike()!.art !== bike()!.fahrradtyp" class="cat-badge">{{ bike()!.art }}</span>
              </div>

              <h1 class="title">{{ bikeTitle() }}</h1>

              <div class="price-card" *ngIf="minDailyPriceValue() !== null">
                <span class="price-label">{{ t().rentalCatalogFrom }}</span>
                <span class="price-value">{{ minDailyPriceValue() }}€</span>
                <span class="price-per">{{ t().rentalCatalogPerDay }}</span>
              </div>

              <!-- Specs -->
              <section class="section">
                <h2 class="section-heading">{{ t().rentalDetailSpecsHeading }}</h2>
                <dl class="specs-list">
                  <ng-container *ngIf="bike()!.marke">
                    <dt>{{ specLabelBrand() }}</dt>
                    <dd>{{ brandLabel() }}</dd>
                  </ng-container>
                  <ng-container *ngIf="bike()!.modell">
                    <dt>{{ specLabelModel() }}</dt>
                    <dd>{{ bike()!.modell }}</dd>
                  </ng-container>
                  <ng-container *ngIf="bike()!.fahrradtyp">
                    <dt>{{ specLabelType() }}</dt>
                    <dd>{{ bike()!.fahrradtyp }}</dd>
                  </ng-container>
                  <ng-container *ngIf="riderHeight(bike()!)">
                    <dt>{{ t().rentalSteps?.riderHeight ?? 'Körpergröße' }}</dt>
                    <dd>{{ riderHeight(bike()!) }}</dd>
                  </ng-container>
                  <ng-container *ngIf="bike()!.rahmengroesse">
                    <dt>{{ t().filterFrameSize }}</dt>
                    <dd>{{ bike()!.rahmengroesse }}</dd>
                  </ng-container>
                  <ng-container *ngIf="bike()!.reifengroesse">
                    <dt>{{ t().filterTireSize }}</dt>
                    <dd>{{ bike()!.reifengroesse }}"</dd>
                  </ng-container>
                  <ng-container *ngIf="bike()!.farbe">
                    <dt>{{ specLabelColor() }}</dt>
                    <dd>{{ bike()!.farbe }}</dd>
                  </ng-container>
                </dl>
              </section>

              <!-- Price Table -->
              <section class="section" *ngIf="priceRows().length > 0">
                <h2 class="section-heading">{{ t().rentalDetailPriceHeading }}</h2>
                <p class="section-note">{{ t().rentalDetailPriceNote }}</p>
                <table class="price-table">
                  <thead>
                    <tr>
                      <th>{{ t().rentalDetailDays }}</th>
                      <th>{{ t().rentalCatalogPerDay }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let row of priceRows()">
                      <td>{{ row.label }}</td>
                      <td><strong>{{ row.price }}€</strong></td>
                    </tr>
                    <tr *ngIf="bike()!.preise.additionalDayAfter7 != null" class="extra-row">
                      <td>{{ t().rentalDetailExtraDay }}</td>
                      <td><strong>{{ bike()!.preise.additionalDayAfter7 }}€</strong></td>
                    </tr>
                  </tbody>
                </table>
              </section>

              <!-- Deposit -->
              <section class="section" *ngIf="bike()!.kaution != null && bike()!.kaution! > 0">
                <h2 class="section-heading">{{ t().rentalDetailDeposit }}</h2>
                <p class="deposit-value">{{ bike()!.kaution }}€</p>
                <p class="section-note">{{ t().rentalDetailDepositInfo }}</p>
              </section>

              <!-- Description -->
              <section class="section" *ngIf="bike()!.beschreibung">
                <h2 class="section-heading">{{ t().rentalDetailDescHeading }}</h2>
                <p class="description-text">{{ bike()!.beschreibung }}</p>
              </section>

              <!-- Availability calendar + booking CTA -->
              <section class="section">
                <h2 class="section-heading">{{ availabilityHeading }}</h2>
                <app-availability-calendar
                  [busyPeriods]="busyPeriods()"
                  [start]="rangeStart"
                  [end]="rangeEnd"
                  (rangeChange)="onRangeChange($event)"
                ></app-availability-calendar>
                <div class="cta-row" style="margin-top: 1rem;">
                  <button
                    type="button"
                    class="cta-primary"
                    [disabled]="!rangeStart || !rangeEnd"
                    [style.opacity]="!rangeStart || !rangeEnd ? 0.5 : 1"
                    [style.cursor]="
                      !rangeStart || !rangeEnd ? 'not-allowed' : 'pointer'
                    "
                    (click)="rentSelected()"
                  >
                    {{ t().rentalDetailReserveCta }}
                  </button>
                </div>
                <p
                  *ngIf="!rangeStart || !rangeEnd"
                  style="
                    font-size: 0.85rem;
                    color: rgba(255, 255, 255, 0.55);
                    margin-top: 0.6rem;
                  "
                >
                  {{ availabilityHint }}
                </p>
              </section>
            </div>
          </aside>
        </article>
      </div>
    </div>

    <!-- 404 -->
    <div *ngIf="!loading() && !bike()" class="not-found">
      <div class="container">
        <h1>404</h1>
        <p>{{ t().rentalCatalogNoBikes }}</p>
        <a [routerLink]="['/' + lang(), catalogSlug()]" class="cta-primary">
          {{ t().rentalDetailBackToCatalog }}
        </a>
      </div>
    </div>
  `,
  styles: [`
    .loading-wrap { padding: 6rem 0; }
    .sk-layout { display: grid; grid-template-columns: 1.4fr 1fr; gap: 2rem; }
    .sk-main-img { aspect-ratio: 4/3; background: rgba(255, 255, 255, 0.05); border-radius: 18px; }
    .sk-line { height: 14px; background: rgba(255, 255, 255, 0.06); border-radius: 999px; margin-bottom: 0.8rem; }
    .sk-line.w30 { width: 30%; } .sk-line.w50 { width: 50%; }
    .sk-line.w70 { width: 70%; } .sk-line.w90 { width: 90%; }

    .detail-page { min-height: 60vh; padding-bottom: 4rem; }
    .breadcrumb-bar {
      padding: 5.25rem 0 1.25rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
      margin-bottom: 2.25rem;
    }
    .back-link {
      display: inline-flex; align-items: center; gap: 0.4rem;
      color: var(--color-text-muted);
      text-decoration: none;
      font-size: 0.9rem;
      transition: color 0.15s;
    }
    .back-link:hover { color: var(--color-accent); }

    .detail-layout {
      display: grid;
      grid-template-columns: minmax(0, 1.3fr) minmax(0, 1fr);
      gap: 2.5rem;
      align-items: start;
    }

    .main-image-wrap {
      position: relative;
      margin: 0;
      aspect-ratio: 4/3;
      background: var(--color-surface);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 24px;
      overflow: hidden;
    }
    .main-img {
      width: 100%; height: 100%;
      object-fit: cover; display: block;
    }
    .no-image {
      width: 100%; height: 100%;
      display: flex; align-items: center; justify-content: center;
      color: var(--color-text-muted);
    }
    .g-nav {
      position: absolute; top: 50%; transform: translateY(-50%);
      background: rgba(9, 11, 15, 0.78);
      backdrop-filter: blur(10px);
      border: none;
      width: 40px; height: 40px;
      border-radius: 50%;
      color: #fff;
      cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      transition: background 0.15s;
    }
    .g-nav:hover { background: var(--color-accent); }
    .g-prev { left: 0.8rem; } .g-next { right: 0.8rem; }
    .img-counter {
      position: absolute;
      bottom: 0.8rem; right: 0.8rem;
      background: rgba(9, 11, 15, 0.78);
      backdrop-filter: blur(10px);
      padding: 0.25rem 0.6rem;
      border-radius: 999px;
      font-size: 0.75rem;
      color: #fff;
    }
    .thumb-strip {
      display: flex; gap: 0.55rem;
      margin-top: 0.85rem;
      overflow-x: auto;
      padding-bottom: 0.25rem;
    }
    .thumb {
      flex-shrink: 0;
      width: 88px; height: 66px;
      border-radius: 10px;
      overflow: hidden;
      border: 2px solid transparent;
      background: var(--color-surface);
      cursor: pointer;
      padding: 0;
    }
    .thumb.active { border-color: var(--color-accent); }
    .thumb img { width: 100%; height: 100%; object-fit: cover; }

    .details-col { position: sticky; top: 5rem; }
    .details-inner {
      background: var(--color-surface);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 24px;
      padding: 1.75rem;
    }
    .badge-row { display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 0.85rem; }
    .cat-badge {
      background: rgba(255, 87, 34, 0.12);
      color: var(--color-accent);
      padding: 0.3rem 0.7rem;
      border-radius: 999px;
      font-size: 0.75rem;
      font-weight: 600;
      letter-spacing: 0.04em;
    }
    .title {
      font-size: clamp(1.6rem, 3.2vw, 2.4rem);
      font-weight: 800;
      color: var(--color-text);
      letter-spacing: -0.02em;
      line-height: 1.1;
      margin: 0 0 1.1rem;
    }
    .price-card {
      display: flex; align-items: baseline; gap: 0.45rem;
      padding: 1rem 1.1rem;
      background: rgba(255, 87, 34, 0.06);
      border: 1px solid rgba(255, 87, 34, 0.2);
      border-radius: 16px;
      margin-bottom: 1.5rem;
    }
    .price-card .price-label {
      font-size: 0.72rem;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: var(--color-text-muted);
    }
    .price-card .price-value {
      font-size: 1.65rem;
      font-weight: 800;
      color: var(--color-accent);
    }
    .price-card .price-per {
      font-size: 0.85rem;
      color: var(--color-text-muted);
    }

    .section {
      padding-top: 1.25rem;
      margin-top: 1.25rem;
      border-top: 1px solid rgba(255, 255, 255, 0.06);
    }
    .section-heading {
      font-size: 0.78rem;
      font-weight: 700;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      color: var(--color-text-muted);
      margin: 0 0 0.85rem;
    }
    .section-note {
      font-size: 0.82rem;
      color: var(--color-text-muted);
      line-height: 1.5;
      margin: 0 0 0.85rem;
    }

    .specs-list {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.5rem 1rem;
      margin: 0;
      font-size: 0.9rem;
    }
    .specs-list dt {
      color: var(--color-text-muted);
      font-weight: 500;
    }
    .specs-list dd {
      margin: 0;
      color: var(--color-text);
      font-weight: 600;
    }

    .price-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.9rem;
    }
    .price-table th, .price-table td {
      padding: 0.55rem 0.4rem;
      text-align: left;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }
    .price-table th {
      font-size: 0.72rem;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--color-text-muted);
      font-weight: 600;
    }
    .price-table td:last-child { text-align: right; color: var(--color-text); }
    .price-table .extra-row td { color: var(--color-accent); }

    .deposit-value {
      font-size: 1.4rem;
      font-weight: 700;
      color: var(--color-text);
      margin: 0 0 0.5rem;
    }

    .description-text {
      color: var(--color-text);
      line-height: 1.65;
      font-size: 0.95rem;
      margin: 0;
      white-space: pre-line;
    }

    .cta-row { margin-top: 1.5rem; }
    .cta-primary {
      display: inline-block;
      width: 100%;
      padding: 1rem 1.5rem;
      background: var(--color-accent);
      color: #fff;
      text-align: center;
      text-decoration: none;
      border-radius: 999px;
      font-weight: 700;
      letter-spacing: 0.02em;
      transition: transform 0.15s, box-shadow 0.15s;
    }
    .cta-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 28px rgba(255, 87, 34, 0.35);
    }

    .not-found {
      padding: 8rem 0;
      text-align: center;
      color: var(--color-text-muted);
    }
    .not-found h1 {
      font-size: 5rem;
      color: var(--color-text);
      margin: 0 0 1rem;
    }
    .not-found .cta-primary { display: inline-block; width: auto; margin-top: 1.5rem; }

    @media (max-width: 880px) {
      .detail-layout { grid-template-columns: 1fr; gap: 1.5rem; }
      .details-col { position: static; }
      .breadcrumb-bar { padding-top: 4.5rem; }
      .specs-list { grid-template-columns: 1fr; }
    }
  `],
})
export class MietfahrradDetailComponent implements OnInit, OnDestroy {
  private apiService = inject(ApiService);
  private route = inject(ActivatedRoute);
  private translationService = inject(TranslationService);
  private titleService = inject(Title);
  private metaService = inject(Meta);
  private document = inject(DOCUMENT);
  private router = inject(Router);

  t = this.translationService.translations;
  lang = this.translationService.currentLanguage;

  bike = signal<PublicRentalBicycle | null>(null);
  loading = signal(true);
  selectedImage = signal(0);
  busyPeriods = signal<CalendarBusyPeriod[]>([]);
  rangeStart = '';
  rangeEnd = '';

  private productSchemaElement: HTMLScriptElement | null = null;
  private breadcrumbSchemaElement: HTMLScriptElement | null = null;

  /** Anzeigename ohne interne Inventarnummer ("E15 - Conway" -> "Conway"). */
  bikeTitle = computed(() => {
    const b = this.bike();
    return b ? rentalBikeTitle(b.marke, b.modell) : '';
  });

  brandLabel = computed(() => cleanRentalLabel(this.bike()?.marke));

  catalogSlug = computed(() => {
    const l = this.lang();
    if (l === 'en') return 'rental-bikes';
    if (l === 'fr') return 'velos-de-location';
    return 'mietfahrraeder';
  });

  bookingPath = computed(() => getRentalBookingPath(this.lang()));

  private static readonly L: Record<
    string,
    { heading: string; hint: string }
  > = {
    de: {
      heading: 'Verfügbarkeit',
      hint: 'Wähle Start- und Enddatum im Kalender, um fortzufahren.',
    },
    en: {
      heading: 'Availability',
      hint: 'Pick a start and end date in the calendar to continue.',
    },
    fr: {
      heading: 'Disponibilité',
      hint: 'Choisissez une date de début et de fin dans le calendrier pour continuer.',
    },
    tr: {
      heading: 'Müsaitlik',
      hint: 'Devam etmek için takvimden başlangıç ve bitiş tarihini seç.',
    },
  };
  private labels() {
    return (
      MietfahrradDetailComponent.L[this.lang()] ??
      MietfahrradDetailComponent.L['en']
    );
  }
  get availabilityHeading(): string {
    return this.labels().heading;
  }
  get availabilityHint(): string {
    return this.labels().hint;
  }

  onRangeChange(range: { start: string; end: string }): void {
    this.rangeStart = range.start;
    this.rangeEnd = range.end;
  }

  /** Jump straight into the booking flow's cart/summary step with this bike + dates. */
  rentSelected(): void {
    const b = this.bike();
    if (!b || !this.rangeStart || !this.rangeEnd) return;
    this.router.navigate([this.bookingPath()], {
      queryParams: {
        step: 'choose-next',
        start: this.rangeStart,
        end: this.rangeEnd,
        bikeId: b.id,
      },
    });
  }

  ngOnInit(): void {
    // Carry over a date range chosen on the fleet page (if any).
    const qp = this.route.snapshot.queryParamMap;
    const start = qp.get('start');
    const end = qp.get('end');
    if (start) this.rangeStart = start;
    if (end) this.rangeEnd = end;

    this.route.paramMap.subscribe((params) => {
      const idStr = params.get('id');
      const id = idStr ? Number(idStr) : NaN;
      if (!Number.isFinite(id)) {
        this.loading.set(false);
        return;
      }
      this.loadBike(id);
    });
  }

  ngOnDestroy(): void {
    this.removeProductSchema();
  }

  private loadBike(id: number): void {
    this.loading.set(true);
    // Einzelabruf statt der gesamten Flotte — die Detailseiten sind
    // SEO-Einstiege aus der Sitemap, der erste Aufruf soll schnell sein.
    this.apiService.getRentalBike(id).subscribe({
      next: (bike) => {
        this.bike.set(bike ?? null);
        this.loading.set(false);
        if (bike) {
          this.applySeo(bike);
          this.addProductSchema(bike);
          this.loadBusyPeriods(id);
        } else {
          this.titleService.setTitle('404 — Bike Haus Freiburg');
        }
      },
      error: () => {
        // Unbekannte ID kommt jetzt als HTTP-404 herein — gleiche
        // Not-Found-Darstellung wie zuvor beim "nicht in der Liste"-Fall.
        this.bike.set(null);
        this.loading.set(false);
        this.titleService.setTitle('404 — Bike Haus Freiburg');
      },
    });
  }

  private loadBusyPeriods(id: number): void {
    this.apiService.getBusyPeriods(id).subscribe({
      next: (periods) => this.busyPeriods.set(periods),
      error: () => this.busyPeriods.set([]),
    });
  }

  private applySeo(bike: PublicRentalBicycle): void {
    const name = rentalBikeTitle(bike.marke, bike.modell);
    const title = `${name} ${this.t().rentalDetailMetaTitleSuffix}`;
    const minPrice = this.minDailyPriceValue();
    const priceText = minPrice !== null ? `${this.t().rentalCatalogFrom} ${minPrice}€${this.t().rentalCatalogPerDay}.` : '';
    const desc = `${this.t().rentalDetailMetaDescPrefix} ${name}. ${priceText} ${bike.beschreibung ? bike.beschreibung.substring(0, 120) : ''}`.trim();

    this.titleService.setTitle(title);
    this.metaService.updateTag({ name: 'description', content: desc });
    this.metaService.updateTag({ property: 'og:title', content: title });
    this.metaService.updateTag({ property: 'og:description', content: desc });
    this.metaService.updateTag({ property: 'og:type', content: 'product' });

    if (bike.images.length > 0) {
      const imgUrl = this.getImageUrl(bike.images[0].filePath);
      this.metaService.updateTag({ property: 'og:image', content: imgUrl });
    }
  }

  prevImage(): void {
    const b = this.bike();
    if (!b) return;
    this.selectedImage.update((i) => (i - 1 + b.images.length) % b.images.length);
  }

  nextImage(): void {
    const b = this.bike();
    if (!b) return;
    this.selectedImage.update((i) => (i + 1) % b.images.length);
  }

  minDailyPriceValue(): number | null {
    const b = this.bike();
    if (!b || !b.preise) return null;
    const v = [b.preise.day1, b.preise.day2, b.preise.day3, b.preise.day4, b.preise.day5, b.preise.day6, b.preise.day7]
      .filter((x): x is number => typeof x === 'number' && x > 0);
    return v.length ? Math.min(...v) : null;
  }

  priceRows(): { label: string; price: number }[] {
    const b = this.bike();
    if (!b || !b.preise) return [];
    const days: (number | null | undefined)[] = [
      b.preise.day1, b.preise.day2, b.preise.day3, b.preise.day4,
      b.preise.day5, b.preise.day6, b.preise.day7,
    ];
    const rows: { label: string; price: number }[] = [];
    days.forEach((p, idx) => {
      if (typeof p === 'number' && p > 0) {
        const n = idx + 1;
        const label = n === 1 ? `1 ${this.t().rentalDetailDay}` : `${n} ${this.t().rentalDetailDays}`;
        rows.push({ label, price: p });
      }
    });
    return rows;
  }

  specLabelBrand(): string {
    const l = this.lang();
    if (l === 'en') return 'Brand';
    if (l === 'fr') return 'Marque';
    if (l === 'tr') return 'Marka';
    return 'Marke';
  }

  specLabelModel(): string {
    const l = this.lang();
    if (l === 'en') return 'Model';
    if (l === 'fr') return 'Modèle';
    if (l === 'tr') return 'Model';
    return 'Modell';
  }

  specLabelType(): string {
    const l = this.lang();
    if (l === 'en') return 'Type';
    if (l === 'fr') return 'Type';
    if (l === 'tr') return 'Tip';
    return 'Typ';
  }

  specLabelColor(): string {
    const l = this.lang();
    if (l === 'en') return 'Colour';
    if (l === 'fr') return 'Couleur';
    if (l === 'tr') return 'Renk';
    return 'Farbe';
  }

  /**
   * Empfohlene Körpergröße als kurzer Text ("165–180 cm"), gleiche Logik wie
   * im Buchungs-Wizard (rental-booking-steps): ist nur eine Grenze gepflegt,
   * wird daraus "≥ 165 cm" bzw. "≤ 180 cm"; ohne Angabe leer.
   */
  riderHeight(bike: PublicRentalBicycle | null | undefined): string {
    const from = bike?.koerpergroesseVonCm ?? null;
    const to = bike?.koerpergroesseBisCm ?? null;
    if (from && to) return `${from}–${to} cm`;
    if (from) return `≥ ${from} cm`;
    if (to) return `≤ ${to} cm`;
    return '';
  }

  bikeAlt(bike: PublicRentalBicycle, index: number): string {
    const name = rentalBikeTitle(bike.marke, bike.modell);
    return index === 0 ? name : `${name} — ${index + 1}`;
  }

  getImageUrl(path: string): string {
    if (!path) return '';
    if (/^https?:\/\//i.test(path)) return path;
    const base = environment.apiUrl.replace('/api/public', '').replace(/\/$/, '');
    const normalized = path.startsWith('/') ? path : `/${path}`;
    return `${base}${normalized}`;
  }

  private addProductSchema(bike: PublicRentalBicycle): void {
    this.removeProductSchema();
    const minPrice = this.minDailyPriceValue();
    const url = `https://bikehausfreiburg.com/${this.lang()}/${this.catalogSlug()}/${bike.id}`;
    const images = bike.images.map((img) => this.getImageUrl(img.filePath));

    const schema: Record<string, unknown> = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: rentalBikeTitle(bike.marke, bike.modell),
      description:
        bike.beschreibung ||
        `${rentalBikeTitle(bike.marke, bike.modell)} — ${this.t().rentalCatalogLabel}`,
      url,
      sku: bike.rahmennummer || `rental-${bike.id}`,
      // Nur echte Marken — Inventarcodes wie "E15 - Conway" sind keine.
      ...(rentalBrandName(bike.marke)
        ? { brand: { '@type': 'Brand', name: rentalBrandName(bike.marke) } }
        : {}),
      category: bike.fahrradtyp || bike.art || undefined,
      image: images.length > 0 ? images : undefined,
      color: bike.farbe || undefined,
    };

    if (minPrice !== null) {
      schema['offers'] = {
        '@type': 'Offer',
        url,
        price: minPrice,
        priceCurrency: 'EUR',
        availability: 'https://schema.org/InStock',
        itemCondition: 'https://schema.org/UsedCondition',
        // Ohne businessFunction liest Google den Tagespreis als KAUFPREIS —
        // "Cube Trekking für 12 €". LeaseOut kennzeichnet das Angebot als
        // Vermietung.
        businessFunction: 'http://purl.org/goodrelations/v1#LeaseOut',
        priceSpecification: {
          '@type': 'UnitPriceSpecification',
          price: minPrice,
          priceCurrency: 'EUR',
          unitCode: 'DAY',
          referenceQuantity: { '@type': 'QuantitativeValue', value: 1, unitCode: 'DAY' },
        },
      };
    }

    this.productSchemaElement = this.document.createElement('script');
    this.productSchemaElement.type = 'application/ld+json';
    this.productSchemaElement.text = JSON.stringify(schema);
    this.document.head.appendChild(this.productSchemaElement);

    const breadcrumb = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Bike Haus Freiburg',
          item: `https://bikehausfreiburg.com/${this.lang()}`,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: this.t().rentalCatalogLabel,
          item: `https://bikehausfreiburg.com/${this.lang()}/${this.catalogSlug()}`,
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: rentalBikeTitle(bike.marke, bike.modell),
          item: url,
        },
      ],
    };

    this.breadcrumbSchemaElement = this.document.createElement('script');
    this.breadcrumbSchemaElement.type = 'application/ld+json';
    this.breadcrumbSchemaElement.text = JSON.stringify(breadcrumb);
    this.document.head.appendChild(this.breadcrumbSchemaElement);
  }

  private removeProductSchema(): void {
    if (this.productSchemaElement && this.productSchemaElement.parentNode) {
      this.productSchemaElement.parentNode.removeChild(this.productSchemaElement);
      this.productSchemaElement = null;
    }
    if (this.breadcrumbSchemaElement && this.breadcrumbSchemaElement.parentNode) {
      this.breadcrumbSchemaElement.parentNode.removeChild(
        this.breadcrumbSchemaElement,
      );
      this.breadcrumbSchemaElement = null;
    }
  }
}
