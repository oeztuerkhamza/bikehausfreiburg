import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { TranslationService } from '../../services/translation.service';
import { getRentalSlug } from '../../services/language-config';
import { RentalBookingStepsComponent } from './rental-booking-steps.component';

/**
 * Dedicated booking page: hosts ONLY the step-by-step rental booking flow.
 * No FAQ / reviews / note banners — step transitions can never land the
 * user on unrelated content (mobile UX feedback 2026-06).
 */
@Component({
  selector: 'app-rental-booking-page',
  standalone: true,
  imports: [CommonModule, RouterModule, RentalBookingStepsComponent],
  template: `
    <div class="booking-page">
      <div class="booking-page-inner">
        <div class="booking-page-head">
          <a [routerLink]="backLink()" class="booking-back-link">
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
            {{ t().rentalSteps?.backToInfo ?? 'Zurück zum Fahrradverleih' }}
          </a>
          <h1 class="booking-page-title">
            {{ t().rentalSteps?.bookingPageTitle ?? 'Fahrrad online buchen' }}
          </h1>
        </div>
        <app-rental-booking-steps></app-rental-booking-steps>
      </div>
    </div>
  `,
  styles: [
    `
      .booking-page {
        min-height: 100vh;
        background:
          radial-gradient(
            circle at top left,
            rgba(255, 87, 34, 0.12),
            transparent 30%
          ),
          linear-gradient(180deg, #0a101c 0%, #121b2b 100%);
        padding: 96px 1rem 4rem;
      }

      .booking-page-inner {
        max-width: 940px;
        margin: 0 auto;
      }

      .booking-page-head {
        max-width: 900px;
        margin: 0 auto;
      }

      .booking-back-link {
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        color: rgba(245, 248, 255, 0.72);
        text-decoration: none;
        font-size: 0.9rem;
        font-weight: 600;
        padding: 0.35rem 0;
      }

      .booking-back-link:hover {
        color: #f5f8ff;
      }

      .booking-page-title {
        color: #f5f8ff;
        font-size: 1.5rem;
        margin: 0.75rem 0 0;
      }

      @media (max-width: 640px) {
        .booking-page {
          padding: 84px 0.6rem 3rem;
        }

        .booking-page-title {
          font-size: 1.25rem;
        }
      }
    `,
  ],
})
export class RentalBookingPageComponent implements OnInit, OnDestroy {
  private titleService = inject(Title);
  private metaService = inject(Meta);
  private translationService = inject(TranslationService);

  t = this.translationService.translations;
  lang = this.translationService.currentLanguage;

  backLink = () => ['/' + this.lang(), getRentalSlug(this.lang())];

  ngOnInit(): void {
    const title =
      this.t().rentalSteps?.bookingPageTitle ?? 'Fahrrad online buchen';
    this.titleService.setTitle(`${title} | BikeHaus Freiburg`);
    // Transactional page — keep it out of the index.
    this.metaService.updateTag({ name: 'robots', content: 'noindex, follow' });
  }

  ngOnDestroy(): void {
    // Don't leak noindex into soft navigations to other pages.
    this.metaService.updateTag({ name: 'robots', content: 'index, follow' });
  }
}
