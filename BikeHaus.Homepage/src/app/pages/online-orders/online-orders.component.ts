import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslationService } from '../../services/translation.service';

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink],
  selector: 'app-online-orders',
  template: `
    <main class="container">
      <h1>{{ t().onlineOrders }}</h1>
      <p>
        {{ 'Unsere Online-Bestellungen werden im Showroom abgewickelt. ' }}
        <a [routerLink]="['/' + currentLang(), 'showroom']">{{
          t().showroom
        }}</a>
      </p>
    </main>
  `,
})
export class OnlineOrdersComponent {
  private translationService = inject(TranslationService);
  t = this.translationService.translations;
  currentLang = this.translationService.currentLanguage;
}
