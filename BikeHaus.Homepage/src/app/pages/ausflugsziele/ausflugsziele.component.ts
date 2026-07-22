import {
  Component,
  inject,
  OnInit,
  OnDestroy,
  computed,
  effect,
  signal,
} from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { TranslationService } from '../../services/translation.service';
import { getRentalBookingPath } from '../../services/language-config';
import {
  AUSFLUGSZIELE_FAKTEN,
  AUSFLUGSZIELE_TEXT,
  ZielFakten,
  AusflugszielePageText,
} from '../../services/ausflugsziele.data';

const BASE_URL = 'https://bikehausfreiburg.com';

/**
 * Ausflugsziele rund um Freiburg (Seen, Tiergehege, Aussicht, Dörfer), per Rad
 * erreichbar. Aufbau angelehnt an [[bike-tours.component]]. Bilder fallen auf
 * einen gestylten Platzhalter zurück, solange keine Datei vorliegt.
 */
@Component({
  selector: 'app-ausflugsziele',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="az" [class.rtl]="isRtl()">
      <!-- Hero -->
      <header class="hero">
        <p class="kicker">{{ t().heroKicker }}</p>
        <h1>{{ t().heroTitle }}</h1>
        <p class="hero-sub">{{ t().heroSub }}</p>
      </header>

      <!-- Intro -->
      <section class="intro">
        <h2>{{ t().introHeading }}</h2>
        <p>{{ t().introText }}</p>
      </section>

      <!-- Grid -->
      <section class="grid">
        <article class="card" *ngFor="let f of fakten; let i = index">
          <div class="photo">
            <img
              *ngIf="!broken().has(f.id)"
              [src]="f.image"
              [alt]="text(f).name"
              loading="lazy"
              (error)="markBroken(f.id)"
            />
            <div class="photo-ph" *ngIf="broken().has(f.id)">
              <span class="ph-emoji">{{ emojiFor(f) }}</span>
              <span class="ph-name">{{ text(f).name }}</span>
            </div>

            <div class="badges">
              <span class="badge fam" *ngIf="f.familie === 3" [title]="t().badgeFamily">
                👪 {{ t().badgeFamily }}
              </span>
              <span class="badge bath" *ngIf="f.baden" [title]="t().badgeBathing">
                🏊 {{ t().badgeBathing }}
              </span>
            </div>
          </div>

          <div class="body">
            <div class="cat">{{ text(f).kategorieLabel }}</div>
            <h3>{{ text(f).name }}</h3>
            <p class="kurz">{{ text(f).kurz }}</p>
            <p class="desc">{{ text(f).beschreibung }}</p>

            <ul class="highlights">
              <li *ngFor="let h of text(f).highlights">{{ h }}</li>
            </ul>

            <p class="tipp"><strong>💡</strong> {{ text(f).tipp }}</p>

            <div class="facts">
              <div class="fact">
                <span class="fl">{{ t().labelDistance }}</span>
                <span class="fv">~{{ f.distanzKm }} {{ t().unitKm }}</span>
              </div>
              <div class="fact">
                <span class="fl">{{ t().labelDifficulty }}</span>
                <span class="fv">{{ schwierigkeitLabel(f) }}</span>
              </div>
              <div class="fact">
                <span class="fl">{{ t().labelBathing }}</span>
                <span class="fv">
                  {{ f.baden ? t().labelBathingYes : t().labelBathingNo }}
                </span>
              </div>
            </div>

            <div class="links">
              <a
                *ngIf="f.mapUrl"
                class="map"
                [href]="f.mapUrl"
                target="_blank"
                rel="noopener"
              >
                📍 {{ t().mapLink }}
              </a>
              <span class="credit" *ngIf="f.credit && !broken().has(f.id)">
                {{ t().photoBy }}:
                <a [href]="f.credit.quelleUrl" target="_blank" rel="noopener">
                  {{ f.credit.autor }}
                </a>
                · {{ f.credit.lizenz }}
              </span>
            </div>
          </div>
        </article>
      </section>

      <!-- CTA -->
      <section class="cta">
        <h2>{{ t().ctaHeading }}</h2>
        <p>{{ t().ctaText }}</p>
        <a class="cta-btn" [routerLink]="bookingPath()">{{ t().ctaButton }}</a>
      </section>
    </div>
  `,
  styles: [
    `
      .az {
        max-width: 1120px;
        margin: 0 auto;
        padding: 2rem 1rem 4rem;
      }
      .az.rtl {
        direction: rtl;
      }
      .hero {
        text-align: center;
        padding: 1.5rem 0 1rem;
      }
      .kicker {
        text-transform: uppercase;
        letter-spacing: 2px;
        font-size: 0.8rem;
        font-weight: 700;
        color: var(--color-accent);
        margin: 0 0 0.5rem;
      }
      .hero h1 {
        font-size: clamp(1.7rem, 4vw, 2.6rem);
        line-height: 1.15;
        margin: 0 0 0.75rem;
        color: var(--color-text);
      }
      .hero-sub {
        max-width: 680px;
        margin: 0 auto;
        color: var(--color-text-secondary);
        font-size: 1.05rem;
        line-height: 1.6;
      }
      .intro {
        max-width: 780px;
        margin: 1.5rem auto 2.5rem;
        text-align: center;
      }
      .intro h2 {
        font-size: 1.3rem;
        color: var(--color-text);
        margin: 0 0 0.6rem;
      }
      .intro p {
        color: var(--color-text-secondary);
        line-height: 1.7;
        margin: 0;
      }
      .grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
        gap: 1.4rem;
      }
      .card {
        display: flex;
        flex-direction: column;
        background: var(--color-surface);
        border: 1px solid var(--color-border);
        border-radius: 16px;
        overflow: hidden;
        transition: transform 0.2s, box-shadow 0.2s;
      }
      .card:hover {
        transform: translateY(-3px);
        box-shadow: 0 12px 30px rgba(0, 0, 0, 0.14);
      }
      .photo {
        position: relative;
        aspect-ratio: 16 / 10;
        background: var(--color-bg-secondary);
      }
      .photo img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }
      .photo-ph {
        position: absolute;
        inset: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        background: linear-gradient(135deg, #1f6f5c 0%, #2e8b78 60%, #46b39a 100%);
        color: #fff;
        text-align: center;
        padding: 1rem;
      }
      .ph-emoji {
        font-size: 2.6rem;
      }
      .ph-name {
        font-weight: 700;
        font-size: 1.05rem;
        text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
      }
      .badges {
        position: absolute;
        left: 10px;
        bottom: 10px;
        display: flex;
        gap: 6px;
        flex-wrap: wrap;
        max-width: calc(100% - 20px);
      }
      .badge {
        font-size: 0.72rem;
        font-weight: 700;
        padding: 4px 9px;
        border-radius: 999px;
        backdrop-filter: blur(4px);
        color: #fff;
      }
      .badge.fam {
        background: rgba(224, 122, 46, 0.92);
      }
      .badge.bath {
        background: rgba(23, 130, 190, 0.92);
      }
      .body {
        display: flex;
        flex-direction: column;
        padding: 1rem 1.1rem 1.2rem;
        flex: 1;
      }
      .cat {
        font-size: 0.75rem;
        text-transform: uppercase;
        letter-spacing: 1px;
        font-weight: 700;
        color: var(--color-accent);
        margin-bottom: 0.3rem;
      }
      .body h3 {
        margin: 0 0 0.3rem;
        font-size: 1.25rem;
        color: var(--color-text);
      }
      .kurz {
        margin: 0 0 0.6rem;
        color: var(--color-text);
        font-weight: 600;
      }
      .desc {
        margin: 0 0 0.8rem;
        color: var(--color-text-secondary);
        line-height: 1.6;
        font-size: 0.94rem;
      }
      .highlights {
        list-style: none;
        padding: 0;
        margin: 0 0 0.8rem;
      }
      .highlights li {
        position: relative;
        padding-left: 1.3rem;
        margin-bottom: 0.3rem;
        color: var(--color-text-secondary);
        font-size: 0.9rem;
      }
      .highlights li::before {
        content: '✓';
        position: absolute;
        left: 0;
        color: var(--color-accent);
        font-weight: 700;
      }
      .rtl .highlights li {
        padding-left: 0;
        padding-right: 1.3rem;
      }
      .rtl .highlights li::before {
        left: auto;
        right: 0;
      }
      .tipp {
        background: var(--color-bg-secondary);
        border-radius: 10px;
        padding: 0.6rem 0.8rem;
        margin: 0 0 0.9rem;
        font-size: 0.9rem;
        color: var(--color-text-secondary);
        line-height: 1.5;
      }
      .facts {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 0.5rem;
        margin: 0 0 0.9rem;
      }
      .fact {
        display: flex;
        flex-direction: column;
        gap: 2px;
        background: var(--color-bg-secondary);
        border-radius: 8px;
        padding: 0.5rem;
        text-align: center;
      }
      .fl {
        font-size: 0.68rem;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        color: var(--color-text-muted);
      }
      .fv {
        font-size: 0.9rem;
        font-weight: 700;
        color: var(--color-text);
      }
      .links {
        margin-top: auto;
        display: flex;
        flex-direction: column;
        gap: 0.4rem;
      }
      .map {
        font-weight: 600;
        color: var(--color-accent);
        text-decoration: none;
        font-size: 0.92rem;
      }
      .map:hover {
        text-decoration: underline;
      }
      .credit {
        font-size: 0.72rem;
        color: var(--color-text-muted);
      }
      .credit a {
        color: var(--color-text-muted);
      }
      .cta {
        text-align: center;
        margin-top: 3rem;
        padding: 2.2rem 1rem;
        background: var(--color-bg-secondary);
        border-radius: 18px;
      }
      .cta h2 {
        margin: 0 0 0.5rem;
        color: var(--color-text);
      }
      .cta p {
        margin: 0 auto 1.2rem;
        max-width: 520px;
        color: var(--color-text-secondary);
      }
      .cta-btn {
        display: inline-block;
        background: var(--color-accent);
        color: #fff;
        font-weight: 700;
        padding: 0.85rem 1.8rem;
        border-radius: 999px;
        text-decoration: none;
        transition: filter 0.15s;
      }
      .cta-btn:hover {
        filter: brightness(1.08);
      }
      @media (max-width: 600px) {
        .grid {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class AusflugszieleComponent implements OnInit, OnDestroy {
  private meta = inject(Meta);
  private title = inject(Title);
  private ts = inject(TranslationService);
  private doc = inject(DOCUMENT);

  lang = this.ts.currentLanguage;
  fakten = AUSFLUGSZIELE_FAKTEN;

  t = computed(
    () => AUSFLUGSZIELE_TEXT[this.lang()] ?? AUSFLUGSZIELE_TEXT.de!,
  );
  isRtl = computed(() => this.lang() === 'ar');
  bookingPath = computed(() => getRentalBookingPath(this.lang()));

  private brokenSig = signal<Set<string>>(new Set());
  broken = this.brokenSig.asReadonly();

  private schemaEl?: HTMLScriptElement;

  private metaEffect = effect(() => {
    const t = this.t();
    this.title.setTitle(t.metaTitle);
    this.meta.updateTag({ name: 'description', content: t.metaDescription });
  });

  ngOnInit(): void {
    // Synchron setzen, damit die Werte vor der Prerender-Serialisierung stehen.
    const t = this.t();
    this.title.setTitle(t.metaTitle);
    this.meta.updateTag({ name: 'description', content: t.metaDescription });
    this.meta.updateTag({ name: 'robots', content: 'index, follow' });
    this.injectSchema();
  }

  ngOnDestroy(): void {
    this.schemaEl?.remove();
  }

  text(f: ZielFakten) {
    return this.t().ziele[f.id];
  }

  markBroken(id: string): void {
    const next = new Set(this.brokenSig());
    next.add(id);
    this.brokenSig.set(next);
  }

  schwierigkeitLabel(f: ZielFakten): string {
    const t = this.t();
    return f.schwierigkeit === 'leicht'
      ? t.difficultyEasy
      : f.schwierigkeit === 'mittel'
        ? t.difficultyMedium
        : t.difficultyHard;
  }

  emojiFor(f: ZielFakten): string {
    if (f.baden) return '🏖️';
    if (f.id === 'mundenhof') return '🦓';
    if (f.id === 'schlossberg' || f.id === 'st-peter') return '🏔️';
    if (
      f.id === 'kaiserstuhl' ||
      f.id === 'glottertal' ||
      f.id === 'staufen' ||
      f.id === 'breisach'
    )
      return '🍇';
    return '🚲';
  }

  private injectSchema(): void {
    const lang = this.lang();
    const t = this.t();
    const pageUrl = `${BASE_URL}/${lang}/ausflugsziele`;

    const itemList = {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: t.metaTitle,
      description: t.metaDescription,
      url: pageUrl,
      numberOfItems: this.fakten.length,
      itemListElement: this.fakten.map((f, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        item: {
          '@type': 'TouristAttraction',
          name: t.ziele[f.id]?.name ?? f.id,
          description: t.ziele[f.id]?.kurz ?? '',
        },
      })),
    };

    const el = this.doc.createElement('script');
    el.type = 'application/ld+json';
    el.text = JSON.stringify(itemList);
    this.doc.head.appendChild(el);
    this.schemaEl = el;
  }
}
