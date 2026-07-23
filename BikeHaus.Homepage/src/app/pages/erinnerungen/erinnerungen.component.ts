import {
  Component,
  OnInit,
  inject,
  signal,
  computed,
  PLATFORM_ID,
} from '@angular/core';
import { CommonModule, isPlatformBrowser, DOCUMENT } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { ApiService } from '../../services/api.service';
import { TranslationService } from '../../services/translation.service';
import { environment } from '../../../environments/environment';
import {
  OG_LOCALE_BY_LANGUAGE,
  getMemoriesSlug,
} from '../../services/language-config';
import { MemoryPublic } from '../../models/models';

interface SelectedPhoto {
  file: File;
  previewUrl: string;
}

@Component({
  selector: 'app-erinnerungen',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="memories-page">
      <header class="mem-hero">
        <h1>{{ t().memoriesTitle }}</h1>
        <p class="mem-subtitle">{{ t().memoriesSubtitle }}</p>
      </header>

      <!-- Galerie -->
      <section class="mem-gallery" *ngIf="memories().length > 0">
        <article
          class="mem-card"
          *ngFor="let m of memories(); let i = index"
        >
          <button
            type="button"
            class="mem-card-media"
            (click)="openLightbox(i, 0)"
            [attr.aria-label]="m.ad + ' – ' + m.ort"
          >
            <img
              [src]="photoUrl(m.fotos[0]?.filePath)"
              [alt]="m.ad + ' – ' + m.ort"
              loading="lazy"
              width="400"
              height="300"
            />
            <span class="mem-photo-badge" *ngIf="m.fotos.length > 1">
              +{{ m.fotos.length - 1 }}
            </span>
          </button>
          <div class="mem-card-body">
            <div class="mem-card-head">
              <strong class="mem-card-name">{{ m.ad }}</strong>
              <span class="mem-card-ort">📍 {{ m.ort }}</span>
            </div>
            <p class="mem-card-story">{{ m.geschichte }}</p>
            <time class="mem-card-date">{{
              m.createdAt | date: 'dd.MM.yyyy'
            }}</time>
          </div>
        </article>
      </section>

      <p class="mem-empty" *ngIf="!loading() && memories().length === 0">
        {{ t().memoriesEmpty }}
      </p>

      <div class="mem-loadmore" *ngIf="hasNext()">
        <button
          type="button"
          class="mem-btn mem-btn-outline"
          [disabled]="loading()"
          (click)="loadMore()"
        >
          {{ loading() ? '…' : t().memoriesLoadMore }}
        </button>
      </div>

      <!-- Einreichungsformular -->
      <section class="mem-form-wrap">
        <h2>{{ t().memoryFormTitle }}</h2>
        <p class="mem-form-intro">{{ t().memoriesIntro }}</p>

        <div class="mem-form-success" *ngIf="formSuccess(); else formTpl">
          ✓ {{ t().memoryFormSuccess }}
        </div>

        <ng-template #formTpl>
          <form class="mem-form" (ngSubmit)="submit()">
            <div class="mem-field">
              <label>{{ t().memoryFormName }} *</label>
              <input
                type="text"
                name="ad"
                [(ngModel)]="form.ad"
                maxlength="200"
                required
              />
            </div>
            <div class="mem-field">
              <label>{{ t().memoryFormLocation }} *</label>
              <input
                type="text"
                name="ort"
                [(ngModel)]="form.ort"
                maxlength="200"
                required
              />
            </div>
            <div class="mem-field">
              <label>{{ t().memoryFormStory }} *</label>
              <textarea
                name="geschichte"
                [(ngModel)]="form.geschichte"
                rows="3"
                maxlength="1000"
                required
              ></textarea>
              <span class="mem-counter">{{ form.geschichte.length }}/1000</span>
            </div>

            <!-- Honeypot: für Menschen unsichtbar -->
            <div class="mem-hp" aria-hidden="true">
              <label>Website</label>
              <input
                type="text"
                name="website"
                [(ngModel)]="form.website"
                tabindex="-1"
                autocomplete="off"
              />
            </div>

            <div class="mem-field">
              <label>{{ t().memoryFormPhotos }} *</label>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                (change)="onFilesSelected($event)"
              />
              <span class="mem-hint">{{ t().memoryFormPhotosHint }}</span>
              <div class="mem-previews" *ngIf="photos().length > 0">
                <div class="mem-preview" *ngFor="let p of photos(); let i = index">
                  <img [src]="p.previewUrl" [alt]="p.file.name" />
                  <button
                    type="button"
                    class="mem-preview-remove"
                    (click)="removePhoto(i)"
                    aria-label="remove"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>

            <label class="mem-consent">
              <input type="checkbox" name="consent" [(ngModel)]="consent" />
              <span>{{ t().memoryFormConsent }}</span>
            </label>

            <p class="mem-form-error" *ngIf="formError()">{{ formError() }}</p>

            <button
              type="submit"
              class="mem-btn mem-btn-primary"
              [disabled]="sending()"
            >
              {{ sending() ? t().memoryFormSending : t().memoryFormSubmit }}
            </button>
          </form>
        </ng-template>
      </section>
    </div>

    <!-- Lightbox -->
    <div
      class="mem-lightbox"
      *ngIf="lightboxOpen()"
      (click)="closeLightbox()"
    >
      <button class="mem-lb-close" (click)="closeLightbox()" aria-label="close">
        ✕
      </button>
      <button
        class="mem-lb-nav mem-lb-prev"
        (click)="prevPhoto($event)"
        aria-label="prev"
      >
        ‹
      </button>
      <img
        class="mem-lb-img"
        [src]="lightboxUrl()"
        [alt]="'memory'"
        (click)="$event.stopPropagation()"
      />
      <button
        class="mem-lb-nav mem-lb-next"
        (click)="nextPhoto($event)"
        aria-label="next"
      >
        ›
      </button>
    </div>
  `,
  styles: [
    `
      .memories-page {
        max-width: 1120px;
        margin: 0 auto;
        padding: 32px 16px 64px;
      }
      .mem-hero {
        text-align: center;
        margin-bottom: 32px;
      }
      .mem-hero h1 {
        font-size: clamp(1.8rem, 4vw, 2.6rem);
        margin: 0 0 8px;
      }
      .mem-subtitle {
        color: var(--text-secondary, #64748b);
        font-size: 1.05rem;
      }
      .mem-gallery {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 20px;
      }
      .mem-card {
        display: flex;
        flex-direction: column;
        border-radius: 14px;
        overflow: hidden;
        background: var(--bg-card, #fff);
        border: 1px solid var(--border-light, #e2e8f0);
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
      }
      .mem-card-media {
        position: relative;
        padding: 0;
        border: none;
        cursor: pointer;
        background: #f1f5f9;
        aspect-ratio: 4 / 3;
        overflow: hidden;
      }
      .mem-card-media img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
        transition: transform 0.3s ease;
      }
      .mem-card-media:hover img {
        transform: scale(1.04);
      }
      .mem-photo-badge {
        position: absolute;
        right: 8px;
        bottom: 8px;
        background: rgba(0, 0, 0, 0.65);
        color: #fff;
        border-radius: 999px;
        padding: 2px 10px;
        font-size: 0.8rem;
        font-weight: 600;
      }
      .mem-card-body {
        padding: 14px 16px 16px;
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .mem-card-head {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        gap: 8px;
      }
      .mem-card-name {
        font-size: 1rem;
      }
      .mem-card-ort {
        font-size: 0.82rem;
        color: var(--text-secondary, #64748b);
        white-space: nowrap;
      }
      .mem-card-story {
        font-size: 0.9rem;
        line-height: 1.5;
        margin: 0;
      }
      .mem-card-date {
        font-size: 0.75rem;
        color: var(--text-secondary, #94a3b8);
      }
      .mem-empty {
        text-align: center;
        color: var(--text-secondary, #64748b);
        padding: 40px 0;
      }
      .mem-loadmore {
        text-align: center;
        margin-top: 24px;
      }
      .mem-btn {
        border-radius: 999px;
        padding: 11px 26px;
        font-size: 0.95rem;
        font-weight: 600;
        cursor: pointer;
        border: 1.5px solid transparent;
      }
      .mem-btn-outline {
        background: transparent;
        border-color: var(--border, #cbd5e1);
        color: inherit;
      }
      .mem-btn-primary {
        background: var(--primary, #16a34a);
        color: #fff;
      }
      .mem-btn-primary:disabled {
        opacity: 0.6;
        cursor: default;
      }
      .mem-form-wrap {
        margin-top: 56px;
        padding: 28px 22px;
        border-radius: 16px;
        background: var(--bg-soft, #f8fafc);
        border: 1px solid var(--border-light, #e2e8f0);
        max-width: 640px;
        margin-inline: auto;
      }
      .mem-form-wrap h2 {
        margin: 0 0 4px;
      }
      .mem-form-intro {
        color: var(--text-secondary, #64748b);
        margin: 0 0 20px;
      }
      .mem-form {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      .mem-field {
        display: flex;
        flex-direction: column;
        gap: 5px;
        position: relative;
      }
      .mem-field label {
        font-weight: 600;
        font-size: 0.88rem;
      }
      .mem-field input[type='text'],
      .mem-field textarea {
        padding: 10px 12px;
        border-radius: 9px;
        border: 1.5px solid var(--border, #cbd5e1);
        font-size: 0.95rem;
        font-family: inherit;
        background: var(--bg-input, #fff);
        color: inherit;
      }
      .mem-counter {
        align-self: flex-end;
        font-size: 0.75rem;
        color: var(--text-secondary, #94a3b8);
      }
      .mem-hint {
        font-size: 0.78rem;
        color: var(--text-secondary, #64748b);
      }
      .mem-hp {
        position: absolute;
        left: -9999px;
        width: 1px;
        height: 1px;
        overflow: hidden;
      }
      .mem-previews {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        margin-top: 8px;
      }
      .mem-preview {
        position: relative;
        width: 80px;
        height: 80px;
        border-radius: 8px;
        overflow: hidden;
      }
      .mem-preview img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .mem-preview-remove {
        position: absolute;
        top: 2px;
        right: 2px;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        border: none;
        background: rgba(0, 0, 0, 0.6);
        color: #fff;
        cursor: pointer;
        font-size: 0.7rem;
        line-height: 1;
      }
      .mem-consent {
        display: flex;
        gap: 10px;
        align-items: flex-start;
        font-size: 0.85rem;
        line-height: 1.4;
        cursor: pointer;
      }
      .mem-consent input {
        margin-top: 3px;
      }
      .mem-form-error {
        color: #dc2626;
        font-size: 0.85rem;
        margin: 0;
      }
      .mem-form-success {
        text-align: center;
        padding: 24px;
        background: var(--success-soft, #dcfce7);
        color: var(--success, #15803d);
        border-radius: 12px;
        font-weight: 600;
      }
      .mem-lightbox {
        position: fixed;
        inset: 0;
        z-index: 1000;
        background: rgba(0, 0, 0, 0.9);
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .mem-lb-img {
        max-width: 92vw;
        max-height: 88vh;
        object-fit: contain;
      }
      .mem-lb-close {
        position: absolute;
        top: 18px;
        right: 22px;
        font-size: 1.8rem;
        color: #fff;
        background: none;
        border: none;
        cursor: pointer;
      }
      .mem-lb-nav {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        font-size: 3rem;
        color: #fff;
        background: none;
        border: none;
        cursor: pointer;
        padding: 0 18px;
      }
      .mem-lb-prev {
        left: 8px;
      }
      .mem-lb-next {
        right: 8px;
      }
    `,
  ],
})
export class ErinnerungenComponent implements OnInit {
  private apiService = inject(ApiService);
  private translationService = inject(TranslationService);
  private titleService = inject(Title);
  private metaService = inject(Meta);
  private document = inject(DOCUMENT);
  private platformId = inject(PLATFORM_ID);

  t = this.translationService.translations;
  lang = this.translationService.currentLanguage;

  memories = signal<MemoryPublic[]>([]);
  loading = signal(false);
  page = signal(1);
  hasNext = signal(false);
  private readonly pageSize = 12;

  // Formular
  form = { ad: '', ort: '', geschichte: '', website: '' };
  consent = false;
  photos = signal<SelectedPhoto[]>([]);
  sending = signal(false);
  formSuccess = signal(false);
  formError = signal<string | null>(null);

  // Lightbox
  lightboxOpen = signal(false);
  private lbMemoryIndex = signal(0);
  private lbPhotoIndex = signal(0);
  lightboxUrl = computed(() => {
    const m = this.memories()[this.lbMemoryIndex()];
    if (!m) return '';
    return this.photoUrl(m.fotos[this.lbPhotoIndex()]?.filePath);
  });

  private readonly assetBase = environment.apiUrl.replace('/api/public', '');

  ngOnInit(): void {
    const t = this.t();
    const lang = this.lang();
    const pageUrl = `https://bikehausfreiburg.com/${lang}/${getMemoriesSlug(lang)}`;

    this.titleService.setTitle(`${t.memoriesTitle} | Bike Haus Freiburg`);
    this.metaService.updateTag({ name: 'description', content: t.memoriesSubtitle });
    this.metaService.updateTag({ property: 'og:title', content: t.memoriesTitle });
    this.metaService.updateTag({ property: 'og:description', content: t.memoriesSubtitle });
    this.metaService.updateTag({ property: 'og:url', content: pageUrl });
    this.metaService.updateTag({ property: 'og:type', content: 'website' });
    this.metaService.updateTag({
      property: 'og:locale',
      content: OG_LOCALE_BY_LANGUAGE[lang] ?? 'de_DE',
    });

    const canonical = this.document.querySelector<HTMLLinkElement>(
      'link[rel="canonical"]',
    );
    if (canonical) canonical.href = pageUrl;

    this.loadPage(1);
  }

  photoUrl(path: string | undefined): string {
    if (!path) return '';
    return this.assetBase + path;
  }

  private loadPage(page: number): void {
    this.loading.set(true);
    this.apiService.getMemories(page, this.pageSize).subscribe({
      next: (res) => {
        this.memories.update((cur) =>
          page === 1 ? res.items : [...cur, ...res.items],
        );
        this.page.set(res.page);
        this.hasNext.set(res.hasNext);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  loadMore(): void {
    this.loadPage(this.page() + 1);
  }

  // ── Lightbox ──
  openLightbox(memoryIndex: number, photoIndex: number): void {
    this.lbMemoryIndex.set(memoryIndex);
    this.lbPhotoIndex.set(photoIndex);
    this.lightboxOpen.set(true);
  }
  closeLightbox(): void {
    this.lightboxOpen.set(false);
  }
  nextPhoto(ev: Event): void {
    ev.stopPropagation();
    const m = this.memories()[this.lbMemoryIndex()];
    if (!m) return;
    this.lbPhotoIndex.set((this.lbPhotoIndex() + 1) % m.fotos.length);
  }
  prevPhoto(ev: Event): void {
    ev.stopPropagation();
    const m = this.memories()[this.lbMemoryIndex()];
    if (!m) return;
    this.lbPhotoIndex.set(
      (this.lbPhotoIndex() - 1 + m.fotos.length) % m.fotos.length,
    );
  }

  // ── Formular ──
  onFilesSelected(ev: Event): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const input = ev.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    const t = this.t();
    const current = this.photos();
    const accepted: SelectedPhoto[] = [...current];

    for (const file of files) {
      if (accepted.length >= 5) {
        this.formError.set(t.memoryFormTooManyPhotos);
        break;
      }
      if (file.size > 8 * 1024 * 1024) {
        this.formError.set(t.memoryFormPhotoTooLarge);
        continue;
      }
      accepted.push({ file, previewUrl: URL.createObjectURL(file) });
    }
    this.photos.set(accepted.slice(0, 5));
    input.value = '';
  }

  removePhoto(index: number): void {
    const list = this.photos();
    const p = list[index];
    if (p && isPlatformBrowser(this.platformId)) URL.revokeObjectURL(p.previewUrl);
    this.photos.set(list.filter((_, i) => i !== index));
  }

  submit(): void {
    const t = this.t();
    this.formError.set(null);

    if (
      !this.form.ad.trim() ||
      !this.form.ort.trim() ||
      !this.form.geschichte.trim()
    ) {
      this.formError.set(t.memoryFormValidation);
      return;
    }
    if (this.photos().length === 0) {
      this.formError.set(t.memoryFormValidation);
      return;
    }
    if (!this.consent) {
      this.formError.set(t.memoryFormConsentRequired);
      return;
    }

    const fd = new FormData();
    fd.append('ad', this.form.ad.trim());
    fd.append('ort', this.form.ort.trim());
    fd.append('geschichte', this.form.geschichte.trim());
    fd.append('website', this.form.website); // Honeypot
    for (const p of this.photos()) fd.append('fotos', p.file, p.file.name);

    this.sending.set(true);
    this.apiService.createMemory(fd).subscribe({
      next: () => {
        this.sending.set(false);
        this.formSuccess.set(true);
      },
      error: (err) => {
        this.sending.set(false);
        this.formError.set(err?.error?.error || t.memoryFormError);
      },
    });
  }
}
