import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { TranslationService } from '../../services/translation.service';
import { ApiService } from '../../services/api.service';
import { PublicShopInfo } from '../../models/models';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="contact-page">
      <!-- Header -->
      <header class="page-header">
        <div class="container">
          <span class="label">{{ t().contactLabel }}</span>
          <h1>{{ t().contactTitle }}</h1>
        </div>
      </header>

      <div class="container contact-body">
        <!-- Contact Grid -->
        <section class="contact-grid">
          <!-- WhatsApp -->
          <a
            href="https://wa.me/4915566300011"
            target="_blank"
            rel="noopener"
            class="contact-card whatsapp"
          >
            <div class="card-icon">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path
                  d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"
                />
              </svg>
            </div>
            <div class="card-content">
              <h3>WhatsApp</h3>
              <p>+49 155 6630 0011</p>
              <span class="card-hint">{{ t().contactWhatsappHint }}</span>
            </div>
            <svg
              class="card-arrow"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>

          <!-- Email -->
          <a href="mailto:bikehausfreiburg&#64;gmail.com" class="contact-card">
            <div class="card-icon">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
              >
                <path
                  d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
                />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            </div>
            <div class="card-content">
              <h3>{{ t().email }}</h3>
              <p>bikehausfreiburg&#64;gmail.com</p>
              <span class="card-hint">{{ t().contactEmailHint }}</span>
            </div>
            <svg
              class="card-arrow"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>

          <!-- Address -->
          <a
            href="https://maps.google.com/?q=Heckerstra%C3%9Fe+27+Freiburg+im+Breisgau"
            target="_blank"
            rel="noopener"
            class="contact-card"
          >
            <div class="card-icon">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
              >
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </div>
            <div class="card-content">
              <h3>{{ t().address }}</h3>
              <p>Heckerstraße 27</p>
              <p class="sub">
                79114 Freiburg im Breisgau
                <span class="district">· Haslach</span>
              </p>
            </div>
            <svg
              class="card-arrow"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>

          <!-- Opening Hours -->
          <div class="contact-card hours-card">
            <div class="card-icon">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <div class="card-content">
              <h3>{{ t().openingHours }}</h3>
              <div class="hours-table">
                <div class="hour-row">
                  <span>{{ t().monShort }}</span
                  ><span>11:00 – 17:00</span>
                </div>
                <div class="hour-row">
                  <span>{{ t().tueShort }}</span
                  ><span>11:00 – 17:00</span>
                </div>
                <div class="hour-row closed">
                  <span>{{ t().wedShort }}</span
                  ><span>{{ t().closed }}</span>
                </div>
                <div class="hour-row">
                  <span>{{ t().thuShort }}</span
                  ><span>11:00 – 17:00</span>
                </div>
                <div class="hour-row">
                  <span>{{ t().friShort }}</span
                  ><span>14:00 – 18:00</span>
                </div>
                <div class="hour-row">
                  <span>{{ t().satShort }}</span
                  ><span>11:30 – 17:00</span>
                </div>
                <div class="hour-row closed">
                  <span>{{ t().sunShort }}</span
                  ><span>{{ t().restDay }}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Map -->
        <section class="map-section">
          <h2>{{ t().visitUs }}</h2>
          <div class="map-container">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2669.5!2d7.8194!3d47.9877!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47911c9e1e000001%3A0x1!2sHeckerstra%C3%9Fe+27%2C+79117+Freiburg+im+Breisgau!5e0!3m2!1sde!2sde!4v1"
              width="100%"
              height="400"
              style="border:0; border-radius: 16px;"
              allowfullscreen
              loading="lazy"
              referrerpolicy="no-referrer-when-downgrade"
            >
            </iframe>
          </div>
        </section>

        <!-- Kleinanzeigen Link -->
        <section class="ka-section" *ngIf="shopInfo()?.kleinanzeigenUrl">
          <a
            [href]="shopInfo()!.kleinanzeigenUrl"
            target="_blank"
            rel="noopener"
            class="ka-card"
          >
            <div class="ka-content">
              <h3>Kleinanzeigen</h3>
              <p>{{ t().contactKaHint }}</p>
            </div>
            <svg
              width="20"
              height="20"
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
        </section>

        <!-- Fahrrad Ankauf -->
        <section class="ankauf-section">
          <div class="ankauf-card">
            <div class="ankauf-icon">
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
              >
                <circle cx="5" cy="17" r="3" />
                <circle cx="19" cy="17" r="3" />
                <path d="M12 17V5l4 4" />
                <path d="M5 17l4-7h6" />
                <path d="M15 10l4 7" />
              </svg>
            </div>
            <div class="ankauf-content">
              <h3>{{ t().ankaufTitle }}</h3>
              <p>{{ t().ankaufDesc }}</p>
            </div>
            <a
              [href]="getAnkaufWhatsappLink()"
              target="_blank"
              rel="noopener"
              class="ankauf-btn"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path
                  d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"
                />
              </svg>
              {{ t().ankaufCta }}
            </a>
            <span class="ankauf-hint">{{ t().ankaufHint }}</span>
          </div>
        </section>
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

      .contact-body {
        padding-top: 3rem;
        padding-bottom: 4rem;
      }

      /* Contact Grid */
      .contact-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
        margin-bottom: 3rem;
      }

      .contact-card {
        display: flex;
        align-items: flex-start;
        gap: 1rem;
        background: var(--color-surface);
        border: 1px solid var(--color-border);
        border-radius: 16px;
        padding: 1.5rem;
        text-decoration: none;
        color: inherit;
        transition:
          border-color 0.3s,
          transform 0.2s;
        position: relative;
      }

      a.contact-card:hover {
        border-color: var(--color-accent);
        transform: translateY(-2px);
      }

      a.contact-card.whatsapp:hover {
        border-color: #25d366;
      }

      .card-icon {
        width: 48px;
        height: 48px;
        border-radius: 12px;
        background: rgba(255, 87, 34, 0.1);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        color: var(--color-accent);
      }

      .whatsapp .card-icon {
        background: rgba(37, 211, 102, 0.1);
        color: #25d366;
      }

      .card-content {
        flex: 1;
        min-width: 0;
      }

      .card-content h3 {
        font-size: 0.8rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--color-text-secondary);
        margin: 0 0 0.35rem;
      }

      .card-content p {
        font-size: 1rem;
        font-weight: 600;
        color: var(--color-text);
        margin: 0;
        line-height: 1.5;
      }

      .card-content p.sub {
        font-size: 0.85rem;
        font-weight: 400;
        color: var(--color-text-secondary);
        margin-top: 0.1rem;
      }

      .district {
        color: var(--color-text-muted);
      }

      .card-hint {
        font-size: 0.8rem;
        color: var(--color-text-muted);
        margin-top: 0.25rem;
        display: block;
      }

      .card-arrow {
        color: var(--color-text-muted);
        flex-shrink: 0;
        margin-top: 0.5rem;
        transition: transform 0.2s;
      }

      a.contact-card:hover .card-arrow {
        transform: translateX(3px);
        color: var(--color-accent);
      }

      /* Hours */
      .hours-table {
        display: flex;
        flex-direction: column;
        gap: 0.15rem;
        margin-top: 0.35rem;
      }

      .hour-row {
        display: flex;
        justify-content: space-between;
        padding: 0.3rem 0;
        font-size: 0.88rem;
        border-bottom: 1px solid var(--color-border);
      }

      .hour-row:last-child {
        border-bottom: none;
      }

      .hour-row span:first-child {
        font-weight: 500;
        color: var(--color-text);
        min-width: 2rem;
      }

      .hour-row span:last-child {
        color: var(--color-text-secondary);
        font-weight: 500;
      }

      .hour-row.closed span:last-child {
        color: var(--color-text-muted);
      }

      /* Map */
      .map-section {
        margin-bottom: 2.5rem;
      }

      .map-section h2 {
        font-size: 1.15rem;
        font-weight: 700;
        color: var(--color-text);
        margin: 0 0 1rem;
      }

      .map-container {
        border-radius: 16px;
        overflow: hidden;
        border: 1px solid var(--color-border);
      }

      .map-container iframe {
        display: block;
      }

      /* Kleinanzeigen CTA */
      .ka-section {
        margin-bottom: 2rem;
      }

      .ka-card {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        background: var(--color-surface);
        border: 1px solid var(--color-border);
        border-radius: 16px;
        padding: 1.25rem 1.5rem;
        text-decoration: none;
        color: var(--color-text-muted);
        transition: border-color 0.3s;
      }

      .ka-card:hover {
        border-color: var(--color-accent);
      }

      .ka-content h3 {
        font-size: 1rem;
        font-weight: 700;
        color: var(--color-text);
        margin: 0 0 0.2rem;
      }

      .ka-content p {
        font-size: 0.85rem;
        color: var(--color-text-secondary);
        margin: 0;
      }

      @media (max-width: 768px) {
        .page-header {
          padding: 6rem 0 2rem;
        }
        .contact-grid {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class ContactComponent implements OnInit {
  private translationService = inject(TranslationService);
  private apiService = inject(ApiService);
  private titleService = inject(Title);
  private metaService = inject(Meta);

  t = this.translationService.translations;
  lang = this.translationService.currentLanguage;
  shopInfo = signal<PublicShopInfo | null>(null);

  ngOnInit(): void {
    // SEO
    this.titleService.setTitle(this.t().contactMetaTitle);
    this.metaService.updateTag({
      name: 'description',
      content: this.t().contactMetaDescription,
    });
    this.metaService.updateTag({
      property: 'og:title',
      content: this.t().contactMetaTitle,
    });
    this.metaService.updateTag({
      property: 'og:url',
      content: 'https://bikehausfreiburg.com/contact',
    });

    this.apiService.getShopInfo().subscribe({
      next: (data) => this.shopInfo.set(data),
    });
  }

  getAnkaufWhatsappLink(): string {
    const phone = '4915566300011';
    const message = encodeURIComponent(this.t().ankaufMessage);
    return `https://wa.me/${phone}?text=${message}`;
  }
}
