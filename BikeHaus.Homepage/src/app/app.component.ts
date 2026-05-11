import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  Component,
  PLATFORM_ID,
  inject,
  OnInit,
  effect,
  Injector,
} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { NavbarComponent } from './components/navbar/navbar.component';
import { FooterComponent } from './components/footer/footer.component';
import { TranslationService } from './services/translation.service';
import { SeoService } from './services/seo.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, FooterComponent],
  template: `
    <div class="app-layout">
      <app-navbar></app-navbar>
      <main class="main-content" role="main">
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
        flex: 1;
      }
    `,
  ],
})
export class AppComponent implements OnInit {
  private title = inject(Title);
  private meta = inject(Meta);
  private translationService = inject(TranslationService);
  private seoService = inject(SeoService);
  private platformId = inject(PLATFORM_ID);
  private document = inject(DOCUMENT);
  private injector = inject(Injector);

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
    this.document.documentElement.lang =
      this.translationService.currentLanguage();
  }
}
