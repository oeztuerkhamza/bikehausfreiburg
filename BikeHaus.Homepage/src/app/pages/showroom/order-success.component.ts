import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { TranslationService } from '../../services/translation.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-order-success',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <!-- Loading -->
    <div class="result-page" *ngIf="status() === 'loading'">
      <div class="result-card">
        <div class="spinner"></div>
        <p class="sub">Zahlung wird überprüft…</p>
      </div>
    </div>

    <!-- Success -->
    <div class="result-page success-bg" *ngIf="status() === 'success'">
      <div class="result-card success-card">
        <div class="icon-circle success-circle">
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#4caf50"
            stroke-width="2.5"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h1>Zahlung erfolgreich!</h1>
        <p class="sub">
          Vielen Dank für deinen Kauf. Wir melden uns in Kürze per E-Mail oder
          Telefon, um die Abholung zu koordinieren.
        </p>
        <p class="shop-info">
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--color-accent)"
            stroke-width="2"
          >
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          Bike Haus Freiburg — Heckerstraße 27, 79108 Freiburg
        </p>
        <a [routerLink]="['/' + lang, 'showroom']" class="btn-back"
          >Zurück zum Showroom</a
        >
      </div>
    </div>

    <!-- Failed -->
    <div class="result-page failed-bg" *ngIf="status() === 'failed'">
      <div class="result-card failed-card">
        <div class="icon-circle failed-circle">
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#f44336"
            stroke-width="2.5"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </div>
        <h1>Zahlung nicht abgeschlossen</h1>
        <p class="sub">
          Die Zahlung wurde abgebrochen oder ist fehlgeschlagen. Du kannst es
          erneut versuchen.
        </p>
        <button
          *ngIf="paymentId()"
          class="btn-retry"
          type="button"
          (click)="retryVerification()"
        >
          Zahlung erneut prüfen
        </button>
        <a [routerLink]="['/' + lang, 'showroom']" class="btn-retry"
          >Erneut versuchen</a
        >
      </div>
    </div>
  `,
  styles: [
    `
      .result-page {
        min-height: 70vh;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 6rem 1rem 4rem;
        background: var(--color-bg);
      }

      .success-bg {
        background:
          radial-gradient(
            circle at top,
            rgba(76, 175, 80, 0.08),
            transparent 30%
          ),
          var(--color-bg);
      }

      .failed-bg {
        background:
          radial-gradient(
            circle at top,
            rgba(244, 67, 54, 0.08),
            transparent 30%
          ),
          var(--color-bg);
      }

      .result-card {
        max-width: 480px;
        width: 100%;
        text-align: center;
        padding: 3rem 2.5rem;
        background:
          linear-gradient(
            180deg,
            rgba(255, 255, 255, 0.045),
            rgba(255, 255, 255, 0.015)
          ),
          var(--color-surface);
        border-radius: 28px;
        box-shadow: 0 24px 60px rgba(0, 0, 0, 0.2);
      }

      .success-card {
        border: 1px solid rgba(76, 175, 80, 0.2);
      }
      .failed-card {
        border: 1px solid rgba(244, 67, 54, 0.2);
      }

      .icon-circle {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 1.5rem;
      }

      .success-circle {
        background: rgba(76, 175, 80, 0.12);
        border: 2px solid rgba(76, 175, 80, 0.3);
      }
      .failed-circle {
        background: rgba(244, 67, 54, 0.12);
        border: 2px solid rgba(244, 67, 54, 0.3);
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
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid rgba(255, 255, 255, 0.08);
        margin-bottom: 2rem;
      }

      .btn-back,
      .btn-retry {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.9rem 2rem;
        border-radius: 14px;
        color: #fff;
        font-weight: 700;
        font-size: 0.95rem;
        text-decoration: none;
        transition:
          opacity 0.2s,
          transform 0.15s;
        border: none;
        cursor: pointer;
        margin: 0.25rem;
      }

      .btn-back {
        background: var(--color-accent);
      }
      .btn-retry {
        background: #f44336;
      }

      .btn-back:hover,
      .btn-retry:hover {
        opacity: 0.9;
        transform: translateY(-1px);
      }

      .spinner {
        width: 48px;
        height: 48px;
        border: 4px solid rgba(255, 255, 255, 0.1);
        border-top-color: var(--color-accent);
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
        margin: 0 auto 1.5rem;
      }

      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }
    `,
  ],
})
export class OrderSuccessComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private translationService = inject(TranslationService);
  private http = inject(HttpClient);

  lang = this.translationService.currentLanguage();
  status = signal<'loading' | 'success' | 'failed'>('loading');
  paymentId = signal<string | null>(null);

  private retryHandle: ReturnType<typeof setTimeout> | null = null;
  private readonly maxAttempts = 6;
  private readonly retryDelayMs = 1500;

  ngOnDestroy(): void {
    if (this.retryHandle) {
      clearTimeout(this.retryHandle);
      this.retryHandle = null;
    }
  }

  ngOnInit(): void {
    this.lang = this.translationService.currentLanguage();

    const paymentId =
      this.route.snapshot.queryParamMap.get('payment_id') ??
      this.route.snapshot.queryParamMap.get('id') ??
      localStorage.getItem('pending_payment_id');

    if (!paymentId) {
      this.status.set('failed');
      return;
    }

    this.paymentId.set(paymentId);
    this.verifyPayment(paymentId, 0);
  }

  retryVerification(): void {
    const paymentId = this.paymentId();
    if (!paymentId) return;
    this.status.set('loading');
    this.verifyPayment(paymentId, 0);
  }

  private verifyPayment(paymentId: string, attempt: number): void {
    this.http
      .post<{ confirmed: boolean; status?: string }>(
        `${environment.apiUrl}/checkout/confirm-payment`,
        { paymentId },
      )
      .subscribe({
        next: (res) => {
          if (res.confirmed) {
            localStorage.removeItem('pending_payment_id');
            this.status.set('success');
            return;
          }

          if (this.shouldRetry(res.status) && attempt < this.maxAttempts) {
            this.retryHandle = setTimeout(() => {
              this.verifyPayment(paymentId, attempt + 1);
            }, this.retryDelayMs);
            return;
          }

          this.status.set('failed');
        },
        error: () => {
          if (attempt < this.maxAttempts) {
            this.retryHandle = setTimeout(() => {
              this.verifyPayment(paymentId, attempt + 1);
            }, this.retryDelayMs);
            return;
          }
          this.status.set('failed');
        },
      });
  }

  private shouldRetry(status?: string): boolean {
    if (!status) return true;
    const normalized = status.toLowerCase();
    return normalized === 'open' || normalized === 'pending' || normalized === 'authorized';
  }
}
