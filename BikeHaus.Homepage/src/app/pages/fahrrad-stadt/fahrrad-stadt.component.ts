import {
  Component,
  inject,
  OnInit,
  OnDestroy,
  signal,
  computed,
  effect,
} from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { TranslationService } from '../../services/translation.service';
import {
  CITY_LANDINGS,
  CityLanding,
} from '../../services/city-landing.data';

@Component({
  selector: 'app-fahrrad-stadt',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    @if (city(); as c) {
      @if (ct(); as t) {
      <div class="city-page">
        <!-- Breadcrumb -->
        <nav class="breadcrumb" aria-label="Breadcrumb">
          <div class="container">
            <a [routerLink]="['/' + lang()]">{{ tr().home }}</a>
            <span class="sep">/</span>
            <span class="current">{{ t.heroTitle }}</span>
          </div>
        </nav>

        <!-- Hero -->
        <header class="city-hero">
          <div class="container">
            <h1>{{ t.heroTitle }}</h1>
            <p class="hero-sub">{{ t.heroSub }}</p>
            <div class="hero-badges">
              <span class="badge">📍 {{ c.distanceKm }} km</span>
              <span class="badge">🚗 {{ c.driveMinutes }} {{ tr().cityMin }}</span>
              <span class="badge">🔧 {{ tr().cityWarrantyIncl }}</span>
            </div>
          </div>
        </header>

        <!-- Intro -->
        <section class="city-section">
          <div class="container">
            <h2>{{ t.introHeading }}</h2>
            <p class="intro-text">{{ t.introText }}</p>
          </div>
        </section>

        <!-- Why -->
        <section class="city-section city-why">
          <div class="container">
            <h2>{{ t.whyHeading }}</h2>
            <ul class="check-list">
              @for (item of t.whyItems; track $index) {
                <li>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4caf50" stroke-width="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  {{ item }}
                </li>
              }
            </ul>
          </div>
        </section>

        <!-- Offer -->
        <section class="city-section">
          <div class="container">
            <h2>{{ t.offerHeading }}</h2>
            <div class="offer-grid">
              @for (item of t.offerItems; track $index) {
                <div class="offer-card">{{ item }}</div>
              }
            </div>
          </div>
        </section>

        <!-- Map & Directions -->
        <section class="city-section city-map">
          <div class="container">
            <h2>{{ tr().cityDirectionsFrom }} {{ c.cityName }}</h2>
            <p class="directions-text">{{ t.directions }}</p>
            <div class="map-wrapper">
              <iframe
                [src]="mapUrl()"
                width="100%"
                height="350"
                style="border:0; border-radius:12px;"
                allowfullscreen
                loading="lazy"
                referrerpolicy="no-referrer-when-downgrade"
                [title]="tr().cityDirectionsFrom + ' ' + c.cityName + ' — Bike Haus Freiburg'"
              ></iframe>
            </div>
            <a
              [href]="'https://www.google.com/maps/dir/' + encodeCity(c.cityName) + '/Heckerstraße+27,+79114+Freiburg'"
              target="_blank"
              rel="noopener"
              class="btn-directions"
            >
              {{ tr().cityOpenMap }}
            </a>
          </div>
        </section>

        <!-- CTA -->
        <section class="city-section city-cta">
          <div class="container">
            <h2>{{ t.ctaHeading }}</h2>
            <p>{{ t.ctaText }}</p>
            <div class="cta-actions">
              <a [routerLink]="['/' + lang(), 'showroom']" class="btn-primary">{{ tr().cityViewShowroom }}</a>
              <a [routerLink]="['/' + lang(), 'contact']" class="btn-secondary-outline">{{ tr().contact }}</a>
              <a href="https://wa.me/4915566300011" target="_blank" rel="noopener" class="btn-whatsapp">
                WhatsApp
              </a>
            </div>
          </div>
        </section>
      </div>
      }
    }
  `,
  styles: [
    `
      :host { display: block; }
      .city-page { min-height: 100vh; padding-bottom: 4rem; }
      .container { max-width: 860px; margin: 0 auto; padding: 0 1.5rem; }

      /* Breadcrumb */
      .breadcrumb { padding: 1rem 0; font-size: 0.8rem; color: #666; border-bottom: 1px solid var(--color-border, #222); }
      .breadcrumb a { color: var(--color-text-secondary, #aaa); text-decoration: none; }
      .breadcrumb a:hover { color: var(--color-accent, #ff5722); }
      .breadcrumb .sep { margin: 0 0.4rem; color: #444; }
      .breadcrumb .current { color: var(--color-text, #fff); }

      /* Hero */
      .city-hero { padding: 3rem 0 2.5rem; border-bottom: 1px solid var(--color-border, #222); }
      .city-hero h1 { font-size: 2.2rem; font-weight: 800; color: var(--color-text, #fff); margin: 0 0 0.7rem; line-height: 1.2; }
      .hero-sub { color: var(--color-text-secondary, #aaa); font-size: 1.1rem; line-height: 1.6; margin: 0 0 1.2rem; }
      .hero-badges { display: flex; gap: 0.75rem; flex-wrap: wrap; }
      .badge { background: var(--color-surface, #111); border: 1px solid var(--color-border, #222); border-radius: 8px; padding: 0.4rem 0.9rem; font-size: 0.85rem; color: var(--color-text, #fff); }

      /* Sections */
      .city-section { padding: 2.5rem 0 0; }
      .city-section h2 { font-size: 1.4rem; font-weight: 700; color: var(--color-text, #fff); margin: 0 0 1rem; }
      .intro-text { color: var(--color-text-secondary, #ccc); font-size: 1rem; line-height: 1.8; margin: 0; }

      /* Why list */
      .check-list { list-style: none; padding: 0; margin: 0; }
      .check-list li { display: flex; align-items: flex-start; gap: 0.7rem; padding: 0.6rem 0; color: var(--color-text-secondary, #ccc); font-size: 0.95rem; line-height: 1.5; border-bottom: 1px solid var(--color-border, #151515); }
      .check-list li:last-child { border-bottom: none; }
      .check-list svg { flex-shrink: 0; margin-top: 2px; }

      /* Offer grid */
      .offer-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 0.75rem; }
      .offer-card { background: var(--color-surface, #111); border: 1px solid var(--color-border, #222); border-radius: 10px; padding: 1rem 1.2rem; color: var(--color-text-secondary, #ccc); font-size: 0.92rem; line-height: 1.5; }

      /* Map */
      .city-map { padding-top: 2.5rem; }
      .map-wrapper { margin: 1rem 0; border-radius: 12px; overflow: hidden; border: 1px solid var(--color-border, #222); }
      .directions-text { color: var(--color-text-secondary, #aaa); font-size: 0.95rem; line-height: 1.6; margin: 0 0 0.5rem; }
      .btn-directions { display: inline-block; margin-top: 0.75rem; color: var(--color-accent, #ff5722); font-weight: 600; text-decoration: none; font-size: 0.95rem; }
      .btn-directions:hover { text-decoration: underline; }

      /* CTA */
      .city-cta { background: var(--color-surface, #0a0a0a); border-top: 1px solid var(--color-border, #222); padding: 3rem 0; margin-top: 2rem; text-align: center; }
      .city-cta p { color: var(--color-text-secondary, #ccc); font-size: 1rem; line-height: 1.7; margin: 0 0 1.5rem; }
      .cta-actions { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }
      .btn-primary { padding: 0.75rem 1.5rem; background: var(--color-accent, #ff5722); color: #fff; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 0.95rem; transition: opacity 0.2s; }
      .btn-primary:hover { opacity: 0.9; }
      .btn-secondary-outline { padding: 0.75rem 1.5rem; border: 1px solid var(--color-border, #444); color: var(--color-text, #fff); border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 0.95rem; transition: border-color 0.2s; }
      .btn-secondary-outline:hover { border-color: var(--color-accent, #ff5722); }
      .btn-whatsapp { padding: 0.75rem 1.5rem; background: #25d366; color: #fff; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 0.95rem; }

      @media (max-width: 600px) {
        .city-hero h1 { font-size: 1.6rem; }
        .hero-badges { gap: 0.5rem; }
        .offer-grid { grid-template-columns: 1fr; }
        .cta-actions { flex-direction: column; align-items: center; }
      }
    `,
  ],
})
export class FahrradStadtComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private meta = inject(Meta);
  private title = inject(Title);
  private ts = inject(TranslationService);
  private doc = inject(DOCUMENT);

  lang = this.ts.currentLanguage;
  tr = this.ts.translations;
  city = signal<CityLanding | null>(null);
  ct = computed(() => {
    const c = this.city();
    if (!c) return null;
    return c.translations[this.lang()];
  });

  mapUrl = computed(() => {
    if (!this.city()) return '';
    return `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2000!2d7.8194!3d47.9877!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47911b7a5f0b3b0d%3A0x0!2sHeckerstra%C3%9Fe+27%2C+79114+Freiburg!5e0!3m2!1sde!2sde!4v1`;
  });

  private schemaEl?: HTMLScriptElement;

  private metaEffect = effect(() => {
    const t = this.ct();
    if (!t) return;
    this.title.setTitle(t.metaTitle);
    this.meta.updateTag({ name: 'description', content: t.metaDescription });
  });

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('city');
    const found = CITY_LANDINGS.find((c) => c.slug === `fahrrad-${slug}`);
    if (!found) {
      this.router.navigate(['/de']);
      return;
    }
    this.city.set(found);
    this.meta.updateTag({ name: 'robots', content: 'index, follow' });
    this.injectSchema(found);
  }

  ngOnDestroy(): void {
    this.schemaEl?.remove();
  }

  encodeCity(name: string): string {
    return encodeURIComponent(name);
  }

  private injectSchema(c: CityLanding): void {
    const t = c.translations[this.lang()];
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      '@id': `https://bikehausfreiburg.com/${this.lang()}/${c.slug}#localbusiness`,
      name: 'Bike Haus Freiburg',
      image: 'https://bikehausfreiburg.com/assets/images/og-image.jpg',
      url: `https://bikehausfreiburg.com/${this.lang()}/${c.slug}`,
      telephone: '+4915566300011',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Heckerstraße 27',
        addressLocality: 'Freiburg im Breisgau',
        postalCode: '79114',
        addressCountry: 'DE',
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: 47.9877,
        longitude: 7.8194,
      },
      areaServed: {
        '@type': 'City',
        name: c.cityName,
      },
      openingHoursSpecification: [
        { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Thursday'], opens: '11:00', closes: '18:00' },
        { '@type': 'OpeningHoursSpecification', dayOfWeek: 'Friday', opens: '11:00', closes: '13:00' },
        { '@type': 'OpeningHoursSpecification', dayOfWeek: 'Friday', opens: '15:00', closes: '18:00' },
        { '@type': 'OpeningHoursSpecification', dayOfWeek: 'Saturday', opens: '11:30', closes: '17:00' },
      ],
      priceRange: '€–€€',
      description: t.metaDescription,
    };

    const el = this.doc.createElement('script');
    el.type = 'application/ld+json';
    el.textContent = JSON.stringify(schema);
    this.doc.head.appendChild(el);
    this.schemaEl = el;
  }
}
