import { ApplicationConfig, LOCALE_ID } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { registerLocaleData } from '@angular/common';
import localeDe from '@angular/common/locales/de';

import { routes } from './app.routes';
import { authInterceptor } from './interceptors/auth.interceptor';
import { imageCompressionInterceptor } from './interceptors/image-compression.interceptor';

// Ohne diese Registrierung fällt Angular auf en-US zurück: Beträge erschienen
// als 1,234.50 € und Daten als 7/29/26 — auf jedem Beleg-, Listen- und
// Detailbildschirm, den Kunden mitlesen. Mit de-DE: 1.234,50 € und 29.07.2026.
registerLocaleData(localeDe);

export const appConfig: ApplicationConfig = {
  providers: [
    { provide: LOCALE_ID, useValue: 'de-DE' },
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([authInterceptor, imageCompressionInterceptor]),
    ),
  ],
};
