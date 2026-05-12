import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-order-success',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="success-page">
      <div class="success-card">
        <div class="check-circle">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#4caf50" stroke-width="2.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h1>Zahlung erfolgreich!</h1>
        <p class="sub">Vielen Dank für deinen Kauf. Wir melden uns in Kürze per E-Mail oder Telefon, um die Abholung zu koordinieren.</p>
        <p class="shop-info">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" stroke-width="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
          </svg>
          Bike Haus Freiburg — Heckerstraße 27, 79108 Freiburg
        </p>
        <a [routerLink]="['/' + lang, 'showroom']" class="btn-back">
          Zurück zum Showroom
        </a>
      </div>
    </div>
  `,
  styles: [`
    .success-page {
      min-height: 70vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 6rem 1rem 4rem;
      background: radial-gradient(circle at top, rgba(76, 175, 80, 0.08), transparent 30%), var(--color-bg);
    }

    .success-card {
      max-width: 480px;
      width: 100%;
      text-align: center;
      padding: 3rem 2.5rem;
      background: linear-gradient(180deg, rgba(255,255,255,0.045), rgba(255,255,255,0.015)), var(--color-surface);
      border: 1px solid rgba(76, 175, 80, 0.2);
      border-radius: 28px;
      box-shadow: 0 24px 60px rgba(0,0,0,0.2);
    }

    .check-circle {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: rgba(76, 175, 80, 0.12);
      border: 2px solid rgba(76, 175, 80, 0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1.5rem;
    }

    h1 {
      font-size: 1.9rem;
      font-weight: 800;
      color: var(--color-text);
      margin: 0 0 1rem;
      letter-spacing: -0.03em;
    }

    .sub {
      font-size: 0.95rem;
      line-height: 1.7;
      color: var(--color-text-secondary);
      margin-bottom: 1.5rem;
    }

    .shop-info {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.85rem;
      color: var(--color-text-muted);
      padding: 0.7rem 1.1rem;
      border-radius: 50px;
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.08);
      margin-bottom: 2rem;
    }

    .btn-back {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.9rem 2rem;
      border-radius: 14px;
      background: var(--color-accent);
      color: #fff;
      font-weight: 700;
      font-size: 0.95rem;
      text-decoration: none;
      transition: opacity 0.2s, transform 0.15s;
    }

    .btn-back:hover {
      opacity: 0.9;
      transform: translateY(-1px);
    }
  `],
})
export class OrderSuccessComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private translationService = inject(TranslationService);

  lang = this.translationService.currentLanguage();

  ngOnInit(): void {
    this.lang = this.translationService.currentLanguage();
  }
}
