import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  Component,
  PLATFORM_ID,
  inject,
  OnInit,
  OnDestroy,
  effect,
  Injector,
  signal,
} from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { filter, Subscription } from 'rxjs';
import { NavbarComponent } from './components/navbar/navbar.component';
import { FooterComponent } from './components/footer/footer.component';
import { TranslationService } from './services/translation.service';
import { SeoService } from './services/seo.service';
import {
  HOME_ROUTE_REGEX,
  getLanguageDirection,
} from './services/language-config';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, FooterComponent],
  template: `
    <div class="app-layout">
      <app-navbar></app-navbar>
      <main class="main-content" role="main">
        @if (!isHomeRoute()) {
          <div class="route-accent route-accent-left" aria-hidden="true"></div>
          <div class="route-accent route-accent-right" aria-hidden="true"></div>
        }
        <router-outlet></router-outlet>
      </main>
      <app-footer></app-footer>
    </div>
  `,
  styles: [
    `
      .app-layout {
        display: flex;
        flex-direction: column;
        min-height: 100vh;
        background: var(--color-bg);
      }

      .main-content {
        position: relative;
        flex: 1;
      }

      .route-accent {
        position: fixed;
        top: 12vh;
        width: clamp(260px, 28vw, 430px);
        aspect-ratio: 3 / 4;
        border-radius: 28px;
        pointer-events: none;
        z-index: 0;
        opacity: 0.32;
        filter: saturate(1.18) contrast(1.05);
        background-size: cover;
        background-position: center;
        box-shadow:
          0 22px 72px rgba(0, 0, 0, 0.4),
          0 0 0 1px rgba(255, 255, 255, 0.08);
      }

      .route-accent-left {
        left: clamp(-95px, -5vw, -35px);
        transform: rotate(-6deg);
        background-image:
          linear-gradient(
            165deg,
            rgba(15, 23, 42, 0.46) 0%,
            rgba(15, 23, 42, 0.14) 100%
          ),
          url('/assets/images/sections/bg-story.webp');
      }

      .route-accent-right {
        right: clamp(-95px, -5vw, -35px);
        transform: rotate(6deg);
        background-image:
          linear-gradient(
            165deg,
            rgba(15, 23, 42, 0.46) 0%,
            rgba(15, 23, 42, 0.14) 100%
          ),
          url('/assets/images/sections/bg-trust.webp');
      }

      @media (max-width: 1200px) {
        .route-accent {
          opacity: 0.24;
          width: clamp(220px, 24vw, 340px);
        }
      }

      @media (max-width: 1024px) {
        .route-accent {
          display: block;
          width: clamp(180px, 42vw, 260px);
          opacity: 0.2;
          top: auto;
          bottom: 18vh;
          border-radius: 24px;
          filter: saturate(1.15) blur(0.4px);
        }

        .route-accent-left {
          left: clamp(-72px, -10vw, -40px);
          bottom: auto;
          top: 11rem;
          transform: rotate(-11deg);
        }

        .route-accent-right {
          right: clamp(-72px, -10vw, -40px);
          bottom: 5rem;
          top: auto;
          transform: rotate(11deg);
        }

        .main-content::before,
        .main-content::after {
          content: '';
          position: fixed;
          width: 42vw;
          height: 42vw;
          border-radius: 999px;
          pointer-events: none;
          z-index: 0;
          filter: blur(48px);
          opacity: 0.32;
        }

        .main-content::before {
          top: 9rem;
          left: -18vw;
          background: rgba(16, 185, 129, 0.22);
        }

        .main-content::after {
          bottom: 8rem;
          right: -20vw;
          background: rgba(249, 115, 22, 0.2);
        }
      }

      @media (max-width: 640px) {
        .route-accent {
          width: clamp(150px, 46vw, 220px);
          opacity: 0.22;
        }

        .route-accent-left {
          top: 9rem;
        }

        .route-accent-right {
          bottom: 4.5rem;
        }
      }
    `,
  ],
})
export class AppComponent implements OnInit, OnDestroy {
  private title = inject(Title);
  private meta = inject(Meta);
  private translationService = inject(TranslationService);
  private seoService = inject(SeoService);
  private platformId = inject(PLATFORM_ID);
  private document = inject(DOCUMENT);
  private injector = inject(Injector);
  private router = inject(Router);
  private routeSub?: Subscription;

  isHomeRoute = signal(false);

  ngOnInit(): void {
    // Set initial translations
    this.updateMetaTags();

    // Update meta tags whenever language changes
    effect(
      () => {
        this.translationService.currentLanguage();
        this.updateMetaTags();
      },
      { injector: this.injector },
    );

    if (isPlatformBrowser(this.platformId)) {
      this.updateLanguageAttribute();

      this.updateHomeRouteFlag(this.router.url);
      this.routeSub = this.router.events
        .pipe(filter((event) => event instanceof NavigationEnd))
        .subscribe((event) => {
          const nav = event as NavigationEnd;
          this.updateHomeRouteFlag(nav.urlAfterRedirects);
        });

      // Update language attribute whenever language changes
      effect(
        () => {
          this.translationService.currentLanguage();
          this.updateLanguageAttribute();
        },
        { injector: this.injector },
      );
    }

    // Initialize SEO service - it handles hreflang and canonical updates
    this.seoService.init();
  }

  private updateMetaTags(): void {
    const t = this.translationService.translations();
    this.title.setTitle(t.metaTitle);
    this.meta.updateTag({ name: 'description', content: t.metaDescription });
  }

  private updateLanguageAttribute(): void {
    const currentLanguage = this.translationService.currentLanguage();
    this.document.documentElement.lang = currentLanguage;
    this.document.documentElement.dir = getLanguageDirection(currentLanguage);
  }

  private updateHomeRouteFlag(url: string): void {
    const cleanUrl = url.split('?')[0].split('#')[0];
    this.isHomeRoute.set(HOME_ROUTE_REGEX.test(cleanUrl));
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
  }
}
