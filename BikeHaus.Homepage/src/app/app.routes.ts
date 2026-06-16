import { Routes, UrlSegment, UrlMatchResult } from '@angular/router';
import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { TranslationService, Language } from './services/translation.service';
import {
  DEFAULT_LANGUAGE,
  isSupportedLanguage,
} from './services/language-config';

export const languageGuard: CanActivateFn = (route) => {
  const lang = route.paramMap.get('lang');
  if (isSupportedLanguage(lang)) {
    inject(TranslationService).setLanguage(lang as Language);
    return true;
  }
  return inject(Router).createUrlTree([`/${DEFAULT_LANGUAGE}`]);
};

// Unmatched URLs fall back to the home page of the language the visitor is
// currently browsing in, not hard-coded German.
export const languageFallbackGuard: CanActivateFn = () => {
  const lang = inject(TranslationService).currentLanguage();
  return inject(Router).createUrlTree([`/${lang}`]);
};

// Angular's router has no mid-segment params, so `path: 'fahrrad-:city'`
// matches nothing — city URLs need this matcher to extract the :city param.
export function cityLandingMatcher(
  segments: UrlSegment[],
): UrlMatchResult | null {
  if (segments.length === 1 && segments[0].path.startsWith('fahrrad-')) {
    return {
      consumed: segments,
      posParams: {
        city: new UrlSegment(segments[0].path.slice('fahrrad-'.length), {}),
      },
    };
  }
  return null;
}

