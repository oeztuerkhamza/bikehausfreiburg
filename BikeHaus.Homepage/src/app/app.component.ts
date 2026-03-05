import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { NavbarComponent } from './components/navbar/navbar.component';
import { FooterComponent } from './components/footer/footer.component';
import { TranslationService } from './services/translation.service';

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

  ngOnInit(): void {
    const t = this.translationService.translations();
    this.title.setTitle(t.metaTitle);
    this.meta.updateTag({ name: 'description', content: t.metaDescription });
    document.documentElement.lang = this.translationService.currentLanguage();
  }
}
