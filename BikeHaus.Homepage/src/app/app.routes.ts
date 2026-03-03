import { Routes } from '@angular/router';
import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { TranslationService, Language } from './services/translation.service';

const SUPPORTED_LANGS = ['de', 'fr', 'tr'];

export const languageGuard: CanActivateFn = (route) => {
  const lang = route.paramMap.get('lang');
  if (lang && SUPPORTED_LANGS.includes(lang)) {
    inject(TranslationService).setLanguage(lang as Language);
    return true;
  }
  return inject(Router).createUrlTree(['/de']);
};

export const routes: Routes = [
  { path: '', redirectTo: 'de', pathMatch: 'full' },
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
        path: 'showroom/:id',
        loadComponent: () =>
          import('./pages/showroom-detail/showroom-detail.component').then(
            (m) => m.ShowroomDetailComponent,
          ),
      },
      {
        path: 'zubehoer',
        loadComponent: () =>
          import('./pages/showroom/showroom.component').then(
            (m) => m.ShowroomComponent,
          ),
        data: { mode: 'zubehoer' },
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
    ],
  },
  { path: '**', redirectTo: 'de' },
];