export const routes: Routes = [
  { path: '', redirectTo: DEFAULT_LANGUAGE, pathMatch: 'full' },
  {
    path: 'showroom',
    redirectTo: `${DEFAULT_LANGUAGE}/showroom`,
    pathMatch: 'full',
  },
  {
    path: 'showroom/danke',
    redirectTo: `${DEFAULT_LANGUAGE}/showroom/danke`,
    pathMatch: 'full',
  },
  {
    path: 'showroom/:id',
    redirectTo: `${DEFAULT_LANGUAGE}/showroom/:id`,
    pathMatch: 'full',
  },
  {
    path: ':lang',
    canActivate: [languageGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/home/home.component').then((m) => m.HomeComponent),
      },
      {
        path: 'showroom',
        loadComponent: () =>
          import('./pages/showroom/showroom.component').then(
            (m) => m.ShowroomComponent,
          ),
      },
      {
        path: 'showroom/danke',
        loadComponent: () =>
          import('./pages/showroom/order-success.component').then(
            (m) => m.OrderSuccessComponent,
          ),
      },
      {
        path: 'showroom/:id',
        loadComponent: () =>
          import('./pages/showroom-detail/showroom-detail.component').then(
            (m) => m.ShowroomDetailComponent,
          ),
      },
      {
        path: 'zubehoer',
        loadComponent: () =>
          import('./pages/zubehoer/zubehoer.component').then(
            (m) => m.ZubehoerComponent,
          ),
      },
      {
        path: 'zubehoer/:id',
        loadComponent: () =>
          import('./pages/zubehoer/zubehoer-detail.component').then(
            (m) => m.ZubehoerDetailComponent,
          ),
      },
      {
        path: 'neue-fahrraeder',
        loadComponent: () =>
          import('./pages/neue-fahrraeder/neue-fahrraeder.component').then(
            (m) => m.NeueFahrraederComponent,
          ),
      },
      {
        path: 'neue-fahrraeder/:id',
        loadComponent: () =>
          import('./pages/neue-fahrraeder/neue-fahrrad-detail.component').then(
            (m) => m.NeueFahrradDetailComponent,
          ),
      },
      {
        path: 'e-bikes',
        loadComponent: () =>
          import('./pages/e-bikes/e-bikes.component').then(
            (m) => m.EBikesComponent,
          ),
      },
      {
        path: 'e-bikes/:id',
        loadComponent: () =>
          import('./pages/e-bikes/e-bike-detail.component').then(
            (m) => m.EBikeDetailComponent,
          ),
      },
      {
        path: 'about',
        loadComponent: () =>
          import('./pages/about/about.component').then((m) => m.AboutComponent),
      },
      {
        path: 'contact',
        loadComponent: () =>
          import('./pages/contact/contact.component').then(
            (m) => m.ContactComponent,
          ),
      },
      {
        path: 'impressum',
        loadComponent: () =>
          import('./pages/impressum/impressum.component').then(
            (m) => m.ImpressumComponent,
          ),
      },
      {
        path: 'datenschutz',
        loadComponent: () =>
          import('./pages/datenschutz/datenschutz.component').then(
            (m) => m.DatenschutzComponent,
          ),
      },
      {
        path: 'garantie',
        loadComponent: () =>
          import('./pages/garantie/garantie.component').then(
            (m) => m.GarantieComponent,
          ),
      },
      {
        path: 'fahrradverleih',
        loadComponent: () =>
          import('./pages/fahrradverleih/fahrradverleih.component').then(
            (m) => m.FahrradverleihComponent,
          ),
      },
      // Dedicated booking flow (must be registered before :category)
      {
        path: 'fahrradverleih/buchen',
        loadComponent: () =>
          import('./pages/fahrradverleih/rental-booking-page.component').then(
            (m) => m.RentalBookingPageComponent,
          ),
      },
      // DE sub-categories
      {
        path: 'fahrradverleih/:category',
        loadComponent: () =>
          import('./pages/fahrradverleih/rental-category.component').then(
            (m) => m.RentalCategoryComponent,
          ),
      },
      // EN canonical alias: /en/bike-rental
      {
        path: 'bike-rental',
        loadComponent: () =>
          import('./pages/fahrradverleih/fahrradverleih.component').then(
            (m) => m.FahrradverleihComponent,
          ),
      },
      // EN booking flow (must be registered before :category)
      {
        path: 'bike-rental/booking',
        loadComponent: () =>
          import('./pages/fahrradverleih/rental-booking-page.component').then(
            (m) => m.RentalBookingPageComponent,
          ),
      },
      // EN sub-categories
      {
        path: 'bike-rental/:category',
        loadComponent: () =>
          import('./pages/fahrradverleih/rental-category.component').then(
            (m) => m.RentalCategoryComponent,
          ),
      },
      // FR canonical alias: /fr/location-velo
      {
        path: 'location-velo',
        loadComponent: () =>
          import('./pages/fahrradverleih/fahrradverleih.component').then(
            (m) => m.FahrradverleihComponent,
          ),
      },
      // FR booking flow (must be registered before :category)
      {
        path: 'location-velo/reservation',
        loadComponent: () =>
          import('./pages/fahrradverleih/rental-booking-page.component').then(
            (m) => m.RentalBookingPageComponent,
          ),
      },
      // FR sub-categories
      {
        path: 'location-velo/:category',
        loadComponent: () =>
          import('./pages/fahrradverleih/rental-category.component').then(
            (m) => m.RentalCategoryComponent,
          ),
      },
      // ── Rental bike catalog (filterable, SEO-optimised) ──
      // DE/TR/ES/IT/AR/RU: /mietfahrraeder
      {
        path: 'mietfahrraeder',
        loadComponent: () =>
          import('./pages/mietfahrraeder/mietfahrraeder.component').then(
            (m) => m.MietfahrraederComponent,
          ),
      },
      {
        path: 'mietfahrraeder/:id',
        loadComponent: () =>
          import('./pages/mietfahrraeder/mietfahrrad-detail.component').then(
            (m) => m.MietfahrradDetailComponent,
          ),
      },
      // EN canonical: /en/rental-bikes
      {
        path: 'rental-bikes',
        loadComponent: () =>
          import('./pages/mietfahrraeder/mietfahrraeder.component').then(
            (m) => m.MietfahrraederComponent,
          ),
      },
      {
        path: 'rental-bikes/:id',
        loadComponent: () =>
          import('./pages/mietfahrraeder/mietfahrrad-detail.component').then(
            (m) => m.MietfahrradDetailComponent,
          ),
      },
      // FR canonical: /fr/velos-de-location
      {
        path: 'velos-de-location',
        loadComponent: () =>
          import('./pages/mietfahrraeder/mietfahrraeder.component').then(
            (m) => m.MietfahrraederComponent,
          ),
      },
      {
        path: 'velos-de-location/:id',
        loadComponent: () =>
          import('./pages/mietfahrraeder/mietfahrrad-detail.component').then(
            (m) => m.MietfahrradDetailComponent,
          ),
      },
      {
        path: 'ratgeber',
        loadComponent: () =>
          import('./pages/ratgeber/ratgeber.component').then(
            (m) => m.RatgeberComponent,
          ),
      },
      {
        path: 'ratgeber/:slug',
        loadComponent: () =>
          import('./pages/ratgeber-detail/ratgeber-detail.component').then(
            (m) => m.RatgeberDetailComponent,
          ),
      },
      // EN/FR alias: /en/guide/:slug, /fr/guide/:slug
      {
        path: 'guide',
        loadComponent: () =>
          import('./pages/ratgeber/ratgeber.component').then(
            (m) => m.RatgeberComponent,
          ),
      },
      {
        path: 'guide/:slug',
        loadComponent: () =>
          import('./pages/ratgeber-detail/ratgeber-detail.component').then(
            (m) => m.RatgeberDetailComponent,
          ),
      },
      {
        path: 'faq',
        loadComponent: () =>
          import('./pages/faq/faq.component').then((m) => m.FaqComponent),
      },
      {
        matcher: cityLandingMatcher,
        loadComponent: () =>
          import('./pages/fahrrad-stadt/fahrrad-stadt.component').then(
            (m) => m.FahrradStadtComponent,
          ),
      },
      // ── Fahrrad-Service (Inspektion, Wartung, Pflege) ──
      // DE/TR/ES/IT/AR/RU: /service
      {
        path: 'service',
        loadComponent: () =>
          import('./pages/fahrrad-service/fahrrad-service.component').then(
            (m) => m.FahrradServiceComponent,
          ),
      },
      // EN canonical: /en/bike-service
      {
        path: 'bike-service',
        loadComponent: () =>
          import('./pages/fahrrad-service/fahrrad-service.component').then(
            (m) => m.FahrradServiceComponent,
          ),
      },
      // FR canonical: /fr/entretien-velo
      {
        path: 'entretien-velo',
        loadComponent: () =>
          import('./pages/fahrrad-service/fahrrad-service.component').then(
            (m) => m.FahrradServiceComponent,
          ),
      },
    ],
  },
  {
    path: '**',
    canActivate: [languageFallbackGuard],
    loadComponent: () =>
      import('./pages/home/home.component').then((m) => m.HomeComponent),
  },
];
